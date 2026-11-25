"""Builds a single self-contained label-maker.html (fonts, images and library inlined).

Usage:  python3 build.py
"""
import base64
import pathlib

ROOT = pathlib.Path(__file__).parent


def b64(path):
    return base64.b64encode((ROOT / path).read_bytes()).decode()


html = (ROOT / "src/index.html").read_text(encoding="utf-8")
for weight in ("Medium", "ExtraBold", "Black"):
    html = html.replace("{{FONT_%s}}" % weight, b64("vendor/Vazirmatn-%s.woff2" % weight))
for name in ("header", "qr", "fragile", "digiqube"):
    html = html.replace("{{IMG_%s}}" % name, b64("assets/%s.jpg" % name))
html = html.replace("{{LIB}}", (ROOT / "vendor/html-to-image.js").read_text(encoding="utf-8"))

assert "{{" not in html, "unreplaced placeholder"
out = ROOT / "label-maker.html"
out.write_text(html, encoding="utf-8")
print("wrote", out, round(out.stat().st_size / 1024), "KB")
