"""Builds the ten Key Express logo concepts: a light version (for the site's white
plate), a dark version (for navy) and a square icon (for the favicon), each as SVG."""
import math
import os
import sys

from lib import *

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")


# ---------- shared pieces ----------

def bitting(x0, x1, y, depths, slope=0.45):
    """Key teeth along the edge y between x0 and x1 (positive depths hang below)."""
    n = len(depths)
    w = (x1 - x0) / n
    s = w * slope / 2
    pts = [(x0, y)]
    for i, dep in enumerate(depths):
        a = x0 + i * w
        pts += [(a + s, y + dep), (a + w - s, y + dep)]
    pts.append((x1, y))
    sgn = 1 if depths[0] > 0 else -1
    pts += [(x1, y - 2 * sgn), (x0, y - 2 * sgn)]
    return poly(pts)


def swap_xy(p):
    return affine(p, 0, 1, 1, 0, 0, 0)


def word(font, s, cap, tracking=0.0, slant=0.0):
    """Letters of s, ink starting at x=0 on baseline y=0. Returns (letters, ink width)."""
    gs, _ = font.glyphs(s, cap=cap, tracking=tracking, slant=slant)
    real = [g for g in gs if list(g.segments)]
    x0, _, x1, _ = bounds(*real)
    return [move(g, -x0, 0) for g in gs], x1 - x0


def runs(letters, spec, x, baseline):
    """[(start, end, fill)] -> [(path, fill)] moved to (x, baseline)."""
    out = []
    for a, b, fill in spec:
        p = union(*letters[a:b])
        out.append((move(p, x, baseline), fill))
    return out


def tagline(font, s, cap, width):
    t = font.fit(s, width, cap)
    letters, w = word(font, s, cap, tracking=t)
    return union(*letters), w


def tile_bg(logo, dark, rx=22):
    return rect(0, 0, 100, 100, rx)


def colors(dark):
    if dark:
        return dict(ink=WHITE, accent=SKY, solid=WHITE)
    return dict(ink=NAVY, accent=BLUE, solid=NAVY)


def metal(logo, name="metal", horizontal=False):
    if horizontal:
        return logo.gradient(name, [(0, WHITE), (1, SILVER)], 0, 0, 1, 0)
    return logo.gradient(name, [(0, WHITE), (1, SILVER)])


def deep(logo, name="deep", vertical=False):
    if vertical:
        return logo.gradient(name, [(0, BLUE), (1, NAVY)], 0, 0, 0, 1)
    return logo.gradient(name, [(0, BLUE), (1, NAVY)])


# ---------- 1. Classic: the current tile and key, redrawn ----------

def classic_key():
    bow = circle(0, 0, 17)
    blade = rect(10, -5.5, 62, 11, 5.5)
    teeth = bitting(40, 68, 5.5, [9, 5, 10, 6])
    return sub(union(bow, blade, teeth), circle(0, 0, 7.5))


def c1_mark(L, ns_dark=False):
    key = rotate(classic_key(), 45)
    key = place(key, 50, 50, "mc")
    L.add(rect(0, 0, 100, 100, 24), deep(L, "tile"))
    L.add(key, metal(L))


def c1(dark):
    c = colors(dark)
    L = Logo("ke1" + ("d" if dark else ""))
    c1_mark(L)
    f = Font(ATKINSON)
    letters, w = word(f, "KEY EXPRESS", cap=40, tracking=0.02)
    for p, fill in runs(letters, [(0, 3, c["ink"]), (4, 11, c["accent"])], 122, 70):
        L.add(p, fill)
    return L


def c1_icon():
    L = Logo("ke1i")
    c1_mark(L)
    return L


# ---------- 2. Pin: a map pin with a keyhole ("we come to you") ----------

def pin_shape(cx=37, top=0, R=36, tip=100):
    cy = top + R
    d = tip - cy
    phi = math.acos(R / d)
    lx, rx_, ly = cx - R * math.sin(phi), cx + R * math.sin(phi), cy + R * math.cos(phi)
    return svgpath(f"M{lx} {ly} A{R} {R} 0 1 1 {rx_} {ly} L{cx} {tip} Z")


