---
title: MySQL 8 与 PostgreSQL 使用指南：从增删改查到索引调优
createTime: 2026/10/12 10:00:00
permalink: /blog/mysql-postgresql-guide/
tags:
  - mysql
  - postgresql
  - 数据库
  - 索引
  - SQL
---

[[TOC]]

## 写在前面

大多数团队同时持有 MySQL 和 PostgreSQL：业务库是 MySQL，数据分析或 JSON 存储又选了 PG；也有人正在把一边迁到另一边。真正让人踩坑的从来不是「SQL 语法记不住」，而是**同一句 SQL 在两边语义不同、执行计划不同、加锁方式不同**——本地跑得好好的，上线换个库就慢十倍或者死锁。

这篇文档把两者放在一起讲：先建立心智模型（内部结构差异），再过一遍增删改查的写法对照，重点放在**索引、执行计划、慢查询排查**这些内部操作上，最后给一份经典问题与解决方案清单。配置部分只保留最小可用片段，够跑起来和定位问题即可。

::: tip 版本与约定
- **MySQL** 指 8.0 ~ 8.4 LTS，存储引擎默认 InnoDB。文中标注 `8.0.18+`、`8.0.29+` 表示特性起始版本。
- **PG** 指 PostgreSQL 13 ~ 17，示例在 16 上验证。
- 提示符 `mysql>`、`postgres=#` 表示在哪个客户端执行；`$` 表示 shell。
:::

## 一、心智模型：差异的源头

### 1.1 层级结构不一样

这是最容易在第一天就撞上的差异：MySQL 的 database 和 PG 的 database 不是同一个东西。

| 层级 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 进程模型 | 1 个 mysqld，内部多线程 | 1 个 postmaster + 每连接 1 个后端进程 |
| 库 | database（≈ 别人的 schema） | database，**物理隔离，不能跨库查询** |
| 命名空间 | database 就是命名空间，没有 schema 层 | database → schema（默认 public），靠 search_path 解析 |
| 跨库 join | 直接 db1.t1 JOIN db2.t2 | 只能同库跨 schema；跨 database 要 postgres_fdw / dblink |
| 用户 | 全局用户，用 `user@host` 区分 | 全局 role，GRANT 可以精确到库/schema/表/列 |

::: warning 迁移时最容易翻车的一条
PG 里 `CREATE DATABASE app` 建的是一个物理独立的库，表默认在 public schema。MySQL 迁移脚本里的 `mydb.orders` 会被直接改成 `app.orders`，而 app 在 PG 里是 database 的位置，于是报 `schema app does not exist`。
:::

### 1.2 存储与并发模型（后面所有结论的依据）

| 维度 | MySQL 8（InnoDB） | PostgreSQL |
| :-- | :-- | :-- |
| 表组织 | **聚簇索引**：主键 B+ 树即数据本体，没有独立堆 | **堆表** + 独立索引，索引叶子存 ctid（物理位置） |
| 二级索引存什么 | 主键值 | 堆行指针 ctid |
| 顺序扫描 | 扫主键索引，所以主键顺序插入极其关键 | 扫堆文件，与主键无关（也可 CLUSTER 一次性重排） |
| MVCC | undo log 版本链 + read view，旧版本在回滚段 | 行头 xmin/xmax 多版本，**旧版本留在表里**，更新写新行 |
| 旧版本清理 | purge 线程自动回收 | VACUUM（autovacuum 异步），长事务会阻塞回收 → 表膨胀 |
| 事务日志 | redo log（循环写）+ binlog（复制/归档） | WAL 单一日志，兼崩溃恢复、复制、PITR |
| 默认隔离级别 | REPEATABLE READ（靠间隙锁防幻读） | READ COMMITTED（语句级快照） |
| 行数统计 | COUNT(*) 扫最小的二级索引 | COUNT(*) 必须扫表/索引，没有缓存行数 |
| DDL | 原子 DDL，Online DDL 多数不锁表 | DDL 完全事务化，可以 ROLLBACK |
| 复制 | binlog（ROW 为主）+ GTID，并行复制 | 物理流复制（WAL）+ 逻辑复制（publication） |

由此可以直接推出几条实践结论：

1. **PG 的 UPDATE 比 MySQL 更贵**：更新要在堆里写一条新行，被更新的每个索引都要插入新条目，旧条目等 VACUUM 清理。热点行（计数器、库存）要降低 `fillfactor`，并保证 autovacuum 跟得上。
2. **MySQL 的二级索引天然覆盖主键**：`INDEX(status)` 实际是 (status, id)，所以 `WHERE status=? ORDER BY id` 很容易走覆盖索引；PG 需要显式 `INCLUDE (id)`。
3. **MySQL 的主键选择直接影响写性能**：随机 UUID 主键导致页分裂与大量随机 IO；PG 只是索引随机写，影响相对轻，但同样建议有序主键。
4. **PG 对长事务极其敏感**：一个挂两小时的只读事务就能让 autovacuum 失效，全库膨胀；MySQL 的长事务主要是 undo 膨胀和锁等待。

## 二、启动与连接（配置从简）

### 2.1 用 Docker 起两个实例

```bash title="start.sh"
# MySQL 8.4
docker run -d --name mysql8 -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=app mysql:8.4

# PostgreSQL 16
docker run -d --name pg16 -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=app postgres:16
```

### 2.2 客户端常用操作对照

每天都要用的部分，建议直接记住。

| 需求 | MySQL | PostgreSQL |
| :-- | :-- | :-- |
| 进入终端 | `mysql -h127.0.0.1 -uroot -p app` | `psql -h 127.0.0.1 -U postgres -d app` |
| 列出所有库 | `SHOW DATABASES;` | `\l` |
| 切换库 | `USE app;` | `\c app` |
| 列出表 | `SHOW TABLES;` | `\dt` / `\dt+` |
| 表结构 | `DESC orders;` / `SHOW CREATE TABLE orders;` | `\d orders` / `\d+ orders` |
| 索引 | `SHOW INDEX FROM orders;` | `\di` 或 `\d orders`（会一并列出索引） |
| 竖排显示 | 语句结尾用 `\G` | `\x` 开关 |
| 计时 | `SET profiling=1;` | `\timing` |
| 执行 SQL 文件 | `SOURCE init.sql;` | `\i init.sql` |
| 会话列表 | `SHOW PROCESSLIST;` | `SELECT * FROM pg_stat_activity;` |
| 杀掉会话 | `KILL 123;` | `SELECT pg_terminate_backend(123);` |
| 查看参数 | `SHOW VARIABLES LIKE 'innodb%';` | `SELECT * FROM pg_settings WHERE name LIKE '%work_mem%';` |

::: note 两个顺手的技巧
MySQL 的 `\G` 与 psql 的 `\x` 能把一行结果竖着打印成「字段名: 值」，排查宽表时比横向滚动舒服得多。
:::

### 2.3 连接串

```text title="JDBC 连接串"
# MySQL
jdbc:mysql://127.0.0.1:3306/app?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&rewriteBatchedStatements=true

# PostgreSQL
jdbc:postgresql://127.0.0.1:5432/app?currentSchema=public&ApplicationName=order-service&reWriteBatchedInserts=true
```

- MySQL 的 `rewriteBatchedStatements=true` 会把批量 INSERT 改写成多值语法，批量写入提升明显，几乎必开。
- PG 的 `currentSchema` 决定 search_path，`ApplicationName` 让 `pg_stat_activity` 里能看出是哪个服务在跑慢 SQL。
- 时区：MySQL 建议 JDBC 明确 `serverTimezone`；PG 用 timestamptz 就不需要额外参数。

### 2.4 最小生产配置

只列真正改变行为的几项，其余默认值在 8.0 / 16 上都算合理。

```ini title="my.cnf"
[mysqld]
# 内存：物理内存的 50%~70%，InnoDB 最关键的一项
innodb_buffer_pool_size = 8G
# 连接数：与连接池上限之和匹配，不是越大越好
max_connections = 500
# 数据安全：1 表示每次提交都刷盘；追求吞吐可退到 2
innodb_flush_log_at_trx_commit = 1
sync_binlog = 1
# 字符集：8.0 默认已是 utf8mb4，显式写死防踩坑
character-set-server = utf8mb4
collation-server = utf8mb4_0900_ai_ci
# 慢日志：定位问题的第一现场
slow_query_log = ON
long_query_time = 0.5
log_slow_extra = ON
# binlog 保留时长，影响 PITR 与复制
binlog_expire_logs_seconds = 604800
```

```ini title="postgresql.conf"
# 内存
shared_buffers = 4GB                # 物理内存 25% 左右
effective_cache_size = 12GB         # 估算 OS 缓存，影响代价模型
work_mem = 16MB                     # 单个排序/哈希算子的上限
maintenance_work_mem = 1GB          # VACUUM / CREATE INDEX 用
# 并发
max_connections = 200               # 每连接一个进程，建议配合 PgBouncer
# SSD 上把随机读代价降下来，否则优化器会抗拒索引
random_page_cost = 1.1
# 慢 SQL 与执行计划
log_min_duration_statement = 500ms
shared_preload_libraries = 'pg_stat_statements'
# autovacuum 要比默认更积极
autovacuum_naptime = 15s
autovacuum_vacuum_scale_factor = 0.05
autovacuum_analyze_scale_factor = 0.02
```

