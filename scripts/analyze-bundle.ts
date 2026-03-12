/**
 * Bundle Analysis Script
 * Analyzes the React Native bundle for size optimization opportunities
 *
 * Run: npx ts-node scripts/analyze-bundle.ts
 *
 * @created 2026-01-23
 */

import * as fs from "fs";
import * as path from "path";

interface DependencyInfo {
  name: string;
  size: number;
  sizeFormatted: string;
  category: "core" | "ui" | "utils" | "native" | "dev" | "other";
}

interface AnalysisResult {
  totalDependencies: number;
  productionDependencies: number;
  devDependencies: number;
  largestDependencies: DependencyInfo[];
  categoryBreakdown: Record<string, number>;
  recommendations: string[];
}

// Known large dependencies and their typical sizes (KB)
const KNOWN_SIZES: Record<string, number> = {
  "react-native": 850,
  expo: 500,
  "@react-navigation/native": 120,
  "@react-navigation/stack": 80,
  "@react-navigation/bottom-tabs": 50,
  "react-native-reanimated": 400,
  "react-native-gesture-handler": 150,
  "react-native-screens": 100,
  "react-native-safe-area-context": 30,
  "@sentry/react-native": 300,
  "socket.io-client": 100,
  axios: 50,
  "date-fns": 80,
  lodash: 500,
  moment: 300,
  "@expo/vector-icons": 200,
  "react-native-maps": 250,
  "react-native-webview": 150,
  "react-native-video": 200,
  "expo-av": 300,
  "expo-camera": 200,
  "expo-image-picker": 150,
  "expo-location": 100,
  "expo-notifications": 120,
  "expo-file-system": 80,
  "expo-secure-store": 40,
  "@react-native-async-storage/async-storage": 30,
  "react-query": 50,
  "@tanstack/react-query": 60,
  zustand: 10,
  jotai: 8,
  recoil: 40,
  redux: 30,
  "@reduxjs/toolkit": 60,
};

// Categories for dependencies
const CATEGORIES: Record<string, string[]> = {
  core: ["react", "react-native", "expo", "expo-router"],
  ui: [
    "@react-navigation",
    "react-native-reanimated",
    "react-native-gesture-handler",
    "react-native-screens",
    "react-native-safe-area-context",
    "@expo/vector-icons",
    "react-native-svg",
    "nativewind",
    "tailwindcss",
  ],
  native: [
    "react-native-maps",
    "react-native-webview",
    "react-native-video",
    "expo-av",
    "expo-camera",
    "expo-image-picker",
    "expo-location",
    "expo-notifications",
    "expo-file-system",
    "expo-secure-store",
    "@react-native-async-storage",
    "expo-barcode-scanner",
  ],
  utils: ["axios", "date-fns", "lodash", "moment", "uuid", "crypto-js"],
  monitoring: ["@sentry/react-native", "expo-updates", "expo-analytics"],
  state: [
    "react-query",
    "@tanstack/react-query",
    "zustand",
    "jotai",
    "recoil",
    "redux",
  ],
  socket: ["socket.io-client", "ws"],
};

function categorize(name: string): string {
  for (const [category, deps] of Object.entries(CATEGORIES)) {
    if (deps.some((d) => name.includes(d))) {
      return category;
    }
  }
  return "other";
}

function formatSize(kb: number): string {
  if (kb >= 1000) {
    return `${(kb / 1000).toFixed(2)} MB`;
  }
  return `${kb.toFixed(0)} KB`;
}

