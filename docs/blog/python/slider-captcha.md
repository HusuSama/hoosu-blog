---
title: 滑块验证码处理指南：获取原图、裁剪定位与坐标换算
createTime: 2026/10/13 12:00:00
tags:
  - python
  - Playwright
  - OpenCV
  - 验证码
permalink: /blog/viqjsm9f/
---

## 从哪里开始

拼图式滑块验证码的处理顺序是：**获取独立图片 → 裁出有效拼图 → 找到缺口 → 换算页面距离 → 拖动按钮 → 检查校验结果**。识别出的横坐标只是其中一个中间结果，不能直接作为拖动距离。

本教程针对自有系统或已获授权的测试页面，适用于以下结构：背景和拼图分别是 `<img>`，拼图图片周围透明，拼图只能水平移动。旋转、点选、图片乱序或 Canvas 验证码不适用下面的直接实现。

按章节逐步执行，每一步都有检查标准。文末提供完整脚本，分为 `images`、`crop`、`match`、`drag` 四个阶段：可以先只检查图片，再裁剪、定位，最后单次拖动。页面地址、选择器和成功条件全部由你配置，不依赖某个网站的元素 ID、接口地址或业务码。

## 第一步：准备环境并找到页面元素

### 安装依赖

使用 Python 3.10 或更新版本，创建一个独立目录并在其中创建虚拟环境：

```sh title="setup.sh"
python -m venv .venv
```

macOS / Linux 激活方式：

```sh title="activate.sh"
source .venv/bin/activate
```

Windows PowerShell 激活方式：

```powershell title="activate.ps1"
.venv\Scripts\Activate.ps1
```

再安装图片处理和浏览器操作依赖：

```sh title="dependencies.sh"
python -m pip install playwright pillow numpy opencv-python
python -m playwright install chromium
```

如果系统只有 `python3` 命令，将创建环境时的 `python` 换为 `python3`。激活后用 `python` 运行。本教程最终使用 OpenCV 轮廓匹配；已有 `ddddocr` 项目可以保留它用于比较，但不必为最终算法加载 OCR 模型。

### 找到三类元素

在浏览器打开测试页面，按 F12 或打开“开发者工具”，使用元素选择工具分别点击背景图、可拖动拼图和底部拖动按钮。

| 元素 | 需要确认的内容 |
| :-- | :-- |
| 背景图片 | `<img>` 的 `src` 或 `currentSrc` 指向背景资源 |
| 拼图图片 | `<img>` 的资源保留透明通道；不是底部按钮的图标 |
| 拖动按钮 | 真正接收按下、移动、松手事件的元素 |
| 成功元素 | 只有验证码通过后才出现的元素，例如登录后用户菜单或成功提示 |

优先选择稳定且唯一的 ID、`data-*` 属性或有语义的选择器。不要把背景容器、滑块按钮和拼图图片混为一谈，也不要仅依赖截图中的位置。

示例命名如下，**这是供配置参考的名称，不要求页面真的存在这些 ID**：

```python title="selectors.py"
background_selector = "#puzzle-background"
piece_selector = "#puzzle-piece"
button_selector = "#puzzle-handle"
success_selector = "[data-test='verification-success']"
```

如果验证码在 iframe 内，先找到 iframe，再通过 `page.frame_locator(...)` 获取图片和按钮。完整脚本提供 `--iframe` 参数；成功元素则按顶层页面配置。

**本步检查：三个操作元素各匹配一个目标，成功元素在验证前不可见。** 如果“成功元素”本来就在页面上，它不能用作验证依据。

## 第二步：检查输入，解释为什么 target 几乎不变

不要先调整拖动距离。先把实际传入识别函数的两张图片保存下来，确认它们是什么。

```python title="inspect-inputs.py"
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageStat

output = Path("debug-images")
output.mkdir(exist_ok=True)

for name, locator in [("piece", piece_locator), ("background", background_locator)]:
    data = locator.screenshot(scale="css")
    (output / f"{name}_screenshot.png").write_bytes(data)
    with Image.open(BytesIO(data)) as image:
        gray = image.convert("L")
        print(name, {
            "size": image.size,
            "mode": image.mode,
            "gray_range": gray.getextrema(),
            "gray_stddev": ImageStat.Stat(gray).stddev[0],
        })
```

打开图片，而不是只看日志。如果缺口每次变化，但结果总在相同位置，可以依次检查：

