import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth';
import { hasAnyPermission, type Permission } from '@/services/userGroups';
import React from 'react';

export function GroupGate({ any, children }: { any: Permission[]; children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [ok, setOk] = React.useState<boolean>(false);
  // Memoize "any" permissions key to avoid complex dep in useEffect
  const anyKey = React.useMemo(() => any.slice().sort().join('|'), [any]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (loading) return;
      if (!user) { setOk(false); return; }
      const allowed = await hasAnyPermission(user.id, any);
      if (mounted) setOk(allowed);
    })();
    return () => { mounted = false };
  }, [user?.id, user, loading, any, anyKey]);

  if (loading) return null;
  if (!ok) return <ThemedText style={{ margin: 16 }}>Bạn không có quyền thực hiện thao tác này.</ThemedText>;
  return <>{children}</>;
}

export default GroupGate;
