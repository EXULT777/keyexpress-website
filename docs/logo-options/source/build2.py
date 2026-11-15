"""Round two: five Key Express logo directions. Flat colors only, one idea each.

Each makes a horizontal logo (white plate), a reversed one (navy), and a square icon."""
import math
import os
import sys

from lib import *
from build import bitting, runs, swap_xy, tagline, word

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "round-2")


def colors(dark):
    return dict(ink=WHITE, accent=SKY) if dark else dict(ink=NAVY, accent=BLUE)


def centered(p, cx, cy):
    b = p.bounds
    return move(p, cx - (b[0] + b[2]) / 2, cy - (b[1] + b[3]) / 2)


# ---------- A. The e-key: a lowercase e whose crossbar runs out into a key blade ----------

def e_key():
    cx, cy, R, t = 40, 50, 34, 13
    bowl = ring(cx, cy, R, R - t)
    # the e's opening, low on the right, between the bar and the end of the bowl
    a0, a1 = math.radians(10), math.radians(48)
    far = R + 20
    wedge = poly([(cx, cy), (cx + far * math.cos(a0), cy + far * math.sin(a0)),
                  (cx + far * 1.4, cy + far * 0.8), (cx + far * math.cos(a1), cy + far * math.sin(a1))])
    bowl = sub(bowl, wedge)
    bar_top, bar_bot = cy - 8, cy + 5
    blade = poly([(cx - R + t - 1, bar_top), (cx + 64, bar_top), (cx + 72, bar_top + 6),
                  (cx + 72, bar_bot), (cx - R + t - 1, bar_bot)])
    teeth = bitting(cx + 42, cx + 70, bar_bot - 1, [11, 6, 12], slope=0.8)
    return union(bowl, blade, teeth)


def a_logo(dark):
    c = colors(dark)
    L = Logo("kea" + ("d" if dark else ""))
    mark = centered(e_key(), 56, 50)
    L.add(mark, c["accent"])
    f = Font("PlusJakartaSans[wght].ttf", wght=800)
    letters, w = word(f, "key express", cap=46, tracking=-0.01)
    x = mark.bounds[2] + 20
    for p, fill in runs(letters, [(0, 11, c["ink"])], x, 66):
        L.add(p, fill)
    return L


def a_icon():
    L = Logo("keai")
    L.add(rect(0, 0, 100, 100, 24), BLUE)
    L.add(centered(scale(e_key(), 0.78), 52, 50), WHITE)
    return L


# ---------- B. Speed keyhole: a forward-leaning keyhole cut by speed lines ----------

def keyhole_solid():
    head = circle(50, 31, 23)
    body = poly([(39, 40), (61, 40), (72, 104), (28, 104)])
    k = union(head, body)
    cuts = union(rect(-20, 66, 140, 6), rect(-20, 83, 140, 6))
    return sub(k, cuts)


def b_mark():
    k = lean(keyhole_solid(), 13, cy=60)
    # speed lines continue the cuts out to the left
    lines = union(rect(-34, 63, 40, 7, 3.5), rect(-22, 81, 30, 7, 3.5), rect(-28, 45, 26, 7, 3.5))
    lines = lean(lines, 13, cy=60)
    return k, lines


def b_logo(dark):
    c = colors(dark)
    L = Logo("keb" + ("d" if dark else ""))
    k, lines = b_mark()
    L.add(k, c["accent"])
    f = Font("Archivo-Italic[wdth,wght].ttf", wdth=108, wght=860)
    letters, w = word(f, "KEY EXPRESS", cap=50, tracking=-0.005)
    x = k.bounds[2] + 18
    for p, fill in runs(letters, [(0, 11, c["ink"])], x, 92):
        L.add(p, fill)
    return L


def b_icon():
    L = Logo("kebi")
    L.add(rect(0, 0, 100, 100, 24), NAVY)
    k, _ = b_mark()
    L.add(centered(scale(k, 0.72), 50, 50), SKY)
    return L


# ---------- C. Unlocked: an open padlock, the moment the job is done ----------

def padlock(open_lift=15):
    body = rect(0, 44, 66, 54, 13)
    hole = union(circle(33, 64, 7), poly([(29.5, 66), (36.5, 66), (38.5, 82), (27.5, 82)]))
    body = sub(body, hole)
    # shackle: a U, lifted, with its left leg out of the body
    w = 11
    lx, rx, top = 17, 49, 10
    pts = []
    pts.append((lx, 34 - open_lift))
    for i in range(0, 33):
        a = math.pi - math.pi * i / 32
        pts.append((33 + 16 * math.cos(a), top + 16 - 16 * math.sin(a) - open_lift))
    pts.append((rx, 52))
    shackle = stroke(pts, w, cap="butt", join="round")
    shackle = sub(shackle, rect(-10, 44, 90, 60))  # stops at the body's top edge
    return body, shackle