| 检查项 | 固定结果的可能原因 |
| :-- | :-- |
| 背景截图左侧也有起始拼图 | 算法匹配到了已有拼图，而非目标缺口 |
| 拼图截图带着后面的背景 | 透明区域被页面渲染合成，输入不再是独立拼图 |
| 模板几乎纯色 | 归一化相关匹配可能退化，最高分没有定位意义 |
| 图片没有加载或尺寸为零 | 实际输入与预期不一致 |
| 保存的图片没有变化 | 可能读取了缓存、旧验证码或错误元素 |

![页面截图包含叠加内容，独立图片资源才保留背景和拼图各自的数据](/images/slider-captcha/image-sources.svg)

`locator.screenshot()` 截取的是**渲染区域**。即使定位到背景 `<img>`，覆盖在它上面的拼图也可能进入截图；透明拼图截图中也会出现透明区域后面的背景。因此读取正确元素不代表截图一定能用于匹配。

### target 到底表示什么

以 `ddddocr 1.6.1` 的 `slide_match()` 实现为例，`target` 是模板在背景中最佳匹配区域的**中心坐标**，`target_x`、`target_y` 是同一坐标拆开的字段。`confidence` 是匹配分数，不是验证码通过概率。不同版本可能有不同返回语义，先确认安装版本与源码。

```python title="center-to-left.py"
matched_left = result["target_x"] - template_width // 2
matched_top = result["target_y"] - template_height // 2
```

如果返回中心始终等于模板宽高的一半，通常意味着最佳匹配区域左上角接近 `(0, 0)`。这是一条诊断线索，需要对照输入图片确认，不能只凭数字断言。

**本步检查：知道识别函数吃进去的图片是什么，能区分目标坐标、匹配区域起点和拖动距离。**

## 第三步：获取真正的拼图原图和背景原图

### 等待图片完成加载

元素可见不等于图片已加载。对 `<img>`，先等待可见，再调用 `decode()`：

```python title="image-state.py"
piece_locator.wait_for(state="visible")
state = piece_locator.evaluate("""async el => {
    await el.decode();
    const rect = el.getBoundingClientRect();
    return {
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
        displayWidth: rect.width,
        displayHeight: rect.height
    };
}""")
print(state)
```

`naturalWidth/naturalHeight` 是浏览器报告的图片固有尺寸，`displayWidth/displayHeight` 是页面显示尺寸。实际换算使用解码后的 Pillow 图片宽高和 `bounding_box()`，避免截图边界取整或响应式资源造成混淆。

### 读取图片资源，不截取叠加区域

在浏览器上下文内对 `el.currentSrc || el.src` 执行 `fetch`，拿到资源字节，再通过 Base64 传给 Python。完整脚本的 `read_image()` 已包含这部分。

`currentSrc` 是浏览器实际选中的资源，对使用 `srcset` 的图片尤其重要。`data:` 和同页面的 `blob:` 地址也可通过此方式读取。

读取并保存之后，检查：

- 背景原图包含背景和缺口，没有页面叠加的起始拼图。
- 拼图原图的可见部分是真正的拼图，周围有透明区域。
- 两张图片来自同一张验证码，读取期间没有刷新。

Pillow 的 `RGBA` 中，A 是透明度：`0` 为完全透明，`255` 为完全不透明。透明图片在查看器中可能显示成黑色、白色或棋盘格，应以透明通道为准。

```python title="alpha-check.py"
alpha = piece_image.convert("RGBA").getchannel("A")
print("透明度范围:", alpha.getextrema())
print("完全透明像素:", alpha.histogram()[0])
```

如果图片原本没有透明度，`convert("RGBA")` 只会增加一个全不透明通道，**不会自动找出拼图形状**。

### 读取失败时怎么办

| 情况 | 正确处理方向 |
| :-- | :-- |
| 跨域资源被 CORS 拦截 | 在图片请求发起前监听浏览器响应，按资源 URL 读取对应响应体 |
| 图片需要登录态 | 在已登录的页面上下文读取，确认资源请求携带需要的凭据 |
| 图片地址短期有效 | 在验证码打开后及时读取，不重复使用旧地址 |
| 背景是 Canvas | 单独处理画布内容；本教程的 `<img>` 路径不能直接套用 |
| 原始背景也包含起始拼图 | 重新确认资源，当前轮廓方案未必适合该验证码结构 |

`credentials="include"` 不会解除 CORS。获取原图失败时，不应悄悄退回被叠加污染的截图。

