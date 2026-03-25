/**
 * Mobile Menu - Complete Version
 * Kết hợp Home Menu Items (49 items) + Role-Based Menu Items
 */

import { useAuth } from '@/context/AuthContext';
import { hasPermission, Permission, UserRole } from '@/types/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// TYPES
// ============================================================================

// Menu items từ trang chủ (Home sections)
type HomeMenuItem = {
  id: string;
  name: string;
  icon?: any;
  route: string;
};

// Menu items từ role-based system
interface RoleMenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  requiredPermission?: Permission;
  requiredRole?: UserRole[];
  badge?: number;
}

// ============================================================================
// HOME MENU DATA (49 items)
// ============================================================================

const PLACEHOLDER_ICON = require('@/assets/icon.png');

const HOME_MENU_BASE: Omit<HomeMenuItem, 'icon'>[] = [
  // SERVICES - Dịch vụ (11 items)
  { id: '1', name: "Thiết kế nhà", route: '/services/house-design' },
  { id: '2', name: "Thiết kế nội thất", route: '/services/interior-design' },
  { id: '3', name: "Tra cứu xây dựng", route: '/services/construction-lookup' },
  { id: '4', name: "Xin phép", route: '/services/permit' },
  { id: '5', name: "Hồ sơ mẫu", route: '/services/sample-documents' },
  { id: '6', name: "Lỗ ban", route: '/services/lo-ban' },
  { id: '7', name: "Bảng mẫu", route: '/services/color-chart' },
  { id: '8', name: "Tư vấn chất lượng", route: '/services/quality-consulting' },
  { id: '9', name: "Công ty xây dựng", route: '/services/construction-company' },
  { id: '10', name: "Công ty nội thất", route: '/services/interior-company' },
  { id: '11', name: "Giám sát chất lượng", route: '/services/quality-supervision' },
  
  // CONSTRUCTION UTILITIES - Tiện ích xây dựng (8 items)
  { id: '12', name: "Ép cọc", route: '/utilities/ep-coc' },
  { id: '13', name: "Đào đất", route: '/utilities/dao-dat' },
  { id: '14', name: "Vật liệu", route: '/utilities/vat-lieu' },
  { id: '15', name: "Nhân công", route: '/utilities/nhan-cong' },
  { id: '16', name: "Thợ xây", route: '/utilities/tho-xay' },
  { id: '17', name: "Thợ coffa", route: '/utilities/tho-coffa' },
  { id: '18', name: "Thợ điện nước", route: '/utilities/tho-dien-nuoc' },
  { id: '19', name: "Bê tông", route: '/utilities/be-tong' },
  
  // FINISHING UTILITIES - Tiện ích hoàn thiện (8 items)
  { id: '20', name: "Thợ lát gạch", route: '/utilities/tho-lat-gach' },
  { id: '21', name: "Thợ thạch cao", route: '/utilities/tho-thach-cao' },
  { id: '22', name: "Thợ sơn", route: '/utilities/tho-son' },
  { id: '23', name: "Thợ đá", route: '/utilities/tho-da' },
  { id: '24', name: "Thợ làm cửa", route: '/utilities/tho-lam-cua' },
  { id: '25', name: "Thợ lan can", route: '/utilities/tho-lan-can' },
  { id: '26', name: "Thợ công", route: '/utilities/tho-cong' },
  { id: '27', name: "Thợ camera", route: '/utilities/tho-camera' },
  
  // EQUIPMENT SHOPPING - Mua sắm thiết bị (8 items)
  { id: '28', name: "Thiết bị bếp", route: '/shopping/kitchen-equipment' },
  { id: '29', name: "Thiết bị vệ sinh", route: '/shopping/sanitary-equipment' },
  { id: '30', name: "Điện", route: '/shopping/electrical' },
  { id: '31', name: "Nước", route: '/shopping/water' },
  { id: '32', name: "PCCC", route: '/shopping/fire-prevention' },
  { id: '33', name: "Bàn ăn", route: '/shopping/dining-table' },
  { id: '34', name: "Bàn học", route: '/shopping/study-desk' },
  { id: '35', name: "Sofa", route: '/shopping/sofa' },
  
  // LIBRARY - Thư viện (7 items)
  { id: '36', name: "Văn phòng", route: '/library/office' },
  { id: '37', name: "Nhà phố", route: '/library/townhouse' },
  { id: '38', name: "Biệt thự", route: '/library/villa' },
  { id: '39', name: "Biệt thự cổ điển", route: '/library/classic-villa' },
  { id: '40', name: "Khách sạn", route: '/library/hotel' },
  { id: '41', name: "Nhà xưởng", route: '/library/factory' },
  { id: '42', name: "Căn hộ dịch vụ", route: '/library/serviced-apartment' },
  
  // DESIGN UTILITIES - Tiện ích thiết kế (7 items)
  { id: '43', name: "Kiến trúc sư", route: '/utilities/architect' },
  { id: '44', name: "Kỹ sư giám sát", route: '/utilities/supervisor' },
  { id: '45', name: "Kỹ sư kết cấu", route: '/utilities/structural-engineer' },
  { id: '46', name: "Kỹ sư điện", route: '/utilities/electrical-engineer' },
  { id: '47', name: "Kỹ sư nước", route: '/utilities/water-engineer' },
  { id: '48', name: "Dự toán", route: '/utilities/estimator' },
  { id: '49', name: "Nội thất", route: '/utilities/interior-architect' },
];

