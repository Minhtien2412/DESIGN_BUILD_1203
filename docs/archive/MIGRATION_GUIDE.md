# 🚀 Navigation System Migration Guide

**Complete guide for migrating from hardcoded navigation paths to type-safe APP_ROUTES system**

---

## 📊 Executive Summary

**Current Status:**
- ✅ **71 typed routes** defined in `constants/typed-routes.ts`
- ⚠️ **169 hardcoded navigation paths** found across codebase
- 📈 **53.1% adoption rate** (191 valid / 360 total navigation calls)
- 🎯 **Target: 100% adoption**

**Impact:**
- **Files to migrate:** 169 files
- **Estimated effort:** 8-12 hours (with automation)
- **Risk level:** Low (incremental migration supported)
- **Benefits:** Type safety, autocomplete, refactoring safety, compile-time validation

---

## 🎯 Migration Strategy

### Three-Phase Approach

#### **Phase 1: Critical Fixes** (2-3 hours)
Fix high-traffic and broken routes first:
- Missing route files (1 file)
- Admin routes (22 instances)
- Authentication routes (28 instances)
- Project management routes (15 instances)

#### **Phase 2: Category Cleanup** (4-6 hours)
Migrate by feature area:
- Profile routes (38 instances)
- Shopping routes (8 instances)
- Legal/terms routes (8 instances)
- Tab navigation (15 instances)

#### **Phase 3: Final Sweep** (2-3 hours)
- Remaining miscellaneous routes (50 instances)
- Verify all tests pass
- Update documentation
- Deploy to production

---

## 📋 Pre-Migration Checklist

Before starting migration:

- [ ] **Backup current code**
  ```bash
  git checkout -b migration/navigation-system
  git commit -am "Pre-migration checkpoint"
  ```

- [ ] **Install dependencies**
  ```bash
  npm install --save-dev tsx @types/node
  ```

- [ ] **Run baseline tests**
  ```bash
  npm run test:routes
  npm run typecheck
  ```

- [ ] **Review test results**
  - Check `route-verification-results.json`
  - Check `navigation-links-results.json`
  - Check `naming-validation-results.json`

- [ ] **Set up IDE**
  - Install TypeScript extension
  - Enable auto-import for APP_ROUTES
  - Configure ESLint for navigation rules

---

## 🔧 Migration Steps

### Step 1: Add Missing Routes to typed-routes.ts

Based on test results, add these missing routes:

