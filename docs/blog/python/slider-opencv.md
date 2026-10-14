---
title: OpenCV 中滑块验证处理
createTime: 2026/10/13 12:00:00
tags:
  - python
  - Playwright
  - OpenCV
  - 验证码
permalink: /blog/viqjsm9f/
---

::::: tip
当前主要是进行简单的横向滑块验证，类似天爱这种拼图滑块，整体流程和 [Ddddocr 中滑块验证处理](/blog/batnpcsj/) 完全一致，只是缺口定位不依赖 `ddddocr`，改用 `OpenCV` 的边缘模板匹配。适合不方便引入 OCR 模型依赖、或者想自己控制匹配过程的项目
:::::

## 环境准备

需要 Python 3.10 或更新版本，先创建一个独立的虚拟环境（Windows PowerShell 的激活脚本是 `.venv\Scripts\Activate.ps1`）：

```sh title="环境准备.sh"
python -m venv .venv
source .venv/bin/activate
```

本文不安装 `ddddocr`，缺口定位全部交给 `OpenCV` 完成：

```sh title="安装依赖.sh"
# playwright 负责浏览器操作，pillow 读写图片，opencv(cv2) 和 numpy 负责边缘提取与模板匹配
python -m pip install playwright pillow numpy opencv-python
python -m playwright install chromium
```

完整脚本默认用 `channel="chrome"` 启动本机 Chrome；没有安装 Chrome 就去掉这个参数，改用上面安装的 Chromium。

## 获取原始图片

在 `playwright` 中通过 `screenshot()` 截图图片，一般是元素可见区域的截图，所以即使针对背景图使用 `screenshot` 也会包含滑块图片，需要获取原始的图片资源

![页面截图包含叠加内容，独立图片资源才保留背景和拼图各自的数据](/images/slider-captcha/image-sources.svg)

后续会使用 `currentSrc` 这是浏览器实际选择的图片地址，如果有 `src` 属性，里面的数据是一个直接显示的 `Base64` 数据，那么，通过 `playwright` 的 `get_attribute("src")` 和 `currentSrc/src` 的数据是一致的，但其他形态可能不一样：

1. `src="/images/xx.png` 时，使用 `get_attribute` 返回的是相对路径，没有任何处理，使用 `currentSrc` 则返回完整的 `URL`
2. 使用 `srcset` 或 `<picture>` 时，`get_attribute` 依然返回 `src` 数据，而 `currentSrc` 返回浏览器根据屏幕、像素密度等条件选中的图片 URL
3. 浏览器尚未选择图片来源时，`get_attribute` 返回属性值，没有则是 `None`，`currentSrc` 返回空字符串

等待图片时需要区分两件事：元素可见只代表它渲染出来了，不代表图片数据已经解码完成。所以要先用 `wait_for` 等可见，再用 `complete && naturalWidth > 0` 等图片真正可用，两者缺一不可

```python title="获取原始图片.py"
bg = dialog.locator(CAPTCHA_BG)
move = dialog.locator(CAPTCHA_MOVE)

# 先等元素可见，再等图片真正解码完成
for image in (bg, move):
    image.wait_for(state="visible")
    image.wait_for_function("img => img.complete && img.naturalWidth > 0")

# 获取图片 src，currentSrc 优先
bg_src = bg.evaluate("img => img.currentSrc || img.src")
move_src = move.evaluate("img => img.currentSrc || img.src")

bg_path = IMG_PATH / "bg.png"
move_path = IMG_PATH / "move.png"
IMG_PATH.mkdir(exist_ok=True)

# 保存图片，需要截取后面的 Base64 数据，类似 data:image/jpeg;base64 的头数据不要
bg_path.write_bytes(base64.b64decode(bg_src.split(",", 1)[1]))
move_path.write_bytes(base64.b64decode(move_src.split(",", 1)[1]))
```

::::: info src 不是 Base64 时怎么办
上面假设 `src` 是 `data:image/png;base64,` 形式的数据。如果图片是 `http(s)` 或 `blob:` 地址，改在页面上下文里 `fetch` 资源再转成 Base64 传回 Python：

```python title="读取网络图片.py"
# 在浏览器里读取图片字节并转成 dataURL，credentials 帮助携带登录态
data_url = bg.evaluate("""async img => {
    const response = await fetch(img.currentSrc || img.src, { credentials: "include" });
    const blob = await response.blob();
    return await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}""")

# data_url 形如 data:image/jpeg;base64,xxxx，后面的处理方式和上面完全一样
bg_path.write_bytes(base64.b64decode(data_url.split(",", 1)[1]))
```

