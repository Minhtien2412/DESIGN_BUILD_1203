/**
 * Script to analyze and help fix deprecated shadow styles
 * Run: npx ts-node scripts/fix-shadow-styles.ts
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Patterns to find deprecated shadow styles
const DEPRECATED_PATTERNS = [
  /shadowColor\s*:/g,
  /shadowOffset\s*:/g,
  /shadowOpacity\s*:/g,
  /shadowRadius\s*:/g,
  /textShadowColor\s*:/g,
  /textShadowOffset\s*:/g,
  /textShadowRadius\s*:/g,
];

interface FileAnalysis {
  file: string;
  hasShadow: boolean;
  hasTextShadow: boolean;
  shadowCount: number;
  textShadowCount: number;
}

function analyzeFile(filePath: string): FileAnalysis | null {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    let shadowCount = 0;
    let textShadowCount = 0;

    // Count shadow occurrences
    const shadowColorMatches = content.match(/shadowColor\s*:/g) || [];
    const shadowOffsetMatches = content.match(/shadowOffset\s*:/g) || [];
    const shadowOpacityMatches = content.match(/shadowOpacity\s*:/g) || [];
    const shadowRadiusMatches = content.match(/shadowRadius\s*:/g) || [];

    shadowCount = shadowColorMatches.length;

    // Count text shadow occurrences
    const textShadowColorMatches = content.match(/textShadowColor\s*:/g) || [];
    const textShadowOffsetMatches =
      content.match(/textShadowOffset\s*:/g) || [];
    const textShadowRadiusMatches =
      content.match(/textShadowRadius\s*:/g) || [];

    textShadowCount = textShadowColorMatches.length;

    if (shadowCount === 0 && textShadowCount === 0) {
      return null;
    }

    return {
      file: filePath,
      hasShadow: shadowCount > 0,
      hasTextShadow: textShadowCount > 0,
      shadowCount,
      textShadowCount,
    };
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

function main() {
  console.log("🔍 Analyzing deprecated shadow styles...\n");

  const componentsDir = path.join(__dirname, "..", "components");
  const appDir = path.join(__dirname, "..", "app");

  const files = [
    ...glob.sync(`${componentsDir}/**/*.tsx`),
    ...glob.sync(`${componentsDir}/**/*.ts`),
    ...glob.sync(`${appDir}/**/*.tsx`),
    ...glob.sync(`${appDir}/**/*.ts`),
  ];

  const results: FileAnalysis[] = [];

  files.forEach((file: string) => {
    const analysis = analyzeFile(file);
    if (analysis) {
      results.push(analysis);
    }
  });

  // Sort by total count
  results.sort(
    (a, b) =>
      b.shadowCount + b.textShadowCount - (a.shadowCount + a.textShadowCount),
  );

  console.log("📊 Summary:\n");
  console.log(`Total files with shadow styles: ${results.length}`);
  console.log(
    `Total shadow occurrences: ${results.reduce((sum, r) => sum + r.shadowCount, 0)}`,
  );
  console.log(
    `Total textShadow occurrences: ${results.reduce((sum, r) => sum + r.textShadowCount, 0)}`,
  );

  console.log("\n📁 Files to fix:\n");

  results.forEach((r, index) => {
    const relativePath = r.file.replace(path.join(__dirname, ".."), "");
    console.log(`${index + 1}. ${relativePath}`);
    console.log(
      `   - Shadow: ${r.shadowCount}, TextShadow: ${r.textShadowCount}`,
    );
  });

  console.log("\n💡 How to fix:");
  console.log("1. Import shadow utility:");
  console.log(
    "   import { shadowPresets, createShadow } from '@/utils/shadowStyles';",
  );
  console.log("\n2. Replace deprecated styles:");
  console.log("   // Before:");
  console.log(
    '   style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}',
  );
  console.log("\n   // After:");
  console.log("   style={shadowPresets.md}");
  console.log("   // Or custom:");
  console.log(
    "   style={createShadow({ offsetY: 2, blurRadius: 4, opacity: 0.25 })}",
  );

  console.log(
    "\n✅ Available presets: sm, md, lg, xl, card, button, fab, inputFocus, error, success, none",
  );
}

// Export for use as module
module.exports = { analyzeFile, main };

// Run if called directly
if (require.main === module) {
  main();
}
