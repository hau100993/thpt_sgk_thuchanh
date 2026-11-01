#!/usr/bin/env python3
"""Ghép các bài học trong src/ thành site tĩnh trong docs/ (GitHub Pages đọc thư mục này).
Mỗi file src/bai/XX.html bắt đầu bằng dòng  <!-- title: Tên trang -->
và chứa <!--CORE--> ở chỗ cần chèn core.js (trước script riêng của bài)."""
import pathlib, re, shutil

ROOT = pathlib.Path(__file__).parent
SRC, DIST = ROOT / "src", ROOT / "docs"
FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800'
         '&family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;600&display=swap">')

def head(title, prefix):
    return f'''<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="Sách Vật lí 12 tương tác: mô phỏng 3D, công thức sống, dự đoán và bài tập theo chương trình GDPT 2018.">
{FONTS}
<link rel="stylesheet" href="{prefix}assets/book.css">
</head>
<body>
'''

def build_page(src, out, prefix):
    text = src.read_text(encoding="utf-8")
    m = re.match(r"\s*<!--\s*title:\s*(.*?)\s*-->\s*", text)
    title = m.group(1) if m else "Vật lí 12"
    body = text[m.end():] if m else text
    body = body.replace("<!--CORE-->", f'<script src="{prefix}assets/core.js"></script>')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(head(title, prefix) + body + "\n</body>\n</html>\n", encoding="utf-8")

def main():
    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / "assets").mkdir(parents=True)
    for f in (ROOT / "assets").iterdir():
        if f.suffix in (".css", ".js") and f.name != "three.min.js":
            shutil.copy(f, DIST / "assets" / f.name)
    build_page(SRC / "index.html", DIST / "index.html", "")
    for f in sorted((SRC / "bai").glob("*.html")):
        build_page(f, DIST / "bai" / f.name, "../")
    for extra in ("README.md", "404.html", ".nojekyll"):
        p = SRC / extra
        if p.exists():
            shutil.copy(p, DIST / extra)
    (DIST / ".nojekyll").touch()
    print("built", len(list((DIST / "bai").glob("*.html"))), "lessons")

if __name__ == "__main__":
    main()
