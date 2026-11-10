# Generates the app icon, adaptive icon layers and splash image.
import math, sys
from PIL import Image, ImageDraw, ImageFont
FONT = sys.argv[1]
GREEN, GOLD, CREAM = (31, 92, 78), (201, 168, 106), (250, 244, 230)

def star(draw, c, r, width, fill=None):
    for rot in (0, 45):
        pts = [(c[0] + r * math.cos(math.radians(rot + 45 + 90 * k)), c[1] + r * math.sin(math.radians(rot + 45 + 90 * k))) for k in range(4)]
        draw.polygon(pts, outline=GOLD, width=width, fill=fill)

def emblem(size, bg=True, color=None):
    im = Image.new('RGBA', (size, size), GREEN + (255,) if bg else (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = (size / 2, size / 2)
    star(d, c, size * 0.36, max(2, size // 90))
    d.ellipse([c[0] - size * 0.24, c[1] - size * 0.24, c[0] + size * 0.24, c[1] + size * 0.24], outline=GOLD, width=max(2, size // 140))
    f = ImageFont.truetype(FONT, int(size * 0.34))
    d.text((c[0], c[1] - size * 0.02), 'ق', font=f, fill=color or CREAM, anchor='mm')
    return im

emblem(1024).convert('RGB').save('assets/icon.png')
fg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); fg.alpha_composite(emblem(700, bg=False).resize((700, 700)), (162, 162)); fg.save('assets/android-icon-foreground.png')
Image.new('RGB', (1024, 1024), GREEN).save('assets/android-icon-background.png')
mono = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0)); m = emblem(700, bg=False, color=(255, 255, 255))
mono.alpha_composite(m, (162, 162)); px = mono.load()
for y in range(1024):
    for x in range(1024):
        if px[x, y][3]: px[x, y] = (255, 255, 255, px[x, y][3])
mono.save('assets/android-icon-monochrome.png')
emblem(600, bg=False).save('assets/splash-icon.png')
emblem(48).convert('RGB').save('assets/favicon.png')