跨域资源被 `CORS` 拦截时 `fetch` 会直接失败，这时可以改用 `page.on("response", ...)` 在浏览器自己请求图片时保存对应响应体
:::::

::::: info 元素级和页面级 wait_for_function 的区别
`locator.wait_for_function()` 会把定位到的元素自动作为 `JS` 函数的第一个参数传入，`arg` 用来传递额外的第二个参数，不传也不影响拿到元素；而 `page.wait_for_function()` 没有元素上下文，函数的入参完全来自 `arg`，所以必须写 `arg=locator.element_handle()` 把元素喂进去
:::::

## 裁剪拼图

大部分移动的滑块拼图，带有一个透明的背景（RGBA），其中 `A` 表示透明度。直接拿整张透明画布去匹配，透明留白会参与计算，还会把模板中心和拼图实际位置混在一起，所以先用 `A` 通道裁出有效部分

```python title="裁剪滑块透明背景.py"
# from PIL import Image
im = Image.open(move_path)
# 获取 A 通道边界，返回 (left, top, right, bottom)，右边界和下边界不包含在区域内
bounds = im.getchannel("A").getbbox()
if bounds is None:
    raise ValueError("滑块图片完全透明，无法裁剪和定位")
move_crop_path = IMG_PATH / "move_crop.png"
# 裁剪并重新保存下来
im.crop(bounds).save(move_crop_path)
# 两个偏移后面都要用：crop_left 换算拼图当前页面位置，crop_top 计算搜索高度
crop_left, crop_top = bounds[0], bounds[1]
```

![裁剪前的透明画布、裁剪后的模板以及需要保留的原图偏移](/images/slider-captcha/crop-offset.svg)

::::: warning 裁剪偏移要保存下来
裁剪之后模板图片的左上角变成了 `(0, 0)`，但拼图在原始画布中的位置信息并没有消失：`crop_left`（原图左侧偏移）在后面换算页面坐标时要用它计算拼图当前的真实位置，`crop_top`（原图顶部偏移）用来反推缺口所在的水平高度，不要裁剪完就把它丢掉
:::::

## 计算并标记图片

`ddddocr` 一行 `slide_match` 就能拿到缺口位置，自己实现时核心是搞清楚「拿什么去匹配什么」。直接拿拼图的图案做灰度匹配并不可靠：缺口在背景里通常被压暗、加描边，纹理和拼图本体对不上，容易匹配到别处的相似纹理

更稳的做法是利用透明拼图的**外形**：把 `A` 通道转成黑白形状图，用 `Canny` 提取外轮廓作为模板；背景转灰度后同样提边缘，缺口边界会在边缘图里凸显出来。拼图只能水平移动，缺口一定和它同高，所以只在同一个水平条带里匹配，把其他高度的干扰全部排除

还有一个容易踩的坑：紧裁剪出来的形状顶到了图片边界，而 `Canny` 在图像边界处测不到梯度，直接对裁剪图提轮廓会得到一张**空模板**（匹配分数恒为 0）。所以要先给形状补一圈透明像素，再提取外轮廓