| 参数 | 作用 | 配错的后果 |
| :-- | :-- | :-- |
| innodb_buffer_pool_size | 缓存数据页与索引页 | 过小 → 频繁读盘，全表扫描变灾难 |
| innodb_flush_log_at_trx_commit | 提交时是否刷 redo | 设 0 会丢事务，只能用于可容忍丢失的场景 |
| shared_buffers | PG 自己的页缓存 | 过小 → 更依赖 OS 缓存，多一次拷贝 |
| work_mem | 单算子可用内存 | 过小 → 排序/哈希落盘，Execution 出现 disk 字样 |
| random_page_cost | 随机读代价 | 机械盘的 4.0 用在 SSD 上，优化器会错误地放弃索引 |
| max_connections | 最大连接数 | PG 调太高会 OOM，应该上连接池 |

## 三、数据类型对照

### 3.1 主键与自增

```sql title="主键写法"
-- MySQL
CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB;

-- PostgreSQL：推荐 IDENTITY（SQL 标准），SERIAL 是历史写法
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

| 关注点 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 自增 | AUTO_INCREMENT 是表属性；LAST_INSERT_ID() 取回 | GENERATED AS IDENTITY，或 SERIAL（sequence + default） |
| 取回新 id | `SELECT LAST_INSERT_ID();` | `INSERT ... RETURNING id` |
| 重设起点 | `ALTER TABLE t AUTO_INCREMENT = 1000;` | `ALTER TABLE t ALTER COLUMN id RESTART WITH 1000;` |
| 显式插入 | 直接给值 | GENERATED ALWAYS 时需要 OVERRIDING SYSTEM VALUE |
| 事务回滚 | 已分配的值不回退 | 同左，序列不参与事务 |
| 高并发替代 | 雪花 ID、`UUID_TO_BIN(UUID(), 1)`（8.0 有序 UUID） | `gen_random_uuid()`（13+ 内置）、UUIDv7、号段模式 |

::: warning 序列空洞是正常现象
两边的自增/序列都会因为回滚、批量预取、重启缓存而出现断层。业务上不要假设 id 连续，更不能拿 id 做数量统计。
:::

### 3.2 常用类型对照

| 用途 | MySQL 8 | PostgreSQL | 说明 |
| :-- | :-- | :-- | :-- |
| 整数 | TINYINT / SMALLINT / INT / BIGINT，可 UNSIGNED | smallint / integer / bigint，无 unsigned | PG 用 `CHECK (x >= 0)` 表达非负 |
| 金额 | `DECIMAL(18,2)` | `numeric(18,2)` | 都别用 float 存钱 |
| 变长字符 | `VARCHAR(n)`，长度必填 | `varchar(n)` 可不写长度，`text` 等价 | PG 里 varchar 与 text 性能无差别 |
| 布尔 | `TINYINT(1)`，BOOL 只是别名 | 原生 boolean | PG 可以 `WHERE is_paid` |
| 时间点 | TIMESTAMP（随 time_zone 转换，2038 上限） | timestamptz（按 UTC 存，按时区显示） | 跨时区业务 PG 更省心 |
| 本地时间 | DATETIME(3)（原样存储，可到 9999） | timestamp / timestamp(3) | MySQL 存业务时间常用 DATETIME |
| JSON | `JSON`（二进制），不能直接建索引 | `jsonb`（二进制，可建 GIN 索引） | PG 的 jsonb 更适合查询 |
| 枚举 | `ENUM('a','b')`，改值要 ALTER | `CREATE TYPE ... AS ENUM` | 两边都更推荐 tinyint + 字典表 |
| 数组/范围 | 不支持 | `int[]`、`tstzrange` | PG 独有能力 |
| UUID | CHAR(36) 或 BINARY(16) | 原生 `uuid`（16 字节） | PG 存储更省 |
| IP | VARCHAR(45) | 原生 `inet` / `cidr` | PG 能直接做网段判断 |
| 二进制 | BLOB / VARBINARY | `bytea` | 大文件都别入库 |

### 3.3 六个高频坑

1. **字符集**：MySQL 8 默认 utf8mb4 + utf8mb4_0900_ai_ci，但老库还可能是 utf8mb3，存 emoji 直接报错或截断。检查：`SHOW CREATE TABLE t\G`。
2. **默认 collation 不区分大小写**：`WHERE code = 'abc'` 会命中 ABC。要区分就用 utf8mb4_0900_as_cs；别用 `WHERE BINARY code = ...`，那会让索引失效。
3. **PG 的标识符自动折叠为小写**：`CREATE TABLE Orders` 实际叫 orders；加双引号写 `Orders` 会保留大小写，但之后每次都得加引号。**建表一律用小写下划线**。
4. **MySQL 表名大小写**取决于 lower_case_table_names：Linux 默认 0（敏感），macOS 默认 1（不敏感）。本地能跑、到 Linux 报表不存在，基本都是这个。
5. **TIMESTAMP 与 DATETIME 混用**：MySQL 的 TIMESTAMP 会按会话时区转换，同一行数据在不同会话看到不同的值；DATETIME 原样存储。约定一种并写进规范。
6. **PG 的 char(n) 会补空格**：语义容易和 varchar 混淆，除定长编码外统一用 varchar / text。

## 四、建表与 DDL

### 4.1 同一张表的两边写法

::: code-tabs
@tab:active MySQL

```sql title="orders_mysql.sql"
CREATE TABLE orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  order_no VARCHAR(32) NOT NULL,
  amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  status TINYINT NOT NULL DEFAULT 0 COMMENT '0待支付 1已支付 2已取消',
  ext JSON DEFAULT NULL,
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uk_order_no (order_no),
  KEY idx_user_status_time (user_id, status, created_at),
  CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='订单表';
```

@tab PostgreSQL

```sql title="orders_pg.sql"
CREATE TABLE orders (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users (id),
  order_no varchar(32) NOT NULL,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  status smallint NOT NULL DEFAULT 0,   -- 0待支付 1已支付 2已取消
  ext jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX uk_order_no ON orders (order_no);
CREATE INDEX idx_user_status_time ON orders (user_id, status, created_at DESC);
COMMENT ON TABLE orders IS '订单表';
COMMENT ON COLUMN orders.status IS '0待支付 1已支付 2已取消';
```
:::

| 项 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 注释 | 列内联 COMMENT，表尾 COMMENT= | 独立的 COMMENT ON TABLE / COLUMN |
| 自动更新 updated_at | `ON UPDATE CURRENT_TIMESTAMP` | 无内置语法，用触发器或应用层维护 |
| 存储引擎 | ENGINE=InnoDB 必须显式 | 无此概念 |
| 索引位置 | 建表语句内一并写出 | 主流是单独 CREATE INDEX，可以并发建 |
| 大小写 | 反引号包裹标识符 | 双引号包裹（会保留大小写） |

### 4.2 DDL 差异清单

- **事务性**：PG 的 DDL 可以整体回滚；MySQL 8 是原子 DDL（单条语句失败自动回滚），但 ALTER 不能和业务事务混在一起。
- **隐式提交**：MySQL 执行 DDL 会隐式提交当前事务，迁移脚本包 BEGIN...COMMIT 是无效的；PG 里不会。
- **删表后的空间**：MySQL 直接删 .ibd，空间立刻还给文件系统；PG 只是打标记，物理文件要等 vacuum 才释放，磁盘看着没降。
- **索引维护**：MySQL 加索引走 Online DDL（INPLACE + NONE）；PG 必须用 `CREATE INDEX CONCURRENTLY` 才不阻塞写入，且它不能在事务块里执行。

### 4.3 常用变更语句对照

| 操作 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 加列 | `ALTER TABLE t ADD COLUMN c INT NOT NULL DEFAULT 0;` | 同左 |
| 改列类型 | `ALTER TABLE t MODIFY c BIGINT NOT NULL;` | `ALTER TABLE t ALTER COLUMN c TYPE bigint;` |
| 改列名 | `ALTER TABLE t RENAME COLUMN a TO b;` | 同左 |
| 改默认值 | `ALTER TABLE t ALTER COLUMN c SET DEFAULT 1;` | 同左 |
| 加索引（不锁写） | `ALTER TABLE t ADD INDEX idx(c), ALGORITHM=INPLACE, LOCK=NONE;` | `CREATE INDEX CONCURRENTLY idx ON t (c);` |
| 删除索引 | `ALTER TABLE t DROP INDEX idx;` | `DROP INDEX CONCURRENTLY idx;` |
| 加唯一约束 | `ALTER TABLE t ADD UNIQUE KEY uk(c);` | `ALTER TABLE t ADD CONSTRAINT uk UNIQUE (c);` |
| 清空表 | `TRUNCATE TABLE t;`（不可回滚） | `TRUNCATE t;`（事务内可回滚） |
| 回收空间 | `OPTIMIZE TABLE t;`（锁表重建） | `VACUUM FULL t;`（锁表，改用 pg_repack 可不锁） |
| 表大小 | `SELECT data_length + index_length FROM information_schema.tables WHERE table_name='t';` | `SELECT pg_size_pretty(pg_total_relation_size('t'));` |

::: caution TRUNCATE 的差别别忽略
MySQL 的 TRUNCATE 是 DDL，隐式提交且**不可回滚**，误删只能靠备份；PG 的 TRUNCATE 是事务性操作，`BEGIN; TRUNCATE t; ROLLBACK;` 能救回来。生产上清表前先确认自己在哪个库。
:::

## 五、增删改查

### 5.1 插入

```sql title="insert.sql"
-- MySQL：批量插入、忽略重复、冲突更新
INSERT INTO users (name, age) VALUES ('张三', 18), ('李四', 20);
INSERT IGNORE INTO users (name, age) VALUES ('张三', 18);
INSERT INTO users (name, age) VALUES ('张三', 18)
  ON DUPLICATE KEY UPDATE age = VALUES(age);

-- PostgreSQL：批量插入、冲突忽略、冲突更新、返回主键
INSERT INTO users (name, age) VALUES ('张三', 18), ('李四', 20);
INSERT INTO users (name, age) VALUES ('张三', 18)
  ON CONFLICT (name) DO NOTHING;
INSERT INTO users (name, age) VALUES ('张三', 18)
  ON CONFLICT (name) DO UPDATE SET age = EXCLUDED.age
  RETURNING id;
```

| 场景 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 冲突则更新 | `ON DUPLICATE KEY UPDATE`（按任意唯一键触发） | `ON CONFLICT (col) DO UPDATE`（必须指定冲突目标） |
| 冲突则跳过 | `INSERT IGNORE`（会吞掉所有错误） | `ON CONFLICT DO NOTHING` |
| 先删后插 | `REPLACE INTO`（实为 delete + insert，触发器与自增会被消耗） | 无等价语法，用 `ON CONFLICT` 或 `MERGE`（15+） |
| 返回插入行 | 只有 `LAST_INSERT_ID()` | `RETURNING *` |
| COPY 大批导入 | `LOAD DATA LOCAL INFILE` | `COPY t FROM STDIN`（最快的官方方式） |

::: warning 8.0.20 起 VALUES() 已被废弃
`ON DUPLICATE KEY UPDATE age = VALUES(age)` 在 8.0.20 之后被标记为 deprecated，新写法是行别名：

```sql title="upsert_mysql8.sql"
INSERT INTO users (name, age) VALUES ('张三', 18) AS new
  ON DUPLICATE KEY UPDATE age = new.age;
```
:::

### 5.2 查询

```sql title="select.sql"
-- 分页
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 10 OFFSET 20;   -- 两边通用
SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20, 10;          -- MySQL 专有

-- 分组统计（两边都支持窗口函数与 CTE）
SELECT user_id, COUNT(*) AS cnt, SUM(amount) AS total
FROM orders
WHERE created_at >= '2026-01-01'
GROUP BY user_id
HAVING SUM(amount) > 1000
ORDER BY total DESC
LIMIT 10;

WITH ranked AS (
  SELECT id, user_id, amount,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY amount DESC) AS rn
  FROM orders
)
SELECT * FROM ranked WHERE rn <= 3;
```

| 关注点 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 分页 | `LIMIT n` / `LIMIT offset, n` | `LIMIT n OFFSET m`（offset 在前会报错） |
| NULL 排序 | NULL 视为最小值，`ORDER BY c` 时排在最前 | 默认 NULL 排最后，可用 `NULLS FIRST/LAST` |
| GROUP BY 校验 | 8.0 默认开启 ONLY_FULL_GROUP_BY | 一直严格，选了非聚合列必须出现在 GROUP BY |
| 别名可用位置 | HAVING、ORDER BY | GROUP BY、ORDER BY（WHERE 都不行） |
| 字符串拼接 | `CONCAT(a,b)` | `a \|\| b` 或 `concat()` |
| 类型严格性 | 隐式转换：`'123' = 123` 为真，`WHERE int_col = 'abc'` 不报错但扫全表 | 严格：类型不匹配直接报错，必须显式 `::int` |
| 取行数 | `COUNT(*)` 扫最小二级索引 | `COUNT(*)` 扫堆/索引，大表很慢 |

### 5.3 更新与删除

```sql title="update_delete.sql"
-- MySQL：更新可用 JOIN，多表一起改
UPDATE orders o
JOIN users u ON u.id = o.user_id
SET o.status = 2
WHERE u.disabled = 1;

