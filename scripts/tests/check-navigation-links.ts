#!/usr/bin/env ts-node
/**
 * Navigation Links Checker
 * Scans all files for navigateTo() calls and validates routes
 * Usage: npx ts-node scripts/tests/check-navigation-links.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { APP_ROUTES } from '../../constants/typed-routes';

// ============================================================================
// Configuration
// ============================================================================

const SCAN_DIRS = [
  path.join(__dirname, '../../app'),
  path.join(__dirname, '../../components'),
];

const FILE_EXTENSIONS = ['.tsx', '.ts'];
const RESULTS_FILE = path.join(__dirname, 'navigation-links-results.json');

interface NavigationCall {
  file: string;
  line: number;
  code: string;
  route: string;
  isValid: boolean;
  error?: string;
}

interface LinkCheckSummary {
  totalFiles: number;
  filesWithNavigation: number;
  totalNavigationCalls: number;
  validCalls: number;
  invalidCalls: number;
  warnings: number;
  timestamp: string;
  calls: NavigationCall[];
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Extract navigation calls from code
 * Patterns:
 * - navigateTo('/route')
 * - navigateTo(APP_ROUTES.ROUTE)
 * - router.push('/route')
 * - router.push(APP_ROUTES.ROUTE)
 */
function extractNavigationCalls(content: string, filePath: string): NavigationCall[] {
  const calls: NavigationCall[] = [];
  const lines = content.split('\n');
  
  // Regex patterns for navigation calls
  const patterns = [
    /navigateTo\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /navigateTo\s*\(\s*APP_ROUTES\.(\w+)\s*\)/g,
    /router\.push\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    /router\.push\s*\(\s*APP_ROUTES\.(\w+)\s*\)/g,
    /router\.replace\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
  ];
  
  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        let route = match[1];
        
        // If it's an APP_ROUTES reference, get the actual route
        if (match[0].includes('APP_ROUTES.')) {
          const routeKey = match[1];
          route = (APP_ROUTES as any)[routeKey] || `APP_ROUTES.${routeKey}`;
        }
        
        // Validate route
        const isValid = validateRoute(route);
        
        calls.push({
          file: path.relative(process.cwd(), filePath),
          line: index + 1,
          code: line.trim(),
          route,
          isValid,
          error: isValid ? undefined : `Route not found in APP_ROUTES`,
        });
      }
    });
  });
  
  return calls;
}

/**
 * Check if route is valid
 */
function validateRoute(route: string): boolean {
  // Check if route exists in APP_ROUTES
  const allRoutes = Object.values(APP_ROUTES);
  
  // Exact match
  if (allRoutes.includes(route)) {
    return true;
  }
  
  // Check for dynamic routes (e.g., /product/123 should match /product/[id])
  const isDynamic = route.match(/\/\d+|\/[a-f0-9-]+$/);
  if (isDynamic) {
    const baseRoute = route.replace(/\/[^/]+$/, '/[id]');
    if (allRoutes.includes(baseRoute)) {
      return true;
    }
  }
  
  // Check for template literals or variables (allow as valid)
  if (route.includes('${') || route.startsWith('APP_ROUTES.')) {
    return true;
  }
  
  return false;
}

/**
 * Recursively scan directory for files
 */
function scanDirectory(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, .expo, etc.
        if (!['node_modules', '.expo', '.git', 'build', 'dist'].includes(item)) {
          files.push(...scanDirectory(fullPath));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(fullPath);
        if (FILE_EXTENSIONS.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning ${dir}:`, error);
  }
  
  return files;
}

// ============================================================================
// Main Test Function
// ============================================================================

async function checkNavigationLinks(): Promise<LinkCheckSummary> {
  console.log('🔗 Starting Navigation Links Check...\n');
  
  // Get all files to scan
  const allFiles: string[] = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...scanDirectory(dir));
  }
  
  console.log(`📁 Scanning ${allFiles.length} files...\n`);
  
  const allCalls: NavigationCall[] = [];
  let filesWithNavigation = 0;
  
  // Scan each file
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const calls = extractNavigationCalls(content, file);
      
      if (calls.length > 0) {
        filesWithNavigation++;
        allCalls.push(...calls);
        
        calls.forEach(call => {
          if (call.isValid) {
            console.log(`✅ ${call.file}:${call.line} → ${call.route}`);
          } else {
            console.log(`❌ ${call.file}:${call.line} → ${call.route}`);
            console.log(`   ${call.error}`);
          }
        });
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  const validCalls = allCalls.filter(c => c.isValid).length;
  const invalidCalls = allCalls.filter(c => !c.isValid).length;
  
  const summary: LinkCheckSummary = {
    totalFiles: allFiles.length,
    filesWithNavigation,
    totalNavigationCalls: allCalls.length,
    validCalls,
    invalidCalls,
    warnings: 0,
    timestamp: new Date().toISOString(),
    calls: allCalls,
  };
  
  // Save results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(summary, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 NAVIGATION LINKS SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files Scanned:           ${summary.totalFiles}`);
  console.log(`Files with Navigation:   ${summary.filesWithNavigation}`);
  console.log(`Total Navigation Calls:  ${summary.totalNavigationCalls}`);
  console.log(`✅ Valid Calls:          ${summary.validCalls} (${((validCalls/summary.totalNavigationCalls)*100).toFixed(1)}%)`);
  console.log(`❌ Invalid Calls:        ${summary.invalidCalls} (${((invalidCalls/summary.totalNavigationCalls)*100).toFixed(1)}%)`);
  console.log('='.repeat(60));
  console.log(`\n📄 Full results saved to: ${path.relative(process.cwd(), RESULTS_FILE)}`);
  
  return summary;
}

// ============================================================================
// CLI Execution
// ============================================================================

if (require.main === module) {
  checkNavigationLinks()
    .then((summary) => {
      if (summary.invalidCalls > 0) {
        console.log('\n❌ Navigation links check FAILED - some links are broken!');
        process.exit(1);
      } else {
        console.log('\n✅ Navigation links check PASSED - all links are valid!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('❌ Error checking navigation links:', error);
      process.exit(1);
    });
}

export { checkNavigationLinks, type LinkCheckSummary, type NavigationCall };
