"""Busca colores fijos que rompen el modo oscuro o se saltan los tokens de StudyHub.

Uso: python audit_colors.py frontend/src   (o una carpeta o archivo concreto)
"""
import re
import sys
from pathlib import Path

# La consola de Windows no es UTF-8 por defecto: sin esto, los acentos salen rotos
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

CHECKS = [
    ("bg-white (usa bg-card)", re.compile(r"\bbg-white\b(?![/\w-])")),
    ("border-white / ring-white (usa border-card / ring-card)", re.compile(r"\b(border|ring)-white\b(?![/\w-])")),
    ("text-white sobre coral (usa text-on-brand)", re.compile(r"bg-brand-600[^\"`]*\btext-white\b|\btext-white\b[^\"`]*bg-brand-600")),
    ("bg-ink + text-white (usa text-inverse)", re.compile(r"\bbg-ink\b(?!/)[^\"`]*\btext-white\b|\btext-white\b[^\"`]*\bbg-ink\b(?!/)")),
    ("text-brand-600 como texto (usa text-brand-700)", re.compile(r"\btext-brand-600\b")),
    ("color de Tailwind por defecto", re.compile(r"\b(?:bg|text|border|ring|fill|stroke)-(?:gray|slate|zinc|neutral|stone|blue|sky|indigo|purple|pink|rose|orange|amber|yellow|lime|emerald|teal|cyan)-\d{2,3}\b")),
    ("hex suelto en una clase", re.compile(r"-\[#[0-9A-Fa-f]{3,8}\]")),
    ("dark: suelto (el tema va por tokens)", re.compile(r"\bdark:")),
]


def main(root: str) -> int:
    base = Path(root)
    files = [base] if base.is_file() else [p for p in base.rglob("*") if p.suffix in {".tsx", ".ts"}]
    total = 0
    for f in sorted(files):
        for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            for label, rx in CHECKS:
                if rx.search(line):
                    total += 1
                    print(f"{f}:{n}  [{label}]  {line.strip()[:120]}")
    print(f"\n{total} avisos. Revisa cada uno: algunos están justificados (logos de marcas, capas sobre fotos).")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "frontend/src"))
