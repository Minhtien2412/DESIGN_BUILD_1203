/**
 * Perfex CRM Test Credentials
 * Use these for testing login functionality
 * 
 * IMPORTANT: Replace with real credentials before production
 */

export const TEST_CREDENTIALS = {
  // Staff Account
  staff: {
    email: 'staff@thietkeresort.com',
    password: 'demo123456',
    userType: 'staff' as const,
    name: 'Test Staff',
    role: 'staff',
  },

  // Customer Account  
  customer: {
    email: 'customer@company.com',
    password: 'demo123456',
    userType: 'customer' as const,
    name: 'Test Customer',
    company: 'Test Company',
  },

  // Admin Account
  admin: {
    email: 'admin@thietkeresort.com',
    password: 'admin123456',
    userType: 'staff' as const,
    name: 'Admin User',
    role: 'admin',
  },
};

// Real Perfex CRM Users (from API test)
export const REAL_CUSTOMERS = [
  {
    userid: '1',
    company: 'Anh Khương Q9',
    email: 'contact@baotienweb.cloud', // Inferred
    phone: '0359777108',
    city: 'Hồ Chí Minh',
    address: '354A/5 Tân Kỳ Tân Quý, Phường Sơn Kỳ, Quận Tân phú',
    website: 'baotienweb.cloud',
  },
  {
    userid: '2',
    company: 'NHÀ XINH',
    email: 'info@nhaxinhdesign.com', // Inferred
    phone: '0909452109',
    city: 'Hồ Chí Minh',
    address: '77 Lam Sơn',
    website: 'nhaxinhdesign.com',
  },
];

/**
 * Helper to auto-fill test credentials
 * Use in development only
 */
export const getTestCredential = (type: 'staff' | 'customer' | 'admin') => {
  return TEST_CREDENTIALS[type];
};

/**
 * Validate if email exists in test credentials
 */
export const isTestEmail = (email: string): boolean => {
  return Object.values(TEST_CREDENTIALS).some(cred => cred.email === email);
};

/**
 * Get user type from email
 */
export const getUserTypeFromEmail = (email: string): 'staff' | 'customer' | null => {
  const credential = Object.values(TEST_CREDENTIALS).find(cred => cred.email === email);
  return credential?.userType || null;
};