-- MySQL 里 UPDATE 子查询不能直接引用同一张表（报 1093），需要包一层派生表
UPDATE orders SET amount = amount * 2
WHERE id IN (SELECT id FROM (SELECT id FROM orders WHERE status = 0) AS t);

-- PostgreSQL：UPDATE ... FROM
UPDATE orders o
SET status = 2
FROM users u
WHERE u.id = o.user_id AND u.disabled = true;

-- 两边通用：带 RETURNING 的删除只有 PG 有
DELETE FROM orders WHERE status = 2 AND created_at < now() - interval '90 days' RETURNING id;
```

| 场景 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 关联更新 | `UPDATE a JOIN b ... SET` | `UPDATE a SET ... FROM b WHERE` |
| 同表子查询 | 报 1093，要套派生表 | 允许 |
| 返回被改的行 | 只有 affected rows | `RETURNING *` |
| 删表数据 | `DELETE FROM t WHERE ...` | 同左 |
| 安全更新 | `sql_safe_updates=1`（必须带 key 条件） | 无内置，靠事务与 `LIMIT` 兜底 |
| 乐观锁 | `UPDATE t SET v=v+1, ver=ver+1 WHERE id=? AND ver=?` | 同左 |

::: tip 用一个事务兜底误操作
没有 RETURNING 的 MySQL 想确认「将要改哪些行」，先跑同条件的 `SELECT id` 并把结果存下来，再开事务执行 DML，确认 affected rows 与预期一致才 commit。这个习惯比事后回滚便宜得多。
:::

### 5.4 常用函数对照

| 需求 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 当前时间 | `NOW(3)` / `CURRENT_TIMESTAMP(3)` | `now()` / `CURRENT_TIMESTAMP` |
| 加减时间 | `DATE_ADD(d, INTERVAL 7 DAY)` | `d + interval '7 days'` |
| 截断到天 | `DATE(d)` | `date_trunc('day', d)` |
| 格式化 | `DATE_FORMAT(d, '%Y-%m-%d')` | `to_char(d, 'YYYY-MM-DD')` |
| 字符串转时间 | `STR_TO_DATE('2026-01-01', '%Y-%m-%d')` | `'2026-01-01'::date` |
| 取部分 | `YEAR(d)` / `MONTH(d)` | `EXTRACT(YEAR FROM d)` |
| 差值 | `TIMESTAMPDIFF(DAY, a, b)` | `b - a`（得到 interval） |
| NULL 兜底 | `IFNULL(a, b)` / `COALESCE` | `COALESCE(a, b)` |
| 条件表达式 | `IF(c, a, b)` / `CASE WHEN` | `CASE WHEN`（无 IF，用 `iif` 需自建） |
| 正则 | `REGEXP_LIKE(s, pat)` | `s ~ pat` |
| JSON 取值 | `JSON_EXTRACT(ext, '$.a')` / `ext->>'$.a'` | `ext->>'a'`（文本）/ `ext->'a'`（jsonb） |
| 分组聚合字符串 | `GROUP_CONCAT(x ORDER BY y SEPARATOR ',')` | `string_agg(x, ',' ORDER BY y)` |
| 主键取回 | `LAST_INSERT_ID()` | `RETURNING id` |

## 六、事务、锁与并发

### 6.1 显式事务

```sql title="transaction.sql"
-- 两边写法一致
BEGIN;                 -- MySQL 里 START TRANSACTION 等价
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
SAVEPOINT sp1;         -- 部分回滚用
-- ...
ROLLBACK TO SAVEPOINT sp1;
COMMIT;
```

差异在于默认行为：

| 项 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 自动提交 | 默认 ON，单条语句即事务 | 默认 ON（与 MySQL 相同） |
| 语句失败后的事务 | 事务仍可继续，出错语句被跳过 | **整个事务进入 aborted 状态**，后续语句全部报错，只能 ROLLBACK 或 ROLLBACK TO SAVEPOINT |
| 只读事务 | `START TRANSACTION READ ONLY` | `BEGIN READ ONLY` / `SET TRANSACTION READ ONLY` |
| 事务超时 | `innodb_lock_wait_timeout`（默认 50s），`max_execution_time` | `statement_timeout`、`lock_timeout`、`idle_in_transaction_session_timeout` |

::: warning PG 的 aborted 事务
在 PG 里一条语句报错后，同一个事务里后面的语句会全部失败并提示 `current transaction is aborted`。这是很多人第一次用 PG 时最迷惑的行为——不是连接坏了，是事务需要回滚。应用层要保证捕获异常后立即 rollback，而不是继续复用这个连接。
:::

### 6.2 隔离级别的语义差异

| 隔离级别 | MySQL 8 默认 | PostgreSQL 默认 | 说明 |
| :-- | :-- | :-- | :-- |
| READ UNCOMMITTED | 支持（实际等价于 RC） | 不支持（当作 RC） | 没有真正的脏读 |
| READ COMMITTED | 支持 | **默认** | 每条语句取新快照，能读到提交后的新数据 |
| REPEATABLE READ | **默认** | 支持 | MySQL 用间隙锁 + next-key lock 防幻读；PG 用事务级快照，写冲突时报 could not serialize |
| SERIALIZABLE | 支持 | 支持（SSI 实现） | PG 的 SSI 不需要读锁，靠冲突检测回滚 |

由此产生两个常见误判：

1. **MySQL RR 下的「当前读」会看到别人刚提交的数据**：`SELECT ... FOR UPDATE`、`UPDATE`、`DELETE` 走当前读，加间隙锁；普通 `SELECT` 走快照读。所以「同一个事务里两次查结果不一样」在 MySQL 里通常是当前读与快照读混用造成的。
2. **PG 的 RR 不是靠锁防幻读**：它靠快照 + 序列化检测，因此两个事务同时更新同一行时，后提交的会报 `could not serialize access due to concurrent update`，应用层必须实现重试。

::: tip 跨库都要写的一条规范
凡是「读-改-写」的并发逻辑，别指望隔离级别兜底。用乐观锁（版本号）或 `SELECT ... FOR UPDATE` 明确串行化，并给事务加上重试。
:::

### 6.3 加锁语句对照

```sql title="lock.sql"
-- 悲观锁：查出来就锁住
SELECT * FROM account WHERE id = 1 FOR UPDATE;              -- 两边通用
SELECT * FROM account WHERE id = 1 FOR SHARE;               -- 共享锁

