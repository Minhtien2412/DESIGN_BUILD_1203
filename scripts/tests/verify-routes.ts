#!/usr/bin/env ts-node
/**
 * Route Verification Test Script
 * Validates that all routes in typed-routes.ts have corresponding files
 * Usage: npx ts-node scripts/tests/verify-routes.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { APP_ROUTES } from '../../constants/typed-routes';

// ============================================================================
// Configuration
// ============================================================================

const APP_DIR = path.join(__dirname, '../../app');
const RESULTS_FILE = path.join(__dirname, 'route-verification-results.json');

interface RouteTestResult {
  route: string;
  exists: boolean;
  filePath?: string;
  error?: string;
  isDynamic: boolean;
  alternativePaths?: string[];
}

interface TestSummary {
  totalRoutes: number;
  passed: number;
  failed: number;
  warnings: number;
  timestamp: string;
  results: RouteTestResult[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a route is dynamic (contains parameters)
 */
function isDynamicRoute(route: string): boolean {
  return route.includes('[') || route.includes(':');
}

/**
 * Convert route to file path
 * Examples:
 * - '/services/house-design' -> 'app/services/house-design.tsx' OR 'app/services/house-design/index.tsx'
 * - '/(tabs)/index' -> 'app/(tabs)/index.tsx'
 * - '/product/[id]' -> 'app/product/[id].tsx'
 */
function routeToFilePaths(route: string): string[] {
  // Remove leading slash
  const cleanRoute = route.startsWith('/') ? route.slice(1) : route;
  
  const possiblePaths: string[] = [];
  
  // Direct file match (e.g., services/house-design.tsx)
  possiblePaths.push(path.join(APP_DIR, `${cleanRoute}.tsx`));
  possiblePaths.push(path.join(APP_DIR, `${cleanRoute}.ts`));
  
  // Index file match (e.g., services/house-design/index.tsx)
  possiblePaths.push(path.join(APP_DIR, cleanRoute, 'index.tsx'));
  possiblePaths.push(path.join(APP_DIR, cleanRoute, 'index.ts'));
  
  // Handle special case: /(tabs)/index -> app/(tabs)/index.tsx
  if (cleanRoute.includes('(tabs)')) {
    possiblePaths.push(path.join(APP_DIR, cleanRoute + '.tsx'));
  }
  
  return possiblePaths;
}

/**
 * Check if any of the possible file paths exist
 */
function checkRouteExists(route: string): RouteTestResult {
  const isDynamic = isDynamicRoute(route);
  const possiblePaths = routeToFilePaths(route);
  
  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        return {
          route,
          exists: true,
          filePath: filePath.replace(__dirname, ''),
          isDynamic,
        };
      }
    } catch (error) {
      // Continue checking other paths
    }
  }
  
  return {
    route,
    exists: false,
    error: `No file found. Checked: ${possiblePaths.map(p => path.relative(APP_DIR, p)).join(', ')}`,
    isDynamic,
    alternativePaths: possiblePaths.map(p => path.relative(process.cwd(), p)),
  };
}

/**
 * Get all routes from APP_ROUTES
 */
function getAllRoutes(): string[] {
  const routes: string[] = [];
  
  for (const [key, value] of Object.entries(APP_ROUTES)) {
    if (typeof value === 'string') {
      routes.push(value);
    }
  }
  
  return [...new Set(routes)]; // Remove duplicates
}

// ============================================================================
// Main Test Function
// ============================================================================

async function runRouteVerification(): Promise<TestSummary> {
  console.log('🔍 Starting Route Verification...\n');
  
  const allRoutes = getAllRoutes();
  const results: RouteTestResult[] = [];
  
  let passed = 0;
  let failed = 0;
  let warnings = 0;
  
  for (const route of allRoutes) {
    const result = checkRouteExists(route);
    results.push(result);
    
    if (result.exists) {
      passed++;
      console.log(`✅ ${route}`);
      if (result.filePath) {
        console.log(`   → ${result.filePath}`);
      }
    } else if (result.isDynamic) {
      warnings++;
      console.log(`⚠️  ${route} (Dynamic route - may not have direct file)`);
      if (result.alternativePaths) {
        console.log(`   Expected one of: ${result.alternativePaths.slice(0, 2).join(' OR ')}`);
      }
    } else {
      failed++;
      console.log(`❌ ${route}`);
      if (result.error) {
        console.log(`   → ${result.error}`);
      }
    }
  }
  
  const summary: TestSummary = {
    totalRoutes: allRoutes.length,
    passed,
    failed,
    warnings,
    timestamp: new Date().toISOString(),
    results,
  };
  
  // Save results to file
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(summary, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Routes:     ${summary.totalRoutes}`);
  console.log(`✅ Passed:        ${summary.passed} (${((passed/summary.totalRoutes)*100).toFixed(1)}%)`);
  console.log(`❌ Failed:        ${summary.failed} (${((failed/summary.totalRoutes)*100).toFixed(1)}%)`);
  console.log(`⚠️  Warnings:      ${summary.warnings} (dynamic routes)`);
  console.log('='.repeat(60));
  console.log(`\n📄 Full results saved to: ${path.relative(process.cwd(), RESULTS_FILE)}`);
  
  return summary;
}

// ============================================================================
// CLI Execution
// ============================================================================

if (require.main === module) {
  runRouteVerification()
    .then((summary) => {
      if (summary.failed > 0) {
        console.log('\n❌ Route verification FAILED - some routes are missing files!');
        process.exit(1);
      } else {
        console.log('\n✅ Route verification PASSED - all routes have files!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('❌ Error running route verification:', error);
      process.exit(1);
    });
}

export { runRouteVerification, type RouteTestResult, type TestSummary };

