/**
 * Zalo Authentication Service
 * ===========================
 * 
 * Service để đăng nhập bằng Zalo trong React Native/Expo
 * Tài liệu: https://developers.zalo.me/docs
 * 
 * @author AI Assistant
 * @date 14/01/2026
 */

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

// ==================== CONFIG ====================

const ZALO_CONFIG = {
  appId: process.env.EXPO_PUBLIC_ZALO_APP_ID || '1408601745775286980',
  // OAuth endpoints
  authUrl: 'https://oauth.zaloapp.com/v4/permission',
  tokenUrl: 'https://oauth.zaloapp.com/v4/access_token',
  userInfoUrl: 'https://graph.zalo.me/v2.0/me',
  // Redirect URI - cần đăng ký trong Zalo Developer Console
  redirectUri: Linking.createURL('zalo-callback'),
  // Permissions (scopes) - cần xin approval từ Zalo
  scope: 'id,name,picture',
};

// ==================== TYPES ====================

export interface ZaloUser {
  id: string;
  name: string;
  picture?: {
    data?: {
      url: string;
    };
  };
  birthday?: string;
  gender?: string;
}

export interface ZaloAuthResult {
  success: boolean;
  user?: ZaloUser;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: string;
}

export interface ZaloTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  error?: number;
  error_description?: string;
}

// ==================== AUTH FUNCTIONS ====================

/**
 * Bắt đầu flow đăng nhập Zalo
 * Mở Zalo app hoặc WebView để user đăng nhập
 */
export async function signInWithZalo(): Promise<ZaloAuthResult> {
  try {
    // Tạo code verifier và challenge cho PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Tạo URL authorize
    const authParams = new URLSearchParams({
      app_id: ZALO_CONFIG.appId,
      redirect_uri: ZALO_CONFIG.redirectUri,
      code_challenge: codeChallenge,
      state: state,
    });

    const authUrl = `${ZALO_CONFIG.authUrl}?${authParams.toString()}`;

    // Mở browser để đăng nhập
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl,
      ZALO_CONFIG.redirectUri
    );

    if (result.type !== 'success') {
      return {
        success: false,
        error: result.type === 'cancel' ? 'Người dùng hủy đăng nhập' : 'Đăng nhập thất bại',
      };
    }

    // Parse response URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    const returnedState = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
      return {
        success: false,
        error: `Zalo error: ${error}`,
      };
    }

    if (returnedState !== state) {
      return {
        success: false,
        error: 'State mismatch - có thể bị tấn công CSRF',
      };
    }

    if (!code) {
      return {
        success: false,
        error: 'Không nhận được authorization code',
      };
    }

    // Đổi code lấy access token
    const tokenResult = await exchangeCodeForToken(code, codeVerifier);
    
    if (!tokenResult.access_token) {
      return {
        success: false,
        error: tokenResult.error_description || 'Không thể lấy access token',
      };
    }

    // Lấy thông tin user
    const user = await getZaloUserInfo(tokenResult.access_token);

    return {
      success: true,
      user,
      accessToken: tokenResult.access_token,
      refreshToken: tokenResult.refresh_token,
      expiresIn: tokenResult.expires_in,
    };

  } catch (error) {
    console.error('[ZaloAuth] Sign in error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi không xác định',
    };
  }
}

/**
 * Đổi authorization code lấy access token
 */
async function exchangeCodeForToken(
  code: string,
  codeVerifier: string
): Promise<ZaloTokenResponse> {
  const params = new URLSearchParams({
    app_id: ZALO_CONFIG.appId,
    code: code,
    code_verifier: codeVerifier,
    grant_type: 'authorization_code',
  });

  const response = await fetch(ZALO_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'secret_key': process.env.ZALO_APP_SECRET || '',
    },
    body: params.toString(),
  });

  return response.json();
}

/**
 * Lấy thông tin user từ Zalo Graph API
 */
async function getZaloUserInfo(accessToken: string): Promise<ZaloUser> {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: 'id,name,picture',
  });

  const response = await fetch(`${ZALO_CONFIG.userInfoUrl}?${params.toString()}`, {
    method: 'GET',
  });

  const data = await response.json();
  
  return {
    id: data.id,
    name: data.name,
    picture: data.picture,
  };
}

/**
 * Refresh access token
 */
export async function refreshZaloToken(refreshToken: string): Promise<ZaloTokenResponse> {
  const params = new URLSearchParams({
    app_id: ZALO_CONFIG.appId,
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  });

  const response = await fetch(ZALO_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'secret_key': process.env.ZALO_APP_SECRET || '',
    },
    body: params.toString(),
  });

  return response.json();
}

// ==================== PKCE HELPERS ====================

/**
 * Tạo code verifier cho PKCE
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for React Native
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return base64UrlEncode(array);
}

/**
 * Tạo code challenge từ verifier
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  // Trong React Native, có thể cần dùng expo-crypto
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(new Uint8Array(hash));
  } catch {
    // Fallback: plain challenge
    return verifier;
  }
}

/**
 * Tạo state ngẫu nhiên để chống CSRF
 */
function generateState(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return base64UrlEncode(array);
}

/**
 * Base64 URL encode
 */
function base64UrlEncode(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ==================== ZALO MINI APP ====================

/**
 * Kiểm tra app có đang chạy trong Zalo Mini App không
 */
export function isRunningInZaloMiniApp(): boolean {
  // Kiểm tra user agent hoặc Zalo specific APIs
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' && 
           window.navigator.userAgent.includes('Zalo');
  }
  return false;
}

/**
 * Lấy thông tin user trong Zalo Mini App context
 */
export async function getZaloMiniAppUser(): Promise<ZaloUser | null> {
  if (!isRunningInZaloMiniApp()) {
    return null;
  }
  
  // Zalo Mini App SDK calls
  // Cần import @aspect-dev/zalo-miniapp-client-sdk
  try {
    // const { getUserInfo } = require('@aspect-dev/zalo-miniapp-client-sdk');
    // const user = await getUserInfo();
    // return user;
    return null;
  } catch (error) {
    console.error('[ZaloAuth] Mini app error:', error);
    return null;
  }
}

// ==================== SHARE TO ZALO ====================

/**
 * Chia sẻ nội dung lên Zalo
 */
export async function shareToZalo(options: {
  title: string;
  description?: string;
  thumbnail?: string;
  link?: string;
}): Promise<boolean> {
  const { title, description, thumbnail, link } = options;
  
  const shareUrl = `https://zalo.me/share?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description || '')}&thumb=${encodeURIComponent(thumbnail || '')}&link=${encodeURIComponent(link || '')}`;
  
  const canOpen = await Linking.canOpenURL(shareUrl);
  if (canOpen) {
    await Linking.openURL(shareUrl);
    return true;
  }
  
  // Fallback: mở web Zalo
  await WebBrowser.openBrowserAsync(shareUrl);
  return true;
}

/**
 * Mở chat với Official Account
 */
export async function openZaloOA(oaId?: string): Promise<boolean> {
  const id = oaId || ZALO_CONFIG.appId;
  const url = `https://zalo.me/${id}`;
  
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  }
  
  await WebBrowser.openBrowserAsync(url);
  return true;
}

// ==================== EXPORT ====================

export const ZaloAuthService = {
  signIn: signInWithZalo,
  refreshToken: refreshZaloToken,
  getUser: getZaloUserInfo,
  isInMiniApp: isRunningInZaloMiniApp,
  getMiniAppUser: getZaloMiniAppUser,
  share: shareToZalo,
  openOA: openZaloOA,
  config: ZALO_CONFIG,
};

export default ZaloAuthService;