const HOME_MENU_ITEMS: HomeMenuItem[] = HOME_MENU_BASE.map((item) => ({ ...item, icon: PLACEHOLDER_ICON }));

// ============================================================================
// ROLE-BASED MENU DATA
// ============================================================================

const ROLE_MENU_ITEMS: RoleMenuItem[] = [
  // Communications
  { id: 'messages', title: 'Tin nhắn', icon: 'chatbubbles', route: '/messages', color: '#0D9488' },
  
  // Shopping
  { id: 'products', title: 'Sản phẩm', icon: 'cube', route: '/shopping', color: '#0D9488', requiredPermission: Permission.VIEW_PRODUCTS },
  { id: 'cart', title: 'Giỏ hàng', icon: 'cart', route: '/cart', color: '#000000' },
  { id: 'quote', title: 'Yêu cầu báo giá', icon: 'document-text', route: '/quote-request', color: '#666666', requiredPermission: Permission.CREATE_QUOTE },
  
  // Construction (Staff+)
  { id: 'construction', title: 'Thi công', icon: 'hammer', route: '/construction', color: '#666666', requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN] },
  { id: 'materials', title: 'Vật liệu', icon: 'layers', route: '/materials', color: '#14b8a6', requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN] },
  { id: 'labor', title: 'Nhân công', icon: 'people', route: '/labor', color: '#0D9488', requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN] },
  
  // Reports
  { id: 'reports', title: 'Báo cáo', icon: 'bar-chart', route: '/reports', color: '#0ea5e9', requiredPermission: Permission.VIEW_REPORTS },
  
  // Admin
  { id: 'moderation', title: 'Kiểm duyệt', icon: 'checkmark-done', route: '/admin/moderation', color: '#000000', requiredPermission: Permission.APPROVE_CONTENT },
  { id: 'users', title: 'Quản lý người dùng', icon: 'people-circle', route: '/admin/staff', color: '#666666', requiredPermission: Permission.MANAGE_USERS },
  { id: 'settings', title: 'Cài đặt', icon: 'settings', route: '/admin/settings', color: '#64748b', requiredPermission: Permission.MANAGE_SETTINGS },
  
  // Utilities
  { id: 'videos', title: 'Videos', icon: 'videocam', route: '/videos', color: '#000000' },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface MobileMenuProps {
  visible: boolean;
  onClose: () => void;
  userIsAdmin?: boolean;
}