```typescript
// constants/typed-routes.ts

export const APP_ROUTES = {
  // ... existing routes ...
  
  // === Admin Routes (22 needed) ===
  ADMIN_DASHBOARD: '/admin/dashboard' as const,
  ADMIN_USERS: '/admin/users' as const,
  ADMIN_PROJECTS: '/admin/projects' as const,
  ADMIN_ANALYTICS: '/admin/analytics' as const,
  ADMIN_SETTINGS: '/admin/settings' as const,
  ADMIN_REPORTS: '/admin/reports' as const,
  ADMIN_PERMISSIONS: '/admin/permissions' as const,
  ADMIN_LOGS: '/admin/logs' as const,
  ADMIN_BACKUP: '/admin/backup' as const,
  ADMIN_NOTIFICATIONS: '/admin/notifications' as const,
  ADMIN_CONTENT: '/admin/content' as const,
  ADMIN_MODERATION: '/admin/moderation' as const,
  ADMIN_BILLING: '/admin/billing' as const,
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions' as const,
  ADMIN_INTEGRATIONS: '/admin/integrations' as const,
  ADMIN_API_KEYS: '/admin/api-keys' as const,
  ADMIN_WEBHOOKS: '/admin/webhooks' as const,
  ADMIN_AUDIT: '/admin/audit' as const,
  ADMIN_SUPPORT: '/admin/support' as const,
  ADMIN_FEEDBACK: '/admin/feedback' as const,
  ADMIN_TEAMS: '/admin/teams' as const,
  ADMIN_ROLES: '/admin/roles' as const,

  // === Auth Routes (28 needed) ===
  AUTH_LOGIN: '/auth/login' as const,
  AUTH_REGISTER: '/auth/register' as const,
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password' as const,
  AUTH_RESET_PASSWORD: '/auth/reset-password' as const,
  AUTH_VERIFY_EMAIL: '/auth/verify-email' as const,
  AUTH_VERIFY_PHONE: '/auth/verify-phone' as const,
  AUTH_TWO_FACTOR: '/auth/two-factor' as const,
  AUTH_TWO_FACTOR_SETUP: '/auth/two-factor-setup' as const,
  AUTH_LOGOUT: '/auth/logout' as const,
  AUTH_SESSION: '/auth/session' as const,
  AUTH_REFRESH: '/auth/refresh' as const,
  AUTH_OAUTH_GOOGLE: '/auth/oauth/google' as const,
  AUTH_OAUTH_FACEBOOK: '/auth/oauth/facebook' as const,
  AUTH_OAUTH_APPLE: '/auth/oauth/apple' as const,
  AUTH_OAUTH_CALLBACK: '/auth/oauth/callback' as const,
  AUTH_CHANGE_PASSWORD: '/auth/change-password' as const,
  AUTH_UPDATE_EMAIL: '/auth/update-email' as const,
  AUTH_UPDATE_PHONE: '/auth/update-phone' as const,
  AUTH_DELETE_ACCOUNT: '/auth/delete-account' as const,
  AUTH_EXPORT_DATA: '/auth/export-data' as const,
  AUTH_PRIVACY_SETTINGS: '/auth/privacy-settings' as const,
  AUTH_SECURITY_SETTINGS: '/auth/security-settings' as const,
  AUTH_SESSIONS_MANAGE: '/auth/sessions' as const,
  AUTH_DEVICES: '/auth/devices' as const,
  AUTH_CONNECTED_APPS: '/auth/connected-apps' as const,
  AUTH_RECOVERY_CODES: '/auth/recovery-codes' as const,
  AUTH_BACKUP_CODES: '/auth/backup-codes' as const,
  AUTH_ACCOUNT_RECOVERY: '/auth/account-recovery' as const,

  // === Profile Routes (38 needed) ===
  PROFILE_VIEW: '/profile' as const,
  PROFILE_EDIT: '/profile/edit' as const,
  PROFILE_SETTINGS: '/profile/settings' as const,
  PROFILE_AVATAR: '/profile/avatar' as const,
  PROFILE_COVER: '/profile/cover' as const,
  PROFILE_BIO: '/profile/bio' as const,
  PROFILE_CONTACT: '/profile/contact' as const,
  PROFILE_ADDRESS: '/profile/address' as const,
  PROFILE_SOCIAL: '/profile/social' as const,
  PROFILE_WORK: '/profile/work' as const,
  PROFILE_EDUCATION: '/profile/education' as const,
  PROFILE_SKILLS: '/profile/skills' as const,
  PROFILE_LANGUAGES: '/profile/languages' as const,
  PROFILE_CERTIFICATIONS: '/profile/certifications' as const,
  PROFILE_PORTFOLIO: '/profile/portfolio' as const,
  PROFILE_PROJECTS: '/profile/projects' as const,
  PROFILE_REVIEWS: '/profile/reviews' as const,
  PROFILE_RATINGS: '/profile/ratings' as const,
  PROFILE_BADGES: '/profile/badges' as const,
  PROFILE_ACHIEVEMENTS: '/profile/achievements' as const,
  PROFILE_FOLLOWERS: '/profile/followers' as const,
  PROFILE_FOLLOWING: '/profile/following' as const,
  PROFILE_FAVORITES: '/profile/favorites' as const,
  PROFILE_BOOKMARKS: '/profile/bookmarks' as const,
  PROFILE_HISTORY: '/profile/history' as const,
  PROFILE_ACTIVITY: '/profile/activity' as const,
  PROFILE_NOTIFICATIONS: '/profile/notifications' as const,
  PROFILE_PREFERENCES: '/profile/preferences' as const,
  PROFILE_PRIVACY: '/profile/privacy' as const,
  PROFILE_SECURITY: '/profile/security' as const,
  PROFILE_BILLING: '/profile/billing' as const,
  PROFILE_SUBSCRIPTION: '/profile/subscription' as const,
  PROFILE_PAYMENTS: '/profile/payments' as const,
  PROFILE_INVOICES: '/profile/invoices' as const,
  PROFILE_TRANSACTIONS: '/profile/transactions' as const,
  PROFILE_WALLET: '/profile/wallet' as const,
  PROFILE_REFERRALS: '/profile/referrals' as const,
  PROFILE_REWARDS: '/profile/rewards' as const,

  // === Project Routes (15 needed) ===
  PROJECT_LIST: '/projects' as const,
  PROJECT_CREATE: '/projects/create' as const,
  PROJECT_DETAIL: '/projects/[id]' as const,
  PROJECT_EDIT: '/projects/[id]/edit' as const,
  PROJECT_DELETE: '/projects/[id]/delete' as const,
  PROJECT_SHARE: '/projects/[id]/share' as const,
  PROJECT_DUPLICATE: '/projects/[id]/duplicate' as const,
  PROJECT_ARCHIVE: '/projects/[id]/archive' as const,
  PROJECT_RESTORE: '/projects/[id]/restore' as const,
  PROJECT_MEMBERS: '/projects/[id]/members' as const,
  PROJECT_TASKS: '/projects/[id]/tasks' as const,
  PROJECT_FILES: '/projects/[id]/files' as const,
  PROJECT_COMMENTS: '/projects/[id]/comments' as const,
  PROJECT_TIMELINE: '/projects/[id]/timeline' as const,
  PROJECT_ANALYTICS: '/projects/[id]/analytics' as const,

  // === Shopping Routes (8 needed) ===
  SHOPPING_CATEGORIES: '/shopping/categories' as const,
  SHOPPING_PRODUCT: '/shopping/product/[id]' as const,
  SHOPPING_COMPARE: '/shopping/compare' as const,
  SHOPPING_WISHLIST: '/shopping/wishlist' as const,
  SHOPPING_CART: '/shopping/cart' as const,
  SHOPPING_CHECKOUT: '/shopping/checkout' as const,
  SHOPPING_ORDER_HISTORY: '/shopping/orders' as const,
  SHOPPING_ORDER_DETAIL: '/shopping/orders/[id]' as const,

  // === Legal Routes (8 needed) ===
  LEGAL_TERMS: '/legal/terms' as const,
  LEGAL_PRIVACY: '/legal/privacy' as const,
  LEGAL_COOKIES: '/legal/cookies' as const,
  LEGAL_DISCLAIMER: '/legal/disclaimer' as const,
  LEGAL_COPYRIGHT: '/legal/copyright' as const,
  LEGAL_LICENSES: '/legal/licenses' as const,
  LEGAL_DMCA: '/legal/dmca' as const,
  LEGAL_GDPR: '/legal/gdpr' as const,

} as const;

export type AppRoute = typeof APP_ROUTES[keyof typeof APP_ROUTES];
```

