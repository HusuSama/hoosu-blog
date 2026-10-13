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

::: tip
当前主要是进行简单的横向滑块验证，类似这种天爱的滑块验证，使用下面的方式完全可以处理
:::

## 获取原始图片

在 `playwright` 中通过 `screenshot()` 截图图片，一般是元素可见区域的截图，所以即使针对背景图使用 `screenshot` 也会包含滑块图片，需要获取原始的图片资源

后续会使用 `currentSrc` 这是浏览器实际选择的图片地址，如果有 `src` 属性，里面的数据是一个直接显示的 `Base64` 数据，那么，通过 `playwright` 的 `get_attribute("src")` 和 `currentSrc/src` 的数据是一致的，但其他形态可能不一样：

1. `src="/images/xx.png` 时，使用 `get_attribute` 返回的是相对路径，没有任何处理，使用 `currentSrc` 则返回完整的 `URL`
2. 使用 `srcset` 或 `<picture>` 时，`get_attribute` 依然返回 `src` 数据，而 `currentSrc` 返回浏览器根据屏幕、像素密度等条件选中的图片 URL
3. 浏览器尚未选择图片来源时，`get_attribute` 返回属性值，没有则是 `None`，`currentSrc` 返回空字符串

获取原始图片资源，大部分情况，我们都可以使用如下形式：

```python title="获取原始图片.py"
bg = dialog.locator(CAPTCHA_BG)
move = dialog.locator(CAPTCHA_MOVE)

# 等待图片完全加载
for image in (bg, move):
    image.wait_for(state="visible")
    page.wait_for_function(
        "img => img.complete && img.naturalWidth > 0",
        arg=image.element_handle(),
    )

# 获取图片 src
bg_src = bg.evaluate("img => img.currentSrc || img.src")
move_src = move.evaluate("img => img.currentSrc || img.src")
bg_path = IMG_PATH / "bg.png"
move_path = IMG_PATH / "move.png"
IMG_PATH.mkdir(exist_ok=True)
bg_path.touch(exist_ok=True)
move_path.touch(exist_ok=True)

# 保存图片，需要截取后面的 Base64 数据，类似 data:image/jpeg;base64 的头数据不要
bg_path.write_bytes(base64.b64decode(bg_src.split(",", 1)[1]))
move_path.write_bytes(base64.b64decode(move_src.split(",", 1)[1]))
```

## 裁剪拼图

大部分移动的滑块拼图，带有一个透明的背景（RGBA），库中会转换成 `RGB` 再做边缘匹配，其中 `A` 表示透明度

```python title="裁剪滑块透明背景.py"
# from PIL import Image
im = Image.open(move_path)
# 获取 A 通道边界
box = im.getchannel("A").getbbox()
move_crop_path = IMG_PATH / "move_crop.png"
# 裁剪并重新保存下来
im.crop(box).save(move_crop_path)

```

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
# 这里获取 target 的坐标位置
center_x, center_y = result["target"]
# 使用 // 的整除，保留整数部分
# 将拼图移到缺口中间，则左右上下移动，得去掉拼图的一半
# 计算后，这里的 left 和 top 就是拼图移动到缺口的左边和顶部位置坐标
left = center_x - width // 2
top = center_y - height // 2

with Image.open(bg_path) as background:
    # 转换一下 RGB ，并且这个会多个 copy 操作，如果不转换，也可以使用 background.copy() 直接拷贝一份，不去修改原图
    marked = background.convert("RGB")
    draw = PIL.ImageDraw.Draw(marked)
    # 绘制矩形
    # 减去 1 是因为包含右边界和下边界像素
    draw.rectangle(
        (left, top, left + width - 1, top + height - 1), outline="red", width=3
    )
    marked.save(IMG_PATH / "bg_marked.png")
```

## 转换坐标

现在使用的是图片的显示坐标，我们需要转换成页面的坐标和尺寸，获取比率后进行计算

```python title="转换坐标.py"
# 获取背景图片元素的坐标和尺寸
bg_rect = bg.bounding_box()
# 获取滑块图片元素的坐标和尺寸
move_rect = move.bounding_box()

assert bg_rect is not None and move_rect is not None

# 把图片的宽度也拿出来，和页面中的进行比较，获取到一个缩放比例
with Image.open(bg_path) as background:
    bg_width = background.width
# left 是缺口的左边界，left * bg_rect["width"] / bg_width 就是按照比例重新计算的左边界，最后为需要移动到的 x
target_crop_x = bg_rect["x"] + left * bg_rect["width"] / bg_width
# 拼图的也需要进行等比例的计算
current_crop_x = move_rect["x"] + box[0] * move_rect["width"] / im.width
# 然后计算得到最终在页面中需要移动的像素距离
drag_x = target_crop_x - current_crop_x

print(f"当前需要水平移动 {drag_x:.1f} 像素")
```

## 操作元素

利用鼠标事件，将鼠标放到滑块按钮的中心，然后向右移动

```python title="移动.py"
btn = page.locator(CAPTCHA_BTN)
btn.wait_for(state="visible")
btn_rect = btn.bounding_box()
if btn_rect is None:
    raise ValueError("滑块按钮完全透明，无法裁剪和定位")
