/**
 * Sentry Error Monitoring Service
 * Tích hợp Sentry cho error tracking và performance monitoring
 */

import * as Sentry from '@sentry/react-native';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || 
  'https://295d16b1ab0f6d8591c062f619da9411@o4510695460372480.ingest.de.sentry.io/4510695463190608';

let isInitialized = false;

/**
 * Khởi tạo Sentry
 */
export function initSentry(options?: {
  environment?: string;
  debug?: boolean;
  tracesSampleRate?: number;
}): void {
  if (isInitialized) return;

  try {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: options?.environment || process.env.EXPO_PUBLIC_ENV || 'development',
      debug: options?.debug ?? __DEV__,
      tracesSampleRate: options?.tracesSampleRate ?? 0.2,
      // Integrations
      integrations: [
        Sentry.reactNativeTracingIntegration(),
      ],
      // Don't send errors in development by default
      enabled: !__DEV__,
      // Ignore common non-critical errors
      ignoreErrors: [
        'Network request failed',
        'AbortError',
        'TypeError: Network request failed',
        'TypeError: Failed to fetch',
      ],
    });

    isInitialized = true;
    console.log('✅ Sentry initialized');
  } catch (error) {
    console.error('❌ Sentry init error:', error);
  }
}

/**
 * Capture exception (lỗi)
 */
export function captureException(
  error: Error | string,
  context?: Record<string, any>
): void {
  if (typeof error === 'string') {
    error = new Error(error);
  }

  if (context) {
    Sentry.setContext('additional', context);
  }

  Sentry.captureException(error);

  // Log in development
  if (__DEV__) {
    console.error('🐛 [Sentry] Exception:', error.message, context);
  }
}

/**
 * Capture message (thông báo)
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  Sentry.captureMessage(message, level);

  if (__DEV__) {
    console.log(`📝 [Sentry ${level}]:`, message);
  }
}

/**
 * Set user context
 */
export function setUser(user: {
  id?: string;
  email?: string;
  username?: string;
  [key: string]: any;
} | null): void {
  if (user) {
    Sentry.setUser(user);
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb (navigation trail)
 */
export function addBreadcrumb(options: {
  category: string;
  message: string;
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  data?: Record<string, any>;
}): void {
  Sentry.addBreadcrumb({
    category: options.category,
    message: options.message,
    level: options.level || 'info',
    data: options.data,
  });
}

/**
 * Set tag
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

/**
 * Set context
 */
export function setContext(name: string, context: Record<string, any>): void {
  Sentry.setContext(name, context);
}

/**
 * Start a transaction (performance monitoring)
 */
export function startTransaction(options: {
  name: string;
  op: string;
  description?: string;
}): Sentry.Span | undefined {
  return Sentry.startInactiveSpan({
    name: options.name,
    op: options.op,
    attributes: options.description ? { description: options.description } : undefined,
  });
}

/**
 * Wrap async function with error handling
 */
export function wrapAsync<T>(
  fn: () => Promise<T>,
  errorContext?: string
): Promise<T> {
  return fn().catch((error) => {
    captureException(error, { context: errorContext });
    throw error;
  });
}

/**
 * API Error Handler - tự động track API errors
 */
export function trackAPIError(
  endpoint: string,
  error: Error,
  requestData?: any
): void {
  Sentry.withScope((scope) => {
    scope.setTag('api_endpoint', endpoint);
    scope.setContext('request', {
      endpoint,
      data: requestData,
    });
    Sentry.captureException(error);
  });
}

/**
 * Track screen view
 */
export function trackScreenView(screenName: string, params?: Record<string, any>): void {
  addBreadcrumb({
    category: 'navigation',
    message: `Viewed screen: ${screenName}`,
    data: params,
  });
}

/**
 * Track user action
 */
export function trackUserAction(
  action: string,
  category: string,
  data?: Record<string, any>
): void {
  addBreadcrumb({
    category,
    message: action,
    data,
  });
}

/**
 * Kiểm tra Sentry status
 */
export function checkSentryStatus(): {
  initialized: boolean;
  dsn: string;
  enabled: boolean;
} {
  return {
    initialized: isInitialized,
    dsn: SENTRY_DSN ? 'Configured' : 'Not configured',
    enabled: !__DEV__,
  };
}

/**
 * Flush pending events
 */
export async function flush(): Promise<boolean> {
  return Sentry.flush();
}

export const SentryService = {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setTag,
  setContext,
  startTransaction,
  wrapAsync,
  trackAPIError,
  trackScreenView,
  trackUserAction,
  checkSentryStatus,
  flush,
};

export default SentryService;
