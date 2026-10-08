# Bundles index.html + src/*.js into a single self-contained HTML file (dist/club-de-espanol.html), and stamps
# each <script src> in index.html with a hash of the file (src/x.js?v=1a2b3c4d), so the play link
# (GitHub Pages serves index.html) never mixes freshly loaded and cached scripts: a plain refresh gets the new game.
import re, os, hashlib
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ip = os.path.join(root, 'index.html')
html = open(ip, encoding='utf-8').read()
def stamp(m):
    src = m.group(1)
    v = hashlib.md5(open(os.path.join(root, src), 'rb').read()).hexdigest()[:8]
    return '<script src="%s?v=%s"></script>' % (src, v)
stamped = re.sub(r'<script src="([^"?]+)(?:\?v=[0-9a-f]*)?"></script>', stamp, html)
if stamped != html: open(ip, 'w', encoding='utf-8').write(stamped)
def inline(m):
    src = m.group(1)
    code = open(os.path.join(root, src), encoding='utf-8').read()
    return '<script>/* %s */\n%s\n</script>' % (src, code.replace('</script', '<\\/script'))
out = re.sub(r'<script src="([^"?]+)(?:\?v=[0-9a-f]*)?"></script>', inline, stamped)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
p = os.path.join(root, 'dist', 'club-de-espanol.html')
open(p, 'w', encoding='utf-8').write(out)
print(p, len(out)//1024, 'KB')
