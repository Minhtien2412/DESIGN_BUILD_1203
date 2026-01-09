import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Feather } from '@expo/vector-icons';
import { memo, useMemo, useState } from 'react';
import { Image, ScrollView, StyleProp, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';

// Types
export type HomeV2Props = {
  style?: StyleProp<ViewStyle>;
  onSearch?: (q: string) => void;
  onNavigate?: (path: string) => void; // expo-router path string (preferred)
};

// Theme (align with the existing green construction vibe)
const theme = {
  colors: {
    primary: '#0066CC',
    primaryAlt: '#7FAB67',
    surface: '#FFFFFF',
    background: '#F7FAF1',
    text: '#111111',
    textSecondary: '#5E6B4A',
    border: '#E6F0D6',
    muted: '#999999',
    subtle: '#F0F6E5',
    chip: '#E6F0D6',
  },
  radii: { sm: 10, md: 14, lg: 20, xl: 28 } as const,
  spacing: { xs: 8, sm: 10, md: 14, lg: 18, xl: 24 } as const,
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  } as const,
};

// Small atoms
const Chip = memo(function Chip({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: theme.colors.chip, borderRadius: 999 }}>
      <Feather name={icon} size={16} color={theme.colors.textSecondary} />
      <Text style={{ marginLeft: 8, color: theme.colors.textSecondary, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
});

const IconTile = memo(function IconTile({ icon, label, onPress }: { icon: keyof typeof Feather.glyphMap; label: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ width: '24%', marginBottom: 12 }}>
      <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderWidth: 1, borderColor: theme.colors.border, ...theme.shadow }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.subtle, borderWidth: 1, borderColor: theme.colors.primary }}>
          <Feather name={icon} size={26} color={theme.colors.primary} />
        </View>
        <Text style={{ marginTop: 10, fontSize: 13, fontWeight: '600', color: theme.colors.text, textAlign: 'center' }} numberOfLines={2}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
});

const HorizontalCard = memo(function HorizontalCard({ title, subtitle, image, onPress }: { title: string; subtitle?: string; image?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, marginRight: 14, width: 260, ...theme.shadow }}>
      <View style={{ height: 140, backgroundColor: '#eee', borderTopLeftRadius: theme.radii.lg, borderTopRightRadius: theme.radii.lg, overflow: 'hidden' }}>
        {image ? (
          <Image source={{ uri: image }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="image" size={28} color={theme.colors.muted} />
          </View>
        )}
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.text }} numberOfLines={1}>{title}</Text>
        {!!subtitle && <Text style={{ marginTop: 4, color: theme.colors.textSecondary }} numberOfLines={2}>{subtitle}</Text>}
      </View>
    </TouchableOpacity>
  );
});

