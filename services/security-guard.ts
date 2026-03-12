/**
 * Security Guard - Enforce Backend-Only Data Access
 * 
 * CRITICAL SECURITY RULE:
 * Mobile apps MUST NEVER connect directly to database.
 * All data access MUST go through authenticated backend API.
 * 
 * WHY?
 * 1. Prevent credential exposure (reverse engineering)
 * 2. Enforce authentication & authorization
 * 3. Enable audit logging
 * 4. Apply rate limiting & validation
 * 5. Protect against SQL injection
 */

const ALLOW_DIRECT_DB = false; // Set to false in production

export class SecurityViolationError extends Error {
  constructor(operation: string) {
    super(
      `[SECURITY] Direct database access blocked: ${operation}\n\n` +
      `REASON: Mobile apps must use backend API for security.\n\n` +
      `CORRECT APPROACH:\n` +
      `  ❌ databaseManager.read('users', { id })\n` +
      `  ✅ apiFetch('/api/users/' + id)\n\n` +
      `WHY?\n` +
      `  • Prevents credential exposure\n` +
      `  • Enforces authentication\n` +
      `  • Enables audit logging\n` +
      `  • Protects against SQL injection\n\n` +
      `If you're testing locally, set ALLOW_DIRECT_DB=true in security-guard.ts`
    );
    this.name = 'SecurityViolationError';
  }
}

/**
 * Check if direct database access is allowed
 * Throws SecurityViolationError if blocked
 */
export function assertDatabaseAccessAllowed(operation: string): void {
  if (!ALLOW_DIRECT_DB) {
    throw new SecurityViolationError(operation);
  }
  
  // Log warning even if allowed (for development)
  console.warn(
    `[SECURITY WARNING] Direct database access detected: ${operation}\n` +
    `This is only allowed in development. Use backend API in production.`
  );
}

/**
 * Wrapper to disable database manager in production
 */
export function guardDatabaseOperation<T>(
  operation: string,
  callback: () => Promise<T>
): Promise<T> {
  assertDatabaseAccessAllowed(operation);
  return callback();
}

// Environment-based toggle
export const isDatabaseAccessAllowed = (): boolean => {
  // Only allow in development mode
  const isDev = __DEV__ || process.env.NODE_ENV === 'development';
  return ALLOW_DIRECT_DB && isDev;
};

/**
 * Recommend backend API endpoint for given operation
 */
export function suggestBackendEndpoint(operation: string, table: string, params?: any): string {
  const suggestions: Record<string, string> = {
    'projects.list': 'GET /api/projects',
    'projects.get': 'GET /api/projects/:id',
    'projects.create': 'POST /api/projects',
    'projects.update': 'PUT /api/projects/:id',
    'projects.delete': 'DELETE /api/projects/:id',
    'users.list': 'GET /api/users',
    'users.get': 'GET /api/users/:id',
    'auth.login': 'POST /auth/login',
    'auth.me': 'GET /auth/me',
  };

  const key = `${table}.${operation}`;
  return suggestions[key] || `GET /api/${table}`;
}

export default {
  assertDatabaseAccessAllowed,
  guardDatabaseOperation,
  isDatabaseAccessAllowed,
  suggestBackendEndpoint,
  SecurityViolationError,
};