-- 不想等：立刻失败或跳过被锁的行
-- MySQL 8
SELECT * FROM task WHERE status = 0 LIMIT 1 FOR UPDATE SKIP LOCKED;
-- PostgreSQL
SELECT * FROM task WHERE status = 0 LIMIT 1 FOR UPDATE SKIP LOCKED;
```

| 特性 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 行锁加在哪 | 加在**索引记录**上；没走索引会退化成锁全表（所有行 + 间隙） | 加在堆行上（tuple 锁），没走索引也是锁全表行 |
| 间隙锁 | 有（RR 下来防止幻读，容易死锁） | 无 |
| NOWAIT / SKIP LOCKED | 8.0 支持 | 9.5 起支持 |
| 表级锁 | `LOCK TABLES`（几乎不要用） | `LOCK TABLE ... IN ACCESS EXCLUSIVE MODE` |
| 队列消费 | `SKIP LOCKED` 是标准做法 | 同左，配合 `UPDATE ... RETURNING` 更顺手 |

### 6.4 查锁与死锁

```sql title="lock_debug.sql"
-- MySQL：谁在等谁
SELECT * FROM sys.innodb_lock_waits\G
SELECT * FROM performance_schema.data_locks;
SELECT * FROM information_schema.innodb_trx\G
SHOW ENGINE INNODB STATUS\G        -- 里面有 LATEST DETECTED DEADLOCK 段落

-- PostgreSQL：一次查清阻塞关系
SELECT pid, pg_blocking_pids(pid) AS blocked_by, state, wait_event_type, left(query, 80) AS query
FROM pg_stat_activity
WHERE cardinality(pg_blocking_pids(pid)) > 0;

SELECT locktype, relation::regclass, mode, granted, pid FROM pg_locks WHERE NOT granted;
```

死锁处理：MySQL 会自动回滚代价小的一方，报 `Deadlock found when trying to get lock; try restarting transaction`；PG 报 `deadlock detected`。**两边都必须实现事务级重试**，因为死锁永远无法只靠代码「避免」，只能降低概率。

### 6.5 降低死锁与锁等待的六条规范

1. **固定加锁顺序**：多个资源（账户 A、B）按主键排序后再加锁，这是最有效的一招。
2. **事务里不做外部调用**：RPC、HTTP、发消息都不许放在事务里，这决定了锁的持有时间。
3. **写语句必须走索引**：MySQL 里没有索引的 `UPDATE` 会锁全表并加间隙锁，是最常见的死锁源头。
4. **拆小事务**：批量更新按主键分批（每批 500~1000 行）提交，避免长事务阻塞 purge / vacuum。
5. **乐观锁优先**：有明显热点行（库存、余额）时，用版本号或条件更新 `UPDATE ... WHERE stock >= n`，让数据库自己做原子判断。
6. **明确超时**：`innodb_lock_wait_timeout`、`lock_timeout` 设小一点（比如 3~5s），让故障快速暴露而不是堆积。

### 6.6 一致性快照导出

备份和「导数据做分析」都要一致性快照，避免导出到一半数据变了：

```bash title="dump.sh"
# MySQL：单事务快照，记录位点便于 PITR
mysqldump -uroot -p --single-transaction --set-gtid-purged=ON --databases app > app.sql

# PostgreSQL：自定义格式 + 快照，可并行恢复
pg_dump -Fc -f app.dump app
pg_dump --snapshot=$(psql -tAc "SELECT pg_export_snapshot()" app) -Fc app > consistent.dump
```

## 七、索引：原理与用法

### 7.1 索引在磁盘上长什么样

**MySQL（InnoDB）**：表就是一棵按主键排序的 B+ 树（聚簇索引），叶子节点直接存整行数据。在别的列上建的索引是另一棵 B+ 树，叶子存「索引列 + 主键值」。所以：

```sql title="回表.sql"
-- 有索引 KEY idx_user (user_id)
SELECT id, user_id FROM orders WHERE user_id = 10;   -- 覆盖索引：二级索引里已有 id，无需回表
SELECT id, amount FROM orders WHERE user_id = 10;    -- 需要回表：拿主键再去聚簇索引取整行
```

**PostgreSQL**：表和索引完全分离，索引叶子存「索引列 + ctid（物理页位置）」。取非索引列必须回堆表，叫 *heap fetch*；只有当页的 visibility map 标记为全可见时，才能只走索引（index-only scan），而这个 map 由 VACUUM 维护——这是 PG 里「为什么刚大批量写入后 index-only scan 不生效」的原因。

| 概念 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 主键索引 | 聚簇索引，即数据本体 | 普通唯一 B 树索引 |
| 二级索引定位 | 主键 → 回表 | ctid → 回堆 |
| 覆盖索引 | 天然包含主键，容易达成 | 需要 `INCLUDE (col)`（11+）或把列放进索引键 |
| 索引顺序 vs 物理顺序 | 主键决定物理顺序 | 无关，`CLUSTER` 才重排一次 |
| 索引页分裂 | 随机主键导致频繁分裂，碎片化 | 同样存在，但堆表不受主键影响 |

::: tip 一条来自存储结构的经验
MySQL 上「主键一定要有序且短」是硬要求：主键值会被复制到每一个二级索引里（所以 varchar(64) UUID 主键会让所有索引一起膨胀），且随机插入造成页分裂。PG 上主键只影响索引本身，但仍推荐有序、短主键。
:::

### 7.2 索引类型对照

| 索引类型 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 普通 / 唯一 | `KEY` / `UNIQUE KEY` | `CREATE INDEX` / `CREATE UNIQUE INDEX` |
| 复合索引 | `KEY (a, b, c)` | `ON t (a, b, c)` |
| 前缀索引 | `KEY (name(10))` | 不支持（用表达式索引 `left(name,10)` 代替） |
| 降序索引 | 8.0 支持 `KEY (a DESC)`（之前被忽略） | `ON t (a DESC NULLS LAST)` |
| 函数 / 表达式索引 | 8.0.13+ 用生成列 + 索引 | 原生 `ON t (lower(email))` |
| 部分索引 | 不支持 | `ON t (a) WHERE status = 1` |
| 不可见索引 | `ALTER TABLE t ALTER INDEX idx INVISIBLE`（让优化器忽略，用于安全下线） | 无，直接 drop，或靠 `SET enable_indexscan = off` 临时验证 |
| 全文索引 | `FULLTEXT`（中文需 ngram 解析器） | `tsvector` + GIN，或 pg_trgm |
| JSON 索引 | 生成列 + 索引；8.0.17+ 多值索引 | `GIN (jsonb_col)` 直接建 |
| 数组 / 范围 | 不支持 | `GIN` / `GiST` |
| 大表顺序扫描加速 | 无 | `BRIN`（按物理顺序，索引体积极小） |
| 空间索引 | `SPATIAL`（仅 MyISAM/InnoDB with SRID） | `GiST (geom)` + PostGIS |

### 7.3 复合索引与最左前缀

假设两边都建了 `(user_id, status, created_at)`，判断下面这些查询能否用上索引：

| 查询条件 | 是否能用 | 说明 |
| :-- | :-- | :-- |
| `WHERE user_id = 1` | 是 | 用到最左列 |
| `WHERE user_id = 1 AND status = 0` | 是 | 连续前缀 |
| `WHERE user_id = 1 AND created_at > now() - interval '1 day'` | 部分 | 只能用到 user_id，created_at 无法继续定位（跳过了 status） |
| `WHERE status = 0` | 否 | 缺最左列；MySQL 8.0.13+ 在列基数极低时可能用 skip scan，PG 一般直接全表扫 |
| `WHERE user_id = 1 ORDER BY created_at` | 否（排序部分） | 中间缺 status，排序要额外 sort |
| `WHERE user_id = 1 AND status = 0 ORDER BY created_at DESC` | 是 | 三个位置全部用上，且不需要额外排序 |
| `WHERE user_id > 1 AND status = 0` | 部分 | 范围列之后的索引列无法用于定位 |

几条实践规则：

1. **等值列在前，范围列在后**，排序字段紧跟等值列，这样能同时解决过滤和排序。
2. **把选择性最高的列放前面**只是经验之谈，前提是查询模式确实是那个前缀；复合索引先看查询，再看区分度。
3. **MySQL 的索引下推（ICP）**：范围扫描时优化器可以把未走索引的列条件下推到存储引擎层过滤，减少回表次数，`EXPLAIN` 里显示 `Using index condition`。PG 没有对应概念，它由规划器决定在索引扫描中带上 filter。
4. **PG 可以用多个索引做 BitmapAnd / BitmapOr**，把两个单列索引组合起来；MySQL 也有 index merge，但通常不如一个合适的复合索引。

### 7.4 选择性：该不该建索引

索引不是越多越好，每个索引都会拖慢写入并占用空间。判断标准是**区分度**：

```sql title="selectivity.sql"
-- MySQL：区分度越接近 1 越好
SELECT COUNT(DISTINCT status) / COUNT(*) AS sel_status,
       COUNT(DISTINCT user_id) / COUNT(*) AS sel_user
