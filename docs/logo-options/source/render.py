"""Contact sheet of the logo concepts, rendered by Chromium to PNGs for review."""
import os
import sys

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..")
SHOTS = os.path.join(HERE, "shots")


def row(name):
    light = f"file://{OUT}/{name}.svg"
    dark = f"file://{OUT}/{name}-dark.svg"
    icon = f"file://{OUT}/{name}-icon.svg"
    return f"""
<section>
  <h2>{name}</h2>
  <div class="grid">
    <div class="big"><img src="{light}" style="height:120px"></div>
    <div class="big navy"><img src="{dark}" style="height:120px"></div>
  </div>
  <div class="strip">
    <div class="header"><span class="plate"><img src="{light}" style="height:48px;max-width:240px"></span><span class="nav">Home Services About</span></div>
    <div class="phone"><span class="plate"><img src="{light}" style="height:48px;max-width:180px;object-fit:contain;object-position:left"></span><span class="menu">Menu</span></div>
    <div class="icons"><img src="{icon}" width="64"><img src="{icon}" width="32"><img src="{icon}" width="16">
      <span class="tab"><img src="{icon}" width="16"> Key Express</span></div>
  </div>
</section>"""


def page(names):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:24px;font:14px system-ui;background:#f3f5f8;color:#1a202c}}
section{{background:#fff;border-radius:12px;padding:16px;margin-bottom:20px}}
h2{{margin:0 0 12px;font-size:16px}}
.grid{{display:flex;gap:16px}}
.big{{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;border:1px solid #e9edf2;border-radius:8px;min-height:150px}}
.big img{{max-width:100%}}
.navy{{background:#0b2545}}
.strip{{display:flex;gap:16px;margin-top:16px;align-items:center}}
.header{{background:#0b2545;padding:12px 16px;border-radius:8px;display:flex;align-items:center;gap:24px;width:520px}}
.phone{{background:#0b2545;padding:12px;border-radius:8px;display:flex;align-items:center;justify-content:space-between;width:336px}}
.plate{{background:#fff;border-radius:12px;padding:8px 12px;display:inline-flex}}
.plate img{{display:block;width:auto}}
.nav,.menu{{color:#fff;font-weight:700}}
.icons{{display:flex;gap:14px;align-items:center}}
.tab{{display:inline-flex;gap:6px;align-items:center;background:#dee1e6;padding:6px 10px;border-radius:8px 8px 0 0}}
</style></head><body>{''.join(row(n) for n in names)}</body></html>"""


def main(names):
    os.makedirs(SHOTS, exist_ok=True)
    html = os.path.join(SHOTS, "sheet.html")
    with open(html, "w") as fh:
        fh.write(page(names))
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": 1200, "height": 800}, device_scale_factor=1)
        pg.goto(f"file://{html}")
        pg.wait_for_timeout(300)
        for i, sec in enumerate(pg.query_selector_all("section")):
            sec.screenshot(path=os.path.join(SHOTS, f"{names[i]}.png"))
        b.close()


if __name__ == "__main__":
    all_names = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith(".svg") and not f.endswith(("-dark.svg", "-icon.svg")))
    want = sys.argv[1:]
    main([n for n in all_names if not want or any(n.startswith(w) for w in want)])
