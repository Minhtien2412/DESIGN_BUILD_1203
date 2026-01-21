# 📋 WEEK 1 DETAILED ACTION PLAN
## Code Quality & Stability

**Timeline:** Day 1-5 (Today - Friday)  
**Status:** ⚡ IN PROGRESS

---

## ✅ COMPLETED TODAY (Day 1)

### 1. TypeScript Strict Mode ✅
- **Status:** Already enabled in tsconfig.json
- **Finding:** 308 TypeScript errors discovered across 78 files
- **Categorization:**
  - Missing types: 132 errors
  - Import errors: 45 errors
  - Type mismatches: 78 errors
  - useRef issues: 12 errors
  - E2E test issues: 41 errors

### 2. Services Layer Fixed ✅
**Files Fixed:**
- ✅ `services/api/types.ts` - Added `disk` property to SystemHealth
- ✅ `services/galleryService.ts` - Fixed result.ok validation
- ✅ `services/perfexFullSync.ts` - Fixed timer type (ReturnType<typeof setInterval>)
- ✅ `services/perfexCRM.ts` - Added milestone_id and progress to PerfexTask
- ✅ `services/phaseService.ts` - Fixed getByProject method call
- ✅ `services/uploadService.ts` - Mocked missing react-native packages

**Errors Fixed:** 9 errors → 0 errors in services/

---

## 🚧 IN PROGRESS (Day 1 Afternoon)

### 3. Hooks Layer (Current Task)
**Files to Fix:**
- [ ] `hooks/useGoogleAuth.ts` - 2 errors (useProxy property)
- [ ] `hooks/useNotifications.ts` - 1 error (setInterval type)
- [ ] `hooks/useTokenRefresh.ts` - 1 error (setInterval type)
- [ ] `hooks/usePushNotifications.ts` - 5 errors (useRef, missing methods)

**Strategy:**
1. Fix timer types: Change `NodeJS.Timeout` → `ReturnType<typeof setInterval>`
2. Fix useRef: Add proper initial values `useRef<any>(null)` or `useRef<any>(undefined)`
3. Fix useProxy: Check expo-auth-session docs or use @ts-expect-error comment
4. Fix missing methods: Add proper type definitions or create utility functions

---

## 📅 REMAINING WEEK 1 SCHEDULE

### Day 1 (Today) - Services & Hooks
- [x] Enable TypeScript strict mode
- [x] Run diagnostics (npx tsc --noEmit)
- [x] Fix services/ folder (9 errors fixed)
- [ ] Fix hooks/ folder (~9 errors)
- [ ] Quick test: npm start (verify no crashes)

**Target:** Fix 20-25 errors today

---

### Day 2 (Tuesday) - Context & Components
**Morning:**
- [ ] Fix `context/AuthContext.tsx` (6 errors)
- [ ] Fix `context/NotificationsContext.tsx` (4 errors)
- [ ] Fix `context/MeetingContext.tsx` (if any)

**Afternoon:**
- [ ] Fix `components/ui/skeletons.tsx` (19 errors - highest priority)
- [ ] Fix `components/social/PostCardInteractive.tsx` (1 error)
- [ ] Fix `components/social/StoriesViewer.tsx` (2 errors)
- [ ] Fix `components/meeting/MeetingTrackingCard.tsx` (4 errors)

**Target:** Fix 36 errors (10 context + 26 components)

---

### Day 3 (Wednesday) - App Screens Part 1
**High-Error Screens:**
- [ ] `app/profile/[userId].tsx` (11 errors)
- [ ] `app/projects/[id]/payment-progress.tsx` (8 errors)
- [ ] `app/projects/[id]/chat.tsx` (4 errors)
- [ ] `app/(tabs)/social.tsx` (4 errors)

**Medium-Error Screens:**
- [ ] `app/quality-assurance/inspections/index.tsx` (5 errors)
- [ ] `app/meet/[meetingId]/room.tsx` (3 errors)
- [ ] `app/timeline/phase/[id].tsx` (7 errors)

**Target:** Fix 42 errors in app screens

---

### Day 4 (Thursday) - Utilities, Tests & Backend
**Morning:**
- [ ] Fix `utils/lazy-components.tsx` (2 errors)
- [ ] Fix `utils/performance.ts` (2 errors)
- [ ] Fix lib/communication/webrtc.ts (1 error - mock react-native-webrtc)

**Afternoon:**
- [ ] Fix E2E tests (132 errors) - Create detox.d.ts global types file
- [ ] Fix unit test imports (7 files with import errors)
- [ ] Add `backend/` to tsconfig exclude or create separate backend tsconfig

**Strategy for E2E:**
```typescript
// Create testing/e2e/detox.d.ts
declare global {
  const device: any;
  const element: (matcher: any) => any;
  const by: any;
  const waitFor: (element: any) => any;
}
export {};
```

