const fs = require("fs");
const FILE =
  "c:\\tien\\New folder\\APP_DESIGN_BUILD05.12.2025\\app\\services\\permit-ai.tsx";
let c = fs.readFileSync(FILE, "utf8");

// ========== 1. IMPORTS ==========
c = c.replace(
  "import { useColors } from '@/hooks/use-colors';",
  "import { useDS } from '@/hooks/useDS';",
);
c = c.replace(/    Dimensions,\n/, "");
c = c.replace(/    StyleSheet,\n/, "");

// ========== 2. CONSTANTS ==========
c = c.replace(
  "const { width } = Dimensions.get('window');",
  "const ACCENT = '#059669';\nconst ACCENT_DARK = '#047857';",
);

// ========== 3. HOOK ==========
c = c.replace(
  "const colors = useColors();",
  "const { colors, spacing, radius, screen } = useDS();",
);

// ========== 4. COLOR PROPERTY RENAMES ==========
c = c.replace(/colors\.textMuted/g, "colors.textSecondary");
c = c.replace(/colors\.background/g, "colors.bg");

// ========== 5. HEX → ACCENT (JSX props first, then style objects) ==========
// JSX attr: prop="#059669" → prop={ACCENT}
c = c.replace(/=["']#059669["']/g, "={ACCENT}");
// Style objects: '#059669' → ACCENT (skip const def lines)
let lines = c.split("\n");
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const ACCENT ")) continue;
  if (lines[i].includes("const ACCENT_DARK ")) continue;
  lines[i] = lines[i].replace(/['"]#059669['"]/g, "ACCENT");
  lines[i] = lines[i].replace(/['"]#047857['"]/g, "ACCENT_DARK");
}
c = lines.join("\n");

// ========== 6. HEX → colors.textInverse (#fff) ==========
// JSX attr: color="#fff" → color={colors.textInverse}
c = c.replace(/=["']#fff["']/g, "={colors.textInverse}");
// Ternary: ? '#fff' : → ? colors.textInverse :
c = c.replace(/\? ['"]#fff['"] :/g, "? colors.textInverse :");

// ========== 7. WARNING COLORS ==========
// JSX attr: color="#D97706" → color={colors.warning}
c = c.replace(/=["']#D97706["']/g, "={colors.warning}");
// Style objects in JSX (where colors is available):
c = c.replace(/['"]#FEF3C7['"]/g, "colors.warningBg");
c = c.replace(/['"]#92400E['"]/g, "colors.warning");

// ========== 8. STYLESHEET → PLAIN OBJECT ==========
c = c.replace("const styles = StyleSheet.create({", "const styles = {");
c = c.replace(/\}\);\s*$/, "};");

// ========== 9. DIMENSION WIDTH → PERCENTAGE ==========
c = c.replace("width: (width - 44) / 2,", 'width: "47%" as unknown as number,');

// ========== 10. BORDERTOPCOLOR ==========
// Remove from module styles
c = c.replace(/    borderTopColor: 'rgba\(0,0,0,0\.1\)',\n/, "");
// Add inline in JSX
c = c.replace(
  "styles.inputContainer, { backgroundColor: colors.card }",
  "styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.divider }",
);

// ========== WRITE & VERIFY ==========
fs.writeFileSync(FILE, c, "utf8");

const v = fs.readFileSync(FILE, "utf8");
console.log("=== PERMIT-AI STATS ===");
console.log("Lines:", v.split("\n").length);
console.log("StyleSheet:", (v.match(/StyleSheet/g) || []).length);
console.log("useColors:", (v.match(/useColors/g) || []).length);
console.log("Dimensions:", (v.match(/Dimensions/g) || []).length);
console.log("textMuted:", (v.match(/textMuted/g) || []).length);
console.log("useDS:", (v.match(/useDS/g) || []).length);
console.log("ACCENT:", (v.match(/\bACCENT\b/g) || []).length);
console.log("textSecondary:", (v.match(/textSecondary/g) || []).length);
console.log("colors.bg:", (v.match(/colors\.bg\b/g) || []).length);
console.log("#059669:", (v.match(/#059669/g) || []).length);
console.log("#047857:", (v.match(/#047857/g) || []).length);
console.log("#fff:", (v.match(/#fff/gi) || []).length);
console.log("#FEF3C7:", (v.match(/#FEF3C7/g) || []).length);
console.log("#92400E:", (v.match(/#92400E/g) || []).length);
console.log("#D97706:", (v.match(/#D97706/g) || []).length);
console.log("#DC2626:", (v.match(/#DC2626/g) || []).length);
const hexes = [...v.matchAll(/(#[0-9A-Fa-f]{3,8})/g)];
console.log("Total hex:", hexes.length);
console.log("borderTopColor:", (v.match(/borderTopColor/g) || []).length);