export function MobileMenu({ visible, onClose }: MobileMenuProps) {
  const { user } = useAuth();
  
  // Filter role-based items
  const visibleRoleItems = ROLE_MENU_ITEMS.filter(item => {
    if (!item.requiredPermission && !item.requiredRole) return true;
    
    if (item.requiredRole && user) {
      if (!item.requiredRole.includes(user.role as UserRole)) return false;
    }
    
    if (item.requiredPermission && user) {
      if (!hasPermission(user as any, item.requiredPermission)) return false;
    }
    
    return true;
  });
  
  // Group role items
  const grouped = {
    communications: visibleRoleItems.filter(i => ['messages'].includes(i.id)),
    shopping: visibleRoleItems.filter(i => ['products', 'cart', 'quote'].includes(i.id)),
    construction: visibleRoleItems.filter(i => ['construction', 'materials', 'labor'].includes(i.id)),
    reports: visibleRoleItems.filter(i => ['reports'].includes(i.id)),
    admin: visibleRoleItems.filter(i => ['moderation', 'users', 'settings'].includes(i.id)),
    utilities: visibleRoleItems.filter(i => ['videos'].includes(i.id)),
  };
  
  const handleItemPress = (route: string) => {
    onClose();
    setTimeout(() => router.push(route as any), 200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        
        <View style={styles.modal}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { onClose(); setTimeout(() => router.push('/search'), 200); }}
              style={styles.searchBar}
            >
              <Ionicons name="search-outline" size={20} color="#00B14F" />
              <Text style={styles.searchText}>Tìm kiếm sản phẩm, dịch vụ...</Text>
              <Ionicons name="mic-outline" size={20} color="#00B14F" style={{ marginRight: 12 }} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* User Role Badge */}
            {user && (
              <View style={styles.roleBadge}>
                <Ionicons name={getRoleIcon(user.role as UserRole)} size={16} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.roleText}>{getRoleLabel(user.role as UserRole)}</Text>
              </View>
            )}
            
            {/* HOME SECTIONS (49 items) */}
            <RenderHomeSection title="Dịch vụ" items={HOME_MENU_ITEMS.slice(0, 11)} onPress={handleItemPress} />
            <RenderHomeSection title="Tiện ích xây dựng" items={HOME_MENU_ITEMS.slice(11, 19)} onPress={handleItemPress} />
            <RenderHomeSection title="Tiện ích hoàn thiện" items={HOME_MENU_ITEMS.slice(19, 27)} onPress={handleItemPress} />
            <RenderHomeSection title="Mua sắm thiết bị" items={HOME_MENU_ITEMS.slice(27, 35)} onPress={handleItemPress} />
            <RenderHomeSection title="Thư viện" items={HOME_MENU_ITEMS.slice(35, 42)} onPress={handleItemPress} />
            <RenderHomeSection title="Tiện ích thiết kế" items={HOME_MENU_ITEMS.slice(42, 49)} onPress={handleItemPress} />
            
            {/* ROLE-BASED SECTIONS */}
            {grouped.communications.length > 0 && <RenderRoleSection title="Giao tiếp" items={grouped.communications} onPress={handleItemPress} />}
            {grouped.shopping.length > 0 && <RenderRoleSection title="Mua sắm" items={grouped.shopping} onPress={handleItemPress} />}
            {grouped.construction.length > 0 && <RenderRoleSection title="Quản lý dự án" items={grouped.construction} onPress={handleItemPress} />}
            {grouped.reports.length > 0 && <RenderRoleSection title="Báo cáo & Phân tích" items={grouped.reports} onPress={handleItemPress} />}
            {grouped.admin.length > 0 && <RenderRoleSection title="Quản trị" items={grouped.admin} onPress={handleItemPress} />}
            {grouped.utilities.length > 0 && <RenderRoleSection title="Tiện ích" items={grouped.utilities} onPress={handleItemPress} />}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function RenderHomeSection({ title, items, onPress }: { title: string; items: HomeMenuItem[]; onPress: (route: string) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => {
          const itemWidth = (SCREEN_WIDTH - 48) / 4;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => onPress(item.route)}
              activeOpacity={0.7}
              style={[styles.homeItem, { width: itemWidth }]}
            >
              <Image source={item.icon} style={styles.homeIcon} resizeMode="contain" />
              <Text style={styles.homeName} numberOfLines={2}>{item.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function RenderRoleSection({ title, items, onPress }: { title: string; items: RoleMenuItem[]; onPress: (route: string) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => onPress(item.route)} activeOpacity={0.7} style={styles.roleCard}>
            <View style={[styles.roleIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={28} color="#fff" />
              {item.badge && item.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge > 9 ? '9+' : item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.roleTitle} numberOfLines={2}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getRoleIcon(role: UserRole): keyof typeof Ionicons.glyphMap {
  switch (role) {
    case UserRole.ADMIN: return 'shield-checkmark';
    case UserRole.MANAGER: return 'star';
    case UserRole.STAFF: return 'person';
    case UserRole.CUSTOMER: return 'person-circle';
    default: return 'person';
  }
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN: return 'Quản trị viên';
    case UserRole.MANAGER: return 'Quản lý';
    case UserRole.STAFF: return 'Nhân viên';
    case UserRole.CUSTOMER: return 'Khách hàng';
    default: return 'Người dùng';
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingBottom: 20
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 20,
    backgroundColor: '#00B14F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  searchText: { color: '#999', flex: 1, marginLeft: 12, fontSize: 14 },
  content: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#0D9488',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  
  // Home items
  homeItem: { alignItems: 'center', marginBottom: 20 },
  homeIcon: { width: 48, height: 48, marginBottom: 8 },
  homeName: { fontSize: 11, fontWeight: '500', color: '#333', textAlign: 'center', lineHeight: 14 },
  
  // Role items
  roleCard: { width: '25%', padding: 6 },
  roleIcon: {
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#000000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  roleTitle: { fontSize: 12, textAlign: 'center', color: '#111', lineHeight: 16 }
});