def keyhole(cx, cy, r, top_hw, bot_hw, bottom):
    return union(circle(cx, cy, r), poly([(cx - top_hw, cy), (cx + top_hw, cy), (cx + bot_hw, bottom), (cx - bot_hw, bottom)]))


def pin_mark():
    return sub(pin_shape(), keyhole(37, 31, 11.5, 5.2, 10, 61))


def c2(dark):
    c = colors(dark)
    L = Logo("ke2" + ("d" if dark else ""))
    L.add(pin_mark(), metal(L) if dark else deep(L, "pin", vertical=True))
    big = Font("Montserrat[wght].ttf", wght=800)
    small = Font("Montserrat[wght].ttf", wght=600)
    letters, w = word(big, "KEY EXPRESS", cap=34, tracking=0.01)
    for p, fill in runs(letters, [(0, 11, c["ink"])], 94, 49):
        L.add(p, fill)
    tag, _ = tagline(small, "MOBILE LOCKSMITH", 13, w)
    L.add(move(tag, 94, 75), c["accent"])
    return L


def c2_icon():
    L = Logo("ke2i")
    L.add(rect(0, 0, 100, 100, 22), deep(L, "tile"))
    m = scale(pin_mark(), 0.74)
    L.add(place(m, 50, 50, "mc"), WHITE)
    return L


# ---------- 3. Speed key: a key in motion ("express") ----------

def speed_key():
    bow = circle(0, 0, 24)
    blade = rect(18, -8, 84, 16, 5)
    teeth = bitting(60, 98, 8, [12, 7, 13, 8])
    return sub(union(bow, blade, teeth), circle(0, 0, 10.5))


def speed_lines(gap=7, w=8.5):
    out = []
    for y, length in ((-14, 30), (0, 46), (14, 22)):
        edge = -math.sqrt(24 * 24 - y * y)
        end = edge - gap - w / 2
        out.append(stroke([(end - length, y), (end, y)], w))
    return union(*out)


def c3(dark):
    c = colors(dark)
    L = Logo("ke3" + ("d" if dark else ""))
    k = lean(speed_key(), 12)
    lines = lean(speed_lines(), 12)
    dx = -bounds(lines)[0]
    L.add(move(lines, dx, 50), c["accent"])
    L.add(move(k, dx, 50), c["solid"])
    f = Font("Barlow-ExtraBoldItalic.ttf")
    letters, w = word(f, "KEY EXPRESS", cap=40, tracking=0.015)
    x = bounds(move(k, dx, 50))[2] + 22
    for p, fill in runs(letters, [(0, 3, c["ink"]), (4, 11, c["accent"])], x, 70):
        L.add(p, fill)
    return L


def c3_icon():
    L = Logo("ke3i")
    L.add(rect(0, 0, 100, 100, 22), deep(L, "tile"))
    # pointing up and to the right, so the key fills the square
    k = rotate(speed_key(), -40)
    lines = rotate(union(stroke([(-54, -12), (-36, -12)], 8.5), stroke([(-62, 4), (-37, 4)], 8.5)), -40)
    g = union(k, lines)
    gb = bounds(g)
    s = 80 / max(gb[2] - gb[0], gb[3] - gb[1])
    k2 = scale(k, s)
    l2 = scale(lines, s)
    b = bounds(k2, l2)
    dx, dy = 50 - (b[0] + b[2]) / 2, 50 - (b[1] + b[3]) / 2
    L.add(move(l2, dx, dy), SKY)
    L.add(move(k2, dx, dy), WHITE)
    return L


# ---------- 4. Shield: trust and security ----------

SHIELD = "M8 0 H76 Q84 0 84 8 V42 C84 68 66 86 42 96 C18 86 0 68 0 42 V8 Q0 0 8 0 Z"


