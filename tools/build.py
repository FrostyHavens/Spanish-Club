# Bundles index.html + src/*.js into a single self-contained HTML file (dist/club-de-espanol.html)
import re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'index.html'), encoding='utf-8').read()
def inline(m):
    src = m.group(1)
    code = open(os.path.join(root, src), encoding='utf-8').read()
    return '<script>/* %s */\n%s\n</script>' % (src, code.replace('</script', '<\\/script'))
out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
p = os.path.join(root, 'dist', 'club-de-espanol.html')
open(p, 'w', encoding='utf-8').write(out)
print(p, len(out)//1024, 'KB')
