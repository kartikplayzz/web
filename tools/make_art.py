from pathlib import Path
from random import Random

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "static" / "anya-flowers.png"
WIDTH, HEIGHT = 1600, 1050


def lerp(a, b, t):
    return int(a + (b - a) * t)


def mix(c1, c2, t):
    return tuple(lerp(a, b, t) for a, b in zip(c1, c2))


def draw_leaf(draw, x, y, angle, scale, color):
    leaf = Image.new("RGBA", (220, 130), (0, 0, 0, 0))
    d = ImageDraw.Draw(leaf)
    d.ellipse((18, 22, 198, 104), fill=color)
    d.polygon([(38, 70), (0, 64), (44, 46)], fill=color)
    d.line((28, 68, 190, 62), fill=(55, 115, 88, 190), width=4)
    leaf = leaf.resize((int(220 * scale), int(130 * scale)))
    leaf = leaf.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)
    return leaf, (int(x - leaf.width / 2), int(y - leaf.height / 2))


def draw_tulip(canvas, x, y, scale, petal_color):
    stem_color = (79, 143, 104, 255)
    draw = ImageDraw.Draw(canvas, "RGBA")
    stem_w = max(8, int(16 * scale))
    draw.rounded_rectangle(
        (x - stem_w // 2, y - int(280 * scale), x + stem_w // 2, y + int(55 * scale)),
        radius=stem_w // 2,
        fill=stem_color,
    )
    for lx, ly, angle, leaf_scale in [
        (x - 72 * scale, y - 92 * scale, -26, 0.72 * scale),
        (x + 78 * scale, y - 152 * scale, 24, 0.62 * scale),
    ]:
        leaf, pos = draw_leaf(draw, lx, ly, angle, leaf_scale, (112, 178, 137, 245))
        canvas.alpha_composite(leaf, pos)

    flower = Image.new("RGBA", (260, 260), (0, 0, 0, 0))
    f = ImageDraw.Draw(flower, "RGBA")
    shades = [
        petal_color,
        tuple(min(255, v + 28) if i < 3 else v for i, v in enumerate(petal_color)),
        tuple(max(0, v - 30) if i < 3 else v for i, v in enumerate(petal_color)),
    ]
    f.ellipse((82, 64, 178, 210), fill=shades[0])
    f.ellipse((38, 82, 136, 218), fill=shades[2])
    f.ellipse((124, 82, 222, 218), fill=shades[1])
    f.pieslice((52, 22, 208, 178), start=205, end=335, fill=shades[0])
    f.ellipse((104, 108, 156, 160), fill=(244, 188, 76, 255))
    flower = flower.filter(ImageFilter.GaussianBlur(0.25))
    flower = flower.resize((int(260 * scale), int(260 * scale)))
    canvas.alpha_composite(flower, (int(x - flower.width / 2), int(y - 360 * scale)))


def main():
    rng = Random(9)
    bg = Image.new("RGB", (WIDTH, HEIGHT))
    pix = bg.load()
    left_top = (251, 180, 187)
    right_top = (113, 184, 185)
    left_bottom = (255, 247, 238)
    right_bottom = (34, 87, 94)

    for y in range(HEIGHT):
        v = y / (HEIGHT - 1)
        left = mix(left_top, left_bottom, v)
        right = mix(right_top, right_bottom, v)
        for x in range(WIDTH):
            h = x / (WIDTH - 1)
            pix[x, y] = mix(left, right, h)

    texture = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    td = ImageDraw.Draw(texture, "RGBA")
    for _ in range(9500):
        x = rng.randrange(WIDTH)
        y = rng.randrange(HEIGHT)
        alpha = rng.randrange(7, 18)
        td.point((x, y), fill=(255, 255, 255, alpha))
    bg = Image.alpha_composite(bg.convert("RGBA"), texture)

    soft = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sd = ImageDraw.Draw(soft, "RGBA")
    sd.ellipse((1000, 70, 1710, 720), fill=(255, 241, 207, 62))
    sd.ellipse((820, 430, 1570, 1120), fill=(18, 82, 88, 88))
    soft = soft.filter(ImageFilter.GaussianBlur(38))
    bg = Image.alpha_composite(bg, soft)

    draw = ImageDraw.Draw(bg, "RGBA")
    draw.rounded_rectangle((1008, 522, 1468, 808), radius=20, fill=(255, 250, 244, 228))
    draw.polygon([(1008, 522), (1238, 695), (1468, 522)], fill=(238, 227, 216, 190))
    draw.polygon([(1008, 808), (1192, 652), (1238, 695), (1284, 652), (1468, 808)], fill=(255, 244, 235, 226))

    for x, y, scale, color in [
        (1118, 910, 1.0, (213, 56, 99, 255)),
        (1260, 960, 0.82, (245, 124, 150, 255)),
        (1400, 930, 0.9, (242, 180, 73, 255)),
        (965, 980, 0.72, (203, 51, 92, 255)),
    ]:
        draw_tulip(bg, x, y, scale, color)

    for _ in range(80):
        px = rng.randrange(260, WIDTH - 60)
        py = rng.randrange(50, HEIGHT - 80)
        w = rng.randrange(12, 28)
        h = rng.randrange(18, 36)
        color = rng.choice([(220, 64, 106, 118), (255, 167, 188, 132), (246, 186, 80, 92)])
        draw.ellipse((px, py, px + w, py + h), fill=color)

    shade = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    sh = ImageDraw.Draw(shade, "RGBA")
    sh.rectangle((0, 0, 700, HEIGHT), fill=(18, 12, 19, 94))
    shade = shade.filter(ImageFilter.GaussianBlur(28))
    bg = Image.alpha_composite(bg, shade)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(OUT, quality=92)
    print(OUT)


if __name__ == "__main__":
    main()
