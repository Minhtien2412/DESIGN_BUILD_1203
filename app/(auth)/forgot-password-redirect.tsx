import { useRouter } from 'expo-router';
import { useEffect } from 'react';

/**
 * Forgot Password Redirect
 * 
 * Redirects to enhanced forgot password screen
 */
export default function ForgotPasswordRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/forgot-password-enhanced');
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
