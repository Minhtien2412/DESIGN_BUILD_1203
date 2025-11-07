import { memo, useMemo, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleProp,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
// Expo: giữ dòng dưới
import { Feather } from '@expo/vector-icons';
// React Native CLI: thay dòng import icon bằng:
// import Feather from 'react-native-vector-icons/Feather';

type Category = {
  key: string;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
};

type Feature = {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
};

type Theme = {
  colors: {
    primary: string;      // #90B44C
    primaryAlt: string;   // #7FAB67
    surface: string;      // #FFFFFF
    background: string;   // #F7F7F7
    text: string;         // #111111
    textSecondary: string;// #4A4A4A
    border: string;       // #EAEAEA
    muted: string;        // #9E9E9E
    subtle: string;       // #F6F9D0
  };
  radii: { sm: number; md: number; lg: number; xl: number; };
  spacing: { sm: number; md: number; lg: number; xl: number; };
  shadow: ViewStyle;
};

const defaultTheme: Theme = {
  colors: {
    primary: '#90B44C',
    primaryAlt: '#7FAB67',
    surface: '#FFFFFF',
    background: '#F7F7F7',
    text: '#111111',
    textSecondary: '#4A4A4A',
    border: '#EAEAEA',
    muted: '#9E9E9E',
    subtle: '#F6F9D0', // brand fill
  },
  radii: { sm: 10, md: 14, lg: 20, xl: 28 },
  spacing: { sm: 10, md: 14, lg: 18, xl: 24 },
  shadow: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

export type DesignBuildSectionProps = {
  style?: StyleProp<ViewStyle>;
  title?: string;              // dòng tiêu đề chính, mặc định "Design Build"
  greeting?: string;           // dòng chào, mặc định "Xin chào 👋"
  searchPlaceholder?: string;  // placeholder thanh tìm kiếm
  categories?: Category[];     // lưới danh mục
  featured?: Feature[];        // carousel dự án nổi bật
  theme?: Partial<Theme>;      // override theme
  scrollable?: boolean;        // mặc định true, set false nếu bọc trong ScrollView khác
  onCategoryPress?: (key: string) => void;
  onCardPress?: (id: string) => void;
  onSearch?: (text: string) => void;
};

const IconBox = memo(function IconBox({
  label, icon = 'grid', onPress, theme,
}: { label: string; icon?: keyof typeof Feather.glyphMap; onPress?: () => void; theme: Theme }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        flex: 1,
        margin: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadow,
      }}
    >
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.subtle,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        }}
      >
        <Feather name={icon} size={26} color={theme.colors.primary} />
      </View>
      <Text
        style={{
          marginTop: 10,
          fontSize: 13,
          fontWeight: '600',
          color: theme.colors.text,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
});

const Card = memo(function Card({
  data, onPress, theme,
}: { data: Feature; onPress?: () => void; theme: Theme }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.lg,
        marginRight: 14,
        width: 260,
        ...theme.shadow,
      }}
    >
      <View style={{
        height: 140,
        backgroundColor: '#eee',
        borderTopLeftRadius: theme.radii.lg,
        borderTopRightRadius: theme.radii.lg,
        overflow: 'hidden',
      }}>
        {data.image ? (
          <Image source={{ uri: data.image }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="image" size={28} color={theme.colors.muted} />
          </View>
        )}
      </View>
      <View style={{ padding: 14 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: theme.colors.text }} numberOfLines={1}>
          {data.title}
        </Text>
        {data.subtitle ? (
          <Text style={{ marginTop: 4, color: theme.colors.textSecondary }} numberOfLines={2}>
            {data.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

export default function DesignBuildSection(props: DesignBuildSectionProps) {
  const {
    style,
    title = 'Design Build',
    greeting = 'Xin chào 👋',
    searchPlaceholder = 'Tìm nhà thầu, dự án, sản phẩm...',
    categories,
    featured,
    theme: themeOverride,
    scrollable = true,
    onCategoryPress,
    onCardPress,
    onSearch,
  } = props;

  const theme: Theme = useMemo(() => ({
    ...defaultTheme,
    ...(themeOverride || {}),
    colors: { ...defaultTheme.colors, ...(themeOverride?.colors || {}) },
    radii: { ...defaultTheme.radii, ...(themeOverride?.radii || {}) },
    spacing: { ...defaultTheme.spacing, ...(themeOverride?.spacing || {}) },
    shadow: { ...defaultTheme.shadow, ...(themeOverride?.shadow || {}) },
  }), [themeOverride]);

  const [query, setQuery] = useState('');

  const _categories = categories ?? [
    { key: 'design', label: 'Thiết kế', icon: 'pen-tool' },
    { key: 'build', label: 'Thi công', icon: 'truck' },
    { key: 'interior', label: 'Nội thất', icon: 'grid' },
    { key: 'materials', label: 'Vật liệu', icon: 'package' },
    { key: 'repair', label: 'Sửa chữa', icon: 'settings' },
    { key: 'engineer', label: 'Kỹ sư', icon: 'briefcase' },
    { key: 'architect', label: 'Kiến trúc sư', icon: 'compass' },
    { key: 'cleaning', label: 'Vệ sinh', icon: 'droplet' },
  ];

  const _featured = featured ?? [
    { id: 'aristo', title: 'Aristo Villa', subtitle: 'Biệt thự hiện đại • Q.7' },
    { id: 'eden', title: 'Eden Villa', subtitle: 'Nghỉ dưỡng • Đà Lạt' },
    { id: 'atrahi', title: 'Atrahi Design', subtitle: 'Coffee concept • Bình Thạnh' },
  ];

  const Content = () => (
    <>
      {/* Header + Search */}
      <View style={{ paddingTop: theme.spacing.lg, paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.md, backgroundColor: theme.colors.subtle }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{greeting}</Text>
        <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '800', marginTop: 2 }}>{title}</Text>

        <View style={{
          marginTop: theme.spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: 999,
          paddingHorizontal: 14,
          height: 44,
        }}>
          <Feather name="search" size={18} color={theme.colors.muted} />
          <TextInput
            style={{ flex: 1, marginLeft: 8 }}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.colors.muted}
            value={query}
            onChangeText={(t) => { setQuery(t); onSearch && onSearch(t); }}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Categories grid (2 columns) */}
      <View style={{ paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10, flexDirection: 'row', flexWrap: 'wrap' }}>
        {_categories.map((c) => (
          <View key={c.key} style={{ width: '50%' }}>
            <IconBox
              label={c.label}
              icon={c.icon}
              onPress={() => onCategoryPress && onCategoryPress(c.key)}
              theme={theme}
            />
          </View>
        ))}
      </View>

      {/* Featured carousel */}
      <View style={{ paddingHorizontal: 18, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, fontWeight: '800', color: theme.colors.text }}>Dự án nổi bật</Text>
        <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Xem tất cả</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 18, paddingRight: 6, paddingVertical: 6 }}
      >
        {_featured.map((f) => (
          <Card
            key={f.id}
            data={f}
            onPress={() => onCardPress && onCardPress(f.id)}
            theme={theme}
          />
        ))}
      </ScrollView>

      <View style={{ height: 24 }} />
    </>
  );

  if (scrollable) {
    return (
      <ScrollView
        style={[{ backgroundColor: theme.colors.background }, style]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}>
        <Content/>
      </ScrollView>
    );
  }
  return (
    <View style={[{ backgroundColor: theme.colors.background }, style]}>
      <Content />
    </View>
  );
}
