---
title: Ddddocr 中滑块验证处理
createTime: 2026/10/13 12:00:00
tags:
  - python
  - Playwright
  - Ocr
  - 验证码
permalink: /blog/batnpcsj/
---

:::: tip
当前主要是进行简单的横向滑块验证，类似这种天爱的滑块验证，使用下面的方式完全可以处理
::::

## 获取原始图片

在 `playwright` 中通过 `screenshot()` 截图图片，一般是元素可见区域的截图，所以即使针对背景图使用 `screenshot` 也会包含滑块图片，需要获取原始的图片资源

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

:::: info 元素级和页面级 wait_for_function 的区别
`locator.wait_for_function()` 会把定位到的元素自动作为 `JS` 函数的第一个参数传入，`arg` 用来传递额外的第二个参数，不传也不影响拿到元素；而 `page.wait_for_function()` 没有元素上下文，函数的入参完全来自 `arg`，所以必须写 `arg=locator.element_handle()` 把元素喂进去
::::

## 裁剪拼图

大部分移动的滑块拼图，带有一个透明的背景（RGBA），库中会转换成 `RGB` 再做边缘匹配，其中 `A` 表示透明度

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
```

:::: warning 裁剪偏移要保存下来
裁剪之后模板图片的左上角变成了 `(0, 0)`，但拼图在原始画布中的位置信息并没有消失：`bounds[0]`（原图左侧偏移）在后面换算页面坐标时要用它计算拼图当前的真实位置，不要裁剪完就把它丢掉
::::

## 计算并标记图片

使用 `ddddocr` 的 `slide_match` 时，如果使用灰度匹配则传递 `simple_target=True` ，边缘匹配使用 `simple_target=False`

- True：直接比较滑块和背景的灰度像素。适合滑块图案与背景对应区域基本一致、纹理能直接对上的情况
- False：先提取两张图的边缘再匹配。适合主要依靠拼图轮廓寻找缺口的情况

```python title="识别并标记.py"
ocr = DdddOcr(show_ad=False, ocr=False, det=False)
result = ocr.slide_match(move_crop_path, bg_path, simple_target=False)
print(result)

# 使用 pillow 计算一下拼图的大小
with Image.open(move_crop_path) as cropped:
    width, height = cropped.size
# target 返回的是匹配区域的中心坐标，需要减去拼图宽高的一半换算成左上角
center_x, center_y = result["target"]
# 将拼图移到缺口中间，则左右上下移动，得去掉拼图的一半
left = center_x - width // 2
top = center_y - height // 2

with Image.open(bg_path) as background:
    # 转换 RGB 是为了画矩形时不带透明通道，convert 会产生一份拷贝，不会修改原图
    marked = background.convert("RGB")
    draw = PIL.ImageDraw.Draw(marked)
    # 绘制矩形，减去 1 是因为包含右边界和下边界像素
    draw.rectangle(
        (left, top, left + width - 1, top + height - 1), outline="red", width=3
    )
    marked.save(IMG_PATH / "bg_marked.png")
```

### 处理置信度

`confidence` 是模板匹配的分数，不是验证码通过的概率。它只适合在**同一算法、同一张图**下比较候选位置的优劣，不同验证码之间的波动非常大：同一站点多次刷新，实测可能从 `0.1` 以下到 `0.6` 之间跳动

置信度过低意味着缺口定位很可能偏了，带着错误的距离去拖动大概率失败，还会白白消耗一次尝试机会。合理的做法是设置一个阈值，低于阈值就点击验证码的刷新按钮换一张图重新识别，而不是硬拖：

```python title="置信度检查.py"
MIN_CONFIDENCE = 0.25

if result["confidence"] < MIN_CONFIDENCE:
    # 换一张验证码，重新等待图片加载后再次识别
    page.locator(CAPTCHA_REFRESH).click()
