/**
 * Google Sign-In Test & Debug Helper
 * 
 * Dùng để test Google Sign-In trong development
 * 
 * Usage in login.tsx:
 * import { testGoogleSignIn } from '@/scripts/test-google-signin';
 * await testGoogleSignIn();
 */

import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const testGoogleSignIn = async () => {
  console.log('\n🧪 ===== GOOGLE SIGN-IN TEST START =====');
  
  try {
    // 1. Check configuration
    console.log('\n1️⃣ Checking configuration...');
    console.log('Web Client ID: 702527545429-60e3mi47s816iu9aus38kb83qgkmkgna.apps.googleusercontent.com');
    
    // 2. Check Play Services
    console.log('\n2️⃣ Checking Google Play Services...');
    const hasPlayServices = await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });
    console.log('✅ Play Services available:', hasPlayServices);
    
    // 3. Get current user (if any)
    console.log('\n3️⃣ Checking current user...');
    const currentUser = await GoogleSignin.getCurrentUser();
    if (currentUser) {
      console.log('✅ Already signed in:', {
        email: currentUser.user.email,
        name: currentUser.user.name,
      });
    } else {
      console.log('ℹ️ No user signed in');
    }
    
    // 4. Sign in
    console.log('\n4️⃣ Starting sign-in flow...');
    const userInfo = await GoogleSignin.signIn();
    
    // 5. Check result
    console.log('\n5️⃣ Sign-in result:');
    console.log('📧 Email:', userInfo.user.email);
    console.log('👤 Name:', userInfo.user.name);
    console.log('🖼️ Photo:', userInfo.user.photo);
    console.log('🆔 User ID:', userInfo.user.id);
    
    // 6. Check tokens
    console.log('\n6️⃣ Token information:');
    if (userInfo.idToken) {
      console.log('✅ ID Token received:', userInfo.idToken.substring(0, 50) + '...');
      
      // Decode JWT to see claims
      const decoded = parseJwt(userInfo.idToken);
      console.log('📋 Token Claims:');
      console.log('  - iss (issuer):', decoded.iss);
      console.log('  - aud (audience):', decoded.aud);
      console.log('  - email:', decoded.email);
      console.log('  - email_verified:', decoded.email_verified);
      console.log('  - exp (expires):', new Date(decoded.exp * 1000).toISOString());
    } else {
      console.log('❌ NO ID TOKEN! This is the problem!');
    }
    
    if (userInfo.serverAuthCode) {
      console.log('✅ Server Auth Code:', userInfo.serverAuthCode.substring(0, 30) + '...');
    } else {
      console.log('ℹ️ No Server Auth Code (normal if offline access not needed)');
    }
    
    console.log('\n✅ ===== TEST COMPLETED SUCCESSFULLY =====\n');
    
    return userInfo;
  } catch (error: any) {
    console.log('\n❌ ===== TEST FAILED =====');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    console.log('==============================\n');
    throw error;
  }
};

/**
 * Parse JWT token (same as in useGoogleAuth)
 */
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
}

/**
 * Quick test for debugging
 */
export const quickTest = async () => {
  console.log('🚀 Quick Google Sign-In Test');
  
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    console.log('✅ ID Token:', userInfo.idToken ? 'YES' : 'NO');
    console.log('✅ User:', userInfo.user.email);
    
    return userInfo;
  } catch (error: any) {
    console.log('❌ Error:', error.code, error.message);
    throw error;
  }
};
