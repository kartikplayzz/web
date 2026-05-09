from math import cos, radians, sin
from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"


def mix(a, b, t):
    return tuple(int(x + (y - x) * t) for x, y in zip(a, b))


def gradient(size, top, bottom):
    width, height = size
    img = Image.new("RGB", size)
    pix = img.load()
    for y in range(height):
        t = y / max(1, height - 1)
        color = mix(top, bottom, t)
        for x in range(width):
            pix[x, y] = color
    return img.convert("RGBA")


def add_grain(img, seed, amount=26):
    rng = Random(seed)
    grain = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pix = grain.load()
    width, height = img.size
    for y in range(height):
        for x in range(width):
            if rng.random() < 0.13:
                value = rng.randrange(0, amount)
                pix[x, y] = (255, 255, 255, value)
            elif rng.random() < 0.08:
                value = rng.randrange(0, amount)
                pix[x, y] = (0, 0, 0, value)
    return Image.alpha_composite(img, grain)


def rng_offset(value, span):
    return int(sin(value * 2.71) * span)


def vignette(img, strength=110):
    width, height = img.size
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-width * 0.22, -height * 0.18, width * 1.22, height * 1.14), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(90))
    dark = Image.new("RGBA", img.size, (12, 9, 13, strength))
    return Image.composite(img, Image.alpha_composite(img, dark), mask)


def draw_rose(canvas, center, scale, angle=0):
    rose = Image.new("RGBA", (180, 180), (0, 0, 0, 0))
    draw = ImageDraw.Draw(rose, "RGBA")
    cx, cy = 90, 86
    colors = [(118, 7, 33, 255), (153, 20, 48, 255), (188, 39, 68, 255), (86, 8, 28, 255)]
    for index, radius in enumerate([76, 62, 48, 35, 24]):
        for step in range(6):
            a = radians(step * 60 + index * 18)
            x = cx + cos(a) * radius * 0.22
            y = cy + sin(a) * radius * 0.18
            box = (x - radius * 0.62, y - radius * 0.38, x + radius * 0.62, y + radius * 0.38)
            draw.ellipse(box, fill=colors[(index + step) % len(colors)])
    draw.ellipse((68, 64, 112, 108), fill=(92, 8, 29, 255))
    draw.line((90, 112, 70, 178), fill=(29, 86, 57, 255), width=7)
    draw.polygon([(70, 144), (42, 130), (62, 166)], fill=(41, 114, 74, 245))
    draw.polygon([(78, 154), (112, 145), (86, 176)], fill=(45, 127, 82, 245))
    rose = rose.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    rose = rose.resize((int(rose.width * scale), int(rose.height * scale)), Image.Resampling.LANCZOS)
    canvas.alpha_composite(rose, (int(center[0] - rose.width / 2), int(center[1] - rose.height / 2)))


def make_girl_photo():
    width, height = 720, 1080
    img = gradient((width, height), (213, 207, 204), (48, 45, 46))
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, 0, 180, 820), fill=(229, 225, 222, 128))
    draw.rectangle((18, 0, 110, 805), fill=(244, 242, 238, 95))
    draw.rectangle((118, 0, 152, 810), fill=(188, 181, 181, 75))
    draw.rectangle((0, 760, width, height), fill=(18, 23, 24, 90))

    hair = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    hd = ImageDraw.Draw(hair, "RGBA")
    hd.ellipse((315, 130, 730, 575), fill=(20, 20, 19, 248))
    hd.pieslice((205, 210, 665, 870), 250, 94, fill=(28, 26, 25, 242))
    hd.polygon([(418, 240), (676, 458), (658, 880), (475, 655), (345, 380)], fill=(34, 31, 30, 240))
    for i in range(90):
        start_x = 330 + (i % 28) * 11
        end_x = start_x + rng_offset(i, 55)
        hd.line(
            (start_x, 178 + (i % 9) * 6, end_x, 610 + (i % 12) * 17),
            fill=(92, 82, 73, 34),
            width=1,
        )
    hair = hair.filter(ImageFilter.GaussianBlur(2.3))
    img.alpha_composite(hair)

    draw.pieslice((318, 290, 462, 480), 82, 270, fill=(184, 147, 130, 210))
    draw.polygon([(345, 458), (598, 560), (710, 1040), (235, 1060), (188, 758)], fill=(18, 25, 28, 238))
    draw.polygon([(426, 512), (575, 584), (518, 704), (340, 610)], fill=(31, 39, 44, 235))
    draw.line((410, 526, 564, 636), fill=(84, 88, 89, 90), width=10)

    for idx, x in enumerate(range(-30, 660, 80)):
        draw_rose(img, (x + 65, 842 + (idx % 3) * 55), 0.82 + (idx % 2) * 0.12, -22 + idx * 11)
    for idx, x in enumerate(range(30, 720, 92)):
        draw_rose(img, (x, 945 + (idx % 2) * 45), 0.78, 12 - idx * 7)

    draw.text((139, 642), "❤", fill=(235, 64, 83, 230))
    draw.text((132, 638), "♡", fill=(255, 248, 244, 230))

    img = img.filter(ImageFilter.GaussianBlur(0.42))
    img = add_grain(img, 34, amount=28)
    img = vignette(img, 84)
    img.save(STATIC / "photo-her.png", quality=92)


