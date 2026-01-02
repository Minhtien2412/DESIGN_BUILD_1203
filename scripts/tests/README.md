# Route Verification Tests

Automated test suite for validating route definitions, navigation links, and naming conventions.

## 🎯 Overview

This test suite ensures:
1. ✅ All routes in `typed-routes.ts` have corresponding files
2. ✅ All navigation calls use valid routes
3. ✅ Routes follow naming conventions
4. ✅ No broken links exist in the codebase

## 🚀 Quick Start

### Run All Tests

```bash
npx ts-node scripts/tests/test-runner.ts
```

### Run Individual Tests

```bash
# Verify route files exist
npx ts-node scripts/tests/verify-routes.ts

# Check navigation links
npx ts-node scripts/tests/check-navigation-links.ts

# Validate naming conventions
npx ts-node scripts/tests/validate-naming-conventions.ts
```

### Add to package.json

```json
{
  "scripts": {
    "test:routes": "ts-node scripts/tests/test-runner.ts",
    "test:routes:verify": "ts-node scripts/tests/verify-routes.ts",
    "test:routes:links": "ts-node scripts/tests/check-navigation-links.ts",
    "test:routes:naming": "ts-node scripts/tests/validate-naming-conventions.ts"
  }
}
```

Then run:
```bash
npm run test:routes
```

---

## 📋 Test Details

### 1. Route File Verification (`verify-routes.ts`)

**Purpose:** Ensures every route in `APP_ROUTES` has a corresponding file in the `app/` directory.

**What it checks:**
- Route has `.tsx` or `.ts` file
- Route has `index.tsx` in directory
- Special handling for `(tabs)` routes
- Identifies dynamic routes (e.g., `/product/[id]`)

**Output:**
- ✅ Routes with existing files
- ⚠️ Dynamic routes (may not have direct files)
- ❌ Missing route files with suggested paths

**Example:**
```
✅ /services/house-design
   → app/services/house-design.tsx

⚠️ /product/[id] (Dynamic route)
   Expected: app/product/[id].tsx

❌ /missing/route
   → No file found. Checked: services/missing/route.tsx, services/missing/route/index.tsx
```

**Results saved to:** `scripts/tests/route-verification-results.json`

---

### 2. Navigation Links Check (`check-navigation-links.ts`)

**Purpose:** Scans all files for navigation calls and validates the routes.

**What it checks:**
- `navigateTo('/route')` calls
- `navigateTo(APP_ROUTES.KEY)` calls
- `router.push('/route')` calls
- `router.replace('/route')` calls

**Validation:**
- Route exists in `APP_ROUTES`
- Dynamic routes match patterns
- Template literals are allowed

**Example:**
```
✅ app/(tabs)/index.tsx:145 → /services/house-design
✅ components/navigation/RouteCard.tsx:52 → APP_ROUTES.MATERIALS
❌ app/broken/page.tsx:23 → /invalid/route
   Route not found in APP_ROUTES
```

**Results saved to:** `scripts/tests/navigation-links-results.json`

---

### 3. Naming Convention Validation (`validate-naming-conventions.ts`)

**Purpose:** Ensures all routes follow established naming standards.

**Rules enforced:**

| Rule | Severity | Description | Example |
|------|----------|-------------|---------|
| `starts-with-slash` | Error | Route must start with `/` | ✅ `/services` ❌ `services` |
| `lowercase-only` | Warning | Use lowercase characters | ✅ `/my-route` ⚠️ `/myRoute` |
| `no-trailing-slash` | Error | No trailing `/` (except root) | ✅ `/route` ❌ `/route/` |
| `kebab-case` | Warning | Use kebab-case for segments | ✅ `/my-service` ⚠️ `/my_service` |
| `no-spaces` | Error | No spaces in routes | ✅ `/my-route` ❌ `/my route` |
| `valid-dynamic-params` | Error | Parameters in `[camelCase]` | ✅ `/product/[id]` ❌ `/product/[ID]` |
| `no-double-slashes` | Error | No `//` in routes | ✅ `/a/b` ❌ `/a//b` |

