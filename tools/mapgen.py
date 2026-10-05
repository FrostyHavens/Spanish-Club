# Generates src/mapdata.js from painted grids. All layouts are original.
import json
class M:
    def __init__(s, w, h, fill='.'):
        s.w, s.h = w, h; s.g = [[fill]*w for _ in range(h)]; s.pos = {}
    def put(s, x, y, c):
        if 0 <= x < s.w and 0 <= y < s.h: s.g[y][x] = c
    def rect(s, x, y, w, h, c):
        for j in range(y, y+h):
            for i in range(x, x+w): s.put(i, j, c)
    def border(s, c, t=1):
        for j in range(s.h):
            for i in range(s.w):
                if i < t or j < t or i >= s.w-t or j >= s.h-t: s.g[j][i] = c
    def hline(s, x0, x1, y, c):
        for i in range(min(x0,x1), max(x0,x1)+1): s.put(i, y, c)
    def vline(s, x, y0, y1, c):
        for j in range(min(y0,y1), max(y0,y1)+1): s.put(x, j, c)
    def path(s, pts, c=','):
        for (a, b) in zip(pts, pts[1:]):
            (x0, y0), (x1, y1) = a, b
            s.hline(x0, x1, y0, c); s.vline(x1, y0, y1, c)
    def house(s, x, y, w, roof='R', tag=None, door=None, walls=None):
        # roof rows y, y+1 ; wall row y+2 ; door at x+door
        s.rect(x, y, w, 2, roof)
        row = walls or ('W' + 'N'*(w-2) + 'W')
        for i, c in enumerate(row): s.put(x+i, y+2, c)
        d = door if door is not None else w//2
        s.put(x+d, y+2, 'D')
        if tag: s.pos[tag] = [x+d, y+2]
        return (x+d, y+3)
    def church(s, x, y, tag):
        s.rect(x, y, 7, 2, 'Q'); s.put(x+3, y, '+')
        for i, c in enumerate('SGSKSGS'): s.put(x+i, y+2, c)
        s.pos[tag] = [x+3, y+2]
    def mark(s, tag, x, y): s.pos[tag] = [x, y]
    def rows(s): return [''.join(r) for r in s.g]

out = {}

# ---------------- Villa Sol (town) 36x28 ----------------
t = M(36, 28)
t.rect(0, 0, 36, 2, 'T'); t.border('T', 1)
for x, y in [(1,2),(2,2),(1,3),(33,2),(34,2),(34,3),(1,25),(1,26),(34,25),(34,26),(2,26),(33,26)]: t.put(x, y, 'f')
# la escuela (the club meets here) - top centre
t.church(14, 2, 'escuelaDoor')
t.put(13, 4, 'P'); t.put(21, 4, 'P')
# casa de la abuela Rosa - west
t.house(3, 4, 5, 'R', 'rosaDoor')
t.put(2, 6, 'P'); t.put(8, 6, 'k')
# la panadería - east
t.house(27, 4, 6, 'Q', 'panaderiaDoor', door=2, walls='WNWNNW')
t.put(26, 6, 'k'); t.put(33, 6, 'k')
# la plaza
t.rect(11, 8, 14, 6, '=')
t.rect(13, 9, 10, 4, 'p')
t.put(18, 11, 'l'); t.mark('fuente', 18, 11)
t.put(11, 8, 'L'); t.put(24, 8, 'L'); t.put(11, 13, 'L'); t.put(24, 13, 'L')
t.put(14, 10, 'Y'); t.mark('pepe', 14, 9); t.mark('puesto', 14, 10)
t.put(21, 10, 'Y')
# mi casa - south-west
t.house(3, 15, 5, 'R', 'casaDoor')
t.put(8, 17, 'P'); t.put(2, 17, 'k')
# la biblioteca - south-east
t.house(26, 15, 7, 'Q', 'bibliotecaDoor', walls='WNWNWNW')
t.put(25, 17, 'L'); t.put(33, 17, 'P')
# el parque - south centre, fenced, gate at the top
t.rect(11, 17, 14, 1, 'F'); t.rect(11, 17, 1, 9, 'F'); t.rect(24, 17, 1, 9, 'F'); t.rect(11, 25, 14, 1, 'F')
t.put(17, 17, ','); t.put(18, 17, ','); t.mark('parqueGate', 17, 17)
t.rect(12, 18, 12, 7, '.')
for x, y in [(13,19),(15,23),(19,19),(22,22),(20,24),(14,21),(21,20)]: t.put(x, y, 'o')
t.rect(19, 21, 3, 2, 'w')
t.put(12, 18, 'f'); t.put(23, 18, 'f'); t.put(12, 24, 'f'); t.put(23, 24, 'f')
for tag, (x, y) in {'arbusto1': (13, 22), 'arbusto2': (16, 19), 'arbusto3': (22, 19), 'arbusto4': (17, 24)}.items():
    t.put(x, y, 'P'); t.mark(tag, x, y)
