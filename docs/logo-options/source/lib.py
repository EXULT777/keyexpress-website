"""Small vector toolkit for the Key Express logo concepts.

Shapes are skia-pathops Paths (exact boolean ops), text is shaped with HarfBuzz
and turned into outlines, so every logo is plain <path> elements that render the
same everywhere (the site loads the logo through <img>, which can't use web fonts).
"""
import math
import os

import pathops
import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.svgLib.path import parse_path
from pathops import LineCap, LineJoin, Path, PathOp

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts") + "/"
ATKINSON = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "..", "src", "fonts", "atkinson-hyperlegible-next-extrabold.ttf")

NAVY = "#0b2545"
BLUE = "#1e56c7"
BLUE_DARK = "#16439e"
SILVER = "#c5ccd6"
SILVER_SOFT = "#e9edf2"
WHITE = "#ffffff"
# Accent for navy backgrounds: #1e56c7 is only 2.4:1 on navy, this is 6.6:1.
SKY = "#7fa8ff"

KAPPA = 0.5522847498


# ---------- shapes ----------

def svgpath(d):
    p = Path()
    parse_path(d, p.getPen())
    return simplify(p)


def circle(cx, cy, r):
    k = KAPPA * r
    p = Path()
    p.moveTo(cx + r, cy)
    p.cubicTo(cx + r, cy + k, cx + k, cy + r, cx, cy + r)
    p.cubicTo(cx - k, cy + r, cx - r, cy + k, cx - r, cy)
    p.cubicTo(cx - r, cy - k, cx - k, cy - r, cx, cy - r)
    p.cubicTo(cx + k, cy - r, cx + r, cy - k, cx + r, cy)
    p.close()
    return p


def rect(x, y, w, h, r=0.0):
    r = min(r, w / 2, h / 2)
    if r <= 0:
        return poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])
    k = KAPPA * r
    p = Path()
    p.moveTo(x + r, y)
    p.lineTo(x + w - r, y)
    p.cubicTo(x + w - r + k, y, x + w, y + r - k, x + w, y + r)
    p.lineTo(x + w, y + h - r)
    p.cubicTo(x + w, y + h - r + k, x + w - r + k, y + h, x + w - r, y + h)
    p.lineTo(x + r, y + h)
    p.cubicTo(x + r - k, y + h, x, y + h - r + k, x, y + h - r)
    p.lineTo(x, y + r)
    p.cubicTo(x, y + r - k, x + r - k, y, x + r, y)
    p.close()
    return p


def poly(pts):
    p = Path()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    p.close()
    return p


_CAPS = {"round": LineCap.ROUND_CAP, "butt": LineCap.BUTT_CAP, "square": LineCap.SQUARE_CAP}
_JOINS = {"round": LineJoin.ROUND_JOIN, "miter": LineJoin.MITER_JOIN, "bevel": LineJoin.BEVEL_JOIN}


def stroke(pts, width, cap="round", join="round", closed=False):
    p = Path()
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    if closed:
        p.close()
    p.stroke(width, _CAPS[cap], _JOINS[join], 4)
    p.convertConicsToQuads()
    return simplify(p)


def ring(cx, cy, r_out, r_in):
    return sub(circle(cx, cy, r_out), circle(cx, cy, r_in))


def simplify(p):
    return pathops.simplify(p)


def union(*paths):
    out = Path()
    for p in paths:
        out = pathops.op(out, p, PathOp.UNION)
    return out


def sub(a, *bs):
    for b in bs:
        a = pathops.op(a, b, PathOp.DIFFERENCE)
    return a


def inter(a, b):
    return pathops.op(a, b, PathOp.INTERSECTION)


def affine(p, a=1, b=0, c=0, d=1, e=0, f=0):
    """SVG matrix(a b c d e f): x' = a x + c y + e, y' = b x + d y + f."""
    return p.transform(a, b, c, d, e, f)


def move(p, dx, dy):
    return affine(p, 1, 0, 0, 1, dx, dy)


def scale(p, s, sy=None, cx=0.0, cy=0.0):
    sy = s if sy is None else sy
    return affine(p, s, 0, 0, sy, cx - s * cx, cy - sy * cy)


def rotate(p, deg, cx=0.0, cy=0.0):
    t = math.radians(deg)  # positive = clockwise on screen (y points down)
    co, si = math.cos(t), math.sin(t)
    return affine(p, co, si, -si, co, cx - co * cx + si * cy, cy - si * cx - co * cy)


def lean(p, deg, cy=0.0):
    """Slant forward like italics: higher points move right."""
    t = math.tan(math.radians(deg))
    return affine(p, 1, 0, -t, 1, t * cy, 0)


def bounds(*paths):
    bs = [p.bounds for p in paths if list(p.segments)]
    return (min(b[0] for b in bs), min(b[1] for b in bs), max(b[2] for b in bs), max(b[3] for b in bs))