```

:::: tip 阈值怎么取
按站点实测调整：阈值过高会频繁刷新、迟迟不肯拖动；过低则会把可疑的匹配当成可信的。先多跑几次记录置信度分布，再取一个能过滤掉明显异常匹配的位置
::::

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

:::: warning 不要依赖动画类名消失
`dialog-fade-enter-active` 这类类名在过渡真正结束前就可能被移除，实测类名查不到了元素可能还在动。后面**所有**的 `bounding_box()` 测量（图片元素、滑块按钮）都要放在这段稳定等待之后
::::

## 转换坐标

现在使用的是图片的像素坐标，我们需要转换成页面的坐标和尺寸，获取比率后进行计算。图片原始宽度（`background.width`）和页面显示宽度（`bg_box["width"]`）往往不一致，两者的比值就是缩放比例

```python title="转换坐标.py"
# 获取背景图片元素和拼图元素的坐标与尺寸
bg_box = bg.bounding_box()
move_box = move.bounding_box()

assert bg_box is not None and move_box is not None

# left 是缺口左边界在背景原图中的位置，乘上缩放比例后加上背景图元素的页面 x，
# 得到缺口的页面坐标；拼图同理，crop_left 就是裁剪时保留下来的原图左侧偏移
with Image.open(bg_path) as background, Image.open(move_path) as piece:
    target_x = bg_box["x"] + left * bg_box["width"] / background.width
    current_x = move_box["x"] + crop_left * move_box["width"] / piece.width

# 两个页面坐标相减，就是最终需要拖动的像素距离
drag_x = target_x - current_x

print(f"当前需要水平移动 {drag_x:.1f} 像素")
```

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

:::: info 为什么用 try/finally
移动过程中一旦抛出异常，没有 `finally` 的话鼠标会一直停留在按下状态，页面后续的输入交互全部会被拖拽行为劫持。`mouse.up()` 必须保证被执行
::::

## 完整的演示代码

地址、账号、密码都是占位数据，替换成自己的即可。代码按阶段拆成了小函数，每个函数对应上面的一节，可以单独检查每一步的产物（图片文件都在 `images` 目录下）：

```python title="完整脚本.py"
import base64
import time
from pathlib import Path

import PIL.ImageDraw
from ddddocr import DdddOcr
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
MIN_CONFIDENCE = 0.25  # 匹配分数低于该值视为定位不可靠，刷新换图重试


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
    """裁掉拼图周围的透明画布，返回 (裁剪图路径, 拼图在原图中的左侧偏移)"""
    with Image.open(move_path) as piece:
        bounds = piece.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError("滑块图片完全透明，无法裁剪和定位")
        crop_path = IMG_PATH / "move_crop.png"
        piece.crop(bounds).save(crop_path)
    return crop_path, bounds[0]


def match_notch(crop_path, bg_path):
    """边缘匹配缺口，返回 (缺口左上角 x, 缺口左上角 y, 置信度)"""
    ocr = DdddOcr(show_ad=False, ocr=False, det=False)
    result = ocr.slide_match(crop_path, bg_path, simple_target=False)
    with Image.open(crop_path) as cropped:
        left = result["target"][0] - cropped.width // 2
        top = result["target"][1] - cropped.height // 2
    return left, top, result["confidence"]


def mark_matched_area(crop_path, bg_path, left, top):
    """把匹配区域画上红框保存下来，拖动前可以人工核对定位是否准确"""
    with Image.open(crop_path) as cropped:
        marked = Image.open(bg_path).convert("RGB")
        draw = PIL.ImageDraw.Draw(marked)
        draw.rectangle(
            (left, top, left + cropped.width - 1, top + cropped.height - 1),
            outline="red",
            width=3,
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
            crop_path, crop_left = crop_piece(move_path)
            left, top, confidence = match_notch(crop_path, bg_path)
            print(f"第 {attempt + 1} 次匹配：confidence = {confidence:.3f}")

            # 定位不可靠就换一张图重新识别，不带错误距离硬拖
            if confidence < MIN_CONFIDENCE:
                page.locator(CAPTCHA_REFRESH).click()
                continue

            mark_matched_area(crop_path, bg_path, left, top)
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
