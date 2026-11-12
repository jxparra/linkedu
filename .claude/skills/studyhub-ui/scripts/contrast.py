"""Contraste WCAG entre dos colores.

Uso: python contrast.py "#c9401c" "#ffffff" ["#otro_fg" "#otro_bg" ...]
Pasa los colores por parejas (texto, fondo). Dice si cumple AA para texto normal (4.5) y grande/iconos (3.0).
"""
import sys

# La consola de Windows no es UTF-8 por defecto: sin esto, los acentos salen rotos
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def luminance(hex_color: str) -> float:
    h = hex_color.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    channels = [int(h[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    lin = [c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]


def ratio(a: str, b: str) -> float:
    la, lb = luminance(a), luminance(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def main(args: list[str]) -> int:
    if len(args) < 2 or len(args) % 2:
        print(__doc__)
        return 1
    worst = 99.0
    for fg, bg in zip(args[::2], args[1::2]):
        r = ratio(fg, bg)
        worst = min(worst, r)
        normal = "OK" if r >= 4.5 else "NO"
        large = "OK" if r >= 3.0 else "NO"
        print(f"{fg} sobre {bg}: {r:.2f}:1  texto normal {normal} · texto grande/iconos {large}")
    return 0 if worst >= 3.0 else 2


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