def c_logo(dark):
    c = colors(dark)
    L = Logo("kec" + ("d" if dark else ""))
    body, shackle = padlock()
    L.add(shackle, c["accent"])
    L.add(body, c["ink"])
    big = Font("Manrope[wght].ttf", wght=800)
    small = Font("Manrope[wght].ttf", wght=700)
    letters, w = word(big, "Key Express", cap=40, tracking=-0.015)
    x = 86
    for p, fill in runs(letters, [(0, 11, c["ink"])], x, 62):
        L.add(p, fill)
    tag, _ = tagline(small, "MOBILE LOCKSMITH  ·  24/7", 11.5, w)
    L.add(move(tag, x, 90), c["accent"])
    return L


def c_icon():
    L = Logo("keci")
    L.add(rect(0, 0, 100, 100, 24), NAVY)
    body, shackle = padlock()
    g = union(body, shackle)
    s = 70 / (g.bounds[3] - g.bounds[1])
    b = scale(g, s).bounds
    dx, dy = 50 - (b[0] + b[2]) / 2, 50 - (b[1] + b[3]) / 2
    L.add(move(scale(shackle, s), dx, dy), SKY)
    L.add(move(scale(body, s), dx, dy), WHITE)
    return L


# ---------- D. Badge: a round trade seal for the van, shirts and cards ----------

def arc_text(font, s, cap, r, cx, cy, where="top", tracking=0.08):
    gs, _ = font.glyphs(s, cap=cap, tracking=tracking)
    xs = []
    for g in gs:
        b = g.bounds if list(g.segments) else None
        xs.append(b)
    real = [b for b in xs if b]
    x0, x1 = real[0][0], real[-1][2]
    total = x1 - x0
    out = Path()
    for g, b in zip(gs, xs):
        if not b:
            continue
        gc = (b[0] + b[2]) / 2
        t = (gc - x0 - total / 2) / r
        local = move(g, -gc, 0)
        if where == "top":
            p = rotate(local, math.degrees(t))
            p = move(p, cx + r * math.sin(t), cy - r * math.cos(t))
        else:
            p = rotate(local, -math.degrees(t))
            p = move(p, cx + r * math.sin(t), cy + r * math.cos(t))
        out = union(out, p)
    return out


def badge_key():
    bow = circle(0, 0, 15)
    blade = rect(9, -5.5, 46, 11, 2.5)
    teeth = bitting(30, 52, 5.5, [8, 4.5, 9], slope=0.7)
    return sub(union(bow, blade, teeth), circle(0, 0, 6.5))


def badge(dark=False):
    cx = cy = 100
    disc = circle(cx, cy, 100)
    line = ring(cx, cy, 91, 88.5)
    inner = circle(cx, cy, 58)
    f = Font("BarlowSemiCondensed-ExtraBold.ttf")
    g = Font("BarlowSemiCondensed-SemiBold.ttf")
    top = arc_text(f, "KEY EXPRESS", 17, 67, cx, cy, "top", tracking=0.06)
    bottom = arc_text(g, "MOBILE LOCKSMITH", 11, 79, cx, cy, "bottom", tracking=0.1)
    dots = union(circle(cx - 74, cy, 3.2), circle(cx + 74, cy, 3.2))
    key = centered(rotate(badge_key(), -45), cx, cy - 6)
    t247 = Font("BarlowSemiCondensed-ExtraBold.ttf").text("24/7", cap=13, tracking=0.06)[0]
    t247 = centered(t247, cx, cy + 34)
    return disc, line, inner, top, bottom, dots, key, t247


def d_mark(L, dark):
    disc, line, inner, top, bottom, dots, key, t247 = badge()
    ink = WHITE if dark else NAVY
    L.add(sub(disc, line, top, bottom, dots, inner), ink if not dark else NAVY)
    if dark:
        L.add(union(line, top, bottom, dots), WHITE)
        L.add(sub(inner, key, t247), BLUE)
        L.add(union(key, t247), WHITE)
    else:
        L.add(sub(inner, key, t247), BLUE)


