import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function RegisterScreen() {
  const router = useRouter();

  // Redirect to Shopee-style register screen
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/register-shopee');
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  return null;
}