async function analyzeDependencies(): Promise<AnalysisResult> {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    throw new Error("package.json not found");
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};

  const allDeps: DependencyInfo[] = [];

  // Analyze production dependencies
  for (const [name, version] of Object.entries(dependencies)) {
    const size = KNOWN_SIZES[name] || estimateSize(name);
    allDeps.push({
      name,
      size,
      sizeFormatted: formatSize(size),
      category: categorize(name) as DependencyInfo["category"],
    });
  }

  // Sort by size
  allDeps.sort((a, b) => b.size - a.size);

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {};
  for (const dep of allDeps) {
    categoryBreakdown[dep.category] =
      (categoryBreakdown[dep.category] || 0) + dep.size;
  }

  // Generate recommendations
  const recommendations: string[] = [];

  // Check for duplicate libraries
  if (dependencies["moment"] && dependencies["date-fns"]) {
    recommendations.push(
      "⚠️ Both moment.js and date-fns found. Consider using only date-fns (smaller).",
    );
  }

  if (dependencies["lodash"]) {
    recommendations.push(
      "💡 Consider using lodash-es for better tree-shaking.",
    );
  }

  // Check for large libraries
  const largeLibs = allDeps.filter((d) => d.size > 200);
  if (largeLibs.length > 5) {
    recommendations.push(
      `📦 ${largeLibs.length} dependencies over 200KB. Review necessity.`,
    );
  }

  // State management check
  const stateLibs = allDeps.filter((d) => d.category === "state");
  if (stateLibs.length > 1) {
    recommendations.push(
      "⚠️ Multiple state management libraries detected. Consider consolidating.",
    );
  }

  // Expo modules check
  const expoModules = allDeps.filter((d) => d.name.startsWith("expo-"));
  if (expoModules.length > 15) {
    recommendations.push(
      `📱 ${expoModules.length} Expo modules. Review if all are necessary.`,
    );
  }

  // Check for @sentry/react-native
  if (dependencies["@sentry/react-native"]) {
    recommendations.push(
      "✅ Sentry monitoring configured. Good for production!",
    );
  }

  // Check for analytics
  if (
    !dependencies["expo-analytics"] &&
    !dependencies["@amplitude/analytics-react-native"]
  ) {
    recommendations.push(
      "💡 Consider adding analytics for user behavior insights.",
    );
  }

  return {
    totalDependencies:
      Object.keys(dependencies).length + Object.keys(devDependencies).length,
    productionDependencies: Object.keys(dependencies).length,
    devDependencies: Object.keys(devDependencies).length,
    largestDependencies: allDeps.slice(0, 20),
    categoryBreakdown,
    recommendations,
  };
}

function estimateSize(name: string): number {
  // Estimate based on package name patterns
  if (name.startsWith("expo-")) return 80;
  if (name.startsWith("@expo/")) return 60;
  if (name.startsWith("react-native-")) return 100;
  if (name.startsWith("@react-native-")) return 60;
  if (name.startsWith("@types/")) return 0; // Type definitions don't affect bundle
  if (name.includes("eslint") || name.includes("prettier")) return 0; // Dev tools
  return 30; // Default estimate
}

async function main() {
  console.log("📊 React Native Bundle Analysis\n");
  console.log("=".repeat(50));

  try {
    const result = await analyzeDependencies();

    console.log(`\n📦 Dependencies Summary:`);
    console.log(`   Total: ${result.totalDependencies}`);
    console.log(`   Production: ${result.productionDependencies}`);
    console.log(`   Development: ${result.devDependencies}`);

    console.log(`\n📈 Category Breakdown (Estimated):`);
    for (const [category, size] of Object.entries(
      result.categoryBreakdown,
    ).sort((a, b) => b[1] - a[1])) {
      console.log(`   ${category}: ${formatSize(size)}`);
    }

    console.log(`\n🏋️ Top 10 Largest Dependencies:`);
    result.largestDependencies.slice(0, 10).forEach((dep, i) => {
      console.log(`   ${i + 1}. ${dep.name}: ${dep.sizeFormatted}`);
    });

    console.log(`\n💡 Recommendations:`);
    result.recommendations.forEach((rec) => {
      console.log(`   ${rec}`);
    });

    // Total estimated size
    const totalSize = Object.values(result.categoryBreakdown).reduce(
      (a, b) => a + b,
      0,
    );
    console.log(`\n📏 Estimated Total Bundle Size: ${formatSize(totalSize)}`);
    console.log(
      "   (Note: Actual size varies with Metro bundler optimizations)\n",
    );
  } catch (error) {
    console.error("Error analyzing bundle:", error);
    process.exit(1);
  }
}

// Export for use as module
export { AnalysisResult, DependencyInfo, analyzeDependencies };

// Run if executed directly
if (require.main === module) {
  main();
}