FROM orders;

-- PostgreSQL：同样思路，也可以用 pg_stats 直接看
SELECT attname, n_distinct, most_common_vals
FROM pg_stats WHERE tablename = 'orders';
```

经验值：

- 区分度 < 0.01 的列（性别、状态、是否删除）**单独建索引意义不大**，但如果和别的列组成复合索引的最左列反而合适（比如 `(status, created_at)` 用于捞待处理任务）。
- 查询返回行数超过表总量的 10%~20% 时，全表扫描往往更快，优化器也会这么选。
- 写入密集的表（日志、消息）索引数量控制在 3~5 个以内。

### 7.5 索引设计清单

1. 主键用有序短整型（bigint），避免 varchar UUID 直接做聚簇主键。
2. 每个高频查询都要有能走到的索引，按 `WHERE` + `ORDER BY` 的实际组合设计复合索引。
3. 唯一约束用唯一索引表达，别用「先查再插」（并发下必翻车）。
4. 模糊搜索用全文索引或 pg_trgm，不要指望 `LIKE '%kw%'` 能用 B 树索引。
5. 只对大表、高频查询建索引；小表（几千行）全表扫完全够用。
6. 定期清理未使用的索引（见 7.6）。
7. 账号/租户类的多租户表，把 `tenant_id` 放在复合索引最左边，天然获得隔离的扫描范围。

### 7.6 索引的查看、清理与维护

```sql title="index_maintenance.sql"
-- MySQL：看索引使用情况（sys 库）
SELECT object_name, index_name FROM sys.schema_unused_indexes;
SELECT index_name, stat_value FROM mysql.innodb_index_stats
WHERE table_name = 'orders' AND stat_name = 'n_leaf_pages';

-- 安全下线：先置为不可见，观察一段时间没问题再删
ALTER TABLE orders ALTER INDEX idx_old INVISIBLE;
ALTER TABLE orders DROP INDEX idx_old;

-- PostgreSQL：idx_scan = 0 说明从没被用过
SELECT relname, indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes WHERE idx_scan = 0 ORDER BY pg_relation_size(indexrelid) DESC;

-- 重建索引（减少膨胀）
REINDEX INDEX CONCURRENTLY idx_orders_user;
```

**统计信息**是优化器做决定的依据，过期就会选错计划：

| 动作 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 手动收集 | `ANALYZE TABLE orders;` | `ANALYZE orders;` |
| 自动收集 | 由 `innodb_stats_auto_recalc` 触发（默认开启，变化超 10% 才触发） | autovacuum 的 analyze 阶段 |
| 采样粒度 | `innodb_stats_persistent_sample_pages`（默认 20） | `default_statistics_target`（默认 100，按列覆盖） |
| 多列相关性 | 不支持 | `CREATE STATISTICS ... (dependencies)` |

## 八、看懂执行计划

### 8.1 基本用法

```sql title="explain.sql"
-- MySQL：8.0.18+ 才有 EXPLAIN ANALYZE（会真正执行）
EXPLAIN SELECT * FROM orders WHERE user_id = 1 AND status = 0;
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 1 AND status = 0;
EXPLAIN FORMAT=JSON SELECT ...;      -- 信息最全，含成本与过滤率
EXPLAIN FORMAT=TREE SELECT ...;      -- 树形，接近 PG 的观感

-- PostgreSQL：默认成本估算；加 ANALYZE 才真正执行
EXPLAIN SELECT * FROM orders WHERE user_id = 1 AND status = 0;
EXPLAIN (ANALYZE, BUFFERS, VERBOSE) SELECT ...;
```

::: warning EXPLAIN ANALYZE 会真的执行
两边的 `EXPLAIN ANALYZE` 都会执行语句。要分析 UPDATE/DELETE 时务必包在事务里并回滚：

```sql title="explain_analyze.sql"
BEGIN;
EXPLAIN ANALYZE UPDATE orders SET status = 2 WHERE user_id = 1;
ROLLBACK;
```
:::

### 8.2 MySQL：只看四个字段就能定位问题

| 字段 | 关注点 |
| :-- | :-- |
| `type` | 从好到坏：`system` → `const` → `eq_ref` → `ref` → `range` → `index` → `ALL`。出现 `ALL`（全表扫）或 `index`（全索引扫）就要警惕 |
| `key` / `key_len` | 实际用了哪个索引、用了索引的前几列。`key_len` 比预期短，说明复合索引只用到了一部分 |
| `rows` / `filtered` | 估算扫描行数与过滤后剩余比例；`rows` 很大而 `filtered` 很小，通常是索引选择性差或缺少复合索引 |
| `Extra` | 见下方危险信号表 |

MySQL 的 `Extra` 危险信号：

| Extra | 含义 | 怎么办 |
| :-- | :-- | :-- |
| `Using filesort` | 需要额外排序（可能落盘） | 让排序字段接在等值条件后面，形成可用索引顺序 |
| `Using temporary` | 用了临时表（GROUP BY / DISTINCT / UNION 常见） | 检查 GROUP BY 是否与索引顺序一致 |
| `Using where`（且 type=ALL） | 全表扫后再过滤 | 补索引 |
| `Using index condition` | 索引下推，正常优化 | 一般无需处理 |
| `Using index` | 覆盖索引，好现象 | 保持 |
| `Using join buffer (hash join)` | 8.0.18+ 的哈希连接 | 通常说明被驱动表缺索引 |

### 8.3 PostgreSQL：成本、行数与真实 I/O

| 字段 | 含义 |
| :-- | :-- |
| `cost=0.00..8.32` | 估算的启动代价..总代价（单位是抽象的页读取代价，不是毫秒） |
| `rows=1 width=48` | 估算返回行数，与实际差几个数量级就是统计信息问题 |
| `actual time=0.012..0.045 rows=1 loops=1` | 真实耗时与真实行数，`loops` 表示该节点被执行了多少次，判断嵌套循环内层耗时要用 `actual time × loops` |
| `Buffers: shared hit=3 read=1` | 命中缓存 vs 真实读盘页数，判断慢在 I/O 还是 CPU 的直接证据 |
| `Filter / Rows Removed by Filter` | 过滤掉多少行，巨大说明索引没选对 |
| `Sort Method: external merge Disk: 24MB` | 排序落盘，调 `work_mem` 或减少排序数据量 |

常见节点名称对照：

| 含义 | MySQL | PostgreSQL |
| :-- | :-- | :-- |
| 索引范围扫描 | `type=range` | `Index Scan` / `Index Only Scan` |
| 全表扫描 | `type=ALL` | `Seq Scan` |
| 位图扫描 | `type=index_merge` | `Bitmap Heap Scan` + `Bitmap Index Scan` |
| 嵌套循环 | `Nested loop join` | `Nested Loop` |
| 哈希连接 | `Hash join` | `Hash Join` |
| 排序 | `Using filesort` | `Sort` / `Incremental Sort` |
| 聚合 | `Using temporary` + `Using filesort` | `GroupAggregate` / `HashAggregate` |

### 8.4 估算与实际严重不符怎么办

这是「昨天还快、今天就慢」的第一大原因：统计信息过期，优化器基于错误的行数估计选了嵌套循环或错误的连接顺序。

处理步骤：

1. 手动更新统计信息：MySQL `ANALYZE TABLE t;`，PG `ANALYZE t;`（大表可 `ANALYZE t (col)` 只收集关键列）。
2. 检查 PG 的 autovacuum 是否长期跟不上（看 `pg_stat_user_tables.last_analyze`）；MySQL 看 `mysql.innodb_table_stats` 的 `last_update`。
3. 仍不准就提升采样：PG 调列级 `ALTER TABLE t ALTER COLUMN c SET STATISTICS 500`，MySQL 调 `innodb_stats_persistent_sample_pages`。
4. 极端情况下临时干预执行计划：MySQL 用优化器提示 `SELECT /*+ NO_JOIN_ORDER(t1,t2) INDEX(t idx_x) */` 或 `optimizer_switch`；PG 需要 `pg_hint_plan` 扩展。**临时干预必须留注释和失效日期**，否则半年后没人敢删。

## 九、慢查询定位的标准流程

### 9.1 第一步：把慢 SQL 记录下来

```ini title="my.cnf"
slow_query_log = ON
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 0.5
log_slow_extra = ON                 # 8.0 起带更多字段（Rows_examined / Rows_sent 等）
min_examined_row_limit = 1000       # 只记录扫描行数多的，避免噪音
```

```ini title="postgresql.conf"
log_min_duration_statement = 500ms
log_lock_waits = on
log_temp_files = 0                  # 记录所有使用临时文件的语句（排序/哈希落盘）
shared_preload_libraries = 'pg_stat_statements, auto_explain'
auto_explain.log_min_duration = 1s
auto_explain.log_analyze = on
```

### 9.2 第二步：聚合分析，找出「总耗时最高的那一类」

| 目标 | MySQL | PostgreSQL |
| :-- | :-- | :-- |
| 语句排行 | `SELECT * FROM sys.statement_analysis LIMIT 20;` | `SELECT query, calls, mean_exec_time, total_exec_time FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20;` |
| 慢日志聚合 | `pt-query-digest slow.log` | `pgbadger` 或直接 grep + awk |
| 实时正在执行的语句 | `SELECT * FROM performance_schema.events_statements_current;` | `SELECT pid, now() - query_start AS dur, query FROM pg_stat_activity WHERE state <> 'idle'` |
| 重置统计 | `TRUNCATE performance_schema.events_statements_summary_by_digest;` | `SELECT pg_stat_statements_reset();` |

::: tip 别只看平均耗时
一条 P99 三秒、平均 20ms 的 SQL 才是线上雪崩的元凶。聚合时优先看 total 耗时与 max 耗时，再去取样例 SQL 分析。
:::

### 9.3 第三步：深入单条 SQL

1. `EXPLAIN ANALYZE` 拿到真实行数与耗时，对比估算值。
2. 看扫描行数（`rows` / `Rows Removed by Filter`）是否远大于返回行数——是则索引不合适。
3. PG 看 `Buffers`：`read` 大说明缓存没命中；MySQL 看 `Handler_read_next` 等状态变量或用 `performance_schema` 的 `events_statements_history_long`。
4. 用「删条件法」二分定位：把 WHERE 里的条件逐条注释掉，看哪一条让耗时骤降，通常就是它没走索引。
5. 如果 SQL 本身很快、并发下才慢，转向排查**锁等待**（第六章）与**连接池大小**。

```sql title="定位单条.sql"
-- MySQL：单条语句的详细等待与扫描信息
EXPLAIN ANALYZE SELECT /*+ INDEX(orders idx_user_status_time) */ *
FROM orders WHERE user_id = 1 AND status = 0;

