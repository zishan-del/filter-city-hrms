#!/usr/bin/env python3
import struct
import zlib
from pathlib import Path

W = H = 1024
BLUE = (11, 49, 88)
RED = (255, 31, 45)
WHITE = (255, 255, 255)

pixels = bytearray(BLUE * (W * H))

def rect(x0, y0, x1, y1, color):
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(W, x1), min(H, y1)
    row = bytes(color) * max(0, x1 - x0)
    for y in range(y0, y1):
        i = (y * W + x0) * 3
        pixels[i:i + len(row)] = row

def ring_border(inset, thickness, color):
    rect(inset, inset, W - inset, inset + thickness, color)
    rect(inset, H - inset - thickness, W - inset, H - inset, color)
    rect(inset, inset, inset + thickness, H - inset, color)
    rect(W - inset - thickness, inset, W - inset, H - inset, color)

ring_border(54, 26, RED)

# Geometric F
rect(190, 285, 255, 755, WHITE)
rect(190, 285, 475, 350, WHITE)
rect(190, 475, 430, 540, WHITE)

# Geometric C
rect(560, 285, 810, 350, WHITE)
rect(535, 310, 600, 730, WHITE)
rect(560, 690, 810, 755, WHITE)
rect(535, 335, 600, 705, WHITE)
# Open the right side to keep a clear C silhouette.
rect(745, 350, 825, 690, BLUE)

raw = bytearray()
stride = W * 3
for y in range(H):
    raw.append(0)
    raw.extend(pixels[y * stride:(y + 1) * stride])

def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)

png = bytearray(b'\x89PNG\r\n\x1a\n')
png += chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0))
png += chunk(b'IDAT', zlib.compress(bytes(raw), 9))
png += chunk(b'IEND', b'')

out = Path(__file__).resolve().parents[1] / 'FILTERCITYHRMS' / 'Assets.xcassets' / 'AppIcon.appiconset' / 'AppIcon-1024.png'
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(png)
print(out)