**Target:** Fix 145+ errors (tests + utils + backend)

---

### Day 5 (Friday) - Error Boundaries & Cleanup
**Morning:**
- [ ] Create `components/ErrorBoundary.tsx`
- [ ] Add ErrorBoundary to `app/_layout.tsx`
- [ ] Wrap critical screens (cart, product, auth) with error boundaries
- [ ] Test error boundary with intentional error

**Afternoon:**
- [ ] Search & remove console.log statements
  ```bash
  # Find all console.log
  grep -r "console\\.log" app/ components/ services/ hooks/ context/
  ```
- [ ] Run `npm run lint -- --fix`
- [ ] Run `npx tsc --noEmit` (verify 0 errors!)
- [ ] Final test on Android & iOS
- [ ] Create Phase 1 completion report

**Target:** Complete Phase 1, 0 TypeScript errors, clean code

---

## 📊 PROGRESS TRACKER

| Day | Task | Errors Start | Errors Fixed | Errors Remaining | Status |
|-----|------|--------------|--------------|------------------|--------|
| 1 | Services + Hooks | 308 | 9 (services) | 299 | 🟡 In Progress |
| 2 | Context + Components | 299 | Target: 36 | Target: 263 | ⚪ Pending |
| 3 | App Screens Part 1 | 263 | Target: 42 | Target: 221 | ⚪ Pending |
| 4 | Utils + Tests | 221 | Target: 145 | Target: 76 | ⚪ Pending |
| 5 | Cleanup + Boundaries | 76 | Target: 76 | Target: 0 ✅ | ⚪ Pending |

---

## 🎯 SUCCESS CRITERIA (End of Week 1)

### Must Have ✅
- [ ] **0 TypeScript errors** (npx tsc --noEmit passes)
- [ ] **ESLint passing** (npm run lint passes)
- [ ] **Error boundaries implemented** (app doesn't crash in production)
- [ ] **No console.log in production code** (only in dev utils)
- [ ] **App runs on Android & iOS** (no red screens)

### Should Have 🎯
- [ ] All imports resolved correctly
- [ ] Proper type annotations on all functions
- [ ] All React hooks have correct types
- [ ] Context APIs properly typed
- [ ] Navigation types working

### Nice to Have 💡
- [ ] JSDoc comments on public APIs
- [ ] Type guards for runtime checks
- [ ] Utility types for common patterns
- [ ] README update with type safety notes

---

## 🛠️ QUICK REFERENCE COMMANDS

### Check Errors
```bash
# Full TypeScript check
npx tsc --noEmit

# Check specific folder
npx tsc --noEmit --project . | grep "hooks/"

# Count errors
npx tsc --noEmit | grep "error TS" | wc -l
```

### Lint
```bash
# Auto-fix linting issues
npm run lint -- --fix

# Check only (no fix)
npm run lint

# Lint specific folder
npm run lint -- app/
```

### Test App
```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Find Console Logs
```bash
# Find all console.log
grep -r "console\.log" app/ components/ services/

# Count console.log
grep -r "console\.log" app/ components/ services/ | wc -l

# Find in specific folder
grep -r "console\.log" services/
```

---

## 📈 DAILY STANDUP FORMAT

### Today's Focus
- What: [Current task]
- Files: [Files being worked on]
- Blockers: [Any blockers or questions]

### Completed
- [List completed tasks]
- [Errors fixed count]

### Next
- [Next task to work on]
- [Expected completion time]

---

## 🚨 ESCALATION PATH

### If Stuck (>30 min on same error)
1. **Check documentation** - TypeScript, React, Expo docs
2. **Search similar issues** - GitHub, StackOverflow
3. **Use @ts-expect-error temporarily** - Add TODO comment
4. **Ask for help** - Team discussion or AI assistance
5. **Move to next task** - Don't block progress

### If Behind Schedule
- **Adjust scope**: Focus on critical path errors first
- **Parallelize**: Split tasks among team members
- **Skip non-critical**: E2E tests can be fixed in Week 2
- **Extend timeline**: Add extra day if needed

---

## ✅ END OF DAY 1 CHECKLIST

Before closing today:
- [ ] Commit current changes with descriptive message
- [ ] Update this file with progress
- [ ] Note any blockers or questions
- [ ] Plan tomorrow's specific tasks
- [ ] Push to branch (if working on feature branch)

---

**Last Updated:** Day 1 (January 10, 2026, 3:00 PM)  
**Next Review:** Day 2 (Tomorrow morning)  
**Owner:** Development Team

---

## 📞 SUPPORT

- **Documentation:** `/docs/guides/PRODUCTION_ROADMAP.md`
- **Visual Timeline:** `/docs/guides/VISUAL_ROADMAP.md`
- **Start Guide:** `/START_HERE.md`
- **This Plan:** `/WEEK1_DETAILED_PLAN.md`