def place(p, x, y, anchor="tl"):
    """Move p so its bounding box's anchor (t/m/b + l/c/r) lands on (x, y)."""
    x0, y0, x1, y1 = p.bounds
    ax = {"l": x0, "c": (x0 + x1) / 2, "r": x1}[anchor[1]]
    ay = {"t": y0, "m": (y0 + y1) / 2, "b": y1}[anchor[0]]
    return move(p, x - ax, y - ay)


# ---------- text ----------

class Font:
    def __init__(self, file, **variations):
        path = file if file.startswith("/") else FONTS + file
        self.face = hb.Face(hb.Blob.from_file_path(path))
        self.hb = hb.Font(self.face)
        if variations:
            self.hb.set_variations(variations)
        self.upem = self.face.upem

    def glyphs(self, s, cap=None, size=None, tracking=0.0, slant=0.0):
        """Per-letter outlines of s with the baseline at y=0, starting at x=0.

        Give the cap height (`cap`, measured on "H") or the font size. `tracking`
        is extra space between letters in em. Returns ([path per letter], advance)."""
        if size is None:
            size = cap / self.cap_ratio()
        sc = size / self.upem
        buf = hb.Buffer()
        buf.add_str(s)
        buf.guess_segment_properties()
        hb.shape(self.hb, buf, {"kern": True, "liga": False})
        t = math.tan(math.radians(slant))
        out = []
        x = 0.0
        n = len(buf.glyph_infos)
        for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
            g = Path()
            ox = (x + pos.x_offset) * sc
            pen = TransformPen(g.getPen(), (sc, 0, sc * t, -sc, ox, -pos.y_offset * sc))
            self.hb.draw_glyph_with_pen(info.codepoint, pen)
            out.append(simplify(g))
            x += pos.x_advance
            if i < n - 1:
                x += tracking * self.upem
        return out, x * sc

    def text(self, s, **kw):
        gs, adv = self.glyphs(s, **kw)
        return union(*gs), adv

    def cap_ratio(self):
        g = Path()
        gid = self.hb.get_nominal_glyph(ord("H"))
        self.hb.draw_glyph_with_pen(gid, g.getPen())
        return g.bounds[3] / self.upem

    def fit(self, s, width, cap):
        """Tracking that makes the ink of s exactly `width` wide at cap height `cap`."""
        p, _ = self.text(s, cap=cap, tracking=0)
        size = cap / self.cap_ratio()
        gaps = max(len(s) - 1, 1)
        return (width - ink_width(p)) / gaps / size


def ink_width(p):
    b = p.bounds
    return b[2] - b[0]


# ---------- svg ----------

def fmt(v):
    s = f"{v:.2f}".rstrip("0").rstrip(".")
    return "0" if s in ("-0", "") else s


def d_of(p):
    pen = SVGPathPen(None, ntos=fmt)
    p.draw(pen)
    return pen.getCommands()


class Logo:
    """Layers of (path, fill); fill is a color or 'url(#id)' of a gradient in defs."""

    def __init__(self, ns):
        self.ns = ns  # id prefix, so several logos can share one page
        self.layers = []
        self.defs = []

    def add(self, path, fill):
        if list(path.segments):
            self.layers.append((path, fill))
        return self

    def gradient(self, name, stops, x1=0, y1=0, x2=1, y2=1):
        gid = f"{self.ns}-{name}"
        st = "".join(f'<stop offset="{fmt(o)}" stop-color="{c}"/>' for o, c in stops)
        self.defs.append(
            f'<linearGradient id="{gid}" x1="{fmt(x1)}" y1="{fmt(y1)}" x2="{fmt(x2)}" y2="{fmt(y2)}">{st}</linearGradient>'
        )
        return f"url(#{gid})"

    def svg(self, title="Key Express", pad=0.0, square=False, height=64):
        x0, y0, x1, y1 = bounds(*(p for p, _ in self.layers))
        x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
        w, h = x1 - x0, y1 - y0
        if square and w != h:
            s = max(w, h)
            x0 -= (s - w) / 2
            y0 -= (s - h) / 2
            w = h = s
        out_h = height
        out_w = round(height * w / h)
        tid = f"{self.ns}-t"
        parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{fmt(x0)} {fmt(y0)} {fmt(w)} {fmt(h)}" '
            f'width="{out_w}" height="{out_h}" role="img" aria-labelledby="{tid}">',
            f'<title id="{tid}">{title}</title>',
        ]
        if self.defs:
            parts.append("<defs>" + "".join(self.defs) + "</defs>")
        # Merge consecutive layers with the same fill into one path element.
        merged = []
        for p, fill in self.layers:
            if merged and merged[-1][1] == fill:
                merged[-1] = (union(merged[-1][0], p), fill)
            else:
                merged.append((p, fill))
        for p, fill in merged:
            parts.append(f'<path fill="{fill}" d="{d_of(p)}"/>')
        parts.append("</svg>")
        return "\n".join(parts) + "\n"