```python title="识别并标记.py"
import cv2
import numpy as np
import PIL.ImageDraw

# 两个图片元素的页面位置和尺寸，图片像素与页面像素的换算全靠它们
bg_box = bg.bounding_box()
move_box = move.bounding_box()

with Image.open(bg_path) as background, Image.open(move_path) as piece, Image.open(
    move_crop_path
) as cropped:
    # 缩放比例 = 页面显示尺寸 ÷ 图片原始尺寸，两张图各算 x、y 两个方向
    piece_scale_x = move_box["width"] / piece.width
    piece_scale_y = move_box["height"] / piece.height
    bg_scale_x = bg_box["width"] / background.width
    bg_scale_y = bg_box["height"] / background.height

    # 裁剪图在页面上的显示尺寸，再除以背景比例，换算成它在背景原图里应占的像素
    width = round(cropped.width * piece_scale_x / bg_scale_x)
    height = round(cropped.height * piece_scale_y / bg_scale_y)

    # A >= 128 当作拼图本体；先 resize 再二值化（直接缩放细轮廓会丢边缘）
    alpha = cropped.getchannel("A").resize((width, height))
    mask = (np.array(alpha) >= 128).astype(np.uint8) * 255
    # 形状顶到图片边界时 Canny 测不到梯度，补一圈 0（当作透明像素）再提轮廓
    template = cv2.Canny(np.pad(mask, 1), 50, 150)  # 尺寸 (height+2, width+2)

    # 背景转灰度后同样提边缘，缺口的边界在边缘图里最清晰
    gray = cv2.cvtColor(np.array(background.convert("RGB")), cv2.COLOR_RGB2GRAY)
    edges = cv2.Canny(gray, 50, 150)

    # 缺口和拼图同高：由拼图当前显示位置反推条带在背景原图里的 y
    band_y = round(
        (move_box["y"] + crop_top * piece_scale_y - bg_box["y"]) / bg_scale_y
    )
    # 条带向上放宽 1px 容纳补边模板，并整体夹进背景范围，防止 matchTemplate 越界
    band_y = max(0, min(band_y - 1, background.height - height - 2))

    # 只在条带里做归一化相关匹配，分数最高的位置就是缺口
    scores = cv2.matchTemplate(
        edges[band_y : band_y + height + 2], template, cv2.TM_CCORR_NORMED
    )
    _, score, _, location = cv2.minMaxLoc(scores)

    # location 是补边后模板的左上角，不是中心；补边让轮廓内移了 1px，要加回来
    left = location[0] + 1
    top = band_y + location[1] + 1

    # 画红框保存，拖动前先人工核对框是否贴住缺口
    marked = background.convert("RGB")
    draw = PIL.ImageDraw.Draw(marked)
    # 减 1 是因为矩形的右边界和下边界像素是包含的
    draw.rectangle(
        (left, top, left + width - 1, top + height - 1), outline="red", width=3
    )
    marked.save(IMG_PATH / "bg_marked.png")

print(f"匹配分数 {score:.3f}，缺口左上角 ({left}, {top})")
```

::::: info 和 ddddocr 返回值的区别
`cv2.minMaxLoc()` 返回的 `location` 是最佳匹配区域的**左上角**，而 `ddddocr` 的 `slide_match` 返回的 `target` 是**中心**坐标。本文后面所有换算直接用 `left`，不需要再减拼图宽高的一半
:::::

::::: tip 阈值不是定死的
`128` 用来区分拼图本体和透明区，`Canny` 的 `50 / 150` 是边缘提取的低、高阈值，都是初始值：拼图带阴影或半透明描边、标注框不贴合时先调它们。如果图片本来就没有透明区域，说明资源形态和本文不同（比如误拿了按钮图或截图），需要换一种取模板的方式
:::::

### 处理置信度

`score` 是 `TM_CCORR_NORMED` 的相关分数，不是验证码通过的概率。边缘图上大部分像素是 0，这个分数整体偏高、绝对值没有参考意义，更不能和 `ddddocr` 的 `confidence` 对比；它只在**同一算法、同一张图**内比较候选位置时有用

分数偏低说明缺口定位很可能偏了，带着错误的距离去拖动大概率失败，还会白白消耗一次尝试机会。合理的做法是设置一个阈值，低于阈值就点击验证码的刷新按钮换一张图重新识别，而不是硬拖：

```python title="置信度检查.py"
MIN_CONFIDENCE = 0.5

if score < MIN_CONFIDENCE:
    # 换一张验证码，重新等待图片加载后再次识别
    page.locator(CAPTCHA_REFRESH).click()
```

::::: tip 阈值怎么取
按站点实测调整：阈值过高会频繁刷新、迟迟不肯拖动；过低则会把可疑的匹配当成可信的。先多跑几次记录分数分布，正常命中和明显偏移的分数通常能拉开差距，把阈值取在中间偏下的位置
:::::

## 等待弹窗入场动画

验证码一般挂在弹窗组件里（比如 Element Plus 的 `el-dialog`），弹窗出现时带有一段滑入/淡入动画，冷缓存时可能持续一到两秒。前面的两个等待条件——元素 `visible` 和图片 `complete`——在**动画进行中**就会全部通过

此时去调 `bounding_box()`，拿到的是动画中间态的坐标，会造成两个后果：