**本步检查：拿到两张独立、完整、属于同一验证码的图片。**

## 第四步：裁剪有效拼图，并保留裁剪偏移

原始拼图经常是一张大透明画布，可见拼图只占其中一小块。直接拿整张画布匹配，会让留白影响结果，并把模板中心与实际拼图位置混在一起。

用透明通道找出非完全透明区域的包围盒：

```python title="crop-piece.py"
alpha = piece_image.convert("RGBA").getchannel("A")
bounds = alpha.getbbox()
if bounds is None:
    raise ValueError("拼图图片完全透明")

left, top, right, bottom = bounds
piece = piece_image.crop(bounds)
piece.save("piece_cropped.png")
print("裁剪偏移:", (left, top))
print("裁剪尺寸:", (right - left, bottom - top))
```

`getbbox()` 返回 `(left, top, right, bottom)`，右边界和下边界不包含在区域中。裁剪后模板原点变为 `(0, 0)`，原图里的 `(left, top)` 偏移并没有消失，必须保留。

![裁剪前的透明画布、裁剪后的模板以及需要保留的原图偏移](/images/slider-captcha/crop-offset.svg)

裁剪只缩小处理范围，不会把拼图内部纹理变成缺口，也不会自动返回正确位移。如果图片周围有阴影或低透明度边缘，包围盒可能包含它们；标注图检查能帮助判断是否影响定位。

**本步检查：裁剪图紧贴可见拼图，记录原图偏移，不能把裁剪左边缘当成图片原来的左边缘。**

## 第五步：提取轮廓，只在正确高度寻找缺口

### 为什么不总是直接做灰度匹配

拼图内容与目标缺口内容可能不同：缺口通常被遮暗、填充或加边框。灰度匹配容易被相似纹理吸引；对拼图的 RGB 图提取边缘，仍会引入内部山体、建筑等纹理。

对透明拼图，可以只利用其**外形**：

```python title="piece-contour.py"
import cv2
import numpy as np

cropped_alpha = alpha.crop(bounds)
mask = (np.array(cropped_alpha) >= 128).astype(np.uint8) * 255
contour = cv2.Canny(mask, 50, 150)
```

阈值 `128` 将 Alpha 透明度转为黑白形状，Canny 再提取边界。这个参数是可调整的初始选择，不适用于所有抗锯齿、阴影和透明度设计。完全没有透明区域时，应换一种取模板的方法。

### 利用只能水平移动的约束

真正的目标与当前拼图应处于同一页面高度。若背景和拼图缩放或页面起点不同，先换算当前拼图顶部到背景原图的 Y 坐标：

```python title="search-height.py"
current_top = piece_box["y"] + crop_top * piece_scale_y
search_y = round((current_top - background_box["y"]) / background_scale_y)
```

模板也要按拼图和背景显示比例换算到背景原图坐标系中。然后只截取 `search_y` 到 `search_y + template_height` 的背景边缘带，并做横向模板匹配。

匹配区域的位置来自 `cv2.minMaxLoc()` 的 `location`，在本文轮廓实现中它是模板**左上角**，不需要再减模板半宽。这与某些库返回模板中心的语义不同。

### 每次定位都要留一张标注图

把提取的轮廓覆盖到目标位置，检查红线是否贴着缺口外形。只看矩形框包住了缺口还不够，宽大的模板框可能隐藏几个像素的偏移。

匹配分数用于比较**同一算法、同一输入下的候选位置**。它不是通过概率，不同匹配算法之间也不能直接比较。复杂背景或重复形状可能产生误匹配，没有通用的“高于某个分数即可拖动”规则。

**本步检查：轮廓和缺口外形贴合；若不贴合，停止拖动，返回检查原图、裁剪边界、阈值和搜索高度。**

## 第六步：把原图位置转换为页面拖动距离

图片原始像素、页面 CSS 像素、鼠标需要移动的距离不能混用。

![从背景原图位置换算到页面当前位置和目标位置，再相减得到拖动距离](/images/slider-captcha/coordinate-spaces.svg)

### 先分别计算缩放比例

```python title="scale.py"
piece_scale_x = piece_box["width"] / piece_image.width
piece_scale_y = piece_box["height"] / piece_image.height
background_scale_x = background_box["width"] / background_image.width
background_scale_y = background_box["height"] / background_image.height
```

