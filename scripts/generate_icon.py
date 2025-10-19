#!/usr/bin/env python3
"""
Generate Routine Reminder toolbar icons at multiple sizes.

The artwork is procedurally created to keep all assets consistent.
"""

from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SIZES = (512, 256, 128, 48, 32, 16)
OUTPUT_DIR = Path("src/assets/icons")


def _lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def _hex_to_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def _gradient_background(size: int) -> Image.Image:
    top = _hex_to_rgb("#3B82F6")  # blue-500
    bottom = _hex_to_rgb("#1E40AF")  # blue-800

    bg = Image.new("RGBA", (size, size))
    draw = ImageDraw.Draw(bg)
    for y in range(size):
        t = y / (size - 1)
        color = tuple(int(_lerp(top[i], bottom[i], t)) for i in range(3))
        draw.line([(0, y), (size, y)], fill=color + (255,))

    padding = int(size * 0.06)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((padding, padding, size - padding, size - padding), fill=255)
    bg.putalpha(mask)

    # Add a soft highlight to the top-left for extra depth.
    highlight = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    hdraw = ImageDraw.Draw(highlight)
    hdraw.ellipse(
        (int(size * 0.02), int(size * 0.08), int(size * 0.75), int(size * 0.85)),
        fill=(255, 255, 255, 68),
    )
    highlight = highlight.filter(ImageFilter.GaussianBlur(radius=size * 0.06))
    return Image.alpha_composite(bg, highlight)


def _bell_shape(size: int) -> Image.Image:
    bell_mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(bell_mask)

    mask_draw.ellipse(
        (int(size * 0.32), int(size * 0.12), int(size * 0.68), int(size * 0.50)),
        fill=255,
    )
    mask_draw.rectangle(
        (int(size * 0.27), int(size * 0.32), int(size * 0.73), int(size * 0.70)),
        fill=255,
    )
    mask_draw.ellipse(
        (int(size * 0.24), int(size * 0.52), int(size * 0.76), int(size * 0.94)),
        fill=255,
    )

    bell = Image.new("RGBA", (size, size), (255, 255, 255, 0))
    bell_color = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    bell = Image.composite(bell_color, bell, bell_mask)

    # Add subtle shadow at the bottom of the bell.
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse(
        (int(size * 0.28), int(size * 0.74), int(size * 0.72), int(size * 0.90)),
        fill=(0, 0, 0, 60),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=size * 0.05))
    bell = Image.alpha_composite(bell, shadow)

    return bell


def _accent_elements(canvas: Image.Image, size: int) -> None:
    draw = ImageDraw.Draw(canvas)

    # Bell clapper.
    clapper_radius = int(size * 0.065)
    cx, cy = size // 2, int(size * 0.79)
    draw.ellipse(
        (cx - clapper_radius, cy - clapper_radius, cx + clapper_radius, cy + clapper_radius),
        fill=_hex_to_rgb("#F59E0B") + (255,),
    )
    draw.ellipse(
        (
            cx - int(clapper_radius * 0.45),
            cy - int(clapper_radius * 0.45),
            cx + int(clapper_radius * 0.45),
            cy + int(clapper_radius * 0.45),
        ),
        fill=(255, 255, 255, 120),
    )

    # Notification badge.
    badge_center = (int(size * 0.68), int(size * 0.26))
    badge_outer = int(size * 0.11)
    badge_inner = int(size * 0.07)
    draw.ellipse(
        (
            badge_center[0] - badge_outer,
            badge_center[1] - badge_outer,
            badge_center[0] + badge_outer,
            badge_center[1] + badge_outer,
        ),
        fill=_hex_to_rgb("#FB923C") + (255,),
    )
    draw.ellipse(
        (
            badge_center[0] - badge_inner,
            badge_center[1] - badge_inner,
            badge_center[0] + badge_inner,
            badge_center[1] + badge_inner,
        ),
        fill=_hex_to_rgb("#FED7AA") + (255,),
    )

    # Friendly check mark inside the bell body.
    check_color = _hex_to_rgb("#2563EB")
    width = max(2, int(size * 0.045))
    if size <= 16:
        width = max(width, 4)
    elif size <= 32:
        width = max(width, 3)
    points = [
        (int(size * 0.38), int(size * 0.50)),
        (int(size * 0.47), int(size * 0.60)),
        (int(size * 0.64), int(size * 0.42)),
    ]
    draw.line(points, fill=check_color + (255,), width=width, joint="curve")


def create_icon(size: int) -> Image.Image:
    background = _gradient_background(size)
    bell = _bell_shape(size)
    canvas = Image.alpha_composite(background, bell)
    _accent_elements(canvas, size)
    return canvas


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    base_size = max(SIZES)
    base_icon = create_icon(base_size)

    for dim in SIZES:
        icon = base_icon.resize((dim, dim), Image.LANCZOS) if dim != base_size else base_icon
        path = OUTPUT_DIR / f"icon-{dim}.png"
        icon.save(path, format="PNG")
        print(f"✓ Generated {path} ({dim}x{dim})")


if __name__ == "__main__":
    main()