1. 按压点落在弹窗背板的遮罩上，组件绑定在滑块按钮上的 `mousedown` 根本不会触发，拖动毫无反应
2. 背景图和拼图元素的位置也在漂移，换算出来的拖动距离失真

可靠的判定是等按钮位置**稳定**：连续两次采样 `bounding_box()` 一致，才认为动画结束。这个判断和动画的具体实现无关，任何框架的入场动画都能覆盖：

```python title="等待动画结束.py"
btn = page.locator(CAPTCHA_BTN)
btn.wait_for(state="visible")

prev = btn.bounding_box()
while True:
    time.sleep(0.2)
    cur = btn.bounding_box()
    if cur is not None and cur == prev:
        break
    prev = cur
```

::::: warning 不要依赖动画类名消失
`dialog-fade-enter-active` 这类类名在过渡真正结束前就可能被移除，实测类名查不到了元素可能还在动。后面**所有**的 `bounding_box()` 测量（图片元素、滑块按钮）都要放在这段稳定等待之后
:::::

## 转换坐标

现在使用的是图片的像素坐标，我们需要转换成页面的坐标和尺寸，获取比率后进行计算。图片原始宽度（`background.width`）和页面显示宽度（`bg_box["width"]`）往往不一致，两者的比值就是缩放比例

![从背景原图位置换算到页面当前位置和目标位置，再相减得到拖动距离](/images/slider-captcha/coordinate-spaces.svg)

```python title="转换坐标.py"
# 获取背景图片元素和拼图元素的坐标与尺寸
bg_box = bg.bounding_box()
move_box = move.bounding_box()

assert bg_box is not None and move_box is not None

# left 是缺口左上角在背景原图中的位置，乘上缩放比例后加上背景图元素的页面 x，
# 得到缺口的页面坐标；拼图同理，crop_left 就是裁剪时保留下来的原图左侧偏移
with Image.open(bg_path) as background, Image.open(move_path) as piece:
    target_x = bg_box["x"] + left * bg_box["width"] / background.width
    current_x = move_box["x"] + crop_left * move_box["width"] / piece.width

# 两个页面坐标相减，就是最终需要拖动的像素距离
drag_x = target_x - current_x

print(f"当前需要水平移动 {drag_x:.1f} 像素")
```

`left` 已经是左上角坐标，这一步不需要像 `ddddocr` 版那样减拼图的一半宽度，直接乘比例换算即可。

## 操作元素

利用鼠标事件，将鼠标放到滑块按钮的中心，然后向右移动。注意两点：

- 按下点必须真的落在按钮元素上，有些验证码组件只把 `mousedown` 绑定在按钮本身，按到遮罩或者轨道上都不会触发拖动
- `steps=20` 会把这次移动拆成多步插值事件，鼠标轨迹更接近真人操作，验证码的行为检测也会记录这段轨迹

```python title="移动.py"
btn = page.locator(CAPTCHA_BTN)
btn.wait_for(state="visible")
btn_rect = btn.bounding_box()
if btn_rect is None or btn_rect["width"] == 0:
    raise ValueError("滑块按钮不可用，无法定位")
start_x = btn_rect["x"] + btn_rect["width"] / 2
start_y = btn_rect["y"] + btn_rect["height"] / 2

page.mouse.move(start_x, start_y)
page.mouse.down()
try:
    page.mouse.move(start_x + drag_x, start_y, steps=20)
finally:
    page.mouse.up()
```

::::: info 为什么用 try/finally
移动过程中一旦抛出异常，没有 `finally` 的话鼠标会一直停留在按下状态，页面后续的输入交互全部会被拖拽行为劫持。`mouse.up()` 必须保证被执行
:::::

## 完整的演示代码

地址、账号、密码都是占位数据，替换成自己的即可。代码按阶段拆成了小函数，每个函数对应上面的一节，可以单独检查每一步的产物（图片文件都在 `images` 目录下）：

