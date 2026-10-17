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

# ---------------- Villa Sol (town) 48x28 ----------------
# x 0..35 is the Round A town (unchanged, so saved spots and townsfolk keep their places); Round B adds the
# countryside east of a farm fence (x 36..46): la granja, the paddock (horse, goat), the duck pond and a wheat field.
t = M(48, 28)
t.rect(0, 0, 48, 2, 'T'); t.border('T', 1)
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

# ----- Round B: animals, benches, flowers, the farm (docs/ROUND_B_PLAN.md) -----
# benches (el banco): two in the plaza, one in the park
for tag, (x, y) in {'banco1': (13, 9), 'banco2': (22, 12), 'banco3': (20, 18)}.items(): t.put(x, y, 'J'); t.mark(tag, x, y)
# more flowers in town
for x, y in [(1,9),(3,8),(34,8),(9,26),(14,26),(22,26),(26,26),(30,26),(12,15),(23,15)]: t.put(x, y, 'o')
# Abuela Rosa's hens scratch about on the grass beside her house (an area: x, y, w, h)
t.pos['gallinero'] = [1, 7, 4, 4]
t.put(1, 7, 'O')                     # a hay bale by the hens
# the park: the frog's pond (the old pool, a little bigger) and the rabbit's lawn
t.rect(19, 21, 4, 2, 'w'); t.put(22, 21, 'w'); t.put(22, 22, '.')
t.pos['rana'] = [19, 21, 4, 2]       # lily pads on these water tiles
t.pos['conejo'] = [12, 18, 12, 7]    # the park lawn
t.mark('fuentePez', 18, 11)          # the fish lives in the fountain
# the farm fence: the town's east edge, with two gates (the bakery road and the library road)
t.vline(35, 2, 26, 'F'); t.put(35, 10, ','); t.put(35, 21, ',')
t.mark('gateFarm', 35, 10); t.mark('gatePond', 35, 21)
for x, y in [(34, 2), (34, 3), (33, 2), (34, 25), (34, 26), (33, 26)]: t.put(x, y, 'f')
# la granja (a red barn; its door is closed) with hay bales
t.house(38, 2, 6, 'R', 'granjaDoor', door=3, walls='WNWDNW')
t.rect(38, 2, 6, 2, 'R')
t.put(44, 4, 'O'); t.put(45, 4, 'O'); t.put(37, 4, 'O')
t.pos['granja'] = [38, 2, 6, 3]      # the barn's roof and walls
# roads: from the bakery road to the barn, then down to the paddock gate; and to the pond
t.hline(30, 41, 10, ','); t.vline(41, 5, 12, ',')
t.hline(30, 36, 21, ',')
# the paddock (el caballo, la cabra): fenced, a gate at the top
t.rect(37, 12, 10, 1, 'F'); t.rect(37, 12, 1, 7, 'F'); t.rect(46, 12, 1, 7, 'F'); t.rect(37, 18, 10, 1, 'F')
t.put(41, 12, ','); t.mark('paddockGate', 41, 12)
t.rect(38, 13, 8, 5, '.')
t.pos['corral'] = [38, 13, 8, 5]
t.put(45, 13, 'O')
# the duck pond (el agua): ducks swim here
for y, (x0, x1) in {19: (39, 41), 20: (38, 42), 21: (37, 42), 22: (37, 42), 23: (37, 42), 24: (38, 42), 25: (39, 41)}.items(): t.hline(x0, x1, y, 'w')
t.pos['estanque'] = [37, 19, 6, 7]
# a wheat field and flowers out in the country
t.rect(44, 20, 3, 6, 'y')
for x, y in [(36, 6), (39, 7), (44, 8), (45, 6), (37, 9), (43, 10), (36, 15), (36, 24), (39, 26), (42, 25), (43, 19), (36, 19)]: t.put(x, y, 'o')
for x, y in [(46, 2), (46, 3), (45, 2), (46, 26), (45, 26), (46, 25)]: t.put(x, y, 'f')
t.put(36, 13, 'P'); t.put(43, 7, 'P')
# named buildings (tap-anything: a tap on a roof or wall names the building), as x, y, w, h
t.pos['escuelaArea'] = [14, 2, 7, 3]; t.pos['rosaArea'] = [3, 4, 5, 3]; t.pos['panaderiaArea'] = [27, 4, 6, 3]
t.pos['casaArea'] = [3, 15, 5, 3]; t.pos['bibliotecaArea'] = [26, 15, 7, 3]
# ----- The open world (docs/WORLD_PLAN.md): five paths out of Villa Sol, each with a signpost (src/zones.js posts) -----
# west (0, 14): El parque de juegos; north (10, 0): El bosque; east (47, 10): La montaña; south (29, 27): La playa;
# south-west (5, 27): La casa de los abuelos. Each opening is a path tile on the map's edge (an exit in content/es/zone-villa.js).
t.hline(0, 4, 14, ',')                      # west, from the path by Rosa's house
t.vline(10, 0, 9, ',')                      # north, from the plaza road
t.hline(42, 47, 10, ',')                    # east, past the barn road
t.vline(29, 22, 27, ',')                    # south, from the library road
t.vline(5, 22, 27, ',')                     # south-west, from home
for tag, (x, y) in {'edgeJuegos': (0, 14), 'edgeBosque': (10, 0), 'edgeMontana': (47, 10), 'edgePlaya': (29, 27), 'edgeAbuelos': (5, 27)}.items(): t.mark(tag, x, y)
for tag, (x, y) in {'postJuegos': (2, 13), 'postBosque': (11, 3), 'postMontana': (45, 9), 'postPlaya': (30, 25), 'postAbuelos': (6, 25)}.items(): t.mark(tag, x, y)
t.mark('busVilla', 26, 11)                  # the bus stop, by the plaza road (east side)
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

