import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

export function useActiveGuard() {
  const isActive = useRef(true);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      isActive.current = state === 'active';
      console.log('[useActiveGuard] App state changed:', state, 'isActive:', isActive.current);
    });
    return () => sub.remove();
  }, []);
  return isActive;
}