def make_boy_photo():
    width, height = 820, 1080
    img = gradient((width, height), (228, 231, 229), (224, 214, 198))
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, 0, width, 106), fill=(67, 73, 78, 255))
    draw.rectangle((0, 107, width, 704), fill=(239, 241, 238, 255))
    for x in [100, 330, 604]:
        draw.rectangle((x, 107, x + 2, 704), fill=(204, 208, 204, 130))
    draw.rectangle((0, 704, width, 918), fill=(155, 146, 133, 255))
    draw.rectangle((0, 918, width, height), fill=(221, 205, 180, 255))
    draw.line((0, 704, width, 704), fill=(116, 111, 104, 160), width=3)

    shadow = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    sd.ellipse((323, 432, 575, 913), fill=(40, 36, 34, 105))
    shadow = shadow.filter(ImageFilter.GaussianBlur(22))
    img.alpha_composite(shadow)

    person = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pd = ImageDraw.Draw(person, "RGBA")
    pd.ellipse((382, 380, 478, 486), fill=(162, 115, 91, 255))
    pd.polygon([(382, 463), (480, 456), (540, 710), (362, 720), (322, 530)], fill=(16, 122, 189, 255))
    pd.line((330, 544, 270, 650), fill=(152, 103, 83, 255), width=24)
    pd.line((496, 538, 582, 648), fill=(154, 106, 84, 255), width=24)
    pd.line((582, 648, 606, 704), fill=(152, 103, 83, 255), width=20)
    pd.line((348, 702, 337, 965), fill=(51, 50, 55, 255), width=72)
    pd.line((488, 704, 514, 965), fill=(44, 44, 49, 255), width=72)
    pd.rounded_rectangle((292, 951, 390, 1010), radius=28, fill=(245, 245, 242, 255))
    pd.rounded_rectangle((474, 951, 572, 1010), radius=28, fill=(245, 245, 242, 255))
    pd.line((418, 470, 391, 710), fill=(10, 78, 126, 145), width=4)
    pd.line((455, 470, 506, 704), fill=(30, 150, 214, 120), width=4)
    pd.arc((387, 404, 473, 448), 0, 180, fill=(9, 18, 22, 255), width=22)
    pd.pieslice((360, 352, 496, 445), 188, 368, fill=(12, 20, 24, 255))
    pd.line((386, 415, 445, 421), fill=(14, 14, 15, 255), width=8)
    pd.line((448, 421, 492, 414), fill=(14, 14, 15, 255), width=8)
    pd.line((380, 506, 512, 618), fill=(105, 67, 58, 255), width=18)
    pd.line((382, 504, 512, 616), fill=(164, 108, 83, 255), width=12)
    for i in range(36):
        pd.line((365 + i * 3, 377, 337 + i * 5, 423 + (i % 4) * 6), fill=(18, 20, 23, 125), width=3)
    person = person.filter(ImageFilter.GaussianBlur(0.9))
    img.alpha_composite(person)

    draw.rectangle((0, 0, width, height), outline=(12, 12, 12, 180), width=6)
    img = add_grain(img, 41, amount=21)
    img = vignette(img, 68)
    img.save(STATIC / "photo-blue-boy.png", quality=92)


def main():
    STATIC.mkdir(parents=True, exist_ok=True)
    make_girl_photo()
    make_boy_photo()
    print(STATIC / "photo-her.png")
    print(STATIC / "photo-blue-boy.png")


if __name__ == "__main__":
    main()