# ---------------- La granja (the barn, inside) 13x9 ----------------
# The horse's stall (fenced, a water trough) on the left, nest boxes along the back wall with hens on the perch, square
# hay bales in the corners, a milk can and a basket of apples; the door at the bottom (G.maps.granja in src/maps.js).
g = M(13, 9, 'z'); g.border('V', 1)
g.put(3, 0, 'C'); g.put(9, 0, 'C')                       # two little windows in the back wall
g.put(1, 1, 'U')                                         # the trough, in the stall
g.vline(4, 1, 4, 'F'); g.hline(1, 4, 4, 'F')             # the stall's fence
g.put(3, 1, 'H')                                         # her hay
g.pos['establo'] = [2, 2, 2, 2]                          # the horse lives here
g.put(5, 1, 'm')                                         # the milk can
for x in (7, 8, 9): g.put(x, 1, 'E')                     # nest boxes; the hens sit on the perch on top
g.pos['roost'] = [7, 1, 3, 1]
g.pos['patio'] = [6, 2, 5, 4]                            # a hen scratches about here
g.put(11, 1, 'H'); g.put(11, 2, 'H'); g.put(10, 1, 'H')  # hay bales: the back corner...
g.put(1, 6, 'H'); g.put(1, 7, 'H'); g.put(2, 7, 'k')     # ...the front corner, a barrel
g.put(11, 6, 'H'); g.put(11, 7, 'k')
g.put(5, 4, 'A')
g.put(9, 5, 'H'); g.put(10, 5, 'H')                     # a low wall of bales in the middle (good for hiding behind)                                         # apples for the horse, by the stall
g.put(6, 8, 'z'); g.mark('door', 6, 8)
out['granja'] = g


# =====================================================================
#  The open world: the PATH maps from Villa Sol to each zone, and each zone's first map (a placeholder entrance that a
#  later step replaces with the whole zone: docs/WORLD_PLAN.md). Every path map: a road from edge to edge, a couple of
#  things to meet on the way (animals, something to pick up, a signpost). Every entrance: the zone's signpost, its bus
#  stop, a dog's spot, a friend (Lola), Nico's hiding places. Tags: 'in' (where you arrive from the path), 'bus', 'busIn'
#  (where the bus leaves you), 'post', 'dog', 'lola', 'nico', areas for animals.
# =====================================================================
def hpath(w, h, y, fill='.', edge='T'):
    m = M(w, h, fill); m.rect(0, 0, w, 1, edge); m.rect(0, h - 1, w, 1, edge); m.rect(0, 0, 1, h, edge); m.rect(w - 1, 0, 1, h, edge)
    m.hline(0, w - 1, y, ','); return m
def vpath(w, h, x, fill='.', edge='T'):
    m = M(w, h, fill); m.rect(0, 0, w, 1, edge); m.rect(0, h - 1, w, 1, edge); m.rect(0, 0, 1, h, edge); m.rect(w - 1, 0, 1, h, edge)
    m.vline(x, 0, h - 1, ','); return m

# --- El camino al parque de juegos (west): a meadow with flowers, a bench, rabbits and sticks to throw ---
m = hpath(30, 12, 6)
m.rect(0, 0, 30, 2, 'T'); m.rect(0, 10, 30, 2, 'T')
for x, y in [(3, 3), (5, 8), (9, 3), (12, 8), (15, 2), (18, 9), (21, 3), (24, 8), (27, 3), (7, 4), (19, 4)]: m.put(x, y, 'o')
for x, y in [(4, 2), (11, 9), (17, 2), (25, 9)]: m.put(x, y, 'f')
m.put(14, 5, 'J'); m.put(8, 8, 'P'); m.put(22, 2, 'P')
m.pos['conejos'] = [10, 2, 8, 3]; m.mark('palo', 13, 8); m.mark('lola', 16, 5)
m.mark('east', 29, 6); m.mark('west', 0, 6); m.mark('postW', 1, 5); m.mark('postE', 28, 7)
out['camino_juegos'] = m

# --- El camino al bosque (north): the trees get thicker, a little pond with a frog, mushrooms, a fallen log ---
m = vpath(14, 26, 6)
for y in range(1, 25):
    for x in (1, 12): m.put(x, y, 'T')
    if y < 12:
        for x in (2, 11): m.put(x, y, 'T')
for x, y in [(3, 4), (9, 3), (4, 9), (10, 8), (3, 15), (9, 17), (4, 21), (10, 22), (2, 13), (11, 19)]: m.put(x, y, 'f')
for x, y in [(4, 6), (8, 11), (3, 18), (10, 14), (8, 23)]: m.put(x, y, 'o')
m.rect(8, 15, 3, 2, 'w'); m.pos['rana'] = [8, 15, 3, 2]
m.put(3, 11, 'r'); m.mark('palo', 4, 13); m.mark('lola', 7, 10)
m.pos['conejos'] = [2, 18, 3, 5]
m.mark('south', 6, 25); m.mark('north', 6, 0); m.mark('postS', 7, 23); m.mark('postN', 5, 2)
out['camino_bosque'] = m

