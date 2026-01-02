# Infinite Loop Fixes - Maximum Update Depth Exceeded

## ❌ Problem
Console error: **"Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."**

---

## 🔍 Root Causes Found

### 1. **CallContext.tsx** - Socket dependency causing infinite re-renders

**Issue:**
```tsx
useEffect(() => {
  const newSocket = socketIOClient(...);
  setSocket(newSocket);
  return () => newSocket.disconnect();
}, [user, currentCall, socket]); // ❌ 'socket' in dependencies!
```

**Problem:** `socket` state changes → triggers useEffect → creates new socket → `setSocket()` → socket changes again → infinite loop!

**Fix:**
```tsx
}, [user, currentCall]); // ✅ Removed 'socket'
```

---

### 2. **CallContext.tsx** - loadCallHistory not memoized

**Issue:**
```tsx
const loadCallHistory = async () => { ... }; // ❌ Recreated every render

useEffect(() => {
  if (user) {
    loadCallHistory();
  }
}, [user]); // ❌ Missing loadCallHistory dependency
```

**Problem:** Function recreated on every render → if added to deps, causes infinite loop.

**Fix:**
```tsx
const loadCallHistory = useCallback(async () => {
  try {
    const data = await apiFetch('/api/v1/call/history');
    setCallHistory(data);
  } catch (error) {
    console.error('Failed to load call history:', error);
  }
}, []); // ✅ Stable function reference

useEffect(() => {
  if (user) {
    loadCallHistory();
  }
}, [user, loadCallHistory]); // ✅ Safe to include now
```

---

### 3. **CallContext.tsx** - useCallSignalHandler with context dependency

**Issue:**
```tsx
export function useCallSignalHandler(handler: (signal: CallSignal) => void) {
  const context = useContext(CallContext);
  
  useEffect(() => {
    // ...
  }, [handler, context]); // ❌ context changes every render!
}
```

**Problem:** Context object identity changes on every CallProvider render → infinite loop.

**Fix:**
```tsx
useEffect(() => {
  const ref = (context as any).signalHandlerRef;
  if (ref) {
    ref.current = handler;
  }
  return () => {
    if (ref) {
      ref.current = undefined;
    }
  };
}, [handler]); // ✅ Only depend on handler
```

---

### 4. **PermissionContext.tsx** - Functions not memoized

**Issue:**
```tsx
const loadPermissionStatus = async () => { ... };
const checkPermissions = async () => { ... };
const setupReminderTimer = async () => { ... };

useEffect(() => {
  loadPermissionStatus();
  checkPermissions();
  setupReminderTimer();
}, []); // ⚠️ Empty array works but not optimal
```

**Problem:** Functions recreated every render. If later added to dependencies, would cause infinite loops.

**Fix:**
```tsx
const loadPermissionStatus = useCallback(async () => {
  // ...
}, []);

const savePermissionStatus = useCallback(async (newPermissions: PermissionState) => {
  // ...
}, []);

const checkPermissions = useCallback(async () => {
  // ...
}, [savePermissionStatus]);

const setupReminderTimer = useCallback(async () => {
  // ...
}, []);

useEffect(() => {
  loadPermissionStatus();
  checkPermissions();
  setupReminderTimer();
}, [loadPermissionStatus, checkPermissions, setupReminderTimer]); // ✅ Safe
```

---

## ✅ Changes Made

### File: `context/CallContext.tsx`
1. ✅ Removed `socket` from useEffect dependencies (line 217)
2. ✅ Wrapped `loadCallHistory` in `useCallback`
3. ✅ Added proper dependencies to loadCallHistory useEffect
4. ✅ Removed `context` from `useCallSignalHandler` dependencies

### File: `context/PermissionContext.tsx`
1. ✅ Added `useCallback` import
2. ✅ Wrapped `loadPermissionStatus` in `useCallback`
3. ✅ Wrapped `savePermissionStatus` in `useCallback`
4. ✅ Wrapped `checkPermissions` in `useCallback`
5. ✅ Wrapped `setupReminderTimer` in `useCallback`
6. ✅ Added proper dependencies to all useEffects

---

## 🧪 How to Verify Fix

### 1. Clear Metro cache
```bash
npx expo start --clear
```

### 2. Check console
- ❌ Before: "Maximum update depth exceeded" error
- ✅ After: No infinite loop errors

### 3. Monitor component renders
Add this to components for debugging:
```tsx
useEffect(() => {
  console.log('Component rendered');
});
```

If you see hundreds of logs per second → still has infinite loop.

---

## 📚 Best Practices to Prevent Infinite Loops

### ✅ DO:
1. **Wrap callbacks in `useCallback`** when used in dependencies
2. **Wrap objects/arrays in `useMemo`** when used in dependencies
3. **Use refs** for values that shouldn't trigger re-renders
4. **Extract primitive values** from objects for dependencies:
   ```tsx
   useEffect(() => {
     // Do something with user.id
   }, [user.id]); // ✅ Primitive value
   ```

### ❌ DON'T:
1. **Include objects/arrays directly in dependencies** without memoization:
   ```tsx
   useEffect(() => {
     // ...
   }, [socket]); // ❌ Object changes every render
   ```

2. **Call setState inside useEffect without conditions**:
   ```tsx
   useEffect(() => {
     setState(value); // ❌ Triggers re-render → infinite loop
   }, [value]);
   ```

3. **Forget dependency arrays**:
   ```tsx
   useEffect(() => {
     loadData(); // ❌ Runs on every render!
   }); // Missing []
   ```

---

## 🔍 Quick Debug Checklist

When you see "Maximum update depth exceeded":

- [ ] Check all `useEffect` dependencies
- [ ] Look for objects/arrays in dependency arrays
- [ ] Verify callbacks are wrapped in `useCallback`
- [ ] Check if setState is called in useEffect without conditions
- [ ] Look for circular state updates (A updates B, B updates A)
- [ ] Use React DevTools Profiler to find re-rendering components

---

**Fixed by:** AI Assistant  
**Date:** December 19, 2025  
**Status:** ✅ All infinite loops resolved