def shield_key():
    bow = circle(0, 0, 14)
    blade = rect(8, -5.5, 44, 11, 5.5)
    teeth = bitting(26, 48, -5.5, [-8, -4.5, -9])
    k = sub(union(bow, blade, teeth), circle(0, 0, 6))
    return rotate(k, 90)  # bow on top, blade pointing down, teeth on the right


def shield_mark(L, dark):
    sh = svgpath(SHIELD)
    band = Path()
    parse_path(SHIELD, band.getPen())
    band.stroke(14, LineCap.BUTT_CAP, LineJoin.ROUND_JOIN, 4)
    band.convertConicsToQuads()
    inner = sub(sh, simplify(band))
    line = Path()
    inner.draw(line.getPen())
    line.stroke(2.6, LineCap.BUTT_CAP, LineJoin.ROUND_JOIN, 4)
    line.convertConicsToQuads()
    L.add(sh, deep(L, "shield", vertical=True) if not dark else NAVY)
    if dark:
        L.add(sub(sh, svgpath(SHIELD).transform(0.94, 0, 0, 0.94, 2.52, 2.4)), SILVER)
    L.add(simplify(line), SILVER)
    k = place(shield_key(), 42, 47, "mc")
    L.add(k, metal(L))


def c4(dark):
    c = colors(dark)
    L = Logo("ke4" + ("d" if dark else ""))
    shield_mark(L, dark)
    big = Font("Lexend[wght].ttf", wght=760)
    small = Font("Lexend[wght].ttf", wght=600)
    letters, w = word(big, "KEY EXPRESS", cap=32, tracking=0.0)
    for p, fill in runs(letters, [(0, 11, c["ink"])], 104, 48):
        L.add(p, fill)
    tag, _ = tagline(small, "CAR · HOME · BUSINESS", 11.5, w)
    L.add(move(tag, 104, 72), c["accent"])
    return L


def c4_icon():
    L = Logo("ke4i")
    shield_mark(L, False)
    return L


# ---------- 5. Steering-wheel key: car keys, and we drive to you ----------

def wheel_key():
    rim = ring(0, 0, 30, 22)
    spokes = union(
        stroke([(-24, 2), (24, 2)], 8, cap="butt"),
        stroke([(0, 0), (0, 24)], 8, cap="butt"),
    )
    blade = rect(26, -7.5, 64, 15, 4.5)
    teeth = bitting(58, 87, 7.5, [11, 7, 12, 8])
    return union(rim, spokes, blade, teeth)


def wheel_hub():
    return circle(0, 0, 10.5)


def c5(dark):
    c = colors(dark)
    L = Logo("ke5" + ("d" if dark else ""))
    k = rotate(wheel_key(), -16)
    hub = wheel_hub()
    b = bounds(k)
    dx, dy = -b[0], 50 - (b[1] + b[3]) / 2
    L.add(move(k, dx, dy), c["solid"])
    L.add(move(hub, dx, dy), c["accent"])
    f = Font("Saira[wdth,wght].ttf", wdth=112, wght=780)
    letters, w = word(f, "KEY EXPRESS", cap=38, tracking=0.02)
    x = b[2] - b[0] + 20
    for p, fill in runs(letters, [(0, 11, c["ink"])], x, 69):
        L.add(p, fill)
    return L


def c5_icon():
    L = Logo("ke5i")
    L.add(rect(0, 0, 100, 100, 22), NAVY)
    k = rotate(wheel_key(), -40)
    hub = rotate(wheel_hub(), -40)
    s = 78 / max(bounds(k)[2] - bounds(k)[0], bounds(k)[3] - bounds(k)[1])
    k, hub = scale(k, s), scale(hub, s)
    b = bounds(k)
    dx, dy = 50 - (b[0] + b[2]) / 2, 50 - (b[1] + b[3]) / 2
    L.add(move(k, dx, dy), WHITE)
    L.add(move(hub, dx, dy), SKY)
    return L


# ---------- 6. Smart key fob: modern car keys ----------