例如背景原图宽 `800`，页面显示宽 `400`，横向比例为 `0.5`。这只是计算示例，不应把 `0.5` 写死。

### 再分别计算页面位置

```python title="distance.py"
current_left = piece_box["x"] + crop_left * piece_scale_x
target_left = background_box["x"] + matched_left * background_scale_x
delta_x = target_left - current_left
```

如果两个图片起点对齐且比例一致，可以简化为：

```python title="aligned-distance.py"
delta_x = (matched_left - crop_left) * scale_x
```

通用代码应使用完整公式。它同时处理图片起点不同、拼图已经移动过和两张图片显示比例不同的情况。

Playwright 鼠标操作与 `bounding_box()` 都使用页面视口内的 CSS 坐标，不必再乘除 `devicePixelRatio`。iframe 元素的 `bounding_box()` 也相对主页面视口，因此鼠标仍使用主页面 `page.mouse`。

鼠标事件里的 `clientX/pageX` 则属于事件所在文档的坐标系。iframe 内的诊断事件需要在同一 iframe 内相互比较，不要直接与主页面的 `bounding_box()` 横坐标相减。完整脚本在按钮所属文档安装事件监听。

**换算前提**是图片完整显示且没有旋转、斜切、`object-fit: cover` 裁切、额外内边距和边框。存在这些样式时，应计算真正的图片内容区域，不能直接把元素盒子作为图片区域。

**本步检查：页面目标位置减当前位置得到距离；目标坐标不等于距离，裁剪偏移必须参与计算。**

## 第七步：单次拖动并观察实际移动量

确定位置之后，从按钮中心按下，保持纵坐标不变，水平移动 `delta_x`，最后松手：

```python title="single-drag.py"
start_x = button_box["x"] + button_box["width"] / 2
start_y = button_box["y"] + button_box["height"] / 2
page.mouse.move(start_x, start_y)
try:
    page.mouse.down()
    page.mouse.move(start_x + delta_x, start_y, steps=20)
finally:
    page.mouse.up()
```

`steps=20` 是中间移动步数，不是总时长。`try/finally` 保证移动失败后仍执行松手。测试过程中不要同时用手移动鼠标或滚动页面。

在松手前读取拼图和按钮的 `bounding_box()`，比较实际移动量。若按钮移动距离与拼图不同，应检查组件的轨道比例或移动上限，不能假定它们一比一。网页可能将位置取整，出现小数差异时先记录，不要盲目追加像素补偿。

**按住期间不截图。** 保持操作简短，将截图和文件保存放在松手之后。截图可能涉及滚动、等待稳定等额外操作；若轨迹有大幅跳跃，记录事件，使用移除截图的对照实验确认，不直接归因于速度。

**本步检查：按钮确实响应拖动、拼图实际位移与计算值相符、任何异常路径都能松手。**

## 第八步：用真实成功条件结束验证

拼图看起来贴合，只说明几何位置可能正确，不代表服务端接受了验证。

检查顺序是：

1. 开发者工具 Network 中找到校验请求，查看请求是否发出。
2. 查看 HTTP 状态和响应内容。HTTP 成功状态不等于业务校验成功。
3. 根据组件自己的接口文档解释业务字段，不能给所有网站套同一个 `code`。
4. 检查页面是否出现真实成功元素或进入预期页面。验证码通过与登录完成可能是两个不同条件。

页面“过期”“失败”等文案可能将多种错误统一展示；应以接口响应和实际页面状态共同判断。需要记录时，只记录必要业务字段，避免把账号密码、验证码标识、Cookie 和令牌写入日志。

完整脚本使用 `--success` 指定顶层页面的成功元素，等待它可见。如果超时，只报告“未观察到成功”，不会自动宣称验证码失败，也不会自动重试。你需要结合页面与网络响应继续判断。

### 诊断回调不要误解析其他业务请求

监听页面响应时，先确认目标接口和请求格式。只有 JSON 请求才尝试 JSON 解析，multipart 登录表单不应被当作 JSON。不要用 `except Exception: pass` 掩盖所有回调错误。

### 跳转后不要再读旧 window 变量

完整页面导航会销毁旧页面的 `window`。如果把鼠标轨迹只存在网页变量里，登录跳转后再调用 `page.evaluate()` 保存，就可能报变量不存在或执行上下文被销毁。

完整脚本把事件实时传到 Python 列表中，松手时移除页面监听，结束时移除 Python 监听。这样即使页面跳转，也能保存已经收到的事件。录制的 `client` 坐标、`page` 坐标和滚动量可以用于比较：