# --- El camino a la montaña (east): rolling hills, boulders, the mountains behind, a goat on the slope ---
m = hpath(30, 12, 6, '.', 'M')
m.rect(0, 1, 30, 1, 'M'); m.rect(0, 10, 30, 1, 'T')
for x in range(2, 28, 3): m.put(x, 2, 'h'); m.put(x + 1, 3, 'h')
for x, y in [(6, 4), (13, 8), (19, 3), (24, 8), (9, 9)]: m.put(x, y, 'r')
for x, y in [(4, 8), (11, 4), (17, 8), (22, 4), (27, 8)]: m.put(x, y, 'o')
m.pos['cabras'] = [14, 2, 8, 3]; m.mark('palo', 8, 7); m.mark('lola', 15, 5)
m.mark('west', 0, 6); m.mark('east', 29, 6); m.mark('postW', 1, 7); m.mark('postE', 28, 5)
out['camino_montana'] = m

# --- El camino a la playa (south): grass turns to sand, a lagoon with ducks, the smell of the sea ---
m = vpath(14, 24, 6)
for y in range(12, 23):
    for x in range(1, 13):
        if m.g[y][x] != ',': m.put(x, y, 's')
for y in range(1, 23): m.put(1, y, 'T'); m.put(12, y, 'T')
for y in range(16, 23): m.put(1, y, 'f'); m.put(12, y, 'f')
m.rect(8, 6, 4, 4, 'w'); m.pos['laguna'] = [8, 6, 4, 4]
for x, y in [(3, 3), (4, 8), (3, 10), (10, 3)]: m.put(x, y, 'o')
m.put(3, 5, 'P'); m.mark('palo', 4, 15); m.mark('lola', 7, 13)
m.mark('north', 6, 0); m.mark('south', 6, 23); m.mark('postN', 5, 2); m.mark('postS', 7, 21)
out['camino_playa'] = m

# --- El camino a la casa de los abuelos (south-west): wheat fields, a fence, hens, an apple tree ---
m = vpath(14, 24, 6)
for y in range(1, 23): m.put(1, y, 'T'); m.put(12, y, 'T')
m.rect(8, 3, 4, 7, 'y'); m.vline(7, 3, 9, 'F'); m.put(7, 6, '.')
m.rect(2, 14, 3, 6, 'y')
for x, y in [(3, 4), (4, 10), (9, 13), (10, 18), (3, 21), (9, 21)]: m.put(x, y, 'o')
m.put(10, 15, 'f'); m.mark('manzana', 10, 16)
m.pos['gallinas'] = [2, 5, 4, 4]; m.mark('lola', 7, 12)
m.mark('north', 6, 0); m.mark('south', 6, 23); m.mark('postN', 5, 2); m.mark('postS', 7, 21)
out['camino_abuelos'] = m

# --- the zones' first maps (placeholders: each a small place with its signpost, bus stop, dog's spot and friends) ---
def entrance(w, h, fill, edge):
    m = M(w, h, fill); m.border(edge, 1); return m
# La playa (the zone, docs/WORLD_PLAN.md): grass and palms along the top (the path comes in at (10, 0), the bus stop and
# the signpost beside it, Doña Nieves's ice-cream cart), a wide sandy beach (umbrellas, the lifeguard's tower, Tere's
# sandcastle, the turtles' nest), wet rocks and a tide pool on the right, a wooden pier on the left with Don Paco's
# boat at its end, then the surf (the waves roll in), the shallows (you can wade) and the deep sea along the bottom.
# Codes (src/tiles.js): s sand, & dune grass, 9 surf, - clear shallows, w sea, d pier, 1 palm, 2 umbrella, 3 sandcastle, 4/5 the boat,
# 6/7 the lifeguard's tower (seat / legs), 8 the ice-cream cart, 0 wet rocks.
m = M(34, 24, 's')
m.rect(0, 0, 34, 3, '.')                                  # the grassy dunes along the top
for x in range(34): m.put(x, 0, 'T')
for y in range(0, 15): m.put(0, y, 'T'); m.put(33, y, 'T')
m.rect(1, 3, 32, 1, 's')
for x, y in [(3, 1), (6, 2), (13, 2), (17, 1), (22, 2), (26, 1), (30, 2), (2, 2)]: m.put(x, y, 'o')
m.vline(10, 0, 4, ',')                                    # the path in from the north, ending on the sand
for x, y in [(2, 4), (4, 8), (8, 4), (24, 3), (30, 4), (32, 8), (1, 11), (20, 3)]: m.put(x, y, '1')   # palms
m.rect(1, 15, 32, 1, '9')                                 # the surf
m.rect(0, 16, 34, 2, '-')                                 # the clear shallows (you can wade)
m.rect(0, 18, 34, 6, 'w')                                 # the sea
for y in range(15, 18): m.put(0, y, 'w'); m.put(33, y, 'w')
for x in range(1, 33):                                    # dune grass where the grass meets the sand
    if x != 10 and (x * 7) % 5 < 3: m.put(x, 3, '&')
for x, y in [(5, 6), (21, 4), (27, 5), (3, 10), (11, 7)]: m.put(x, y, '&')
# the pier on the left, two planks wide, a platform at its end, Don Paco's boat tied beside it
for y in range(15, 22): m.put(5, y, 'd'); m.put(6, y, 'd')
m.rect(4, 20, 4, 2, 'd')
m.put(8, 21, '4'); m.put(9, 21, '5')
# wet rocks and a tide pool on the right (el charco: clear water you can wade into)
for j, row in enumerate(['..00.0..0',
                         '.000000.0',
                         '.0---00..',
                         '00----000',
                         '.00.000..']):
    for i, c in enumerate(row):
        if c != '.': m.put(24 + i, 10 + j, c)