def fob_parts():
    body = rect(-18, 0, 36, 62, 18)
    buttons = union(circle(0, 16, 5.4), circle(0, 31, 5.4), circle(0, 46, 5.4))
    collar = rect(-9.5, -7, 19, 11, 3)
    blade = rect(-5.5, -48, 11, 44, 4)
    teeth = swap_xy(bitting(-42, -16, 5.5, [6, 10, 5, 9]))
    return body, buttons, collar, union(blade, teeth)


def fob_mark(L, dark, angle=24):
    body, buttons, collar, blade = (rotate(p, angle) for p in fob_parts())
    L.add(blade, NAVY if not dark else metal(L, "blade"))
    L.add(collar, metal(L, "collar") if not dark else SILVER)
    L.add(body, deep(L, "body", vertical=True) if not dark else BLUE)
    L.add(buttons, WHITE)
    return bounds(body, collar, blade)


def c6(dark):
    c = colors(dark)
    L = Logo("ke6" + ("d" if dark else ""))
    b = fob_mark(L, dark)
    # center the fob vertically on y=50
    dy = 50 - (b[1] + b[3]) / 2
    dx = -b[0]
    L.layers = [(move(p, dx, dy), fill) for p, fill in L.layers]
    f = Font("Sora[wght].ttf", wght=760)
    letters, w = word(f, "KEY EXPRESS", cap=36, tracking=0.01)
    x = b[2] - b[0] + 22
    for p, fill in runs(letters, [(0, 3, c["ink"]), (4, 11, c["accent"])], x, 68):
        L.add(p, fill)
    return L


def c6_icon():
    L = Logo("ke6i")
    L.add(rect(0, 0, 100, 100, 22), BLUE)
    body, buttons, collar, blade = (rotate(p, 32) for p in fob_parts())
    allp = union(body, collar, blade)
    s = 80 / (bounds(allp)[3] - bounds(allp)[1])
    b = bounds(scale(allp, s))
    dx, dy = 50 - (b[0] + b[2]) / 2, 50 - (b[1] + b[3]) / 2
    f = lambda p: move(scale(p, s), dx, dy)
    L.add(f(union(blade, collar)), WHITE)
    L.add(f(sub(body, buttons)), WHITE)
    return L


# ---------- 7. Clock with a key for a hand: 24/7 ----------

def clock_parts():
    rim = ring(50, 50, 48, 40.5)
    ticks = []
    for a in (-90, 0, 90, 180):
        t = math.radians(a)
        ticks.append(stroke([(50 + 30 * math.cos(t), 50 + 30 * math.sin(t)), (50 + 35 * math.cos(t), 50 + 35 * math.sin(t))], 5.5))
    # the key: bow on the center, blade pointing to 2 o'clock
    bow = circle(0, 0, 12)
    blade = rect(6, -4.6, 30, 9.2, 2.5)
    teeth = bitting(21, 34, 4.6, [5.5, 3.2, 6])
    key = sub(union(bow, blade, teeth), circle(0, 0, 5))
    key = move(rotate(key, -30), 50, 50)
    t = math.radians(-150)
    hour = stroke([(50 + 15 * math.cos(t), 50 + 15 * math.sin(t)), (50 + 26 * math.cos(t), 50 + 26 * math.sin(t))], 7.5)
    return union(rim, *ticks), hour, key


def c7(dark):
    c = colors(dark)
    L = Logo("ke7" + ("d" if dark else ""))
    face, hour, key = clock_parts()
    L.add(face, c["solid"])
    L.add(hour, c["solid"])
    L.add(key, c["accent"])
    big = Font("RedHatDisplay[wght].ttf", wght=900)
    small = Font("RedHatDisplay[wght].ttf", wght=700)
    letters, w = word(big, "KEY EXPRESS", cap=34, tracking=0.01)
    for p, fill in runs(letters, [(0, 11, c["ink"])], 120, 50):
        L.add(p, fill)
    tag, _ = tagline(small, "24/7 MOBILE LOCKSMITH", 11.5, w)
    L.add(move(tag, 120, 75), c["accent"])
    return L