-- PostgreSQL：把 I/O 与 JIT 一起打出来
EXPLAIN (ANALYZE, BUFFERS, TIMING ON) SELECT * FROM orders WHERE user_id = 1 AND status = 0;
```

## 十、经典问题与解决方案

下面每一条都是线上真实会遇到的问题，按「现象 → 原因 → 解决」组织。可以直接当排查手册用。

### 10.1 深分页：`LIMIT 1000000, 20` 越来越慢

**现象**：翻到后面几页响应时间从 20ms 涨到几秒。

**原因**：`OFFSET` 要求数据库先读出并丢弃前 100 万行，再取 20 行。丢弃的是真实行，索引扫描也要逐行回表。

**解决**：三条路，按推荐顺序。

```sql title="deeppagination.sql"
-- ① 游标分页（keyset pagination）：记住上一页最后一条的排序键
--    两边通用，且始终走索引，翻到第 100 万页也是常数时间
SELECT id, order_no, amount FROM orders
WHERE user_id = 1 AND id < 1000000        -- 上一页的最后一个 id
ORDER BY id DESC LIMIT 20;

-- ② 延迟关联（deferred join）：先用覆盖索引取出 20 个主键，再回表
SELECT o.* FROM orders o
JOIN (SELECT id FROM orders WHERE user_id = 1 ORDER BY id DESC LIMIT 1000000, 20) AS t
  ON t.id = o.id;

-- ③ 只允许前 N 页
--    产品层面限制 + 强制用户加筛选条件，比任何 SQL 优化都有效
```

::: tip 为什么游标分页是最优解
它把「偏移量」换成了「已知的边界值」，B+ 树可以直接定位，代价与页码无关。代价是不能跳页——所以后台管理页面用 ②，面向用户的列表用 ①。
:::

### 10.2 索引明明建了，优化器却不用

这是最高频的疑问。逐条排查下面的清单，95% 的情况能在里面找到答案：

| # | 失效原因 | 判断方法 | 解决 |
| :-- | :-- | :-- | :-- |
| 1 | 列被函数或运算包裹：`WHERE DATE(created_at) = '2026-01-01'` | `EXPLAIN` 里 type=ALL | 改写成范围：`created_at >= '2026-01-01' AND created_at < '2026-01-02'` |
| 2 | 隐式类型转换：varchar 列与数字比较 `WHERE order_no = 1001` | MySQL 下索引失效；PG 直接报错 | 类型对齐，参数用字符串 |
| 3 | 字符集或 collation 不一致（join 两表字段一边 utf8mb4 一边 utf8mb4_0900_ai_ci 别的排序规则） | `SHOW CREATE TABLE` 对比 | 统一字符集与排序规则 |
| 4 | 前导通配符：`LIKE '%kw%'` | `type=ALL` | 全文索引 / pg_trgm / 外部搜索 |
| 5 | 复合索引没用最左列 | `key` 为空 | 调整索引顺序或增加索引 |
| 6 | 范围条件之后的列无法定位 | `key_len` 偏短 | 把范围列放最后 |
| 7 | OR 两边一个是索引列一个不是 | `type=ALL` | 改写 `UNION ALL` |
| 8 | `NOT IN` / `!=` / `IS NOT NULL`（低选择性） | 优化器主动放弃 | 改成 `NOT EXISTS` 或补索引 |
| 9 | 统计信息过期，估算行数离谱 | 估算 rows 与真实差一个量级 | `ANALYZE` |
| 10 | 表太小，全表扫更便宜 | 行数几千 | 无需处理 |
| 11 | 返回行数占比过高（> 10%~20%） | `EXPLAIN` 显示走全表 | 加 LIMIT 或缩小范围，属正常选择 |

MySQL 与 PG 各有一个特有的坑：

- **MySQL 的参数类型偏差**：`WHERE phone = 13800000000`（int）对 varchar 列，会先 `CAST(phone AS DOUBLE)` 再比较，索引直接失效且扫描全表。养成「字符串列永远用字符串参数」的习惯。
- **PG 的 prepared statement 参数敏感**：同一份计划在参数间复用，可能导致「大部分参数值很快、某个值极慢」。PG 12+ 会在前 5 次使用自定义计划再切通用计划；遇到极端倾斜可以 `SET plan_cache_mode = force_custom_plan;` 针对该连接关闭缓存复用。

### 10.3 大表加索引、加字段，怎么不停机

| 操作 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 加索引 | `ALTER TABLE t ADD INDEX idx(c), ALGORITHM=INPLACE, LOCK=NONE;`（不阻塞读写，但仍消耗 IO） | `CREATE INDEX CONCURRENTLY idx ON t (c);` |
| 加列（带默认值） | 8.0.12+ 用 `ALGORITHM=INSTANT`，元数据级操作 | 11+ 非 volatile 默认值不重写表，瞬时完成 |
| 改列类型 | 大概率重建表（COPY），需要 gh-ost / pt-osc | 多数会重写表，用逻辑复制或 `pg_repack` 过渡 |
| 失败处理 | 中断后索引状态需检查 `information_schema.statistics` | CONCURRENTLY 失败会留下 invalid 索引，必须 `DROP INDEX` 后重来 |

::: warning CREATE INDEX CONCURRENTLY 的三个限制
不能放在事务块里；失败或取消后留下 `invalid` 状态的索引（查 `pg_index.indisvalid = false`）；会扫描两遍表，必须放在低峰期，并确认没有长事务——否则会阻塞在等待快照上，把所有写入一起拖住。
:::

MySQL 侧补充：

- `ALGORITHM=INSTANT` 加列的限制（8.0.29 之前只能加在最后、不支持带生成列等）。执行前用 `ALTER TABLE t ADD COLUMN c INT, ALGORITHM=INSTANT;` 试探，报错就退到 `INPLACE`。
- 超大表（亿级）在线加索引仍然可能撑爆 IO：用 `pt-online-schema-change` 或 `gh-ost` 做影子表切换，可以限速、可以暂停。
- 加索引前用 `EXPLAIN` 验证确实会被用上，别白花两小时 IO。

### 10.4 隐式转换与 collation 导致的「莫名全表扫」

```sql title="implicit_cast.sql"
-- 反例：order_no 是 varchar(32)
SELECT * FROM orders WHERE order_no = 20260101001;     -- MySQL 会把列转成数字，索引失效
SELECT * FROM orders WHERE order_no = '20260101001';   -- 正确

-- PG 不会隐式转换，但类型不匹配时会报错，改类型时要同步改参数
SELECT * FROM orders WHERE id = '1';                   -- PG 会尝试常量转换，一般没问题
SELECT * FROM orders WHERE created_at::date = '2026-01-01';  -- 列被函数包裹，索引失效
```

collation 不一致更隐蔽：两张表 join 时如果排序规则不同，MySQL 无法使用索引做连接（会变成全表扫 + 逐行比较），PG 则直接报 `collation mismatch`。统一做法：库级、表级、列级全部显式指定同一个 collation（MySQL 用 utf8mb4_0900_ai_ci，PG 用 `LC_COLLATE=C.UTF-8` 或 `COLLATE "C"` 以获得最快的比较速度）。

### 10.5 函数与表达式导致索引失效：生成列与表达式索引

```sql title="expression_index.sql"
-- MySQL：用生成列 + 索引（8.0.13+ 也支持函数索引，写法是 (expression)）
ALTER TABLE users ADD COLUMN email_lower VARCHAR(128)
  GENERATED ALWAYS AS (LOWER(email)) STORED;
CREATE INDEX idx_email_lower ON users (email_lower);
SELECT * FROM users WHERE email_lower = 'a@b.com';

-- 8.0.13+ 原生函数索引
CREATE INDEX idx_email_fn ON users ((LOWER(email)));

