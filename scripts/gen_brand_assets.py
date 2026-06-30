"""Generate raster brand assets from the PostalAtlas mark (pin + globe on an
Atlas-Teal tile): public/og.png (1200x630), app/apple-icon.png (180x180), and
app/favicon.ico (legacy). Run: python scripts/gen_brand_assets.py
The vector favicon lives in app/icon.svg; keep this mark in sync with it."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
TEAL = (11, 116, 104)      # #0b7468
INK = (24, 24, 27)         # #18181b
MUTED = (113, 113, 122)    # #71717a
WHITE = (255, 255, 255)
SS = 4                     # supersample factor for smooth edges


def _font(names, size):
    for n in names:
        for base in (r"C:\Windows\Fonts", "/usr/share/fonts"):
            try:
                return ImageFont.truetype(str(Path(base) / n), size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_mark(size, radius_ratio=0.25):
    """Return an RGBA image of the logo tile (pin + globe) at `size` px."""
    S = size * SS
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    r = int(S * radius_ratio)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=r, fill=TEAL)

    u = S / 32.0  # viewBox units -> px
    # pin: white head circle + triangle to the tip
    hx, hy, hr = 16 * u, 12.9 * u, 7.3 * u
    d.ellipse([hx - hr, hy - hr, hx + hr, hy + hr], fill=WHITE)
    d.polygon([(8.9 * u, 15.5 * u), (23.1 * u, 15.5 * u), (16 * u, 25.6 * u)], fill=WHITE)
    # globe cut into the pin
    gr = 3.7 * u
    d.ellipse([hx - gr, hy - gr, hx + gr, hy + gr], fill=TEAL)
    lw = max(2, int(0.9 * u))
    # meridian (vertical ellipse) + equator (horizontal line)
    mrx = 1.5 * u
    d.ellipse([hx - mrx, hy - gr, hx + mrx, hy + gr], outline=WHITE, width=lw)
    d.line([(hx - gr, hy), (hx + gr, hy)], fill=WHITE, width=lw)

    return img.resize((size, size), Image.LANCZOS)


def make_apple_icon():
    # Full-bleed (iOS applies its own rounding); square teal tile + mark.
    icon = draw_mark(180, radius_ratio=0.0)
    bg = Image.new("RGB", (180, 180), TEAL)
    bg.paste(icon, (0, 0), icon)
    bg.save(ROOT / "app" / "apple-icon.png")
    print("wrote app/apple-icon.png")


def make_favicon():
    sizes = [16, 32, 48]
    base = draw_mark(64, radius_ratio=0.22)
    base.save(ROOT / "app" / "favicon.ico", sizes=[(s, s) for s in sizes])
    print("wrote app/favicon.ico")


def make_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), WHITE)
    d = ImageDraw.Draw(img)
    # thin teal rule along the bottom for a finished edge
    d.rectangle([0, H - 10, W, H], fill=TEAL)

    mark = draw_mark(300, radius_ratio=0.25)
    img.paste(mark, (110, (H - 300) // 2 - 20), mark)

    f_brand = _font(["segoeuib.ttf", "arialbd.ttf", "DejaVuSans-Bold.ttf"], 104)
    f_tag = _font(["segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"], 42)
    f_small = _font(["seguisb.ttf", "segoeui.ttf", "arial.ttf", "DejaVuSans.ttf"], 34)

    tx = 470
    ty = 210
    d.text((tx, ty), "Postal", font=f_brand, fill=INK)
    pw = d.textlength("Postal", font=f_brand)
    d.text((tx + pw, ty), "Atlas", font=f_brand, fill=TEAL)
    d.text((tx, ty + 130), "Global postal & ZIP code directory", font=f_tag, fill=MUTED)
    d.text((tx, ty + 195), "Places · regions · coordinates · maps", font=f_small, fill=TEAL)

    img.save(ROOT / "public" / "og.png")
    print("wrote public/og.png")


if __name__ == "__main__":
    make_apple_icon()
    make_favicon()
    make_og()
    print("done")
