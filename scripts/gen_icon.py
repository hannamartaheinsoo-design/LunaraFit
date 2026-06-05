#!/usr/bin/env python3
"""
LunaraFit App Store icon generator.
Aesthetic: warm neutrals, clean minimal crescent moon, Pinterest wellness vibe.
"""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import math
import os

S = 2048   # working size (2x for anti-aliasing)
F = 1024   # final output size
CX = CY = S // 2

xx, yy = np.meshgrid(np.arange(S, dtype=np.float32), np.arange(S, dtype=np.float32))


def make_background():
    # Warm cream → warm beige gradient (top → bottom), very subtle
    t = yy / S

    # Top: #F5F0EA  Bottom: #E2D4C4
    r = np.clip(245 - t * 19, 0, 255)
    g = np.clip(240 - t * 28, 0, 255)
    b = np.clip(234 - t * 42, 0, 255)
    a = np.full((S, S), 255, dtype=np.float32)

    # Subtle radial darkening toward corners for depth
    dist_corner = np.sqrt((xx - CX)**2 + (yy - CY)**2) / (S * 0.72)
    vignette = np.clip(dist_corner * 0.12, 0, 1)

    r = np.clip(r - vignette * 30, 0, 255)
    g = np.clip(g - vignette * 22, 0, 255)
    b = np.clip(b - vignette * 16, 0, 255)

    return Image.fromarray(
        np.stack([r.astype(np.uint8), g.astype(np.uint8),
                  b.astype(np.uint8), a.astype(np.uint8)], axis=-1), 'RGBA')


def make_crescent(mx, my, moon_r, bite_offset, bite_ratio):
    """Filled crescent using signed distance field for smooth anti-aliased edges."""
    dist_moon = np.sqrt((xx - mx)**2 + (yy - my)**2).astype(np.float32)
    dist_bite = np.sqrt((xx - (mx - bite_offset))**2 + (yy - my)**2).astype(np.float32)
    bite_r = moon_r * bite_ratio

    moon_sdf = moon_r - dist_moon
    bite_sdf = dist_bite - bite_r

    edge = 6.0
    alpha = np.clip(moon_sdf / edge, 0, 1) * np.clip(bite_sdf / edge, 0, 1)

    # Warm dark tone: #6B5040 — richer, more contrast against cream
    layer = np.zeros((S, S, 4), dtype=np.uint8)
    layer[..., 0] = np.clip(107 * alpha, 0, 255).astype(np.uint8)  # R
    layer[..., 1] = np.clip( 80 * alpha, 0, 255).astype(np.uint8)  # G
    layer[..., 2] = np.clip( 64 * alpha, 0, 255).astype(np.uint8)  # B
    layer[..., 3] = np.clip(255 * alpha, 0, 255).astype(np.uint8)  # A

    return Image.fromarray(layer, 'RGBA')


def make_full_moon_ring(mx, my, moon_r):
    """Thin ring (ghost of the full moon) — visible only outside the crescent."""
    dist_moon = np.sqrt((xx - mx)**2 + (yy - my)**2).astype(np.float32)

    ring_w = 16.0
    ring_sdf = np.abs(dist_moon - moon_r)
    alpha = np.clip(1.0 - ring_sdf / ring_w, 0, 1) ** 2
    alpha *= 0.35  # keep it very subtle

    layer = np.zeros((S, S, 4), dtype=np.uint8)
    layer[..., 0] = np.clip(107 * alpha, 0, 255).astype(np.uint8)
    layer[..., 1] = np.clip( 80 * alpha, 0, 255).astype(np.uint8)
    layer[..., 2] = np.clip( 64 * alpha, 0, 255).astype(np.uint8)
    layer[..., 3] = np.clip(255 * alpha, 0, 255).astype(np.uint8)

    return Image.fromarray(layer, 'RGBA')


# ─── Build layers ─────────────────────────────────────────────────────────────
img = make_background()

MX = CX
MY = CY - 60
MOON_R    = 440
BITE_OFF  = 180   # smaller offset = thicker crescent
BITE_RATIO = 0.82

# Ghost ring first (goes under crescent)
ring_img = make_full_moon_ring(MX, MY, MOON_R)
img = Image.alpha_composite(img, ring_img)

# Crescent on top
crescent_img = make_crescent(MX, MY, MOON_R, BITE_OFF, BITE_RATIO)
img = Image.alpha_composite(img, crescent_img)

# ─── Minimal accent dots (3 small circles below the crescent) ─────────────────
draw = ImageDraw.Draw(img)

# Warm dark dot color: #6B5040
DOT_COLOR = (107, 80, 64, 200)
DOT_OUTLINE = (107, 80, 64, 110)

# Phase dots: 5 small circles in a subtle arc
dot_y = MY + MOON_R + 140
dot_gap = 100
n_dots = 5
dot_x0 = CX - (n_dots - 1) * dot_gap // 2

for i in range(n_dots):
    dx = dot_x0 + i * dot_gap
    dr = 22
    if i == n_dots // 2:   # center = filled (full moon)
        draw.ellipse([(dx-dr, dot_y-dr), (dx+dr, dot_y+dr)], fill=DOT_COLOR)
    elif i == 0 or i == n_dots - 1:  # ends = outline (new moon)
        draw.ellipse([(dx-dr, dot_y-dr), (dx+dr, dot_y+dr)],
                     outline=DOT_OUTLINE, width=4)
    else:
        a = int(120 + (i / (n_dots - 1)) * 80)
        draw.ellipse([(dx-dr, dot_y-dr), (dx+dr, dot_y+dr)],
                     fill=(107, 80, 64, a))

# ─── Downscale and save ───────────────────────────────────────────────────────
final = img.resize((F, F), Image.LANCZOS)

out_dir = os.path.join(os.path.dirname(__file__), '..', 'assets')
icon_path = os.path.join(out_dir, 'icon.png')
final.save(icon_path, 'PNG')
print(f'Saved icon.png  ({F}×{F})')

# Also save a clean splash icon (just crescent, no dots, on cream bg)
splash_img = make_background()
splash_img = Image.alpha_composite(splash_img, ring_img)
splash_img = Image.alpha_composite(splash_img, crescent_img)
splash_final = splash_img.resize((F, F), Image.LANCZOS)
splash_path = os.path.join(out_dir, 'splash-icon.png')
splash_final.save(splash_path, 'PNG')
print(f'Saved splash-icon.png ({F}×{F})')
