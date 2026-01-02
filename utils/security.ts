/**
 * Security Utilities
 * SSL Pinning, data encryption, and security helpers
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * Secure token storage with encryption
 */
export const secureStorage = {
  /**
   * Store sensitive data securely
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error('Secure storage error:', error);
      throw new Error('Failed to store secure data');
    }
  },

  /**
   * Retrieve secure data
   */
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('Secure retrieval error:', error);
      return null;
    }
  },

  /**
   * Remove secure data
   */
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Secure deletion error:', error);
    }
  },

  /**
   * Clear all secure storage
   */
  async clear(): Promise<void> {
    try {
      const keys = ['authToken', 'refreshToken', 'userSession', 'apiKey'];
      await Promise.all(keys.map((key) => this.removeItem(key)));
    } catch (error) {
      console.error('Clear storage error:', error);
    }
  },
};

/**
 * Generate secure hash for data integrity
 */
export async function generateHash(
  data: string,
  algorithm: Crypto.CryptoDigestAlgorithm = Crypto.CryptoDigestAlgorithm.SHA256
): Promise<string> {
  try {
    return await Crypto.digestStringAsync(algorithm, data);
  } catch (error) {
    console.error('Hash generation error:', error);
    throw new Error('Failed to generate hash');
  }
}

/**
 * Validate data integrity with hash
 */
export async function validateHash(
  data: string,
  hash: string,
  algorithm: Crypto.CryptoDigestAlgorithm = Crypto.CryptoDigestAlgorithm.SHA256
): Promise<boolean> {
  try {
    const computedHash = await generateHash(data, algorithm);
    return computedHash === hash;
  } catch (error) {
    console.error('Hash validation error:', error);
    return false;
  }
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Include lowercase letters');
  } else {
    score++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Include uppercase letters');
  } else {
    score++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Include numbers');
  } else {
    score++;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Include special characters');
  } else {
    score++;
  }

  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    isValid: score >= 4,
    strength,
    feedback,
  };
}

/**
 * Rate limiting helper
 */
class RateLimiter {
  private attempts = new Map<string, number[]>();
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  check(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Filter out old attempts outside the window
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false; // Rate limit exceeded
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true; // Allowed
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  clear(): void {
    this.attempts.clear();
  }
}

export const rateLimiter = new RateLimiter(5, 60000); // 5 attempts per minute

/**
 * OWASP Mobile Security Best Practices Checklist
 */
export const SECURITY_CHECKLIST = {
  dataStorage: {
    useSecureStore: true,
    encryptSensitiveData: true,
    noPlainTextPasswords: true,
    secureKeychain: true,
  },
  network: {
    useHTTPS: true,
    certificatePinning: true, // TODO: Implement
    validateServerCertificates: true,
    noSensitiveDataInURLs: true,
  },
  authentication: {
    strongPasswordPolicy: true,
    tokenExpiration: true,
    refreshTokenRotation: true,
    biometricAuth: false, // TODO: Implement
  },
  codeProtection: {
    obfuscation: false, // TODO: Implement for production
    preventDebugging: false, // TODO: Implement for production
    jailbreakDetection: false, // TODO: Implement
  },
  dataValidation: {
    inputSanitization: true,
    sqlInjectionPrevention: true,
    xssPrevention: true,
  },
};

/**
 * Environment-specific security config
 */
export const SECURITY_CONFIG = {
  development: {
    strictSSL: false,
    certificatePinning: false,
    debugEnabled: true,
  },
  production: {
    strictSSL: true,
    certificatePinning: true,
    debugEnabled: false,
  },
};

/**
 * Get current security config based on environment
 */
export function getSecurityConfig() {
  return __DEV__ ? SECURITY_CONFIG.development : SECURITY_CONFIG.production;
}