start_x = btn_rect["x"] + btn_rect["width"] / 2
start_y = btn_rect["y"] + btn_rect["height"] / 2
page.mouse.move(start_x, start_y)
page.mouse.down()
try:
    page.mouse.move(start_x + drag_x, start_y, steps=20)
finally:
    page.mouse.up()
```

## 完整的演示代码

代码内容写的比较随意，主要是为了一步一步做出滑块验证内容，后续可以优化，比如测试后无需保存图片，直接写入内存；代码进行更好的组织等

```python title="完整脚本.py"
import base64
import time
from pathlib import Path

import PIL.ImageDraw
from ddddocr import DdddOcr
from PIL import Image
from playwright.sync_api import sync_playwright

INPUT_ELEMENT = "//input[contains(@placeholder, '请输入账号')]"
PASSWORD_ELEMENT = "//input[contains(@placeholder, '请输入密码')]"
CAPTCHA_BOX = "div#captcha-box"
CAPTCHA_BG = "img#tianai-captcha-slider-bg-img"
CAPTCHA_MOVE = "img#tianai-captcha-slider-move-img"
CAPTCHA_BTN = "div#tianai-captcha-slider-move-btn"

IMG_PATH = Path(__file__).resolve().parent / "images"


def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False, args=["--start-maximized"], channel="chrome"
        )
        page = browser.new_page(no_viewport=True)
        page.goto("xxx")
        page.wait_for_load_state()
        page.locator(INPUT_ELEMENT).fill("18174551626")
        page.locator(PASSWORD_ELEMENT).fill("BaMa77329601")
        page.get_by_role("button", name="登录").click()

        dialog = page.locator(CAPTCHA_BOX)
        dialog.wait_for(state="visible")

        bg = dialog.locator(CAPTCHA_BG)
        move = dialog.locator(CAPTCHA_MOVE)

        # 等待图片完全加载
        for image in (bg, move):
            image.wait_for(state="visible")
            page.wait_for_function(
                "img => img.complete && img.naturalWidth > 0",
                arg=image.element_handle(),
            )

        # 获取图片 src
        bg_src = bg.evaluate("img => img.currentSrc || img.src")
        move_src = move.evaluate("img => img.currentSrc || img.src")
        bg_path = IMG_PATH / "bg.png"
        move_path = IMG_PATH / "move.png"
        IMG_PATH.mkdir(exist_ok=True)
        bg_path.touch(exist_ok=True)
        move_path.touch(exist_ok=True)
        bg_path.write_bytes(base64.b64decode(bg_src.split(",", 1)[1]))
        move_path.write_bytes(base64.b64decode(move_src.split(",", 1)[1]))

        im = Image.open(move_path)
        box = im.getchannel("A").getbbox()
        if box is None:
            raise ValueError("滑块图片完全透明，无法裁剪和定位")
        move_crop_path = IMG_PATH / "move_crop.png"
        im.crop(box).save(move_crop_path)

        ocr = DdddOcr(show_ad=False, ocr=False, det=False)
        result = ocr.slide_match(move_crop_path, bg_path, simple_target=False)
        print(result)

        with Image.open(move_crop_path) as cropped:
            width, height = cropped.size
        center_x, center_y = result["target"]
        left = center_x - width // 2
        top = center_y - height // 2

        with Image.open(bg_path) as background:
            marked = background.convert("RGB")
            draw = PIL.ImageDraw.Draw(marked)
            draw.rectangle(
                (left, top, left + width - 1, top + height - 1), outline="red", width=3
            )
            marked.save(IMG_PATH / "bg_marked.png")

        # 如何转换成 playwright 可操作坐标

        bg_rect = bg.bounding_box()
        move_rect = move.bounding_box()

        assert bg_rect is not None and move_rect is not None

        with Image.open(bg_path) as background:
            bg_width = background.width
        target_crop_x = bg_rect["x"] + left * bg_rect["width"] / bg_width
        current_crop_x = move_rect["x"] + box[0] * move_rect["width"] / im.width
        drag_x = target_crop_x - current_crop_x

        print(f"当前需要水平移动 {drag_x:.1f} 像素")

        btn = page.locator(CAPTCHA_BTN)
        btn.wait_for(state="visible")
        btn_rect = btn.bounding_box()
        if btn_rect is None:
            raise ValueError("滑块按钮完全透明，无法裁剪和定位")
        start_x = btn_rect["x"] + btn_rect["width"] / 2
        start_y = btn_rect["y"] + btn_rect["height"] / 2
        page.mouse.move(start_x, start_y)
        page.mouse.down()
        try:
            page.mouse.move(start_x + drag_x, start_y, steps=20)
        finally:
            page.mouse.up()

        time.sleep(2)

        page.close()
        browser.close()


if __name__ == "__main__":
    main()
```
