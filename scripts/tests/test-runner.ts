#!/usr/bin/env ts-node
/**
 * Master Test Runner
 * Runs all route verification tests in sequence
 * Usage: npx ts-node scripts/tests/test-runner.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { checkNavigationLinks } from './check-navigation-links';
import { validateNamingConventions } from './validate-naming-conventions';
import { runRouteVerification } from './verify-routes';

// ============================================================================
// Types
// ============================================================================

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  summary?: any;
  error?: string;
}

interface MasterSummary {
  totalTests: number;
  passed: number;
  failed: number;
  totalDuration: number;
  timestamp: string;
  results: TestResult[];
}

// ============================================================================
// Test Configurations
// ============================================================================

const TESTS = [
  {
    name: 'Route File Verification',
    description: 'Verify all routes have corresponding files',
    run: runRouteVerification,
  },
  {
    name: 'Navigation Links Check',
    description: 'Check all navigation calls use valid routes',
    run: checkNavigationLinks,
  },
  {
    name: 'Naming Convention Validation',
    description: 'Validate route naming conventions',
    run: validateNamingConventions,
  },
];

// ============================================================================
// Runner Functions
// ============================================================================

function printHeader(title: string) {
  const width = 70;
  const padding = Math.max(0, (width - title.length - 2) / 2);
  const line = '='.repeat(width);
  
  console.log('\n' + line);
  console.log(' '.repeat(Math.floor(padding)) + title);
  console.log(line + '\n');
}

function printTestHeader(testNumber: number, total: number, name: string, description: string) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🧪 Test ${testNumber}/${total}: ${name}`);
  console.log(`   ${description}`);
  console.log(`${'─'.repeat(70)}\n`);
}

async function runTest(test: any, testNumber: number, total: number): Promise<TestResult> {
  printTestHeader(testNumber, total, test.name, test.description);
  
  const startTime = Date.now();
  
  try {
    const summary = await test.run();
    const duration = Date.now() - startTime;
    
    // Determine if test passed based on summary
    let passed = false;
    
    if ('failed' in summary) {
      passed = summary.failed === 0;
    } else if ('invalidCalls' in summary) {
      passed = summary.invalidCalls === 0;
    } else {
      passed = true;
    }
    
    console.log(`\n${passed ? '✅' : '❌'} Test completed in ${(duration/1000).toFixed(2)}s`);
    
    return {
      name: test.name,
      passed,
      duration,
      summary,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Test failed with error: ${error}`);
    
    return {
      name: test.name,
      passed: false,
      duration,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runAllTests(): Promise<MasterSummary> {
  printHeader('🚀 ROUTE VERIFICATION TEST SUITE');
  
  console.log('📋 Running all route verification tests...');
  console.log(`   Total tests: ${TESTS.length}\n`);
  
  const results: TestResult[] = [];
  const startTime = Date.now();
  
  for (let i = 0; i < TESTS.length; i++) {
    const result = await runTest(TESTS[i], i + 1, TESTS.length);
    results.push(result);
  }
  
  const totalDuration = Date.now() - startTime;
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  const summary: MasterSummary = {
    totalTests: TESTS.length,
    passed,
    failed,
    totalDuration,
    timestamp: new Date().toISOString(),
    results,
  };
  
  // Save master summary
  const summaryFile = path.join(__dirname, 'master-test-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  // Print final summary
  printHeader('📊 FINAL TEST SUMMARY');
  
  console.log(`Total Tests:      ${summary.totalTests}`);
  console.log(`✅ Passed:        ${summary.passed}`);
  console.log(`❌ Failed:        ${summary.failed}`);
  console.log(`Total Duration:   ${(summary.totalDuration/1000).toFixed(2)}s`);
  console.log(`Success Rate:     ${((passed/summary.totalTests)*100).toFixed(1)}%\n`);
  
  console.log('Test Results:');
  results.forEach((result, i) => {
    const icon = result.passed ? '✅' : '❌';
    const duration = (result.duration/1000).toFixed(2);
    console.log(`  ${icon} ${i + 1}. ${result.name} (${duration}s)`);
    if (result.error) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  console.log(`\n📄 Master summary saved to: ${path.relative(process.cwd(), summaryFile)}`);
  console.log('─'.repeat(70));
  
  return summary;
}

// ============================================================================
// CLI Execution
// ============================================================================

if (require.main === module) {
  runAllTests()
    .then((summary) => {
      if (summary.failed > 0) {
        console.log('\n❌ TEST SUITE FAILED - Fix the issues above!');
        process.exit(1);
      } else {
        console.log('\n✅ TEST SUITE PASSED - All tests successful!');
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error('\n❌ FATAL ERROR:', error);
      process.exit(1);
    });
}

export { runAllTests, type MasterSummary, type TestResult };
