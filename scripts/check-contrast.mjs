// Checks every text/background color pair the site uses against WCAG AA:
// 4.5:1 for text, 3:1 for borders and focus outlines. Run: npm run check:contrast
const colors = {
  navy: "#0b2545",
  action: "#1e56c7",
  actionHover: "#16439e",
  silver: "#c5ccd6",
  silverSoft: "#e9edf2",
  silverLight: "#f3f5f8",
  white: "#ffffff",
  ink: "#1a202c",
  inkSoft: "#3b4556",
  emergency: "#c62828",
  success: "#1e6b3a",
  error: "#b3261e",
  emergencyRow: "#fdeceb",
};

// [foreground, background, what it is, minimum ratio]
const pairs = [
  ["ink", "white", "body text", 4.5],
  ["ink", "silverLight", "body text on light silver sections", 4.5],
  ["ink", "silver", "body text on the bottom of the brushed-silver gradient", 4.5],
  ["inkSoft", "white", "hints and secondary text", 4.5],
  ["inkSoft", "silverLight", "hints on light silver", 4.5],
  ["navy", "white", "headings", 4.5],
  ["navy", "silverLight", "headings on light silver", 4.5],
  ["navy", "silver", "headings on the brushed-silver gradient", 4.5],
  ["white", "navy", "header bar, footer and dark sections", 4.5],
  ["silverSoft", "navy", "secondary text on dark blue", 4.5],
  ["white", "action", "blue buttons", 4.5],
  ["white", "actionHover", "blue buttons on hover", 4.5],
  ["action", "white", "links and outline buttons", 4.5],
  ["action", "silverLight", "links on light silver", 4.5],
  ["actionHover", "silver", "links on the brushed-silver gradient (globals.css)", 4.5],
  ["actionHover", "white", "links on hover", 4.5],
  ["navy", "silverSoft", "white-button hover on dark blue", 4.5],
  ["white", "emergency", "24/7 Emergency badge", 4.5],
  ["success", "white", "Saved ✓ messages", 4.5],
  ["success", "silverLight", "Shown status chips", 4.5],
  ["error", "white", "error messages", 4.5],
  ["error", "silverLight", "Hidden status chips", 4.5],
  ["ink", "emergencyRow", "emergency requests in the inbox", 4.5],
  ["action", "emergencyRow", "links in emergency requests", 4.5],
  ["inkSoft", "white", "input borders", 3],
  ["action", "white", "focus outline on light backgrounds", 3],
  ["white", "navy", "focus outline on dark backgrounds", 3],
  ["silver", "white", "card borders (decorative, no minimum)", 1],
];

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

let failed = 0;
for (const [fg, bg, what, min] of pairs) {
  const value = ratio(colors[fg], colors[bg]);
  const ok = value >= min;
  if (!ok) failed++;
  console.log(`${ok ? "pass" : "FAIL"}  ${value.toFixed(2).padStart(5)}:1  (needs ${min}:1)  ${fg} on ${bg}: ${what}`);
}
if (failed) {
  console.error(`\n${failed} pair(s) below the minimum.`);
  process.exit(1);
}
console.log("\nAll color pairs meet WCAG AA.");
