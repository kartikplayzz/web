from math import cos, radians, sin
from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "sorry-sticker.png"
SIZE = 1100


def font(name, size):
    path = Path("C:/Windows/Fonts") / name
    if path.exists():
        return ImageFont.truetype(str(path), size)
    return ImageFont.load_default(size=size)


def draw_rotated_text(base, text, center, radius, start_angle, step, font_obj):
    for index, char in enumerate(text):
        angle = start_angle + index * step
        x = center[0] + radius * cos(radians(angle))
        y = center[1] + radius * sin(radians(angle))
        bbox = font_obj.getbbox(char)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        glyph = Image.new("RGBA", (w + 36, h + 36), (0, 0, 0, 0))
        gd = ImageDraw.Draw(glyph)
        gd.text((18 - bbox[0], 18 - bbox[1]), char, font=font_obj, fill=(22, 18, 19, 255))
        glyph = glyph.rotate(angle + 88, expand=True, resample=Image.Resampling.BICUBIC)
        base.alpha_composite(glyph, (int(x - glyph.width / 2), int(y - glyph.height / 2)))


def centered_text(draw, text, y, font_obj, fill=(22, 18, 19, 255)):
    bbox = draw.textbbox((0, 0), text, font=font_obj)
    width = bbox[2] - bbox[0]
    x = (SIZE - width) // 2
    draw.text((x, y), text, font=font_obj, fill=fill)


def main():
    rng = Random(17)
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img, "RGBA")

    points = []
    center = SIZE // 2
    for degree in range(0, 360, 6):
        wave = 1 + 0.035 * sin(radians(degree * 5)) + 0.026 * sin(radians(degree * 9))
        radius = 460 * wave
        points.append(
            (
                center + radius * cos(radians(degree)),
                center + radius * sin(radians(degree)),
            )
        )

    shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow, "RGBA")
    sd.polygon(points, fill=(0, 0, 0, 45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    img.alpha_composite(shadow, (0, 16))

    draw.polygon(points, fill=(255, 255, 255, 255), outline=(221, 219, 216, 255))
    draw.polygon(
        [(x * 0.9 + center * 0.1, y * 0.9 + center * 0.1) for x, y in points],
        fill=(255, 231, 239, 255),
    )

    face = Image.new("RGBA", (640, 600), (0, 0, 0, 0))
    fd = ImageDraw.Draw(face, "RGBA")
    fd.ellipse((65, 35, 575, 545), fill=(180, 157, 150, 255))
    fd.ellipse((105, 92, 530, 540), fill=(199, 178, 170, 235))
    fd.ellipse((165, 205, 290, 335), fill=(7, 8, 14, 255))
    fd.ellipse((350, 205, 475, 335), fill=(7, 8, 14, 255))
    fd.ellipse((202, 232, 234, 265), fill=(255, 255, 255, 245))
    fd.ellipse((386, 232, 418, 265), fill=(255, 255, 255, 245))
    fd.ellipse((288, 350, 350, 392), fill=(219, 163, 160, 235))
    fd.arc((252, 366, 318, 432), start=15, end=105, fill=(124, 83, 84, 190), width=4)
    fd.arc((322, 366, 388, 432), start=75, end=165, fill=(124, 83, 84, 190), width=4)

    for _ in range(4600):
        x = rng.randrange(75, 570)
        y = rng.randrange(48, 542)
        alpha = rng.randrange(18, 55)
        color = rng.choice([(95, 79, 82, alpha), (238, 225, 218, alpha), (74, 65, 72, alpha)])
        fd.line((x, y, x + rng.randrange(-8, 9), y + rng.randrange(-7, 8)), fill=color, width=1)

    fd.pieslice((157, 280, 300, 420), 0, 180, fill=(56, 176, 231, 255))
    fd.pieslice((342, 280, 485, 420), 0, 180, fill=(56, 176, 231, 255))
    fd.rounded_rectangle((185, 350, 230, 485), radius=24, fill=(56, 176, 231, 255))
    fd.rounded_rectangle((407, 350, 452, 485), radius=24, fill=(56, 176, 231, 255))
    fd.rounded_rectangle((197, 423, 218, 480), radius=12, fill=(239, 250, 255, 230))
    fd.rounded_rectangle((419, 423, 440, 480), radius=12, fill=(239, 250, 255, 230))

    bow_color = (247, 61, 167, 255)
    fd.polygon([(438, 128), (530, 68), (548, 176)], fill=bow_color, outline=(90, 46, 70, 255))
    fd.polygon([(558, 84), (652, 142), (544, 198)], fill=bow_color, outline=(90, 46, 70, 255))
    fd.ellipse((518, 120, 568, 170), fill=(232, 111, 184, 255), outline=(90, 46, 70, 255), width=5)
    fd.line((482, 104, 532, 140), fill=(255, 145, 205, 255), width=7)
    fd.line((578, 140, 630, 170), fill=(255, 145, 205, 255), width=7)
    fd.polygon([(516, 168), (486, 230), (542, 202)], fill=bow_color, outline=(90, 46, 70, 255))
    fd.polygon([(548, 172), (596, 226), (582, 188)], fill=bow_color, outline=(90, 46, 70, 255))

    face = face.filter(ImageFilter.GaussianBlur(1.15))
    img.alpha_composite(face, (230, 258))

    top_font = font("Inkfree.ttf", 94)
    bottom_font = font("Inkfree.ttf", 66)
    centered_text(draw, "I AM SORRY!", 124, top_font)
    centered_text(draw, "PLEASE FORGIVE ME", 842, bottom_font)

    img = img.resize((760, 760), resample=Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
