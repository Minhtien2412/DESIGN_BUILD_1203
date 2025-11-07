import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Admin index - redirect to dashboard
 */
export default function AdminIndex() {
  useEffect(() => {
    router.replace('/admin/dashboard' as any);
  }, []);

  return null;
}