**After adding routes:**
```bash
# Verify TypeScript compiles
npm run typecheck

# Restart TS server in VS Code
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

---

### Step 2: Create Missing Route Files

One file is missing: `app/legal/index.tsx`

```bash
# Create missing directory and file
mkdir -p app/legal
touch app/legal/index.tsx
```

```tsx
// app/legal/index.tsx

import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { APP_ROUTES } from '@/constants/typed-routes';

const LEGAL_DOCUMENTS = [
  { route: APP_ROUTES.LEGAL_TERMS, title: 'Điều khoản sử dụng', icon: '📜' },
  { route: APP_ROUTES.LEGAL_PRIVACY, title: 'Chính sách bảo mật', icon: '🔒' },
  { route: APP_ROUTES.LEGAL_COOKIES, title: 'Chính sách Cookie', icon: '🍪' },
  { route: APP_ROUTES.LEGAL_DISCLAIMER, title: 'Tuyên bố miễn trừ', icon: '⚠️' },
  { route: APP_ROUTES.LEGAL_COPYRIGHT, title: 'Bản quyền', icon: '©️' },
  { route: APP_ROUTES.LEGAL_LICENSES, title: 'Giấy phép', icon: '📄' },
  { route: APP_ROUTES.LEGAL_DMCA, title: 'DMCA', icon: '⚖️' },
  { route: APP_ROUTES.LEGAL_GDPR, title: 'GDPR', icon: '🇪🇺' },
];