-- PostgreSQL：直接建表达式索引
CREATE INDEX idx_users_email_lower ON users (lower(email));
SELECT * FROM users WHERE lower(email) = 'a@b.com';
```

PG 的部分索引在「只查一小部分数据」时非常好用，而 MySQL 只能靠复合索引近似：

```sql title="partial_index.sql"
-- 只索引未完成的任务，索引体积可能只有全表的 1%
CREATE INDEX idx_task_pending ON task (created_at) WHERE status = 0;
-- 查询条件必须能推出 status = 0 才会用到它
SELECT * FROM task WHERE status = 0 ORDER BY created_at LIMIT 50;
```

### 10.6 锁等待与死锁：从现象到定位

**现象**：接口偶发超时，日志里出现 `Lock wait timeout exceeded`（MySQL）或 `deadlock detected`（PG）。

**定位顺序**：找到阻塞源 → 看它在等什么 → 判断是 SQL 缺索引还是事务太长。

```sql title="deadlock.sql"
-- MySQL：当前谁在跑、谁被阻塞
SELECT trx_id, trx_state, trx_started, trx_mysql_thread_id, left(trx_query, 100)
FROM information_schema.innodb_trx ORDER BY trx_started;

SELECT * FROM sys.innodb_lock_waits\G     -- 阻塞关系一目了然
SHOW ENGINE INNODB STATUS\G               -- 搜 LATEST DETECTED DEADLOCK

-- PostgreSQL：一次拿到阻塞链
SELECT a.pid, a.state, now() - a.xact_start AS xact_age,
       pg_blocking_pids(a.pid) AS blockers, left(a.query, 100)
FROM pg_stat_activity a
WHERE a.state <> 'idle' ORDER BY xact_age DESC NULLS LAST;
```

**典型死锁案例（MySQL）**：

```sql title="deadlock_case.sql"
-- 事务 A
BEGIN; UPDATE account SET balance = balance - 10 WHERE id = 1;
-- 事务 B（同时）
BEGIN; UPDATE account SET balance = balance + 10 WHERE id = 1;
-- 两个事务都去更新另一行，顺序相反 → 死锁
```

**解决思路**：

1. 业务层保证加锁顺序一致（例如总是按 id 升序更新）。
2. 让每条 DML 都走索引——MySQL 里没有索引的 UPDATE 会给所有扫描到的行加 next-key 锁，等价于锁表。
3. 缩短事务：把 RPC、日志写、消息发送移到事务外。
4. 热点行用「排队」的思路处理：单行更新改成队列表 + `SKIP LOCKED` 消费，把锁竞争变成排队。

### 10.7 连接数打满与连接池配置

**现象**：`Too many connections`（MySQL）或 `FATAL: sorry, too many clients already`（PG）。

| 项 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 内存模型 | 线程，连接开销小，但每个连接有会话缓冲 | 每连接一个进程，`max_connections` 直接影响内存 |
| 上限建议 | 与连接池总和匹配，500~2000 常见 | 生产 100~300，超出必须上 PgBouncer |
| 连接池模式 | HikariCP 等应用侧池 | 应用池 + **PgBouncer（transaction 模式）** |
| 注意点 | `wait_timeout` / `interactive_timeout` 要短于中间件空闲回收 | PgBouncer transaction 模式不支持 `SET` 会话级参数、`LISTEN`、预处理语句（需 1.21+ 支持 protocol-level prepared） |

::: warning 池子不是越大越好
连接数超过 CPU 核数太多只会增加上下文切换与锁竞争，吞吐反而下降。经验公式：连接数上限 ≈ 核数 × 2 ~ 4（I/O 密集业务可以再放大一点），剩下的排队交给池。
:::

### 10.8 PostgreSQL 专属：表膨胀、长事务与回卷

PG 的旧版本行必须靠 VACUUM 回收，三类情况会让它失效：

| 问题 | 现象 | 解决 |
| :-- | :-- | :-- |
| 长事务 | `pg_stat_activity` 里有小时级 `xact_start`，死行无法回收 | 设 `idle_in_transaction_session_timeout`；排查代码里忘记 commit 的连接 |
| 复制槽卡住 | `pg_replication_slots` 的 `active = false` 且 `restart_lsn` 很旧 | 删除废弃 slot；否则 WAL 与死行都无法清理 |
| 回卷风险 | `age(datfrozenxid)` 接近 20 亿 | 紧急 VACUUM；平时监控 `autovacuum_for_wraparound` |

```sql title="bloat.sql"
-- 看膨胀：死行占比
SELECT relname, n_live_tup, n_dead_tup,
       round(100 * n_dead_tup / greatest(n_live_tup + n_dead_tup, 1), 1) AS dead_pct,
       last_autovacuum, last_analyze
FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 20;

-- 看最长事务与最老快照
SELECT pid, now() - xact_start AS age, state, left(query, 80) FROM pg_stat_activity
WHERE xact_start IS NOT NULL ORDER BY age DESC LIMIT 5;

-- 在线整理膨胀（不锁表）
-- pg_repack -t orders -d app
```

MySQL 侧对应的问题是 **undo 膨胀**与**purge 延迟**：长事务会把 undo 表空间撑大，回滚段无法清理。检查 `SHOW ENGINE INNODB STATUS` 中的 `History list length`，持续增长说明 purge 跟不上（通常是长事务或大量写入）。

### 10.9 MySQL 专属：表碎片与随机主键

- **大量 DELETE 后空间不释放**：`DELETE` 只标记删除，页面空闲但仍在 .ibd 里。查碎片：`SELECT data_free FROM information_schema.tables WHERE table_name='t';`，回收用 `OPTIMIZE TABLE`（会锁表，用 gh-ost 更稳）。
- **随机主键写入慢**：UUIDv4 主键的插入点在索引中间，每插一行就可能触发页分裂，写放大严重。解决：换 bigint 自增；必须用 UUID 就用 `UUID_TO_BIN(UUID(), 1)` 把时间低位重排成有序 UUID，或者远端生成 UUIDv7 再转 bigint。
- **字符串主键**：主键会复制到所有二级索引，varchar(64) 主键让每个索引都多 64 字节/行。用 bigint 代理键。

### 10.10 JSON 字段怎么查得快

```sql title="json.sql"
-- MySQL：JSON 不能直接建索引，用生成列 + 索引
ALTER TABLE orders
  ADD COLUMN shop_id BIGINT GENERATED ALWAYS AS (ext->>'$.shop_id') STORED,
  ADD INDEX idx_shop (shop_id);

-- 8.0.17+ 多值索引：对数组内元素建索引
ALTER TABLE orders ADD INDEX idx_tags ((CAST(ext->'$.tags' AS UNSIGNED ARRAY)));

-- PostgreSQL：jsonb + GIN，一步到位
CREATE INDEX idx_orders_ext ON orders USING GIN (ext jsonb_path_ops);
SELECT * FROM orders WHERE ext @> '{"shop_id": 12}';
SELECT * FROM orders WHERE ext->>'shop_id' = '12';     -- 这个写法用不上 GIN，只能表达式索引
```

规则：**能用关系列就别放 JSON**。JSON 适合「字段经常变、整体读取」的场景；一旦某个 key 参与高频过滤，就把它提升成生成列 + 索引，或者干脆独立成列。

### 10.11 排序与聚合落盘

| 现象 | MySQL | PostgreSQL |
| :-- | :-- | :-- |
| 排序用磁盘 | `Using filesort` + `Sort_merge_passes` 增长 | `Sort Method: external merge` |
| 调参 | `sort_buffer_size`（每连接，别乱调大） | `work_mem`（每算子，注意并发下是乘法） |
| 根治 | 让 ORDER BY 顺着索引顺序 | 同左；或减少排序数据量（先过滤再排） |
| 聚合落盘 | `tmp_table_size` / `max_heap_table_size` | `HashAggregate` 超出 `work_mem` 后分批 |

### 10.12 大批量写入与主从延迟

- **批量写**：MySQL 用 `INSERT ... VALUES (...), (...)` 搭配 JDBC `rewriteBatchedStatements=true`；PG 用 `COPY` 或 `reWriteBatchedInserts=true`。逐行 INSERT 是最大的性能浪费。
- **批量删/改**：按主键区间分批（每批 500~2000 行），避免长事务与主从复制积压。
- **主从延迟**：MySQL 用并行复制（`replica_parallel_workers` + `replica_parallel_type=LOGICAL_CLOCK`，或 8.0 的 WRITESET 冲突检测）把延迟压下去；PG 的逻辑复制订阅端有 `max_parallel_apply_workers_per_subscription`（16+）。
- **读写分离不一致**：写后立刻读主库（会话粘滞），或让业务接受最终一致；别用「加个 sleep」这种玄学方案。

### 10.13 时区与时间过滤

「明明有今天的数据却查不到」几乎总是时区问题：

```sql title="timezone.sql"
-- MySQL：TIMESTAMP 按会话时区转换，DATETIME 不转
SELECT @@time_zone, @@system_time_zone;
-- 规范：业务时间统一用 DATETIME 存 UTC 或本地时间（二选一写进规范），比较时不要写函数包裹列