| 观察 | 排查方向 |
| :-- | :-- |
| `client`、`page` 坐标同时跳变 | 实际鼠标事件或其他输入变化 |
| `client` 不变、`page` 随滚动改变 | 页面滚动导致坐标变化 |
| 页面事件正常、接口提交轨迹异常 | 前端轨迹组装、坐标转换或残留监听 |

**本步检查：明确观察到什么业务结果，页面跳转后程序仍正常结束并保存诊断数据。**

## 完整脚本：按阶段运行

前面的短代码用于解释原理，依赖对应步骤的变量。下面这段是可以独立运行的完整版本，保存为 `slider_workflow.py`。

脚本先打开页面，由你手动输入账号、打开验证码，再按回车开始所选阶段；不把登录表单逻辑绑到某个网站。每次运行重新获取当前验证码，不复用之前的坐标。

```python title="slider_workflow.py" :collapsed-lines=25
import argparse
import base64
import json
import tempfile
from pathlib import Path
from uuid import uuid4

import cv2
import numpy as np
from PIL import Image
from io import BytesIO
from playwright.sync_api import TimeoutError as PlaywrightTimeoutError
from playwright.sync_api import sync_playwright


def read_image(locator):
    locator.wait_for(state="visible", timeout=10000)
    encoded = locator.evaluate("""async el => {
        await el.decode();
        const response = await fetch(el.currentSrc || el.src, {
            credentials: "include"
        });
        if (!response.ok) throw new Error(`图片读取失败: HTTP ${response.status}`);
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(blob);
        });
    }""")
    raw = base64.b64decode(encoded.split(",", 1)[1], validate=True)
    with Image.open(BytesIO(raw)) as image:
        return image.copy()


def crop_piece(image, output):
    alpha = image.convert("RGBA").getchannel("A")
    if alpha.getextrema()[0] == 255:
        raise ValueError("没有透明区域，不能直接采用透明轮廓方案")
    bounds = alpha.getbbox()
    if bounds is None:
        raise ValueError("拼图完全透明")
    image.crop(bounds).save(output / "piece_cropped.png")
    alpha.crop(bounds).save(output / "alpha_cropped.png")
    print("裁剪边界:", bounds)
    return alpha.crop(bounds), bounds


def locate(alpha, bounds, piece, background, piece_box, bg_box, output):
    if piece_box is None or bg_box is None:
        raise ValueError("图片不可见，无法计算坐标")
    px, py = piece_box["width"] / piece.width, piece_box["height"] / piece.height
    bx, by = bg_box["width"] / background.width, bg_box["height"] / background.height
    current_x = piece_box["x"] + bounds[0] * px
    current_y = piece_box["y"] + bounds[1] * py
    y = round((current_y - bg_box["y"]) / by)
    width, height = round(alpha.width * px / bx), round(alpha.height * py / by)
    if width < 1 or height < 1 or width > background.width:
        raise ValueError("模板尺寸超出背景范围")
    if y < 0 or y + height > background.height:
        raise ValueError("水平搜索高度超出背景范围")
    mask = (np.array(alpha.resize((width, height))) >= 128).astype(np.uint8) * 255
    contour = cv2.Canny(mask, 50, 150)
    if not np.any(contour):
        raise ValueError("没有有效轮廓")
    gray = cv2.cvtColor(np.array(background.convert("RGB")), cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    scores = cv2.matchTemplate(edges[y:y + height], contour, cv2.TM_CCORR_NORMED)
    _, score, _, location = cv2.minMaxLoc(scores)
    x = location[0]
    target_x, target_y = bg_box["x"] + x * bx, bg_box["y"] + y * by
    report = {
        "matched_top_left": (x, y), "crop_offset": bounds[:2],
        "piece_scale": (px, py), "background_scale": (bx, by),
        "score": score, "delta_x": target_x - current_x,
        "delta_y": target_y - current_y,
    }
    print("定位和坐标换算:", report)
    Image.fromarray(contour).save(output / "contour.png")
    marked = np.array(background.convert("RGB"))
    marked[y:y + height, x:x + width][contour > 0] = (255, 0, 0)
    Image.fromarray(marked).save(output / "match.png")
    (output / "match.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report["delta_x"]


def start_recording(page, button):
    prefix = f"slider-diagnostic-{uuid4().hex}:"
    events = []

    def receive(message):
        if message.text.startswith(prefix):
            events.append(json.loads(message.text[len(prefix):]))

    page.on("console", receive)
    button.evaluate("""(el, prefix) => {
        const types = ["mousedown", "mousemove", "mouseup"];
        const record = event => {
            console.debug(prefix + JSON.stringify({
                type: event.type, epoch_ms: Date.now(), buttons: event.buttons,
                clientX: event.clientX, clientY: event.clientY,
                pageX: event.pageX, pageY: event.pageY,
                scrollX: window.scrollX, scrollY: window.scrollY
            }));
            if (event.type === "mouseup") {
                for (const type of types) window.removeEventListener(type, record, true);
            }
        };
        for (const type of types) window.addEventListener(type, record, true);
    }""", prefix)
    return events, receive


def drag_once(page, piece_locator, button, delta_x, success, timeout, output):
    button.wait_for(state="visible", timeout=10000)
    button_before, piece_before = button.bounding_box(), piece_locator.bounding_box()
    if button_before is None or piece_before is None:
        raise ValueError("按钮或拼图不可见")
    if success.is_visible():
        raise ValueError("成功元素在拖动前已可见，请换用真实成功条件")
    start_x = button_before["x"] + button_before["width"] / 2
    start_y = button_before["y"] + button_before["height"] / 2
    events, receive = start_recording(page, button)
    try:
        page.mouse.move(start_x, start_y)
        try:
            page.mouse.down()
            page.mouse.move(start_x + delta_x, start_y, steps=20)
            page.evaluate("() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))")
            button_after, piece_after = button.bounding_box(), piece_locator.bounding_box()
            print("实际移动量:", {
                "requested": delta_x,
                "button": None if button_after is None else button_after["x"] - button_before["x"],
                "piece": None if piece_after is None else piece_after["x"] - piece_before["x"],
            })
        finally:
            page.mouse.up()
        try:
            success.wait_for(state="visible", timeout=timeout)
            print("已观察到配置的成功元素:", page.url)
        except PlaywrightTimeoutError:
            print("等待结束，未观察到成功元素。请检查页面提示和校验响应。")
        page.screenshot(path=str(output / "after_release.png"), scale="css")
    finally:
        page.remove_listener("console", receive)
        (output / "mouse_events.json").write_text(
            json.dumps(events, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print("已保存页面鼠标事件")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("url")
    parser.add_argument("--piece", required=True, help="拼图 img 的选择器")
    parser.add_argument("--background", required=True, help="背景 img 的选择器")
    parser.add_argument("--stage", choices=["images", "crop", "match", "drag"], default="images")
    parser.add_argument("--button", help="drag 阶段的按钮选择器")
    parser.add_argument("--success", help="drag 阶段的顶层页面成功元素")
    parser.add_argument("--iframe", help="图片和按钮所在 iframe 的选择器")
    parser.add_argument("--timeout", type=int, default=10000, help="成功等待时间，毫秒")
    parser.add_argument("--chrome", action="store_true", help="使用已安装的 Google Chrome")
    args = parser.parse_args()
    if args.stage == "drag" and (not args.button or not args.success):
        parser.error("drag 阶段必须提供 --button 和 --success")
    output = Path(tempfile.mkdtemp(prefix="slider-workflow-"))
    print("诊断目录:", output)
    with sync_playwright() as p:
        options = {"headless": False}
        if args.chrome:
            options["channel"] = "chrome"
        browser = p.chromium.launch(**options)
        try:
            page = browser.new_page()
            page.goto(args.url, wait_until="domcontentloaded")
            input("在浏览器打开验证码，准备好后按回车：")
            scope = page.frame_locator(args.iframe) if args.iframe else page
            piece_locator, bg_locator = scope.locator(args.piece), scope.locator(args.background)
            piece, background = read_image(piece_locator), read_image(bg_locator)
            piece.save(output / "piece_original.png")
            background.save(output / "background_original.png")
            print("原图:", {"piece": (piece.size, piece.mode), "background": (background.size, background.mode)})
            if args.stage != "images":
                alpha, bounds = crop_piece(piece, output)
                if args.stage in ("match", "drag"):
                    delta_x = locate(alpha, bounds, piece, background,
                                     piece_locator.bounding_box(), bg_locator.bounding_box(), output)
                    if args.stage == "drag":
                        drag_once(page, piece_locator, scope.locator(args.button), delta_x,
                                  page.locator(args.success), args.timeout, output)
            input("查看页面和诊断目录，按回车关闭浏览器：")
        finally:
            browser.close()


if __name__ == "__main__":
    main()
```