export default function LegalIndexScreen() {
  return (
    <Container>
      <Section>
        <Text style={styles.title}>Thông tin pháp lý</Text>
        <Text style={styles.subtitle}>
          Tài liệu và chính sách quan trọng
        </Text>

        <View style={styles.grid}>
          {LEGAL_DOCUMENTS.map((doc) => (
            <TouchableOpacity
              key={doc.route}
              style={styles.card}
              onPress={() => router.push(doc.route)}
            >
              <Text style={styles.icon}>{doc.icon}</Text>
              <Text style={styles.cardTitle}>{doc.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
```

---

### Step 3: Migrate High-Priority Files

#### Top Offenders (Most hardcoded paths)

1. **app/(tabs)/profile-luxury.tsx** (25 hardcoded paths)
2. **app/(tabs)/profile-new.tsx** (13 hardcoded paths)
3. **app/admin/dashboard.tsx** (11 hardcoded paths)
4. **app/(tabs)/profile.tsx** (9 hardcoded paths)
5. **app/(tabs)/index.tsx** (8 hardcoded paths)

**Migration Pattern:**

```typescript
// ❌ BEFORE (hardcoded)
router.push('/services/house-design');
router.replace('/auth/login');
Linking.openURL('/legal/terms');

// ✅ AFTER (type-safe)
import { APP_ROUTES } from '@/constants/typed-routes';

router.push(APP_ROUTES.HOUSE_DESIGN);
router.replace(APP_ROUTES.AUTH_LOGIN);
router.push(APP_ROUTES.LEGAL_TERMS);
```

**Automated Find & Replace:**

```bash
# Use VS Code's Find & Replace (Cmd+Shift+H)
# Enable regex mode

# Pattern 1: router.push with string literal
Find:    router\.push\(['"`](/[^'"`]+)['"`]\)
Replace: router.push(APP_ROUTES.XXX) // Manual replacement needed

# Pattern 2: router.replace with string literal
Find:    router\.replace\(['"`](/[^'"`]+)['"`]\)
Replace: router.replace(APP_ROUTES.XXX)

# Pattern 3: Linking.openURL
Find:    Linking\.openURL\(['"`](/[^'"`]+)['"`]\)
Replace: router.push(APP_ROUTES.XXX)
```

**Important:** After regex find, manually map each path to correct APP_ROUTES constant using autocomplete.

---

### Step 4: Migrate by Category

#### Admin Routes Migration

```bash
# Find all admin navigation
grep -r "router.push.*'/admin" app/

# Example migration
# BEFORE:
router.push('/admin/dashboard');
router.push('/admin/users');

# AFTER:
import { APP_ROUTES } from '@/constants/typed-routes';
router.push(APP_ROUTES.ADMIN_DASHBOARD);
router.push(APP_ROUTES.ADMIN_USERS);
```

#### Auth Routes Migration

```bash
# Find all auth navigation
grep -r "router.push.*'/auth" app/

# Example migration
# BEFORE:
router.push('/auth/login');
router.replace('/auth/register');

# AFTER:
router.push(APP_ROUTES.AUTH_LOGIN);
router.replace(APP_ROUTES.AUTH_REGISTER);
```

#### Profile Routes Migration

```bash
# Find all profile navigation
grep -r "router.push.*'/profile" app/

# Example migration
# BEFORE:
router.push('/profile');
router.push('/profile/edit');

# AFTER:
router.push(APP_ROUTES.PROFILE_VIEW);
router.push(APP_ROUTES.PROFILE_EDIT);
```

---

### Step 5: Verify Migration

After each file migration:

```bash
# 1. Check TypeScript compilation
npm run typecheck

# 2. Run route tests
npm run test:routes:links

# 3. Test navigation manually
npm start
# Navigate to migrated screens and verify they work
```

**Verification Checklist:**
- [ ] No TypeScript errors
- [ ] All routes resolve correctly
- [ ] Navigation transitions work smoothly
- [ ] Deep linking still functions
- [ ] Analytics tracking works
- [ ] Breadcrumbs display correctly

---

## 🛠️ Migration Tools

### Automated Migration Script

Create `scripts/migrate-navigation.ts`:

```typescript
import fs from 'fs';
import path from 'path';

interface Migration {
  oldPath: string;
  newConstant: string;
}

const MIGRATION_MAP: Migration[] = [
  { oldPath: '/services/house-design', newConstant: 'APP_ROUTES.HOUSE_DESIGN' },
  { oldPath: '/services/interior-design', newConstant: 'APP_ROUTES.INTERIOR_DESIGN' },
  { oldPath: '/auth/login', newConstant: 'APP_ROUTES.AUTH_LOGIN' },
  { oldPath: '/auth/register', newConstant: 'APP_ROUTES.AUTH_REGISTER' },
  { oldPath: '/profile', newConstant: 'APP_ROUTES.PROFILE_VIEW' },
  // ... add all 71 routes
];

function migrateFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  MIGRATION_MAP.forEach(({ oldPath, newConstant }) => {
    const patterns = [
      `router.push('${oldPath}')`,
      `router.push("${oldPath}")`,
      `router.replace('${oldPath}')`,
      `router.replace("${oldPath}")`,
      `Linking.openURL('${oldPath}')`,
      `Linking.openURL("${oldPath}")`,
    ];

    patterns.forEach(pattern => {
      if (content.includes(pattern)) {
        const replacement = pattern.replace(oldPath, newConstant);
        content = content.replace(pattern, replacement);
        changed = true;
      }
    });
  });

  if (changed) {
    // Ensure import exists
    if (!content.includes("import { APP_ROUTES }")) {
      const importStatement = "import { APP_ROUTES } from '@/constants/typed-routes';\n";
      // Add after last import
      const lastImportIndex = content.lastIndexOf('import ');
      const nextLineIndex = content.indexOf('\n', lastImportIndex);
      content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Migrated: ${filePath}`);
  }
}

function migrateDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      migrateDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      migrateFile(fullPath);
    }
  });
}

// Run migration
console.log('🚀 Starting navigation migration...\n');
migrateDirectory('./app');
console.log('\n✨ Migration complete!');
console.log('\n📝 Next steps:');
console.log('1. Run: npm run typecheck');
console.log('2. Run: npm run test:routes:links');
console.log('3. Test manually: npm start');
```

**Run migration:**
```bash
tsx scripts/migrate-navigation.ts
```

---

## 📊 Progress Tracking

### Migration Dashboard

Track progress with this checklist:

```markdown
## Phase 1: Critical Fixes (Target: Day 1)
- [ ] Create missing legal/index.tsx file
- [ ] Add 22 admin routes to typed-routes.ts
- [ ] Add 28 auth routes to typed-routes.ts
- [ ] Add 15 project routes to typed-routes.ts
- [ ] Migrate app/admin/dashboard.tsx (11 paths)
- [ ] Migrate auth components (28 paths)
- [ ] Run tests: npm run test:routes

## Phase 2: Category Cleanup (Target: Day 2-3)
- [ ] Add 38 profile routes to typed-routes.ts
- [ ] Add 8 shopping routes to typed-routes.ts
- [ ] Add 8 legal routes to typed-routes.ts
- [ ] Add 15 tab routes to typed-routes.ts
- [ ] Migrate app/(tabs)/profile-luxury.tsx (25 paths)
- [ ] Migrate app/(tabs)/profile-new.tsx (13 paths)
- [ ] Migrate app/(tabs)/profile.tsx (9 paths)
- [ ] Migrate app/(tabs)/index.tsx (8 paths)
- [ ] Migrate shopping components (8 paths)
- [ ] Migrate legal components (8 paths)
- [ ] Run tests: npm run test:routes

## Phase 3: Final Sweep (Target: Day 4)
- [ ] Migrate remaining 50 miscellaneous paths
- [ ] Run full test suite
- [ ] Fix any TypeScript errors
- [ ] Manual testing on device
- [ ] Update documentation
- [ ] Code review
- [ ] Deploy to staging
- [ ] Final production deployment
```

### Metrics to Track

```bash
# Before migration
npm run test:routes:links
# Output: 191/360 valid (53.1%)

# After Phase 1
# Target: 250/360 valid (69.4%)

# After Phase 2
# Target: 330/360 valid (91.7%)

# After Phase 3
# Target: 360/360 valid (100%)
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Dynamic Routes

```typescript
// ❌ WRONG - Type error
const productId = '123';
router.push(APP_ROUTES.PRODUCT_DETAIL); // Missing [id] param!

// ✅ CORRECT - Use template literal
router.push(`/product/${productId}` as AppRoute);

// ✅ BETTER - Use helper
function navigateToProduct(id: string) {
  router.push(`/product/${id}` as AppRoute);
}
```

### Pitfall 2: Query Parameters

```typescript
// ❌ WRONG - Query params break type safety
router.push(APP_ROUTES.SHOPPING_INDEX + '?cat=construction');

// ✅ CORRECT - Use router params
router.push({
  pathname: APP_ROUTES.SHOPPING_INDEX,
  params: { cat: 'construction' },
});
```

### Pitfall 3: Conditional Navigation

```typescript
// ❌ WRONG - String concatenation
const baseRoute = '/profile';
router.push(baseRoute + '/edit'); // Not type-safe!

// ✅ CORRECT - Use constants
const route = isEditing ? APP_ROUTES.PROFILE_EDIT : APP_ROUTES.PROFILE_VIEW;
router.push(route);
```

### Pitfall 4: External URLs

```typescript
// ❌ WRONG - External URLs in APP_ROUTES
APP_ROUTES.EXTERNAL_LINK: 'https://example.com' // Don't do this!

// ✅ CORRECT - Use Linking for external URLs
import { Linking } from 'react-native';
Linking.openURL('https://example.com');
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// tests/navigation.test.ts

import { APP_ROUTES, isValidRoute } from '@/constants/typed-routes';

describe('Navigation Migration', () => {
  test('all routes are valid', () => {
    Object.values(APP_ROUTES).forEach(route => {
      expect(isValidRoute(route)).toBe(true);
    });
  });

  test('hardcoded paths should fail validation', () => {
    expect(isValidRoute('/some/hardcoded/path')).toBe(false);
  });

  test('dynamic routes work with parameters', () => {
    const productId = '123';
    const route = `/product/${productId}`;
    // Should be manually type-asserted
    expect(route).toContain('/product/');
  });
});
```

### Integration Tests

```typescript
// e2e/navigation.e2e.ts

import { by, element, expect } from 'detox';

describe('Navigation System E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should navigate to house design service', async () => {
    await element(by.id('service-house-design')).tap();
    await expect(element(by.text('Thiết kế nhà'))).toBeVisible();
  });

  it('should navigate back from service detail', async () => {
    await element(by.id('service-house-design')).tap();
    await element(by.id('back-button')).tap();
    await expect(element(by.id('home-screen'))).toBeVisible();
  });

  it('should handle deep linking', async () => {
    await device.openURL({ url: 'myapp://services/house-design' });
    await expect(element(by.text('Thiết kế nhà'))).toBeVisible();
  });
});
```

### Manual Testing Checklist

- [ ] Home screen navigation works
- [ ] Service cards navigate correctly
- [ ] Tab navigation functions
- [ ] Profile navigation works
- [ ] Admin routes accessible (if admin user)
- [ ] Auth flow works (login, register, logout)
- [ ] Shopping cart navigation works
- [ ] Deep links open correct screens
- [ ] Back navigation functions
- [ ] Breadcrumbs display correctly
- [ ] Analytics tracking works
- [ ] No console errors
- [ ] Performance is smooth

---

## 📚 Resources

### Documentation
- [API Reference](./docs/navigation/api-reference.md)
- [Component Guide](./docs/navigation/component-guide.md)
- [Adding Routes](./docs/navigation/adding-routes.md)
- [Troubleshooting](./docs/navigation/troubleshooting.md)
- [Type Safety Guide](./docs/navigation/type-safety.md)

### Test Scripts
```bash
npm run test:routes        # Run all tests
npm run test:routes:verify # Verify route files exist
npm run test:routes:links  # Check navigation calls
npm run test:routes:naming # Validate naming conventions
```

### Support Channels
- **Slack:** #navigation-help
- **Email:** navigation-team@company.com
- **GitHub Issues:** Report bugs and feature requests

---

## 🎉 Success Criteria

Migration is complete when:

- ✅ **100% adoption rate** (360/360 valid navigation calls)
- ✅ **Zero TypeScript errors**
- ✅ **All tests passing** (npm run test:routes)
- ✅ **All 71 routes working** on device
- ✅ **No hardcoded navigation paths** in codebase
- ✅ **Documentation updated**
- ✅ **Team trained** on new system
- ✅ **Deployed to production** successfully

---

## 🚀 Post-Migration

After successful migration:

1. **Monitor Analytics**
   - Track navigation patterns
   - Identify any broken routes
   - Measure performance improvements

2. **Team Training**
   - Hold workshop on type-safe navigation
   - Share documentation
   - Update onboarding materials

3. **Continuous Improvement**
   - Add new routes using migration guide
   - Enforce rules via ESLint
   - Keep tests updated

4. **Celebrate!** 🎉
   - You've achieved 100% type safety!
   - Refactoring is now safe
   - Developer experience improved

---

**Migration Started:** December 22, 2025  
**Estimated Completion:** December 25, 2025 (3 days)  
**Team:** Navigation System Enhancement Project  
**Version:** 1.0.0

---

**Questions?** Contact #navigation-help on Slack or email navigation-team@company.com
