"""Generate the 180x180 storefront tile used as this plugin's market icon.

Writes to assets/icon-180.png next to package.json; pass a path to override.
Requires Pillow.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw

SIZE = 720
OUT = 180

ROOT = Path(__file__).resolve().parent.parent
target = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "icon-180.png"

image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
gradient = Image.new("RGBA", (SIZE, SIZE))
pixels = gradient.load()
start = (30, 107, 255)
end = (0, 166, 166)
for y in range(SIZE):
    for x in range(SIZE):
        t = (x + y) / (2 * (SIZE - 1))
        pixels[x, y] = (
            round(start[0] + (end[0] - start[0]) * t),
            round(start[1] + (end[1] - start[1]) * t),
            round(start[2] + (end[2] - start[2]) * t),
            255,
        )

mask = Image.new("L", (SIZE, SIZE), 0)
ImageDraw.Draw(mask).rounded_rectangle((42, 42, SIZE - 42, SIZE - 42), radius=158, fill=255)
image.paste(gradient, (0, 0), mask)

draw = ImageDraw.Draw(image)
# Subtle inner rim.
draw.rounded_rectangle((49, 49, SIZE - 49, SIZE - 49), radius=151, outline=(255, 255, 255, 55), width=5)

# Bars.
bar_color = (255, 255, 255, 245)
bars = [(150, 430, 214, 565), (278, 360, 342, 565), (406, 468, 470, 565), (534, 226, 598, 565)]
for left, top, right, bottom in bars:
    draw.rounded_rectangle((left, top, right, bottom), radius=17, fill=bar_color)

# Trend line.
points = [(154, 382), (246, 300), (338, 386), (430, 280), (522, 188), (590, 148)]
draw.line(points, fill=(255, 255, 255, 245), width=24, joint="curve")
for x, y in points:
    draw.ellipse((x - 15, y - 15, x + 15, y + 15), fill=(255, 255, 255, 255))

# Arrow head at the last point.
draw.polygon([(594, 138), (614, 196), (552, 178)], fill=(255, 255, 255, 245))

image = image.resize((OUT, OUT), Image.Resampling.LANCZOS)
target.parent.mkdir(parents=True, exist_ok=True)
image.save(target, optimize=True)
print(f"{target} {image.size}")