### 依次运行四个阶段

把下面地址和选择器换成你自己页面的值。命令使用相同的基本参数，只改变 `--stage`。macOS / Linux 示例：

```sh title="workflow.sh"
# 1. 保存并查看独立原图
python slider_workflow.py "https://your-test-site.example/login" \
  --piece "#puzzle-piece" --background "#puzzle-background" --stage images

# 2. 查看裁剪后的拼图和 Alpha 通道
python slider_workflow.py "https://your-test-site.example/login" \
  --piece "#puzzle-piece" --background "#puzzle-background" --stage crop

# 3. 查看定位轮廓和坐标换算
python slider_workflow.py "https://your-test-site.example/login" \
  --piece "#puzzle-piece" --background "#puzzle-background" --stage match

# 4. 使用当前验证码重新定位并拖动，等待真实成功条件
python slider_workflow.py "https://your-test-site.example/login" \
  --piece "#puzzle-piece" --background "#puzzle-background" --stage drag \
  --button "#puzzle-handle" --success "[data-test='verification-success']"
```

Windows 可以把每条命令合成一行；PowerShell 多行续行符是反引号，而不是 `\`。使用本机 Chrome 时追加 `--chrome`，需已安装 Google Chrome。

| 阶段 | 主要输出 | 进入下一阶段的条件 |
| :-- | :-- | :-- |
| `images` | `piece_original.png`、`background_original.png` | 拼图透明，背景无起始拼图叠加 |
| `crop` | `piece_cropped.png`、`alpha_cropped.png` | 有效边界与可见拼图一致 |
| `match` | `contour.png`、`match.png`、`match.json` | 轮廓贴合目标，坐标换算合理 |
| `drag` | 实际移动量、`mouse_events.json`、`after_release.png` | 观察到真实成功条件并正常结束 |

图片保存到系统临时目录，终端会打印路径。文件名是脚本输出约定，可以自行修改，与目标网站无关。截图可能含个人信息，分享前脱敏。

每次运行可能生成不同验证码，上一张匹配成功不保证下一张成功。`drag` 阶段不会等待你查看标注图后再拖动，以免长期等待导致资源失效；它会对当前验证码重新计算。如果算法尚未稳定，继续在 `match` 阶段积累不同样本，不进入 `drag`。

## 常见问题：按发生阶段排查

| 现象 | 先检查什么 |
| :-- | :-- |
| `target` 几乎固定、分数很高 | 输入图片是否含相同叠加内容，模板是否纯色 |
| 图片是白色或尺寸为零 | 图片加载、目标元素和资源读取是否正确 |
| 不能按透明通道裁剪 | 原图是否真的透明，是否误用了截图或按钮图 |
| 匹配框落在相似背景 | 使用了内部纹理还是外轮廓，是否限定正确高度 |
| 拼图始终差一截 | 裁剪偏移、图片缩放、两个图片的页面起点 |
| 按钮移动正确、拼图移动不同 | 组件轨道比例、最大移动范围或页面取整 |
| 拼图贴合但服务端拒绝 | 实际校验响应、提交数据、鼠标事件，而非只看提示文案 |
| 轨迹出现大幅跳跃 | 按住期间额外操作、页面滚动或其他输入 |
| 登录后回调解析异常 | 是否把非 JSON 登录请求交给 JSON 解析 |
| 跳转后保存报变量不存在 | 是否仍依赖旧页面的 window 数据 |

完整处理的标准是：输入正确、定位可信、换算正确、组件实际移动正确、真实校验成功、导航后程序正常结束。仅“不报错”或“拼图看起来贴合”不足以判定完成。

## 参考资料

- [ddddocr](https://github.com/sml2h3/ddddocr)：确认实际安装版本的滑块接口与坐标语义。
- [Playwright Locator](https://playwright.dev/python/docs/api/class-locator)：图片截图、元素等待和 `bounding_box()`。
- [Playwright Mouse](https://playwright.dev/python/docs/api/class-mouse)：鼠标坐标与移动步数。
- [Pillow Image.getbbox](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.getbbox)：包围盒与裁剪边界。
- [OpenCV 模板匹配](https://docs.opencv.org/4.x/d4/dc6/tutorial_py_template_matching.html)：算法与匹配分数。