for x, y in [(1, 13), (2, 14), (1, 14)]: m.put(x, y, '0')  # a few rocks by the pier
# umbrellas, the lifeguard's tower, the sandcastle, the ice-cream cart
for x, y in [(13, 8), (23, 6), (8, 11), (28, 7)]: m.put(x, y, '2')
m.put(18, 8, '6'); m.put(18, 9, '7')
m.put(15, 12, '3')
m.put(14, 4, '8')
m.mark('in', 10, 1); m.mark('north', 10, 0); m.mark('post', 11, 2); m.mark('bus', 8, 2); m.mark('busIn', 8, 3)
m.mark('lola', 12, 6); m.mark('nico', 21, 5); m.mark('paco', 6, 19); m.mark('marina', 19, 9); m.mark('nieves', 15, 4); m.mark('tere', 16, 12)
m.mark('dog', 11, 13); m.mark('dog2', 26, 6); m.mark('splash', 20, 15)
m.mark('net', 5, 21); m.mark('nest', 22, 13); m.mark('castle', 15, 12); m.mark('hermit', 23, 11)
m.pos['charco'] = [26, 12, 4, 2]; m.pos['rocas'] = [22, 8, 11, 7]; m.pos['arena'] = [3, 5, 26, 9]; m.pos['orilla'] = [10, 14, 22, 3]
m.pos['mar'] = [12, 19, 20, 4]; m.pos['agua'] = [1, 16, 32, 7]; m.pos['bajo'] = [10, 16, 20, 2]
m.mark('hide1', 13, 8); m.mark('hide2', 15, 12); m.mark('hide3', 26, 10); m.mark('hide4', 30, 4); m.mark('hide5', 8, 21); m.mark('hide6', 23, 6)
out['playa'] = m
# El bosque (the zone, docs/WORLD_PLAN.md): a rocky cliff along the top with a waterfall into a pond (a frog), a meadow
# (deer, rabbits), the bears' cave in a rock outcrop (top right), a river across the middle with a little bridge on
# the main path and stepping stones further east, then the south woods: a clearing ringed by tall trees (the lost bear
# cub, the squirrel's oak), Doña Lupe's log cabin with her berry bushes (left), a hollow log (right), the path in from
# Villa Sol at the bottom with the bus stop and the signpost. Two more maps: the cave inside (dark, fireflies, mama bear
# asleep) and Lupe's cabin inside.
# Codes (src/tiles.js): ( tall tree crown over ) its trunk, % mushrooms, * berry bush, _ hollow log, # rock cliff,
# | waterfall, @ the cave's mouth, : stepping stones, [ log cabin wall, ] its door; inside the cave { floor, } rock wall.
m = M(40, 30, '.')
m.border('T', 1)
for x, y in [(1, 1), (38, 1), (1, 28), (38, 28), (2, 28), (37, 28), (1, 27), (38, 27)]: m.put(x, y, 'T')
m.rect(1, 1, 38, 2, '#')                                  # the cliff along the top
m.put(6, 1, '|'); m.put(7, 1, '|'); m.put(6, 2, '|'); m.put(7, 2, '|')   # the waterfall
for y, (x0, x1) in {3: (4, 9), 4: (3, 10), 5: (3, 10), 6: (3, 10), 7: (3, 10), 8: (2, 10), 9: (1, 11)}.items(): m.hline(x0, x1, y, 'w')  # the pond
m.rect(1, 10, 38, 2, 'w')                                 # the river
m.put(18, 10, 'B'); m.put(18, 11, 'B')                    # the little bridge
m.put(31, 10, ':'); m.put(31, 11, ':')                    # stepping stones
# the bears' cave: a rock outcrop below the cliff, its dark mouth, boulders
m.rect(28, 3, 9, 2, '#'); m.put(27, 3, '#'); m.put(37, 3, '#'); m.put(32, 4, '@')
for x, y in [(27, 4), (36, 5), (26, 3)]: m.put(x, y, 'r')
# the main path: in from the south, over the bridge, up to the meadow, east to the cave
m.vline(18, 5, 29, ','); m.hline(18, 32, 5, ',')
m.hline(6, 18, 17, ',')                                   # to Lupe's cabin
m.hline(18, 29, 19, ',')                                  # to the hollow log
m.put(18, 10, 'B'); m.put(18, 11, 'B')                    # (the bridge over the river, on the path)
# Doña Lupe's log cabin (left): roof, log wall, its door
m.rect(3, 13, 6, 2, 'R'); m.hline(3, 8, 15, '['); m.put(6, 15, ']'); m.vline(6, 16, 17, ',')
for x, y in [(2, 19), (4, 20), (7, 21), (10, 20), (3, 23)]: m.put(x, y, '*')   # berry bushes
m.put(30, 19, '_')                                        # the hollow log
# tall trees (crown over trunk) ringing the clearing and about the woods
for x, y in [(13, 13), (23, 13), (12, 18), (24, 17), (15, 22), (22, 22), (27, 13), (10, 14), (34, 15), (35, 21), (8, 25), (28, 24), (14, 6), (24, 7), (38 - 1, 7), (2, 12)]:
    m.put(x, y, '('); m.put(x, y + 1, ')')