**Example:**
```
✅ HOUSE_DESIGN: /services/house-design
⚠️ MY_PROJECTS: /projects/myProjects
   Warning: Route should use kebab-case
❌ INVALID_ROUTE: /services/Invalid Route/
   Error: Route must not contain spaces
   Error: Route should not end with /
```

**Results saved to:** `scripts/tests/naming-validation-results.json`

---

### 4. Master Test Runner (`test-runner.ts`)

**Purpose:** Runs all tests in sequence and provides comprehensive summary.

**Features:**
- Sequential test execution
- Timing for each test
- Aggregated pass/fail status
- JSON summary output

**Example Output:**
```
====================================================================
            🚀 ROUTE VERIFICATION TEST SUITE
====================================================================

🧪 Test 1/3: Route File Verification
   Verify all routes have corresponding files
──────────────────────────────────────────────────────────────────

[... test output ...]

✅ Test completed in 0.45s

🧪 Test 2/3: Navigation Links Check
[... continues ...]

====================================================================
                  📊 FINAL TEST SUMMARY
====================================================================
Total Tests:      3
✅ Passed:        3
❌ Failed:        0
Total Duration:   1.87s
Success Rate:     100.0%
```

**Results saved to:** `scripts/tests/master-test-summary.json`

---

## 🔧 Configuration

### Scan Directories

Edit `check-navigation-links.ts`:
```typescript
const SCAN_DIRS = [
  path.join(__dirname, '../../app'),
  path.join(__dirname, '../../components'),
  // Add more directories here
];
```

### File Extensions

Edit `check-navigation-links.ts`:
```typescript
const FILE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];
```

### Naming Rules

Edit `validate-naming-conventions.ts` to add custom rules:
```typescript
{
  name: 'custom-rule',
  check: (route) => /* your logic */,
  message: 'Custom error message',
  severity: 'error' | 'warning',
}
```

---

## 📊 CI/CD Integration

### GitHub Actions

Create `.github/workflows/route-tests.yml`:

```yaml
name: Route Verification Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-routes:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run route verification tests
        run: npx ts-node scripts/tests/test-runner.ts
        
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: route-test-results
          path: scripts/tests/*-results.json
```

### Pre-commit Hook

Add to `.husky/pre-commit` or `package.json`:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run test:routes"
    }
  }
}
```

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
# Install dependencies
npm install
npm install --save-dev @types/node ts-node typescript
```

### "Cannot find module '../../constants/typed-routes'"

Ensure you're running from project root:
```bash
cd /path/to/APP_DESIGN_BUILD05.12.2025
npx ts-node scripts/tests/test-runner.ts
```

### Tests fail on dynamic routes

Dynamic routes (e.g., `/product/[id]`) are expected to fail file verification. These generate warnings, not errors.

To create a dynamic route file:
```bash
mkdir -p app/product
echo "export default function ProductDetail() {}" > app/product/[id].tsx
```

---

## 📈 Interpreting Results

### All Green ✅
Perfect! All routes are valid, files exist, and naming is correct.

### Warnings ⚠️
Routes work but could be improved:
- Consider standardizing naming (kebab-case)
- Dynamic routes may need placeholder files

### Failures ❌
Critical issues that need fixing:
- Missing route files → Create them
- Broken navigation links → Fix or remove
- Invalid naming → Rename routes

---

## 🎯 Best Practices

1. **Run tests before commits**
   ```bash
   npm run test:routes
   git commit -m "..."
   ```

2. **Fix errors before warnings**
   - Errors break navigation
   - Warnings are style issues

3. **Keep APP_ROUTES in sync**
   - Add route to `typed-routes.ts`
   - Create corresponding file
   - Run tests to verify

4. **Document exceptions**
   If a route intentionally doesn't have a file (e.g., redirect-only), add a comment in the test.

---

## 📚 Related Documentation

- [typed-routes.ts](../../constants/typed-routes.ts) - Route definitions
- [ROUTE_MAPPING_AUDIT.md](../../ROUTE_MAPPING_AUDIT.md) - Route inventory
- [Navigation Components Guide](../../docs/NAVIGATION_COMPONENTS_GUIDE.md)

---

**Last Updated:** December 22, 2025  
**Version:** 1.0.0  
**Maintained By:** Navigation System Team