```python title="完整脚本.py"
import base64
import time
from pathlib import Path

import cv2
import numpy as np
import PIL.ImageDraw
from PIL import Image
from playwright.sync_api import sync_playwright

LOGIN_URL = "https://example.com/login"
ACCOUNT = "your-account"
PASSWORD = "your-password"

ACCOUNT_INPUT = "//input[contains(@placeholder, '请输入账号')]"
PASSWORD_INPUT = "//input[contains(@placeholder, '请输入密码')]"
CAPTCHA_BOX = "div#captcha-box"
CAPTCHA_BG = "img#tianai-captcha-slider-bg-img"
CAPTCHA_MOVE = "img#tianai-captcha-slider-move-img"
CAPTCHA_BTN = "div#tianai-captcha-slider-move-btn"
CAPTCHA_REFRESH = "div#tianai-captcha-slider-refresh-btn"

IMG_PATH = Path(__file__).resolve().parent / "images"
MIN_CONFIDENCE = 0.5  # 匹配分数低于该值视为定位不可靠，刷新换图重试


def login_and_open_captcha(page):
    """登录并等验证码弹窗出现"""
    page.goto(LOGIN_URL)
    page.wait_for_load_state()
    page.locator(ACCOUNT_INPUT).fill(ACCOUNT)
    page.locator(PASSWORD_INPUT).fill(PASSWORD)
    page.get_by_role("button", name="登录").click()
    page.locator(CAPTCHA_BOX).wait_for(state="visible")


def wait_captcha_ready(page):
    """先等图片加载完成，再等弹窗入场动画结束、按钮位置稳定"""
    for selector in (CAPTCHA_BG, CAPTCHA_MOVE):
        image = page.locator(selector)
        image.wait_for(state="visible")
        image.wait_for_function("img => img.complete && img.naturalWidth > 0")

    btn = page.locator(CAPTCHA_BTN)
    prev = btn.bounding_box()
    while True:
        time.sleep(0.2)
        cur = btn.bounding_box()
        if cur is not None and cur == prev:
            return
        prev = cur


def save_origin_images(page):
    """读取背景和拼图的原图数据，保存后返回两个文件路径"""
    bg_src = page.locator(CAPTCHA_BG).evaluate("img => img.currentSrc || img.src")
    move_src = page.locator(CAPTCHA_MOVE).evaluate("img => img.currentSrc || img.src")
    IMG_PATH.mkdir(exist_ok=True)
    bg_path, move_path = IMG_PATH / "bg.png", IMG_PATH / "move.png"
    bg_path.write_bytes(base64.b64decode(bg_src.split(",", 1)[1]))
    move_path.write_bytes(base64.b64decode(move_src.split(",", 1)[1]))
    return bg_path, move_path


def crop_piece(move_path):
    """裁掉拼图周围的透明画布，返回 (裁剪图路径, 原图左侧偏移, 原图顶部偏移)"""
    with Image.open(move_path) as piece:
        bounds = piece.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError("滑块图片完全透明，无法裁剪和定位")
        crop_path = IMG_PATH / "move_crop.png"
        piece.crop(bounds).save(crop_path)
    return crop_path, bounds[0], bounds[1]


def match_notch(page, crop_path, move_path, bg_path, crop_top):
    """用拼图外轮廓在背景边缘图里定位缺口，返回 (left, top, width, height, score)"""
    bg_box = page.locator(CAPTCHA_BG).bounding_box()
    move_box = page.locator(CAPTCHA_MOVE).bounding_box()
    assert bg_box is not None and move_box is not None

    with Image.open(bg_path) as background, Image.open(
        move_path
    ) as piece, Image.open(crop_path) as cropped:
        # 显示尺寸 ÷ 原始尺寸，图片像素和页面像素靠这四个比例互相换算
        piece_scale_x = move_box["width"] / piece.width
        piece_scale_y = move_box["height"] / piece.height
        bg_scale_x = bg_box["width"] / background.width
        bg_scale_y = bg_box["height"] / background.height

        # 裁剪图换算到背景原图的像素尺寸
        width = round(cropped.width * piece_scale_x / bg_scale_x)
        height = round(cropped.height * piece_scale_y / bg_scale_y)
        if width <= 0 or height <= 0 or width + 2 > background.width or height + 2 > background.height:
            raise ValueError("模板尺寸异常，检查图片元素与原图尺寸是否匹配")

        # A >= 128 当作拼图本体，先 resize 再二值化；
        # 补一圈 0 是因为形状顶到图片边界时 Canny 测不到梯度
        alpha = cropped.getchannel("A").resize((width, height))
        mask = (np.array(alpha) >= 128).astype(np.uint8) * 255
        template = cv2.Canny(np.pad(mask, 1), 50, 150)

        # 背景转灰度提边缘，缺口边界在边缘图里最清晰
        gray = cv2.cvtColor(np.array(background.convert("RGB")), cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 50, 150)

        # 缺口和拼图同高：由拼图当前显示位置反推条带 y，只在条带内匹配；
        # 条带上下各放宽 1px 容纳补边模板，并夹进背景范围
        band_y = round(
            (move_box["y"] + crop_top * piece_scale_y - bg_box["y"]) / bg_scale_y
        )
        band_y = max(0, min(band_y - 1, background.height - height - 2))
        scores = cv2.matchTemplate(
            edges[band_y : band_y + height + 2], template, cv2.TM_CCORR_NORMED
        )
        _, score, _, location = cv2.minMaxLoc(scores)

    # location 是补边模板的左上角，轮廓内移 1px 要加回来，也不用减半宽
    return location[0] + 1, band_y + location[1] + 1, width, height, score


def mark_matched_area(bg_path, left, top, width, height):
    """把匹配区域画上红框保存下来，拖动前可以人工核对定位是否准确"""
    marked = Image.open(bg_path).convert("RGB")
    draw = PIL.ImageDraw.Draw(marked)
    # 减 1 是因为矩形的右边界和下边界像素是包含的
    draw.rectangle(
        (left, top, left + width - 1, top + height - 1), outline="red", width=3
    )
    marked.save(IMG_PATH / "bg_marked.png")


def calc_drag_distance(page, matched_left, crop_left):
    """把图片像素坐标换算成页面坐标，返回需要水平拖动的距离"""
    bg_box = page.locator(CAPTCHA_BG).bounding_box()
    move_box = page.locator(CAPTCHA_MOVE).bounding_box()
    assert bg_box is not None and move_box is not None

    with Image.open(IMG_PATH / "bg.png") as background, Image.open(
        IMG_PATH / "move.png"
    ) as piece:
        target_x = bg_box["x"] + matched_left * bg_box["width"] / background.width
        current_x = move_box["x"] + crop_left * move_box["width"] / piece.width
    return target_x - current_x


def drag_slider(page, distance):
    """按住滑块按钮中心，水平拖动指定距离后松开"""
    btn_rect = page.locator(CAPTCHA_BTN).bounding_box()
    if btn_rect is None or btn_rect["width"] == 0:
        raise ValueError("滑块按钮不可用，无法定位")
    start_x = btn_rect["x"] + btn_rect["width"] / 2
    start_y = btn_rect["y"] + btn_rect["height"] / 2
    page.mouse.move(start_x, start_y)
    page.mouse.down()
    try:
        page.mouse.move(start_x + distance, start_y, steps=20)
    finally:
        page.mouse.up()


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False, args=["--start-maximized"], channel="chrome"
        )
        page = browser.new_page(no_viewport=True)
        login_and_open_captcha(page)

        for attempt in range(3):
            wait_captcha_ready(page)
            bg_path, move_path = save_origin_images(page)
            crop_path, crop_left, crop_top = crop_piece(move_path)
            left, top, width, height, score = match_notch(
                page, crop_path, move_path, bg_path, crop_top
            )
            print(f"第 {attempt + 1} 次匹配：score = {score:.3f}")

            # 定位不可靠就换一张图重新识别，不带错误距离硬拖
            if score < MIN_CONFIDENCE:
                page.locator(CAPTCHA_REFRESH).click()
                continue

            mark_matched_area(bg_path, left, top, width, height)
            distance = calc_drag_distance(page, left, crop_left)
            print(f"当前需要水平移动 {distance:.1f} 像素")
            drag_slider(page, distance)
            break

        time.sleep(2)
        page.close()
        browser.close()


if __name__ == "__main__":
    main()
```

## 参考资料

- [OpenCV 模板匹配](https://docs.opencv.org/4.x/d4/dc6/tutorial_py_template_matching.html)：`matchTemplate` 各算法与匹配分数的含义
- [OpenCV Canny 边缘检测](https://docs.opencv.org/4.x/da/d22/tutorial_py_canny.html)：边缘图提取与高低阈值
- [Playwright Locator](https://playwright.dev/python/docs/api/class-locator)：元素等待、`evaluate` 和 `bounding_box()`
- [Playwright Mouse](https://playwright.dev/python/docs/api/class-mouse)：鼠标坐标与移动步数
- [Pillow Image.getbbox](https://pillow.readthedocs.io/en/stable/reference/Image.html#PIL.Image.Image.getbbox)：透明通道包围盒与裁剪边界