t.mark('sofia', 18, 20)
# paths
t.path([(17,5),(17,8)], ',')
t.vline(5, 7, 14, ','); t.hline(5, 11, 10, ',')
t.vline(29, 7, 14, ','); t.hline(24, 29, 10, ',')
t.hline(5, 10, 14, ','); t.vline(10, 14, 16, ',')
t.hline(5, 10, 21, ','); t.vline(5, 18, 21, ',')
t.vline(10, 14, 21, ',')
t.vline(17, 14, 16, ','); t.vline(18, 14, 16, ',')
t.vline(29, 14, 14, ','); t.hline(25, 29, 14, ',')
t.vline(29, 18, 21, ','); t.hline(25, 29, 21, ','); t.vline(25, 14, 21, ',')
for x, y in [(8,3),(9,8),(26,8),(31,9),(3,11),(8,12),(31,12),(3,23),(7,24),(28,24),(32,22)]: t.put(x, y, 'o')
t.put(2, 12, 'P'); t.put(33, 12, 'P'); t.put(7, 25, 'P'); t.put(29, 25, 'P')
t.mark('casaFront', 5, 18); t.mark('start', 5, 18)
out['villa'] = t

# ---------------- Interiors ----------------
def room(w, h, tag='door', doorx=None):
    r = M(w, h, 'i'); r.border('I', 1)
    dx = doorx if doorx is not None else w//2
    r.put(dx, h-1, 'i'); r.mark(tag, dx, h-1)
    return r

c = room(9, 7)                      # mi casa
c.put(1, 1, 'n'); c.put(2, 1, 'n'); c.put(5, 1, 'v'); c.put(7, 2, 'j'); c.put(7, 3, 'j'); c.rect(2, 3, 2, 1, 't'); c.put(1, 5, 'P')
c.rect(4, 4, 1, 2, 'q')
c.mark('mama', 3, 2)
out['casa'] = c

e = M(13, 10, 'c'); e.border('I', 1)   # la escuela / el club
e.rect(6, 1, 1, 9, 'q')
e.put(2, 1, 'n'); e.put(3, 1, 'n'); e.put(9, 1, 'n'); e.put(10, 1, 'n')
for y in (4, 6):
    e.rect(2, y, 3, 1, 't'); e.rect(8, y, 3, 1, 't')
e.put(1, 8, 'P'); e.put(11, 8, 'P'); e.put(11, 2, 'k')
e.put(6, 9, 'q'); e.mark('door', 6, 9)
e.mark('luna', 6, 2)
out['escuela'] = e

r = room(9, 7)                      # casa de la abuela
r.put(1, 1, 'n'); r.put(6, 1, 'v'); r.rect(3, 3, 3, 1, 't'); r.put(7, 3, 'j'); r.put(7, 4, 'j'); r.put(1, 5, 'P'); r.put(7, 5, 'k')
r.mark('rosa', 2, 2)
out['rosa'] = r

p = room(10, 8)                     # la panadería
p.rect(2, 3, 6, 1, 'e'); p.put(1, 1, 'n'); p.put(2, 1, 'n'); p.put(6, 1, 'v'); p.put(7, 1, 'v'); p.put(8, 5, 'k'); p.put(1, 5, 'k')
p.mark('marta', 5, 2)
out['panaderia'] = p

b = room(11, 9)                     # la biblioteca
for x in (1, 2, 3, 7, 8, 9): b.put(x, 1, 'n')
b.rect(2, 4, 2, 1, 't'); b.rect(7, 4, 2, 1, 't'); b.put(1, 7, 'P'); b.put(9, 7, 'P')
b.rect(5, 2, 1, 6, 'q')
b.mark('ines', 5, 2)
out['biblioteca'] = b

import os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = ["// Generated by tools/mapgen.py - original map layouts", "'use strict';", "G.MAPDATA = {"]
for kname, mm in out.items():
    js.append("  %s: { rows: %s, pos: %s }," % (kname, json.dumps(mm.rows()), json.dumps(mm.pos)))
js.append("};")
open(os.path.join(root, 'src', 'mapdata.js'), 'w').write('\n'.join(js) + '\n')
for kname, mm in out.items():
    print('==', kname, mm.w, 'x', mm.h, mm.pos)
    for r in mm.rows(): print(r)