# woods: groves of small trees you can walk among, more tall trees in them (kept off the paths and the places)
import random
rnd = random.Random(7)
keep = set()
for (x, y) in [(18, 28), (19, 27), (16, 26), (16, 27), (20, 25), (25, 23), (20, 13), (8, 17), (30, 19), (25, 12), (25, 8), (27, 22), (29, 21), (31, 20), (18, 16), (32, 5), (13, 14), (21, 20), (24, 18), (10, 20), (7, 21), (29, 19), (31, 19), (31, 20), (30, 20), (30, 18), (31, 12), (31, 9), (26, 12), (24, 12), (8, 18), (9, 17), (7, 22)]:
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1): keep.add((x + dx, y + dy))
def free(x, y): return m.g[y][x] == '.' and (x, y) not in keep and all(m.g[y + dy][x + dx] != ',' for dx, dy in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1)])
for (x0, y0, w, h, dens) in [(1, 19, 11, 9, 0.5), (26, 13, 13, 15, 0.42), (1, 12, 2, 7, 0.6), (19, 6, 9, 3, 0.25), (33, 6, 6, 3, 0.4), (10, 12, 4, 3, 0.3), (11, 22, 7, 6, 0.35), (19, 21, 6, 7, 0.3)]:
    for y in range(y0, y0 + h):
        for x in range(x0, x0 + w):
            if 0 < x < 39 and 0 < y < 29 and free(x, y) and rnd.random() < dens:
                if rnd.random() < 0.3 and y + 1 < 29 and free(x, y + 1) and (x, y + 1) not in keep: m.put(x, y, '('); m.put(x, y + 1, ')')
                else: m.put(x, y, 'f')
m.put(36, 11, 'w')
# flowers in the meadow and the clearing, mushrooms here and there (off the story's and the games' places)
busy = {(15, 17), (17, 21), (21, 17), (11, 16), (22, 21), (20, 20), (22, 20), (21, 21), (23, 21), (16, 15), (22, 6), (14, 16), (11, 6), (27, 17), (9, 24), (21, 26), (18, 16)}
for x, y in [(12, 5), (15, 4), (20, 7), (23, 4), (16, 8), (11, 7), (15, 15), (21, 16), (16, 20), (20, 18), (14, 18), (25, 25), (9, 19), (17, 14), (22, 18), (15, 19), (13, 15), (21, 14), (24, 20), (16, 23), (20, 24), (23, 25), (12, 9), (25, 4), (30, 7), (6, 18), (9, 16)]:
    if m.g[y][x] == '.' and (x, y) not in busy: m.put(x, y, 'o')
for x, y in [(13, 8), (21, 4), (34, 7), (26, 15), (11, 21), (33, 18), (4, 18), (29, 22), (16, 14), (22, 15), (20, 21), (14, 20), (23, 19), (19, 7), (8, 22)]:
    if m.g[y][x] == '.' and (x, y) not in busy: m.put(x, y, '%')
m.mark('in', 18, 28); m.mark('south', 18, 29); m.mark('post', 19, 27); m.mark('bus', 16, 26); m.mark('busIn', 16, 27)
m.mark('lola', 20, 25); m.mark('nico', 25, 23); m.mark('elena', 20, 13); m.mark('lupe', 8, 17)
m.mark('dog', 30, 19); m.mark('rio', 25, 12); m.mark('rioFar', 25, 8); m.mark('rastro', 27, 22)
m.mark('cub', 18, 16); m.mark('cave', 32, 4); m.mark('caveFront', 32, 5); m.mark('cabinDoor', 6, 15); m.mark('log', 30, 19)
m.mark('oak', 13, 14); m.mark('sorter', 21, 20)
m.pos['prados'] = [11, 3, 13, 6]; m.pos['conejos'] = [19, 6, 7, 3]; m.pos['rana'] = [4, 4, 6, 4]
m.pos['claro'] = [13, 14, 11, 7]; m.pos['zorros'] = [25, 18, 9, 7]; m.pos['orilla'] = [19, 12, 17, 2]
m.pos['moras'] = [2, 18, 9, 6]; m.pos['arboles'] = [10, 12, 26, 14]; m.pos['norte'] = [19, 3, 8, 5]; m.pos['owl'] = [24, 8, 1, 1]
m.mark('hide1', 13, 14); m.mark('hide2', 30, 19); m.mark('hide3', 7, 21); m.mark('hide4', 27, 4); m.mark('hide5', 24, 18); m.mark('hide6', 10, 20)
out['bosque'] = m
# the bears' cave, inside: dark rock, glowing mushrooms, a little pool, mama bear asleep at the back, fireflies
m = M(16, 10, '{'); m.border('}', 1); m.rect(0, 0, 16, 2, '}')
for x, y in [(1, 2), (14, 2), (1, 8), (14, 8), (2, 2), (13, 2)]: m.put(x, y, '}')
m.rect(11, 4, 3, 2, 'w')
for x, y in [(3, 7), (12, 7), (8, 2), (5, 3)]: m.put(x, y, '%')
m.put(8, 9, '{'); m.mark('door', 8, 9)
m.pos['osa'] = [3, 3, 3, 2]; m.pos['luces'] = [2, 2, 12, 6]
m.mark('hide1', 13, 3)
out['bosque_cueva'] = m
# Doña Lupe's cabin, inside: her oven, a table, a bed, shelves of jars
c = room(9, 7); c.put(1, 1, 'n'); c.put(2, 1, 'n'); c.put(6, 1, 'v'); c.rect(3, 3, 2, 1, 't'); c.put(7, 4, 'j'); c.put(7, 5, 'j'); c.put(1, 5, 'k')
c.mark('table', 3, 3); c.mark('lupe', 5, 2)
out['bosque_cabana'] = c
# El parque de juegos (the zone, docs/WORLD_PLAN.md): a park with a playground. The path comes in from Villa Sol on the
# east edge (39, 13) along the main path, past the bus stop and Don Chuy's bubble cart; north of the path, the fenced
# playground (swings, a slide, a climbing frame by a tall tree, a seesaw, a merry-go-round, a sandbox with a little
# sandcastle); to the north-west the kite hill; to the south the little soccer field (two goals); south-west a pond
# with ducks, rocks where lizards sun, and the dog's jumping course; south-east a garden with a fountain, benches and
# flower beds (bees, ladybugs, a hummingbird in the morning, pigeons by the fountain).
# Codes (src/tiles.js): ! swing set (seats drawn by the zone), < slide ladder, > slide chute, / climbing frame,
# ? seesaw (its plank drawn by the zone), ^ merry-go-round (2x2: its pad; the wheel drawn by the zone), ; a goal,
# $ Don Chuy's bubble cart.
m = M(40, 28, '.')
m.border('T', 1)
for x in range(1, 39):
    if x % 4 != 1: m.put(x, 1, 'f')