-- PostgreSQL：timestamptz 存 UTC，按时区显示，最省心
SET timezone = 'Asia/Shanghai';
SELECT now(), now() AT TIME ZONE 'UTC';
```

索引友好的时间过滤写法（两边通用）：

```sql title="time_range.sql"
-- 好：范围条件，能用索引
WHERE created_at >= '2026-10-01 00:00:00' AND created_at < '2026-10-02 00:00:00'
-- 差：函数包裹列，索引失效
WHERE DATE(created_at) = '2026-10-01'
```

### 10.14 OR、IN 与 EXISTS 的改写

- `WHERE a = 1 OR b = 2`：如果 a、b 各有索引，PG 可能用 BitmapOr，MySQL 可能 index merge（多数情况不如直接全表扫）。数据量大时改成 `SELECT ... WHERE a=1 UNION ALL SELECT ... WHERE b=2`。
- `NOT IN (SELECT ...)` 遇到 NULL 会整体返回空集，这是 SQL 语义陷阱，不是数据库 bug。统一改用 `NOT EXISTS`。
- `IN` 的列表超过几千个值会让解析和计划都变慢，改用临时表 join 或分批查询。

### 10.15 分区还是分表

| 场景 | 建议 |
| :-- | :-- |
| 单表 2 亿以内、查询都带时间范围 | 先优化索引与归档，别急着分区 |
| 按时间归档、能整段删除 | 时间分区最有效：`ALTER TABLE ... DROP PARTITION` 是秒级操作（MySQL 要求分区键必须在主键里） |
| 单机容量/写入到顶 | 才考虑分库分表（ShardingSphere / Citus / 应用层路由） |
| 需要跨分区唯一约束 | PG 声明式分区支持，MySQL 的分区唯一键必须包含分区键 |

PG 声明式分区示例：

```sql title="partition.sql"
CREATE TABLE orders (id bigint, created_at timestamptz NOT NULL, amount numeric)
PARTITION BY RANGE (created_at);
CREATE TABLE orders_2026_10 PARTITION OF orders
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
-- 查询带时间条件时自动分区裁剪（Partition Pruning）
```

## 十一、日常运维速查

### 11.1 容量与热点

```sql title="capacity.sql"
-- MySQL：按大小排序的表
SELECT table_schema, table_name,
       ROUND((data_length + index_length) / 1024 / 1024) AS size_mb,
       table_rows
FROM information_schema.tables
WHERE table_schema = 'app' ORDER BY data_length + index_length DESC LIMIT 20;

-- PostgreSQL：表 + 索引 + 总大小
SELECT relname,
       pg_size_pretty(pg_relation_size(oid))  AS table_size,
       pg_size_pretty(pg_indexes_size(oid))   AS index_size,
       pg_size_pretty(pg_total_relation_size(oid)) AS total
FROM pg_class WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace
ORDER BY pg_total_relation_size(oid) DESC LIMIT 20;
```

### 11.2 复制与备份

| 动作 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 复制状态 | `SHOW REPLICA STATUS\G`（8.0.22+ 用 REPLICA 代替 SLAVE） | `SELECT * FROM pg_stat_replication;` |
| 延迟 | `Seconds_Behind_Source` | `pg_last_wal_replay_lsn()` 与主库对比，或 `pg_stat_replication.replay_lag` |
| 逻辑备份 | `mysqldump --single-transaction` | `pg_dump -Fc` |
| 物理备份 | XtraBackup | `pg_basebackup` |
| PITR | binlog + `mysqlbinlog --stop-datetime` | WAL 归档 + `recovery_target_time` |
| 恢复校验 | 定期在隔离环境重放备份 | 同左，务必真跑一次 |

::: warning 备份没验证过就等于没有备份
两边的备份脚本都很容易「跑成功但不可恢复」。至少要定期做一次完整演练：在空实例上恢复，并跑几条关键业务查询。
:::

### 11.3 权限与安全

```sql title="grant.sql"
-- MySQL：不要用 root 跑业务，按库授权
CREATE USER 'app'@'10.0.%' IDENTIFIED BY 'strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE ON app.* TO 'app'@'10.0.%';

-- PostgreSQL：用 role + 默认权限，避免每建一张表就要重新授权
CREATE ROLE app LOGIN PASSWORD 'strong-password';
GRANT CONNECT ON DATABASE app TO app;
GRANT USAGE ON SCHEMA public TO app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app;
```

MySQL 8.4 的注意点：`mysql_native_password` 默认被禁用，老客户端连不上时要升级驱动或显式开启插件；默认认证插件是 `caching_sha2_password`，JDBC 要开 SSL 或用 `allowPublicKeyRetrieval=true`（仅内网）。

## 十二、从 MySQL 迁到 PG 的常见坑

| # | MySQL 写法 | PG 对应 | 坑点 |
| :-- | :-- | :-- | :-- |
| 1 | `db.tbl` 跨库 | 同库跨 schema `schema.tbl` | 跨 database 要 FDW |
| 2 | 反引号 | 双引号，且会保留大小写 | 建议全部小写不加引号 |
| 3 | `AUTO_INCREMENT` | `GENERATED AS IDENTITY` | `LAST_INSERT_ID()` 改为 `RETURNING` |
| 4 | `LIMIT 20, 10` | `LIMIT 10 OFFSET 20` | 顺序写反直接语法错误 |
| 5 | `ON DUPLICATE KEY UPDATE` | `ON CONFLICT (col) DO UPDATE` | 必须显式指定冲突列 |
| 6 | `GROUP_CONCAT` | `string_agg` | 分隔符参数位置不同 |
| 7 | `IFNULL` / `IF` | `COALESCE` / `CASE WHEN` | PG 没有 IF 函数 |
| 8 | `DATE_FORMAT(d, '%Y-%m')` | `to_char(d, 'YYYY-MM')` | 格式串完全不同 |
| 9 | `TINYINT(1)` 当布尔 | 原生 `boolean` | 迁移工具常转成 smallint，需要人工修正 |
| 10 | 隐式类型转换 | 严格类型 | `WHERE id = '1'` 在函数参数场景会报错，需显式 `::bigint` |
| 11 | 一条语句报错，事务继续 | 事务变 aborted | 应用必须 rollback 后重试 |
| 12 | NULL 在 ORDER BY 中排最前 | 默认排最后 | 分页数据顺序会变，需要 `NULLS FIRST` |
| 13 | `UNSIGNED` | 无 | 用 `CHECK` 约束或放大到 bigint |
| 14 | `replace into` | 无等价 | 用 `ON CONFLICT` 重写 |

## 十三、选型对照：一屏决策

| 维度 | MySQL 8 | PostgreSQL |
| :-- | :-- | :-- |
| 上手成本 | 低，生态与教程极多 | 中，概念更多（schema / VACUUM / 角色） |
| 简单主键查询 | 极快（聚簇索引一次定位） | 快（索引 + 回堆两步） |
| 复杂查询 / 分析 | 8.0 有明显进步（CTE、窗口、Hash Join），仍偏弱 | 强项：丰富连接算法、并行查询、窗口、CTE、扩展 |
| JSON | 够用，索引要绕 | jsonb + GIN，明显更强 |
| 地理 / 搜索 / 向量 | 有限 | PostGIS、全文、pgvector |
| 高并发简单写入 | 强（线程模型、成熟分库方案） | 需要连接池；单机写入不如 MySQL 顺手 |
| 数据一致性工具 | 成熟商业方案多 | 复制、PITR、逻辑复制都很扎实 |
| 运维心智 | 参数多但资料全 | VACUUM / 膨胀 / 回卷必须懂 |
| 典型场景 | 电商、支付、互联网业务主库 | 复杂业务、数据平台、多类型混合负载 |

一句话结论：**简单的点查与高并发 OLTP 选 MySQL 更省心；复杂查询、JSON、地理与混合负载选 PG 更合适**。真要二选一，看团队更熟悉哪个——熟悉带来的工程收益远大于数据库本身的差距。

## 十四、速查卡片

```sql title="cheatsheet.sql"
-- ===== 正在跑的慢 SQL =====
-- MySQL
SELECT id, user, time, state, left(info, 100) FROM information_schema.processlist
WHERE command <> 'Sleep' AND time > 2 ORDER BY time DESC;
-- PG
SELECT pid, now() - query_start AS dur, left(query, 100) FROM pg_stat_activity
WHERE state = 'active' AND now() - query_start > interval '2 seconds';

-- ===== 谁在阻塞谁 =====
-- MySQL
SELECT * FROM sys.innodb_lock_waits;
-- PG
SELECT pid, pg_blocking_pids(pid) FROM pg_stat_activity WHERE cardinality(pg_blocking_pids(pid)) > 0;

-- ===== 没用过的索引 =====
-- MySQL
SELECT * FROM sys.schema_unused_indexes;
-- PG
SELECT relname, indexrelname, idx_scan FROM pg_stat_user_indexes WHERE idx_scan = 0;

-- ===== 表的行数与大小 =====
-- MySQL
SELECT table_name, table_rows FROM information_schema.tables WHERE table_schema = 'app';
-- PG（估算值，精确值需要 COUNT(*)）
SELECT relname, n_live_tup, n_dead_tup FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;

-- ===== 强制刷新统计信息 =====
-- MySQL
ANALYZE TABLE orders;
-- PG
ANALYZE orders;
```

## 结语

把这两套数据库用顺手的顺序，大致是：

1. **先统一写法规范**：类型、命名、时间字段、主键策略，两边都按同一套约定，迁移时少一半工作量。
2. **再吃透索引**：复合索引的顺序、覆盖索引、什么时候索引不该存在——这一步的收益最大。
3. **然后练执行计划**：能读懂 `EXPLAIN` 的 rows / cost / actual，才谈得上优化，否则都是猜。
4. **最后是运维**：慢日志、锁、膨胀、备份恢复，这些决定故障时你能不能十分钟内止血。

遇到问题时的通用套路永远是：**先量化（慢在哪、多慢）→ 再定位（计划、扫描行数、锁等待）→ 最后才动手改（索引、SQL、参数）**。跳过前两步直接加索引，往往只是把问题挪了个位置。