def c7_icon():
    L = Logo("ke7i")
    face, hour, key = clock_parts()
    L.add(circle(50, 50, 48), WHITE)
    L.add(face, NAVY)
    L.add(hour, NAVY)
    L.add(key, BLUE)
    return L


# ---------- 8. K monogram whose stem is a keyhole ----------

def k_keyhole():
    top, base = 20, 80
    stem = union(circle(35, 35.5, 14.5), poly([(28.5, 36), (41.5, 36), (46, base), (24, base)]))
    band = rect(0, top, 100, base - top)
    up = stroke([(40, 60), (82, 8)], 14.5, cap="butt")
    down = stroke([(48, 50), (82, 92)], 15.5, cap="butt")
    return union(stem, inter(union(up, down), band))


def c8_mark(L):
    L.add(rect(0, 0, 100, 100, 22), NAVY)
    L.add(place(k_keyhole(), 50, 50, "mc"), WHITE)


def c8(dark):
    c = colors(dark)
    L = Logo("ke8" + ("d" if dark else ""))
    if dark:
        L.add(rect(0, 0, 100, 100, 22), WHITE)
        L.add(place(k_keyhole(), 50, 50, "mc"), NAVY)
    else:
        c8_mark(L)
    f = Font("Outfit[wght].ttf", wght=800)
    l1, w1 = word(f, "KEY", cap=40, tracking=0.02)
    l2, w2 = word(f, "EXPRESS", cap=40, tracking=0.02)
    for p, fill in runs(l1, [(0, 3, c["ink"])], 122, 40):
        L.add(p, fill)
    for p, fill in runs(l2, [(0, 7, c["accent"])], 122, 100):
        L.add(p, fill)
    return L


def c8_icon():
    L = Logo("ke8i")
    c8_mark(L)
    return L


# ---------- 9. Wordmark: the X is two crossed keys ----------

def key_x(x0, x1, cap, sw):
    """An X whose \\ stroke is a key (bow top left, teeth near the foot).

    Two keys with rings would read as scissors, so the / stroke stays a letter stroke."""
    band = rect(x0 - 60, -cap, x1 - x0 + 120, cap)
    w = sw * 0.92
    a, b = (x0 + w * 0.55, 0), (x1 - w * 0.55, -cap)
    da = (b[0] - a[0], b[1] - a[1])
    n = math.hypot(*da)
    ext = lambda p, q, k: (q[0] + (q[0] - p[0]) / n * k, q[1] + (q[1] - p[1]) / n * k)
    plain = inter(stroke([ext(b, a, w), ext(a, b, w)], w, cap="butt"), band)

    R = cap * 0.23
    top = (x0 + R * 0.95, -cap + R * 0.95)
    foot = (x1 - w * 0.55, 0)
    dx, dy = foot[0] - top[0], foot[1] - top[1]
    ln = math.hypot(dx, dy)
    tip = (foot[0] + dx / ln * w, foot[1] + dy / ln * w)
    blade = inter(stroke([top, tip], w * 0.94, cap="butt"), band)
    ang = math.degrees(math.atan2(dy, dx))
    t = bitting(ln * 0.5, ln * 0.8, w * 0.47, [w * 0.62, w * 0.36, w * 0.66], slope=0.6)
    t = inter(move(rotate(t, ang), *top), band)
    hole = circle(*top, R - w * 0.52)
    key = sub(union(circle(*top, R), blade, t), hole)
    # a thin gap where the key crosses over the plain stroke
    gap = stroke([top, tip], w * 0.94 + w * 0.36, cap="butt")
    return sub(plain, gap, circle(*top, R + w * 0.18)), key


