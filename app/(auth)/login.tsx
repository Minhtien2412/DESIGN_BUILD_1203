import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function LoginScreen() {
  const router = useRouter();

  // Redirect to Shopee-style login screen
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login-shopee');
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
