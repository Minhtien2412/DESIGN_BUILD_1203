// Minimal shim for zustand to reduce TS noise until proper types are installed.
// This declares the basic exported helpers used across the codebase.
declare module 'zustand' {
  // Permissive shim that supports both direct and curried generic forms used in the repo.
  // The real `create` returns a hook-like getter that can accept an optional selector.
  export function create<T>(fn: (set: any, get: any, api?: any) => T): (selector?: (state: T) => any) => any;
  export function create<T>(): (fn: (set: any, get: any, api?: any) => T) => (selector?: (state: T) => any) => any;
  const _default_create: typeof create;
  export default _default_create;
}

declare module 'zustand/middleware' {
  export const persist: any;
  export const createJSONStorage: any;
}