def d_logo(dark):
    c = colors(dark)
    L = Logo("ked" + ("d" if dark else ""))
    d_mark(L, dark)
    if dark:
        # on navy the badge needs a light edge to stand apart
        L.layers.insert(0, (ring(100, 100, 100, 96.5), SILVER))
    f = Font("BarlowSemiCondensed-ExtraBold.ttf")
    g = Font("BarlowSemiCondensed-SemiBold.ttf")
    letters, w = word(f, "KEY EXPRESS", cap=64, tracking=0.03)
    for p, fill in runs(letters, [(0, 11, c["ink"])], 232, 104):
        L.add(p, fill)
    tag, _ = tagline(g, "MOBILE LOCKSMITH · 24/7", 22, w)
    L.add(move(tag, 232, 150), c["accent"])
    return L


def d_icon():
    # the seal's lettering is unreadable at icon size, so the icon keeps only its center
    L = Logo("kedi")
    L.add(sub(circle(50, 50, 50), circle(50, 50, 41)), NAVY)
    L.add(sub(circle(50, 50, 41), centered(scale(rotate(badge_key(), -45), 1.05), 50, 50)), BLUE)
    return L


# ---------- E. One-line wordmark: the y's tail becomes a key under "Express" ----------

def e_logo(dark):
    c = colors(dark)
    L = Logo("kee" + ("d" if dark else ""))
    f = Font("Figtree[wght].ttf", wght=860)
    cap = 60
    letters, w = word(f, "Key Express", cap=cap, tracking=-0.012)
    y = letters[2]
    yb = y.bounds
    # the descender's foot: where the y's tail ends below the baseline
    foot = inter(y, rect(yb[0] - 5, yb[3] - 3, yb[2] - yb[0] + 10, 4))
    fb = foot.bounds
    mid = inter(y, rect(yb[0] - 5, yb[3] * 0.5, yb[2] - yb[0] + 10, 2)).bounds
    th = (mid[2] - mid[0]) * 0.72
    end_x = w + 2
    bottom = yb[3]
    blade = poly([(fb[0] + 2, bottom - th), (end_x - 9, bottom - th), (end_x, bottom - th + 7),
                  (end_x, bottom), (fb[0] + 2, bottom)])
    teeth = bitting(end_x - 50, end_x - 4, bottom - 1, [12, 4, 13], slope=1.0)
    # the p's descender crosses the blade: give it a small gap so it reads as a crossing
    p = letters[6]
    halo = Path()
    p.draw(halo.getPen())
    halo.stroke(7, LineCap.ROUND_CAP, LineJoin.ROUND_JOIN, 4)
    halo.convertConicsToQuads()
    halo = union(simplify(halo), p)
    L.add(union(*letters), c["ink"])
    L.add(sub(union(blade, teeth), y, halo), c["accent"])
    return L


def e_icon():
    L = Logo("keei")
    L.add(rect(0, 0, 100, 100, 24), NAVY)
    f = Font("Figtree[wght].ttf", wght=860)
    k, _ = f.text("K", cap=54)
    L.add(centered(k, 47, 44), WHITE)
    bar = poly([(22, 74), (70, 74), (78, 79.5), (78, 82), (22, 82)])
    teeth = bitting(50, 76, 81, [6, 3.5, 7, 4], slope=0.85)
    L.add(union(bar, teeth), SKY)
    return L


CONCEPTS = [
    ("A-e-key", a_logo, a_icon),
    ("B-speed-keyhole", b_logo, b_icon),
    ("C-unlocked", c_logo, c_icon),
    ("D-badge", d_logo, d_icon),
    ("E-key-tail", e_logo, e_icon),
]


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    for name, full, icon in CONCEPTS:
        if only and not any(name.startswith(o) for o in only):
            continue
        for suffix, svg in (("", full(False).svg(pad=1)), ("-dark", full(True).svg(pad=1)),
                            ("-icon", icon().svg(square=True, height=64))):
            with open(os.path.join(OUT, f"{name}{suffix}.svg"), "w") as fh:
                fh.write(svg)
        print("built", name)


if __name__ == "__main__":
    main(sys.argv[1:] or None)


def d_seal():
    """The seal on its own, for large decorative use (the home page hero)."""
    L = Logo("keds")
    d_mark(L, False)
    return L


if __name__ == "__main__" and "seal" in sys.argv:
    with open(os.path.join(OUT, "D-badge-seal.svg"), "w") as fh:
        fh.write(d_seal().svg(height=200))


def d_seal_logo():
    """The site logo: the seal alone, with a silver rim so it holds its edge on the
    navy header as well as on white."""
    L = Logo("kesl")
    d_mark(L, True)
    L.add(ring(100, 100, 100, 96.5), SILVER)
    return L


if __name__ == "__main__" and "seal" in sys.argv:
    with open(os.path.join(OUT, "D-badge-seal-logo.svg"), "w") as fh:
        fh.write(d_seal_logo().svg(height=64))
