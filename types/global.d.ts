// Global developer convenience types to ease gradual migration.
// This file provides a small augmentation for RequestInit used across the repo
// so code that passes `token`, `data`, `timeoutMs` doesn't error while we
// iteratively migrate callers to the canonical ApiFetchOptions.

export { };

declare global {
  // Allow custom fetch-like options commonly used in the codebase
  interface RequestInit {
    token?: string;
    data?: any;
    timeoutMs?: number;
  }

  // Create a project-level alias so older callers that reference ApiFetchOptions
  // in the global scope can resolve. Prefer importing the real `ApiFetchOptions`
  // from `services/api` where available.
  type ApiFetchOptions = RequestInit & {
    token?: string;
    data?: any;
    timeoutMs?: number;
  };
}