for y in range(2, 27):
    if y % 3 == 0: m.put(1, y, 'f'); m.put(38, y, 'f')
for x in range(2, 38):
    if x % 5 == 2: m.put(x, 26, 'f')
# the kite hill (north-west): grass and flowers (the zone draws the hill's soft rise; Pablo flies his kite on top)
for x, y in [(3, 3), (9, 2), (2, 6), (10, 5), (4, 7), (8, 7), (5, 2), (11, 3)]: m.put(x, y, 'o')
# the main path: in from the east, west to the hill; up into the playground and down to the soccer field; to the pond
m.hline(4, 39, 13, ','); m.vline(6, 8, 13, ','); m.vline(21, 10, 16, ','); m.vline(4, 13, 21, ','); m.hline(4, 9, 21, ',')
m.vline(34, 13, 17, ',')
# the playground: a fence with gates (south on the path, west to the hill, east)
m.hline(14, 31, 10, 'F'); m.vline(14, 2, 10, 'F'); m.vline(31, 2, 10, 'F')
for x, y in [(20, 10), (21, 10), (22, 10), (14, 6), (14, 7), (31, 6), (31, 7)]: m.put(x, y, ',' if x == 21 else '.')
for x in (16, 17, 18): m.put(x, 3, '!')                    # the swings
m.put(21, 3, '<'); m.put(22, 3, '>')                       # the slide: its ladder, its chute (you land on (23, 3))
m.put(25, 3, '/'); m.put(26, 3, '/')                       # the climbing frame...
m.put(27, 2, '('); m.put(27, 3, ')')                       # ...beside a tall tree (Pablo's kite gets stuck in it)
for x in (16, 17, 18): m.put(x, 7, '?')                    # the seesaw
m.rect(23, 6, 2, 2, '^')                                   # the merry-go-round
m.rect(26, 6, 4, 3, 's'); m.put(29, 8, '3')                # the sandbox, a little sandcastle in it
m.put(15, 9, 'J'); m.put(30, 2, 'P'); m.put(15, 2, 'P')
# north of the path: Don Chuy's bubble cart, benches, lamps
m.put(30, 11, '$'); m.put(17, 11, 'J'); m.put(25, 11, 'J')
for x, y in [(12, 12), (28, 12), (33, 14), (9, 14)]: m.put(x, y, 'L')
# the soccer field (la cancha: its lines are drawn by the zone), a goal at each end
m.put(12, 20, ';'); m.put(28, 20, ';')
# the pond (south-west), rocks where the lizards sun
for y, (x0, x1) in {16: (3, 7), 17: (2, 8), 18: (2, 8), 19: (3, 7)}.items(): m.hline(x0, x1, y, 'w')
for x, y in [(9, 16), (2, 15), (8, 20), (10, 18)]: m.put(x, y, 'r')
# the garden (south-east): a fountain, benches, flower beds
m.put(34, 19, 'l')
m.rect(31, 22, 3, 2, 'o'); m.rect(36, 22, 2, 2, 'o'); m.rect(36, 16, 2, 2, 'o'); m.rect(31, 16, 2, 1, 'o')
m.put(32, 18, 'J'); m.put(36, 19, 'J')
for x, y in [(35, 24), (32, 25), (37, 20)]: m.put(x, y, 'o')
# flowers about, tall trees and small ones (off the paths and the places)
for x, y in [(12, 3), (11, 7), (3, 9), (8, 10), (13, 15), (29, 15), (24, 25), (17, 26), (10, 23), (16, 12), (26, 12), (5, 11), (35, 9), (36, 4)]:
    if m.g[y][x] == '.': m.put(x, y, 'o')
for x, y in [(34, 3), (37, 7), (11, 9), (2, 11), (30, 24), (14, 24), (25, 15), (37, 11)]:
    m.put(x, y, '('); m.put(x, y + 1, ')')
for x, y in [(33, 6), (36, 2), (10, 1), (12, 25), (19, 25), (27, 25), (3, 25), (9, 26), (11, 16), (29, 17), (36, 26), (24, 14), (16, 15)]:
    if m.g[y][x] in '.o': m.put(x, y, 'f')
