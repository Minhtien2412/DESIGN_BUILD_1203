const fs = require("fs");
const path = require("path");

const f = path.join(
  __dirname,
  "..",
  "app",
  "services",
  "interior-design-ai.tsx",
);
let c = fs.readFileSync(f, "utf8");

// Map color property names
c = c.replace(/colors\.textMuted/g, "colors.textSecondary");
c = c.replace(/colors\.background(?!Color)/g, "colors.bg");

// Replace color="#fff" -> color={colors.textInverse}
c = c.replace(/color="#fff"/g, "color={colors.textInverse}");
// Replace ? "#fff" : -> ? colors.textInverse :
c = c.replace(/\? "#fff" :/g, "? colors.textInverse :");

// Replace "#8B5A2B" in JSX UI contexts -> ACCENT
// But keep in: const ACCENT = "..." and data array color: "..."
const lines = c.split("\n");
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Skip the ACCENT constant definition
  if (line.includes("const ACCENT =")) continue;
  // Skip data arrays (INTERIOR_STYLES color field)
  if (line.match(/color:\s*"#/)) continue;
  // Replace remaining "#8B5A2B"
  if (line.includes('"#8B5A2B"')) {
    lines[i] = line.replace(/"#8B5A2B"/g, "ACCENT");
  }
  // Replace gradient "#6B4423"
  if (line.includes('"#6B4423"')) {
    lines[i] = lines[i].replace(/"#6B4423"/g, "ACCENT_DARK");
  }
}
c = lines.join("\n");

// Fix JSX prop syntax: color=ACCENT -> color={ACCENT}
c = c.replace(/activeColor=ACCENT/g, "activeColor={ACCENT}");
c = c.replace(/color=ACCENT(?!\s*\})/g, "color={ACCENT}");

fs.writeFileSync(f, c, "utf8");

// Report stats
const ssCount = (c.match(/StyleSheet/g) || []).length;
const fffCount = (c.match(/"#fff"/g) || []).length;
const textMuted = (c.match(/colors\.textMuted/g) || []).length;
const accent = (c.match(/"#8B5A2B"/g) || []).length;
const useDS = (c.match(/useDS/g) || []).length;
console.log(
  `StyleSheet: ${ssCount}, "#fff": ${fffCount}, textMuted: ${textMuted}, "#8B5A2B": ${accent}, useDS: ${useDS}`,
);
console.log(`Lines: ${lines.length}`);