def c9(dark):
    c = colors(dark)
    L = Logo("ke9" + ("d" if dark else ""))
    f = Font("Archivo[wdth,wght].ttf", wdth=112, wght=850)
    cap = 60
    letters, w = word(f, "KEY EXPRESS", cap=cap, tracking=0.015)
    xb = letters[5].bounds
    stem = Font("Archivo[wdth,wght].ttf", wdth=112, wght=850).text("I", cap=cap)[0].bounds
    sw = stem[2] - stem[0]
    widen = 6
    left = union(*letters[:5])
    right = move(union(*letters[6:]), widen, 0)
    plain, key = key_x(xb[0], xb[2] + widen, cap, sw)
    L.add(move(union(left, plain, right), 0, 60), c["ink"])
    L.add(move(key, 0, 60), c["accent"])
    return L


def c9_icon():
    L = Logo("ke9i")
    L.add(rect(0, 0, 100, 100, 22), NAVY)
    plain, key = key_x(0, 62, 64, 15)
    b = bounds(plain, key)
    dx, dy = 50 - (b[0] + b[2]) / 2, 50 - (b[1] + b[3]) / 2
    L.add(move(plain, dx, dy), WHITE)
    L.add(move(key, dx, dy), SKY)
    return L


# ---------- 10. The name on the blade of a big key ----------

def sign_key(text_w, cap):
    blade_top, blade_bot = 24, 76
    x_blade = 86
    xe = x_blade + 16 + text_w + 18
    bow = circle(44, 50, 44)
    collar = rect(80, 16, 16, 68, 5)
    blade = poly([(x_blade, blade_top), (xe, blade_top), (xe + 20, blade_top + 20), (xe + 20, blade_bot), (x_blade, blade_bot)])
    teeth = bitting(x_blade + (xe - x_blade) * 0.46, xe + 12, blade_bot - 1, [14, 5, 15, 4, 13], slope=1.0)
    k = sub(union(bow, collar, blade, teeth), circle(24, 50, 10.5))
    return k, x_blade + 16


def c10(dark):
    L = Logo("ke10" + ("d" if dark else ""))
    f = Font("BarlowCondensed-ExtraBold.ttf")
    cap = 30
    letters, w = word(f, "KEY EXPRESS", cap=cap, tracking=0.05)
    k, tx = sign_key(w, cap)
    if dark:
        L.add(k, metal(L, "key", horizontal=True))
        L.add(move(union(*letters), tx, 50 + cap / 2), NAVY)
    else:
        L.add(k, L.gradient("key", [(0, BLUE), (1, NAVY)], 0, 0, 1, 1))
        L.add(move(union(*letters), tx, 50 + cap / 2), WHITE)
    return L


def c10_icon():
    L = Logo("ke10i")
    L.add(rect(0, 0, 100, 100, 22), deep(L, "tile"))
    bow = sub(circle(0, 0, 20), circle(-8, 0, 6))
    blade = poly([(14, -9), (62, -9), (72, 1), (72, 9), (14, 9)])
    teeth = bitting(36, 66, 9, [7, 11, 6, 10])
    k = rotate(sub(union(bow, blade, teeth), circle(-8, 0, 6)), 45)
    L.add(place(k, 50, 50, "mc"), WHITE)
    return L


CONCEPTS = [
    ("01-classic", c1, c1_icon),
    ("02-pin", c2, c2_icon),
    ("03-speed", c3, c3_icon),
    ("04-shield", c4, c4_icon),
    ("05-wheel", c5, c5_icon),
    ("06-fob", c6, c6_icon),
    ("07-clock", c7, c7_icon),
    ("08-monogram", c8, c8_icon),
    ("09-crossed-keys", c9, c9_icon),
    ("10-key-sign", c10, c10_icon),
]


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    for name, full, icon in CONCEPTS:
        if only and not any(name.startswith(o) for o in only):
            continue
        with open(os.path.join(OUT, f"{name}.svg"), "w") as fh:
            fh.write(full(False).svg(pad=1))
        with open(os.path.join(OUT, f"{name}-dark.svg"), "w") as fh:
            fh.write(full(True).svg(pad=1))
        with open(os.path.join(OUT, f"{name}-icon.svg"), "w") as fh:
            fh.write(icon().svg(square=True, height=64))
        print("built", name)


if __name__ == "__main__":
    main(sys.argv[1:] or None)
