import { router } from 'expo-router';

export type AppKnownRoute = '/chat/[userId]' | '/bid/[id]' | '/bids' | '/(tabs)/notifications' | '/chat';

export function pushRoute(route: AppKnownRoute, params?: Record<string, string>) {
  switch (route) {
    case '/chat/[userId]':
      return router.push({ pathname: '/chat/[userId]' as any, params: { userId: String(params?.userId || '') } });
    case '/bid/[id]':
      return router.push({ pathname: '/bid/[id]' as any, params: { id: String(params?.id || '') } });
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
