/**
 * API Endpoints Configuration
 * Based on backend documentation: https://api.thietkeresort.com.vn
 */

// ===== AUTHENTICATION =====
export const AUTH_ENDPOINTS = {
  // Social Auth
  GOOGLE: '/auth/google',                    // POST { idToken }
  GOOGLE_REVOKE: '/auth/google/revoke',      // POST { token }
  FACEBOOK: '/auth/social',                  // POST (Facebook)
  
  // Standard Auth
  LOGIN: '/auth/login',                      // POST { email, password }
  REGISTER: '/auth/register',                // POST { email, password, name }
  LOGOUT: '/auth/logout',                    // POST
  ME: '/auth/me',                            // GET
  REFRESH: '/auth/refresh',                  // POST
  
  // Password
  FORGOT_PASSWORD: '/auth/forgot-password',  // POST { email }
  RESET_PASSWORD: '/auth/reset-password',    // POST { token, password }
} as const;

// ===== MESSAGING & CALLS =====
export const MESSAGING_ENDPOINTS = {
  // Conversations
  CONVERSATIONS: '/api/messages/conversations',              // GET
  CONVERSATION: (id: string) => `/api/messages/conversations/${id}`,  // GET
  CREATE_CONVERSATION: '/api/messages/conversations',        // POST
  
  // Messages
  MESSAGES: (conversationId: string) => `/api/messages/conversations/${conversationId}/messages`,  // GET
  SEND_MESSAGE: (conversationId: string) => `/api/messages/conversations/${conversationId}/messages`,  // POST
  
  // Calls
  CALLS: '/api/calls',                                      // GET
  CALL: (id: string) => `/api/calls/${id}`,                // GET
  START_CALL: '/api/calls/start',                          // POST
  END_CALL: (id: string) => `/api/calls/${id}/end`,       // POST
  
  // Call Management
  ACTIVE_CALLS: '/api/calls/active',                       // GET
  MISSED_CALLS: '/api/calls/missed',                       // GET
} as const;

// ===== NOTIFICATIONS =====
export const NOTIFICATION_ENDPOINTS = {
  // Get notifications
  LIST: '/api/notifications',                                      // GET
  UNREAD: '/api/notifications/unread',                            // GET
  UNREAD_COUNT: '/api/notifications/unread-counts',               // GET
  
  // Notification actions
  MARK_READ: (id: string) => `/api/notifications/${id}/read`,    // POST
  MARK_ALL_READ: '/api/notifications/read-all',                  // POST
  DELETE: (id: string) => `/api/notifications/${id}`,           // DELETE
} as const;

// ===== PROJECTS =====
export const PROJECT_ENDPOINTS = {
  // Projects CRUD
  LIST: '/api/projects',                                    // GET
  CREATE: '/api/projects',                                  // POST
  DETAIL: (id: string) => `/api/projects/${id}`,          // GET
  UPDATE: (id: string) => `/api/projects/${id}`,          // PUT
  DELETE: (id: string) => `/api/projects/${id}`,          // DELETE
  
  // Project Features
  TIMELINE: (id: string) => `/api/projects/${id}/timeline`,  // GET
  PAYMENTS: (id: string) => `/api/projects/${id}/payments`,  // GET
  DOCUMENTS: (id: string) => `/api/projects/${id}/documents`,  // GET
} as const;

// ===== CONTRACTORS =====
export const CONTRACTOR_ENDPOINTS = {
  LIST: '/api/contractors',                                  // GET
  DETAIL: (id: string) => `/api/contractors/${id}`,        // GET
  SEARCH: '/api/contractors/search',                        // POST
  VERIFY: '/api/contractors/verify',                        // POST
} as const;

// ===== VIDEOS =====
export const VIDEO_ENDPOINTS = {
  LIST: '/api/videos',                                      // GET ?category=design&limit=6
  DETAIL: (id: string) => `/api/videos/${id}`,            // GET
  UPLOAD: '/api/videos/upload',                            // POST
} as const;

// ===== MEDIA =====
export const MEDIA_ENDPOINTS = {
  UPLOAD: '/api/media/upload',                             // POST
  DELETE: (id: string) => `/api/media/${id}`,             // DELETE
} as const;

// ===== USER PROFILE =====
export const PROFILE_ENDPOINTS = {
  GET: '/api/profile',                                     // GET
  UPDATE: '/api/profile',                                  // PUT
  AVATAR: '/api/profile/avatar',                           // POST
  
  // Verification
  VERIFY_PERSONAL: '/api/profile/verify/personal',         // POST
  VERIFY_CONTRACTOR: '/api/profile/verify/contractor',     // POST
} as const;

// ===== UTILITIES =====
export const UTILITY_ENDPOINTS = {
  // Construction lookup
  CONSTRUCTION_LOOKUP: '/api/utilities/construction-lookup',
  
  // Permit application
  PERMIT_APPLICATION: '/api/utilities/permit-application',
  
  // Sample documents
  SAMPLE_DOCUMENTS: '/api/utilities/sample-documents',
  
  // Quality consultation
  QUALITY_CONSULTATION: '/api/utilities/quality-consultation',
} as const;

// ===== SHOPPING =====
export const SHOPPING_ENDPOINTS = {
  // Products
  PRODUCTS: '/api/shopping/products',                      // GET
  PRODUCT: (id: string) => `/api/shopping/products/${id}`, // GET
  CATEGORIES: '/api/shopping/categories',                  // GET
  
  // Cart
  CART: '/api/shopping/cart',                              // GET
  ADD_TO_CART: '/api/shopping/cart/add',                  // POST
  UPDATE_CART: (id: string) => `/api/shopping/cart/${id}`, // PUT
  REMOVE_FROM_CART: (id: string) => `/api/shopping/cart/${id}`, // DELETE
  
  // Orders
  ORDERS: '/api/shopping/orders',                          // GET
  CREATE_ORDER: '/api/shopping/orders',                    // POST
  ORDER: (id: string) => `/api/shopping/orders/${id}`,    // GET
} as const;

// Helper function to get endpoint
export function getEndpoint(endpoint: string | ((...args: any[]) => string), ...params: any[]): string {
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
}

export default {
  AUTH: AUTH_ENDPOINTS,
  MESSAGING: MESSAGING_ENDPOINTS,
  NOTIFICATIONS: NOTIFICATION_ENDPOINTS,
  PROJECTS: PROJECT_ENDPOINTS,
  CONTRACTORS: CONTRACTOR_ENDPOINTS,
  VIDEOS: VIDEO_ENDPOINTS,
  MEDIA: MEDIA_ENDPOINTS,
  PROFILE: PROFILE_ENDPOINTS,
  UTILITIES: UTILITY_ENDPOINTS,
  SHOPPING: SHOPPING_ENDPOINTS,
};