m.put(3, 12, 'P'); m.put(33, 11, 'P')
m.mark('in', 38, 13); m.mark('east', 39, 13); m.mark('post', 38, 12); m.mark('bus', 36, 12); m.mark('busIn', 36, 13)
m.mark('lola', 34, 15); m.mark('nico', 24, 12); m.mark('ana', 20, 6); m.mark('pablo', 17, 4); m.mark('chuy', 29, 11)
m.mark('hill', 6, 4); m.mark('kite', 27, 2); m.mark('frame', 25, 3); m.mark('slide', 21, 3); m.mark('land', 23, 3)
m.mark('mgr', 23, 6); m.mark('cart', 30, 11)
m.mark('dog', 27, 7); m.mark('agility', 3, 23); m.mark('agilityEnd', 10, 23); m.mark('palomasDog', 35, 21)
m.pos['cancha'] = [13, 17, 15, 7]; m.pos['palomas'] = [31, 18, 7, 4]; m.pos['jardin'] = [31, 15, 7, 10]; m.pos['flores'] = [31, 16, 7, 8]
m.pos['hormigas'] = [13, 11, 10, 2]; m.pos['rocas'] = [1, 14, 11, 8]; m.pos['arenero'] = [26, 6, 4, 3]; m.pos['pasto'] = [2, 2, 10, 7]
m.pos['estanque'] = [2, 16, 7, 4]; m.pos['conejos'] = [2, 8, 9, 3]
m.mark('hide1', 30, 11); m.mark('hide2', 21, 3); m.mark('hide3', 29, 8); m.mark('hide4', 32, 18); m.mark('hide5', 3, 12); m.mark('hide6', 11, 10)
out['juegos'] = m
# La casa de los abuelos (the zone, docs/WORLD_PLAN.md): a cosy countryside home. The path comes in from Villa Sol at
# the top (30, 0) past the bus stop and the signpost; the grandparents' cottage in the middle (its front door faces
# the yard: you can go in), the orchard behind it (tall fruit trees, a swing hanging from one), the henhouse and the
# hens' run on the left, the vegetable garden (rows of carrots, lettuces, tomatoes, corn) with the water pump, the
# clothesline with the washing drying (the zone draws it), the duck pond, the paddock (the cow, the donkey) on the
# right, the turkeys' yard, the sheep's meadow and the pigs' muddy pen at the bottom right.
# Codes (src/tiles.js): ñ a garden bed (vegetables), á the henhouse, í mud (the pigs'), é the water pump and its
# trough; inside the cottage: ó the wardrobe, ú the dressing-up trunk.
m = M(40, 30, '.')
m.border('T', 1)
for x, y in [(1, 1), (38, 1), (1, 28), (38, 28), (2, 28), (37, 28), (1, 27), (38, 27), (2, 1), (37, 1)]: m.put(x, y, 'T')
# the paths: in from the north at (30, 0), down to the yard; the main path across; to the door, the garden, the pond
m.vline(30, 0, 12, ','); m.hline(4, 36, 12, ',')
m.vline(19, 10, 12, ',')                                  # the front door's path
m.vline(13, 12, 20, ','); m.hline(4, 13, 20, ',')         # to the garden and the pump
m.vline(24, 12, 21, ',')                                  # to the pond
m.vline(34, 12, 22, ',')                                  # to the pigs
# the cottage: a red roof, cream walls with windows, the front door at (19, 9)
m.house(13, 7, 13, 'R', walls='WNWNWNWNWNWNW')            # roof 7-8, walls on row 9, the door in the middle (19, 9)
m.mark('door', 19, 9); m.mark('porch', 19, 10)
m.put(14, 10, 'P'); m.put(24, 10, 'P'); m.put(16, 10, 'J')   # flower pots, the porch bench
for x in (15, 17, 21, 22, 23): m.put(x, 10, 'o')
# the orchard behind the cottage: tall fruit trees (apples drawn on some), grass and flowers between
for x, y in [(3, 2), (7, 1), (11, 2), (15, 1), (19, 2), (23, 1)]: m.put(x, y, '('); m.put(x, y + 1, ')')
for x, y in [(5, 4), (9, 4), (13, 4), (17, 5), (21, 4), (2, 5), (25, 2)]: m.put(x, y, 'o')
# the swing tree (east of the cottage): a tall tree, the swing hangs beside its trunk (the zone draws it)
m.put(27, 7, '('); m.put(27, 8, ')'); m.mark('swing', 28, 9)
# the henhouse and the hens' run (left of the cottage)
m.hline(2, 9, 7, 'F'); m.vline(2, 7, 11, 'F'); m.vline(9, 7, 11, 'F'); m.hline(2, 9, 11, 'F'); m.put(6, 11, '.')
m.put(3, 8, 'á'); m.put(4, 8, 'á'); m.mark('coop', 3, 8)
m.put(8, 8, 'O')
m.pos['gallinero'] = [3, 9, 6, 2]
# the vegetable garden (huerto): four beds with a path round them, the water pump by the path
for y in (14, 16, 18):
    for x in range(3, 11): m.put(x, y, 'ñ')
