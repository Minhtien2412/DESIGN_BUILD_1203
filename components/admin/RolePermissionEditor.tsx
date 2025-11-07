import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import Checkbox from '@/components/ui/checkbox';
import { Container } from '@/components/ui/container';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/layout';
import { useThemeColor } from '@/hooks/use-theme-color';
import { computePermissionsForRole, getRoleOverrides, PERMISSION_GROUPS, setRoleOverrides } from '@/services/rbac';
import type { PermissionString, Role } from '@/types/auth';
import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

type Props = {
  role: Role;
};

export function RolePermissionEditor({ role }: Props) {
  const [overrides, setOverrides] = React.useState<Record<Role, PermissionString[]>>({} as any);
  const [selected, setSelected] = React.useState<PermissionString[]>([]);
  const border = useThemeColor({}, 'border');

  React.useEffect(() => {
    (async () => {
      const ovr = await getRoleOverrides();
      setOverrides(ovr);
      setSelected(computePermissionsForRole(role, ovr));
    })();
  }, [role]);

  const toggle = (id: PermissionString) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const save = async () => {
    const next = { ...overrides, [role]: selected } as Record<Role, PermissionString[]>;
    await setRoleOverrides(next);
    setOverrides(next);
  };

  return (
    <Container>
      <SurfaceCard style={styles.header}>
        <ThemedText type="title">Phân quyền vai trò</ThemedText>
        <ThemedText>Vai trò: {role}</ThemedText>
      </SurfaceCard>

      <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xl }}>
        {PERMISSION_GROUPS.map(group => (
          <SurfaceCard key={group.id} style={[styles.group, { borderColor: border }]}>
            <ThemedText type="defaultSemiBold" style={styles.groupTitle}>{group.label}</ThemedText>
            <View style={styles.items}>
              {group.items.map(item => (
                <View key={item.id} style={styles.itemRow}>
                  <Checkbox checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
                  <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                </View>
              ))}
            </View>
          </SurfaceCard>
        ))}

        <Button title="Lưu thay đổi" onPress={save} />
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: Spacing.md },
  group: { marginBottom: Spacing.md, borderWidth: StyleSheet.hairlineWidth },
  groupTitle: { marginBottom: Spacing.sm },
  items: { gap: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemLabel: { fontSize: 14 },
});

export default RolePermissionEditor;
