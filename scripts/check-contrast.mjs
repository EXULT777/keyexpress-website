// Checks every text/background color pair the site uses against WCAG AA:
// 4.5:1 for text, 3:1 for borders and focus outlines. Run: npm run check:contrast
const colors = {
  // Color Hunt palette 14279B · 3D56B2 · 5C7AEA · E6E6E6, plus shades of it
  royal: "#14279b",
  action: "#3d56b2",
  periwinkle: "#5c7aea",
  silverLight: "#e6e6e6",
  navy: "#0b1650",
  navyDeep: "#081040",
  sky: "#9fb1f5",
  silver: "#d3d7e6",
  silverSoft: "#edeff7",
  white: "#ffffff",
  ink: "#1b1f3b",
  inkSoft: "#4a5070",
  emergency: "#c62828",
  success: "#1e6b3a",
  error: "#b3261e",
  emergencyRow: "#fdeceb",
};

// [foreground, background, what it is, minimum ratio]
const pairs = [
  ["ink", "white", "body text", 4.5],
  ["ink", "silverLight", "body text on the grey sections", 4.5],
  ["inkSoft", "white", "hints and secondary text", 4.5],
  ["inkSoft", "silverLight", "hints on the grey sections", 4.5],
  ["royal", "white", "headings", 4.5],
  ["royal", "silverLight", "headings on the grey sections", 4.5],
  ["white", "navy", "header, footer and dark bands", 4.5],
  ["white", "royal", "white text where the top-section gradient reaches royal", 4.5],
  ["white", "navyDeep", "top bar and footer", 4.5],
  ["silverSoft", "navy", "secondary text on navy", 4.5],
  ["sky", "navy", "phone icons, hovers and the current menu item on navy", 4.5],
  ["sky", "royal", "phone icons where the gradient reaches royal", 4.5],
  ["sky", "navyDeep", "phone icons in the footer", 4.5],
  ["white", "action", "blue buttons and the light end of the call gradient", 4.5],
  ["white", "royal", "the dark end of the call gradient, and button hovers", 4.5],
  ["royal", "white", "white call buttons on navy", 4.5],
  ["royal", "silverSoft", "white call buttons on hover", 4.5],
  ["action", "white", "links and outline buttons", 4.5],
  ["action", "silverLight", "links on the grey sections", 4.5],
  ["royal", "white", "links on hover", 4.5],
  ["periwinkle", "white", "card accent lines and icons (graphics need 3:1)", 3],
  ["navy", "silverSoft", "town names, the emergency checkbox and FAQ questions on hover", 4.5],
  ["ink", "silverSoft", "the emergency checkbox's note", 4.5],
  ["action", "silverSoft", "the phone link in the emergency checkbox's note", 4.5],
  ["action", "silverSoft", "phone badges on Service tiles, FAQ arrows and Contact page icons (graphics need 3:1)", 3],
  ["royal", "silverSoft", "the key fob block's heading", 4.5],
  ["silverSoft", "navyDeep", "the copyright line in the footer", 4.5],
  ["inkSoft", "white", "Open 24/7 in the phone menu", 4.5],
  ["white", "emergency", "24/7 Emergency badge", 4.5],
  ["success", "white", "Saved ✓ messages", 4.5],
  ["success", "silverLight", "Shown status chips", 4.5],
  ["error", "white", "error messages", 4.5],
  ["error", "silverLight", "Hidden status chips", 4.5],
  ["ink", "emergencyRow", "emergency requests in the inbox", 4.5],
  ["royal", "emergencyRow", "links in the inbox, including emergency requests (inbox.tsx)", 4.5],
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