m.put(12, 16, 'é'); m.mark('pump', 12, 16); m.mark('pumpAt', 13, 16)
m.mark('huerto', 3, 14)
# the clothesline: two posts, the washing between them (drawn by the zone; you walk under it)
m.put(15, 16, 'F'); m.put(22, 16, 'F'); m.mark('lineL', 15, 16); m.mark('lineR', 22, 16)
# the duck pond
for y, (x0, x1) in {22: (16, 21), 23: (15, 22), 24: (15, 22), 25: (16, 21)}.items(): m.hline(x0, x1, y, 'w')
for x, y in [(14, 22), (23, 25), (17, 26)]: m.put(x, y, 'r')
# the paddock (the cow and the donkey): fenced, a gate on the path, hay bales
m.hline(26, 38, 14, 'F'); m.vline(26, 14, 20, 'F'); m.hline(26, 33, 20, 'F'); m.put(34, 14, ','); m.put(34, 20, ',')
m.hline(35, 38, 20, 'F')
m.put(37, 15, 'O'); m.put(36, 15, 'O'); m.put(27, 19, 'O')
# the pigs' pen: a muddy patch behind a fence (bottom right)
m.hline(30, 38, 22, 'F'); m.vline(30, 22, 27, 'F'); m.hline(30, 38, 27, 'F'); m.put(34, 22, ',')
for y in range(23, 27):
    for x in range(31, 38):
        if (x, y) not in [(31, 23), (37, 26), (37, 23)]: m.put(x, y, 'í')
# the sheep's meadow (bottom, between the pond and the pen) and flowers about
for x, y in [(26, 24), (28, 26), (25, 27), (11, 24), (8, 26), (4, 23), (6, 22), (10, 22), (27, 22), (36, 9), (33, 4), (37, 6), (35, 2), (24, 5)]:
    if m.g[y][x] == '.': m.put(x, y, 'o')
for x, y in [(2, 24), (3, 27), (11, 27), (36, 4), (38, 10), (12, 22), (28, 28)]:
    if m.g[y][x] == '.': m.put(x, y, 'f')
m.mark('in', 30, 1); m.mark('north', 30, 0); m.mark('post', 31, 2); m.mark('bus', 28, 2); m.mark('busIn', 28, 3)
m.mark('lola', 32, 5); m.mark('nico', 9, 22); m.mark('abuela', 18, 11); m.mark('abuelo', 9, 15)
m.mark('dog', 6, 13); m.mark('pavosDog', 33, 7); m.mark('sock', 18, 17)
m.pos['vacas'] = [27, 15, 7, 4]; m.pos['burros'] = [33, 16, 5, 3]; m.pos['ovejas'] = [24, 23, 6, 5]; m.pos['cerdos'] = [31, 23, 7, 4]
m.pos['pavos'] = [31, 4, 7, 6]; m.pos['huertoA'] = [2, 13, 10, 7]; m.pos['huerta'] = [2, 1, 24, 5]; m.pos['estanque'] = [15, 22, 8, 4]
m.pos['rana'] = [15, 23, 8, 2]; m.pos['conejos'] = [3, 21, 8, 5]; m.pos['gallo'] = [3, 9, 6, 2]; m.pos['flores'] = [14, 10, 10, 1]
m.mark('hide1', 8, 8); m.mark('hide2', 4, 8); m.mark('hide3', 27, 19); m.mark('hide4', 12, 16); m.mark('hide5', 27, 8); m.mark('hide6', 23, 25)
out['abuelos'] = m
# the cottage, inside: the living room (photos on the wall, the fireplace, the sofa, a rug), the kitchen (the stove,
# the counter, the table, a mouse's hole), the bedroom (the wardrobe, the grandparents' beds, the dressing-up trunk)
c = M(20, 11, 'i'); c.border('I', 1)
c.vline(7, 1, 9, 'I'); c.vline(13, 1, 9, 'I'); c.put(7, 6, 'i'); c.put(7, 7, 'i'); c.put(13, 6, 'i'); c.put(13, 7, 'i')
c.put(1, 1, 'n'); c.put(5, 1, 'v'); c.rect(2, 4, 3, 1, 'u'); c.rect(2, 6, 4, 3, 'q'); c.put(1, 9, 'P')
c.put(8, 1, 'e'); c.put(9, 1, 'e'); c.put(10, 1, 'v'); c.put(11, 1, 'e'); c.put(12, 1, 'n'); c.rect(9, 4, 3, 1, 't')
c.put(14, 1, 'ó'); c.put(16, 1, 'j'); c.put(16, 2, 'j'); c.put(17, 1, 'j'); c.put(17, 2, 'j'); c.put(17, 7, 'ú'); c.put(18, 9, 'P')
c.put(4, 10, 'i'); c.mark('door', 4, 10)
c.mark('photos', 2, 0); c.mark('mirror', 15, 0); c.mark('trunk', 17, 7); c.mark('wardrobe', 14, 1); c.mark('table', 9, 4)
c.mark('abuela', 10, 3); c.mark('bebe', 3, 7); c.mark('hole', 12, 9)
c.pos['cocina'] = [8, 6, 5, 4]; c.pos['sala'] = [1, 5, 6, 4]
out['abuelos_casa'] = c
# La montaña: a meadow under the peaks, snow up top (roll), boulders, a goat
m = entrance(22, 14, '.', 'M')
m.rect(1, 1, 20, 2, 'M'); m.rect(1, 3, 20, 2, 'h')
m.hline(0, 10, 9, ','); m.vline(10, 5, 9, ',')
for x, y in [(4, 6), (15, 10), (18, 6), (6, 11)]: m.put(x, y, 'r')
for x, y in [(3, 11), (13, 7), (17, 11), (8, 6)]: m.put(x, y, 'o')
m.mark('in', 1, 9); m.mark('west', 0, 9); m.mark('post', 2, 8); m.mark('bus', 7, 10); m.mark('busIn', 7, 9)
m.mark('dog', 12, 4); m.mark('lola', 12, 8); m.mark('nico', 16, 8); m.pos['cabras'] = [12, 5, 7, 3]
m.mark('hide1', 4, 6); m.mark('hide2', 15, 10); m.mark('hide3', 18, 6)
out['montana'] = m

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
