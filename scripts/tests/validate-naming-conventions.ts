#!/usr/bin/env ts-node
/**
 * Route Naming Convention Validator
 * Ensures all routes follow naming standards
 * Usage: npx ts-node scripts/tests/validate-naming-conventions.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { APP_ROUTES } from '../../constants/typed-routes';

// ============================================================================
// Naming Convention Rules
// ============================================================================

interface NamingRule {
  name: string;
  check: (route: string) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

const NAMING_RULES: NamingRule[] = [
  {
    name: 'starts-with-slash',
    check: (route) => route.startsWith('/'),
    message: 'Route must start with /',
    severity: 'error',
  },
  {
    name: 'lowercase-only',
    check: (route) => {
      const withoutSpecial = route.replace(/\[|\]|\(|\)/g, '');
      return withoutSpecial === withoutSpecial.toLowerCase();
    },
    message: 'Route should use lowercase only (except brackets)',
    severity: 'warning',
  },
  {
    name: 'no-trailing-slash',
    check: (route) => !route.endsWith('/') || route === '/',
    message: 'Route should not end with / (except root)',
    severity: 'error',
  },
  {
    name: 'kebab-case',
    check: (route) => {
      const parts = route.split('/').filter(p => p && !p.includes('[') && !p.includes('('));
      return parts.every(part => /^[a-z0-9-]+$/.test(part));
    },
    message: 'Route segments should use kebab-case (lowercase with hyphens)',
    severity: 'warning',
  },
  {
    name: 'no-spaces',
    check: (route) => !route.includes(' '),
    message: 'Route must not contain spaces',
    severity: 'error',
  },
  {
    name: 'valid-dynamic-params',
    check: (route) => {
      const params = route.match(/\[([^\]]+)\]/g);
      if (!params) return true;
      return params.every(param => /^\[[a-z][a-zA-Z0-9]*\]$/.test(param));
    },
    message: 'Dynamic parameters should be in [camelCase] format',
    severity: 'error',
  },
  {
    name: 'no-double-slashes',
    check: (route) => !route.includes('//'),
    message: 'Route must not contain double slashes',
    severity: 'error',
  },
];

// ============================================================================
// Types
// ============================================================================

interface ValidationResult {
  route: string;
  routeKey: string;
  passed: boolean;
  errors: { rule: string; message: string }[];
  warnings: { rule: string; message: string }[];
}

interface ValidationSummary {
  totalRoutes: number;
  passed: number;
  failed: number;
  totalErrors: number;
  totalWarnings: number;
  timestamp: string;
  results: ValidationResult[];
}

// ============================================================================
// Validation Functions
// ============================================================================

function validateRoute(route: string, routeKey: string): ValidationResult {
  const result: ValidationResult = {
    route,
    routeKey,
    passed: true,
    errors: [],
    warnings: [],
  };
  
  for (const rule of NAMING_RULES) {
    if (!rule.check(route)) {
      if (rule.severity === 'error') {
        result.errors.push({ rule: rule.name, message: rule.message });
        result.passed = false;
      } else {
        result.warnings.push({ rule: rule.name, message: rule.message });
      }
    }
  }
  
  return result;
}

async function validateNamingConventions(): Promise<ValidationSummary> {
  console.log('📝 Starting Naming Convention Validation...\n');
  
  const results: ValidationResult[] = [];
  
  // Get all routes with their keys
  for (const [key, value] of Object.entries(APP_ROUTES)) {
    if (typeof value === 'string') {
      const result = validateRoute(value, key);
      results.push(result);
      
      if (result.passed && result.warnings.length === 0) {
        console.log(`✅ ${key}: ${value}`);
      } else if (result.passed && result.warnings.length > 0) {
        console.log(`⚠️  ${key}: ${value}`);
        result.warnings.forEach(w => {
          console.log(`   Warning: ${w.message}`);
        });
      } else {
        console.log(`❌ ${key}: ${value}`);
        result.errors.forEach(e => {
          console.log(`   Error: ${e.message}`);
        });
        result.warnings.forEach(w => {
          console.log(`   Warning: ${w.message}`);
        });
      }
    }
  }
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  
  const summary: ValidationSummary = {
    totalRoutes: results.length,
    passed,
    failed,
    totalErrors,
    totalWarnings,
    timestamp: new Date().toISOString(),
    results,
  };
  
  // Save results
  const resultsFile = path.join(__dirname, 'naming-validation-results.json');
  fs.writeFileSync(resultsFile, JSON.stringify(summary, null, 2));
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 NAMING CONVENTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Routes:     ${summary.totalRoutes}`);
  console.log(`✅ Passed:        ${summary.passed} (${((passed/summary.totalRoutes)*100).toFixed(1)}%)`);
  console.log(`❌ Failed:        ${summary.failed}`);
  console.log(`Total Errors:     ${summary.totalErrors}`);
  console.log(`Total Warnings:   ${summary.totalWarnings}`);
  console.log('='.repeat(60));
  console.log(`\n📄 Full results saved to: ${path.relative(process.cwd(), resultsFile)}`);
  
  // Print rules reference
  console.log('\n📋 Naming Convention Rules:');
  NAMING_RULES.forEach(rule => {
    const icon = rule.severity === 'error' ? '❌' : '⚠️';
    console.log(`${icon} ${rule.name}: ${rule.message}`);
  });
  
  return summary;
}

// ============================================================================
// CLI Execution
// ============================================================================

if (require.main === module) {
  validateNamingConventions()
    .then((summary) => {
      if (summary.failed > 0) {
        console.log('\n❌ Naming convention validation FAILED!');
        process.exit(1);
      } else if (summary.totalWarnings > 0) {
        console.log('\n⚠️  Naming convention validation PASSED with warnings');
        process.exit(0);
      } else {
        console.log('\n✅ Naming convention validation PASSED!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('❌ Error validating naming conventions:', error);
      process.exit(1);
    });
}

export { validateNamingConventions, type ValidationResult, type ValidationSummary };

