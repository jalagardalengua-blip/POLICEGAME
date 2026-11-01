#!/usr/bin/env python3
"""Genera dist/patrulla-espana.html: el juego completo en un solo archivo (útil para compartirlo)."""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'css/style.css').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
for name in ('data', 'game'):
    js = (root / f'js/{name}.js').read_text(encoding='utf-8')
    html = html.replace(f'<script src="js/{name}.js"></script>', '<script>\n' + js + '\n</script>')
out = root / 'dist'
out.mkdir(exist_ok=True)
(out / 'patrulla-espana.html').write_text(html, encoding='utf-8')
print('OK ->', out / 'patrulla-espana.html')