export default function HomeV2(props: HomeV2Props) {
  const { style, onSearch, onNavigate } = props;
  const [query, setQuery] = useState('');

  const categories = useMemo(() => ([
    { key: 'design', label: 'Thi?t k?', icon: 'pen-tool' as const, route: '/projects' },
    { key: 'build', label: 'Thi c�ng', icon: 'truck' as const, route: '/projects' },
    { key: 'interior', label: 'N?i th?t', icon: 'grid' as const, route: '/projects' },
    { key: 'materials', label: 'V?t li?u', icon: 'package' as const, route: '/projects' },
    { key: 'repair', label: 'S?a ch?a', icon: 'settings' as const, route: '/projects' },
    { key: 'engineer', label: 'K? su', icon: 'briefcase' as const, route: '/projects' },
    { key: 'architect', label: 'Ki?n tr�c su', icon: 'compass' as const, route: '/projects' },
    { key: 'cleaning', label: 'V? sinh', icon: 'droplet' as const, route: '/projects' },
  ]), []);

  const featured = useMemo(() => ([
    { id: 'aristo', title: 'Aristo Villa', subtitle: 'Bi?t th? hi?n d?i � Q.7' },
    { id: 'eden', title: 'Eden Villa', subtitle: 'Ngh? du?ng � �� L?t' },
    { id: 'atrahi', title: 'Atrahi Design', subtitle: 'Coffee concept � B�nh Th?nh' },
  ]), []);

  return (
    <Container style={[{ flex: 1, backgroundColor: theme.colors.background }, style]}>
      {/* Hero */}
      <View style={{ backgroundColor: theme.colors.subtle, borderRadius: theme.radii.lg, padding: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Xin ch�o ??</Text>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 }}>Thi?t k? & Thi c�ng</Text>
        <View style={{ marginTop: theme.spacing.md, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderColor: theme.colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, height: 44 }}>
          <Feather name="search" size={18} color={theme.colors.muted} />
          <TextInput
            style={{ flex: 1, marginLeft: 8 }}
            placeholder="T�m nh� th?u, d? �n, s?n ph?m..."
            placeholderTextColor={theme.colors.muted}
            value={query}
            onChangeText={(t) => { setQuery(t); onSearch && onSearch(t); }}
            returnKeyType="search"
          />
        </View>

        <View style={{ flexDirection: 'row', marginTop: theme.spacing.md, columnGap: 8, rowGap: 8, flexWrap: 'wrap' }}>
          <Chip icon="map" label="G?n b?n" onPress={() => onNavigate && onNavigate('/projects')} />
          <Chip icon="trending-up" label="Xu hu?ng" onPress={() => onNavigate && onNavigate('/projects')} />
          <Chip icon="percent" label="Uu d�i" onPress={() => onNavigate && onNavigate('/projects')} />
          <Chip icon="clock" label="�ang thi c�ng" onPress={() => onNavigate && onNavigate('/live')} />
        </View>
      </View>

      {/* Categories */}
      <Section title="Danh m?c d?ch v?">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {categories.map(c => (
            <IconTile key={c.key} icon={c.icon} label={c.label} onPress={() => onNavigate && onNavigate(c.route)} />
          ))}
        </View>
      </Section>

      {/* Featured Projects */}
      <Section title="D? �n n?i b?t">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>
          {featured.map(f => (
            <HorizontalCard key={f.id} title={f.title} subtitle={f.subtitle} onPress={() => onNavigate && onNavigate(`/projects`)} />
          ))}
        </ScrollView>
      </Section>

      {/* Quick Access Blocks */}
      <Section title="Ti?n �ch nhanh">
        <View style={{ flexDirection: 'row', columnGap: 12 }}>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('/go-live')} style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 14, borderWidth: 1, borderColor: theme.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.subtle, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Feather name="camera" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={{ fontWeight: '800', color: theme.colors.text }}>B?t d?u Live</Text>
                <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }}>Ph�t tr?c ti?p c�ng tr�nh</Text>
              </View>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNavigate && onNavigate('/shop')} style={{ flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 14, borderWidth: 1, borderColor: theme.colors.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.subtle, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Feather name="shopping-bag" size={20} color={theme.colors.primary} />
              </View>
              <View>
                <Text style={{ fontWeight: '800', color: theme.colors.text }}>Mua s?m nhanh</Text>
                <Text style={{ color: theme.colors.textSecondary, marginTop: 2 }}>Thi?t b?, v?t li?u, n?i th?t</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </Section>

      {/* Editorial / Tips */}
      <Section title="M?o & c?m h?ng">
        <View style={{ rowGap: 12 }}>
          {[1,2,3].map(i => (
            <TouchableOpacity key={i} activeOpacity={0.9} style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, padding: 14, borderWidth: 1, borderColor: theme.colors.border }}>
              <Text style={{ fontWeight: '800', color: theme.colors.text }}>5 luu � quan tr?ng khi ch?n nh� th?u #{i}</Text>
              <Text style={{ color: theme.colors.textSecondary, marginTop: 6 }}>Ch?n nh� th?u ph� h?p gi�p t?i uu chi ph�, d?m b?o ti?n d? v� ch?t lu?ng c�ng tr�nh...</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Section>

      {/* CTA */}
      <View style={{ backgroundColor: theme.colors.primary, borderRadius: theme.radii.lg, padding: 16, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>B?n c?n tu v?n nhanh?</Text>
        <Text style={{ color: '#fff', opacity: 0.9, marginTop: 4 }}>Ch�ng t�i s? k?t n?i b?n v?i chuy�n gia ph� h?p</Text>
        <TouchableOpacity onPress={() => onNavigate && onNavigate('/chat')} style={{ marginTop: 10, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999 }}>
          <Text style={{ color: theme.colors.primary, fontWeight: '800' }}>Nh?n tin ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Spacer */}
      <View style={{ height: 24 }} />
    </Container>
  );
}
