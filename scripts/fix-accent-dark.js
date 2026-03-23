const fs = require("fs");
const f =
  "c:\\tien\\New folder\\APP_DESIGN_BUILD05.12.2025\\app\\services\\interior-design-ai.tsx";
let c = fs.readFileSync(f, "utf8");
c = c.replace(
  "const ACCENT_DARK = ACCENT_DARK;",
  'const ACCENT_DARK = "#6B4423";',
);
fs.writeFileSync(f, c, "utf8");
const lines = fs.readFileSync(f, "utf8").split("\n");
console.log("Line 33:", lines[32]);
