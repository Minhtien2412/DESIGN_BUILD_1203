import { router } from 'expo-router';

export type AppKnownRoute = '/chat/[userId]' | '/bid/[id]' | '/bids' | '/(tabs)/notifications' | '/chat';

export function pushRoute(route: AppKnownRoute, params?: Record<string, string>) {
  switch (route) {
    case '/chat/[userId]':
      return router.push(`/chat/${encodeURIComponent(String(params?.userId || ''))}` as any);
    case '/bid/[id]':
      return router.push(`/bid/${encodeURIComponent(String(params?.id || ''))}` as any);
    case '/bids':
      return router.push('/bids' as any);
    case '/(tabs)/notifications':
      return router.push('/(tabs)/notifications');
    case '/chat':
      return router.push('/chat' as any);
    default:
      return;
  }
}
