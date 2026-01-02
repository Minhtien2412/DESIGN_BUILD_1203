/**
 * Home Menu Grid Component
 * Role-based menu with permission checks
 */

import { useAuth } from '@/context/AuthContext';
import { hasPermission, Permission, UserRole } from '@/types/permissions';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  requiredPermission?: Permission;
  requiredRole?: UserRole[];
  badge?: number;
}

const ALL_MENU_ITEMS: MenuItem[] = [
  // === COMMUNICATIONS ===
  {
    id: 'messages',
    title: 'Tin nhắn',
    icon: 'chatbubbles',
    route: '/messages',
    color: '#3b82f6',
  },
  
  // === SHOPPING ===
  {
    id: 'products',
    title: 'Sản phẩm',
    icon: 'cube',
    route: '/shopping',
    color: '#f59e0b',
    requiredPermission: Permission.VIEW_PRODUCTS,
  },
  {
    id: 'cart',
    title: 'Giỏ hàng',
    icon: 'cart',
    route: '/cart',
    color: '#ef4444',
  },
  {
    id: 'quote',
    title: 'Yêu cầu báo giá',
    icon: 'document-text',
    route: '/quote-request',
    color: '#8b5cf6',
    requiredPermission: Permission.CREATE_QUOTE,
  },
  
  // === CONSTRUCTION (Staff+) ===
  {
    id: 'construction',
    title: 'Thi công',
    icon: 'hammer',
    route: '/construction',
    color: '#ec4899',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'materials',
    title: 'Vật liệu',
    icon: 'layers',
    route: '/materials',
    color: '#14b8a6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'labor',
    title: 'Nhân công',
    icon: 'people',
    route: '/labor',
    color: '#f97316',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  
  // === DOCUMENTS (Staff+) ===
  {
    id: 'documents',
    title: 'Tài liệu',
    icon: 'folder',
    route: '/documents',
    color: '#6366f1',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'contracts',
    title: 'Hợp đồng',
    icon: 'clipboard',
    route: '/contracts',
    color: '#a855f7',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'document-control',
    title: 'Kiểm soát tài liệu',
    icon: 'document-lock-outline',
    route: '/document-control',
    color: '#ec4899',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'submittal',
    title: 'Trình duyệt',
    icon: 'send-outline',
    route: '/submittal',
    color: '#14b8a6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'rfi',
    title: 'RFI',
    icon: 'help-circle-outline',
    route: '/rfi',
    color: '#f59e0b',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'change-order',
    title: 'Lệnh thay đổi',
    icon: 'swap-horizontal-outline',
    route: '/change-order',
    color: '#ef4444',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'change-management',
    title: 'Quản lý thay đổi',
    icon: 'git-compare-outline',
    route: '/change-management',
    color: '#8b5cf6',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'as-built',
    title: 'Bản vẽ hoàn công',
    icon: 'document-outline',
    route: '/as-built',
    color: '#06b6d4',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'om-manuals',
    title: 'Sổ tay O&M',
    icon: 'book-outline',
    route: '/om-manuals',
    color: '#10b981',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  
  // === OPERATIONS ===
  {
    id: 'daily-report',
    title: 'Báo cáo hàng ngày',
    icon: 'today-outline',
    route: '/daily-report',
    color: '#3b82f6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'meeting-minutes',
    title: 'Biên bản họp',
    icon: 'people-outline',
    route: '/meeting-minutes',
    color: '#6366f1',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'procurement',
    title: 'Mua sắm',
    icon: 'bag-handle-outline',
    route: '/procurement',
    color: '#f59e0b',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'equipment',
    title: 'Thiết bị',
    icon: 'construct-outline',
    route: '/equipment',
    color: '#ef4444',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'fleet',
    title: 'Xe cộ',
    icon: 'car-outline',
    route: '/fleet',
    color: '#14b8a6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'resource-planning',
    title: 'Kế hoạch tài nguyên',
    icon: 'calendar-outline',
    route: '/resource-planning',
    color: '#ec4899',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  
  // === SPECIALIZED ===
  {
    id: 'commissioning',
    title: 'Nghiệm thu',
    icon: 'checkmark-done-circle-outline',
    route: '/commissioning',
    color: '#10b981',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'warranty',
    title: 'Bảo hành',
    icon: 'shield-outline',
    route: '/warranty',
    color: '#06b6d4',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'risk',
    title: 'Rủi ro',
    icon: 'alert-circle-outline',
    route: '/risk',
    color: '#ef4444',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'environmental',
    title: 'Môi trường',
    icon: 'leaf-outline',
    route: '/environmental',
    color: '#10b981',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  
  // === QUALITY & PLANNING ===
  {
    id: 'qc-qa',
    title: 'QC/QA',
    icon: 'shield-checkmark-outline',
    route: '/quality-assurance',
    color: '#10b981',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'safety',
    title: 'An toàn',
    icon: 'warning-outline',
    route: '/safety',
    color: '#ef4444',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'inspection',
    title: 'Kiểm tra',
    icon: 'search-outline',
    route: '/inspection',
    color: '#8b5cf6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'punch-list',
    title: 'Danh sách khuyết tật',
    icon: 'list-outline',
    route: '/punch-list',
    color: '#f97316',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'timeline',
    title: 'Tiến độ',
    icon: 'time-outline',
    route: '/timeline',
    color: '#06b6d4',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'timeline-phases',
    title: 'Giai đoạn',
    icon: 'layers-outline',
    route: '/timeline/phases',
    color: '#3b82f6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'timeline-critical',
    title: 'Đường găng',
    icon: 'git-network-outline',
    route: '/timeline/critical-path',
    color: '#dc2626',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'timeline-dependencies',
    title: 'Phụ thuộc',
    icon: 'git-branch-outline',
    route: '/timeline/dependencies',
    color: '#7c3aed',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  
  // === FINANCE & INVENTORY ===
  {
    id: 'budget',
    title: 'Ngân sách',
    icon: 'wallet-outline',
    route: '/budget',
    color: '#f59e0b',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'budget-expenses',
    title: 'Chi phí',
    icon: 'cash-outline',
    route: '/budget/expenses',
    color: '#ef4444',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'budget-invoices',
    title: 'Hóa đơn',
    icon: 'receipt-outline',
    route: '/budget/invoices',
    color: '#10b981',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'inventory',
    title: 'Kho vật liệu',
    icon: 'cube-outline',
    route: '/inventory',
    color: '#14b8a6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'inventory-materials',
    title: 'Vật liệu',
    icon: 'layers-outline',
    route: '/inventory/materials',
    color: '#06b6d4',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'inventory-orders',
    title: 'Đơn hàng',
    icon: 'cart-outline',
    route: '/inventory/orders',
    color: '#8b5cf6',
    requiredRole: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    id: 'inventory-suppliers',
    title: 'Nhà cung cấp',
    icon: 'business-outline',
    route: '/inventory/suppliers',
    color: '#ec4899',
    requiredRole: [UserRole.MANAGER, UserRole.ADMIN],
  },
  
  // === REPORTS (Manager+) ===
  {
    id: 'reports',
    title: 'Báo cáo',
    icon: 'bar-chart',
    route: '/reports',
    color: '#0ea5e9',
    requiredPermission: Permission.VIEW_REPORTS,
  },
  
  // === CONTENT CREATION (Staff+) ===
  {
    id: 'moderation',
    title: 'Kiểm duyệt',
    icon: 'checkmark-done',
    route: '/admin/moderation',
    color: '#ef4444',
    requiredPermission: Permission.APPROVE_CONTENT,
    badge: 0, // Will be updated with pending count
  },
  {
    id: 'users',
    title: 'Quản lý người dùng',
    icon: 'people-circle',
    route: '/admin/staff',
    color: '#6366f1',
    requiredPermission: Permission.MANAGE_USERS,
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    icon: 'settings',
    route: '/admin/settings',
    color: '#64748b',
    requiredPermission: Permission.MANAGE_SETTINGS,
  },
  
  // === UTILITIES ===
  {
    id: 'videos',
    title: 'Videos',
    icon: 'videocam',
    route: '/videos',
    color: '#ef4444',
  },
];

export function HomeMenuGrid() {
  const { user } = useAuth();
  
  // Filter menu items based on user role and permissions
  const visibleMenuItems = ALL_MENU_ITEMS.filter(item => {
    // No restriction
    if (!item.requiredPermission && !item.requiredRole) {
      return true;
    }
    
    // Check role requirement
    if (item.requiredRole && user) {
      if (!item.requiredRole.includes(user.role as UserRole)) {
        return false;
      }
    }
    
    // Check permission requirement
    if (item.requiredPermission && user) {
      if (!hasPermission(user as any, item.requiredPermission)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Group by category
  const grouped = {
    communications: visibleMenuItems.filter(i => ['messages'].includes(i.id)),
    shopping: visibleMenuItems.filter(i => ['products', 'cart', 'quote'].includes(i.id)),
    newFeatures: visibleMenuItems.filter(i => ['file-upload', 'progress-tracking', 'scheduled-tasks', 'health-check', 'analytics'].includes(i.id)),
    construction: visibleMenuItems.filter(i => ['construction', 'materials', 'labor'].includes(i.id)),
    documents: visibleMenuItems.filter(i => ['documents', 'contracts', 'document-control', 'submittal', 'rfi', 'change-order', 'change-management', 'as-built', 'om-manuals'].includes(i.id)),
    quality: visibleMenuItems.filter(i => ['qc-qa', 'safety', 'inspection', 'punch-list', 'timeline', 'timeline-phases', 'timeline-critical', 'timeline-dependencies'].includes(i.id)),
    finance: visibleMenuItems.filter(i => ['budget', 'budget-expenses', 'budget-invoices', 'inventory', 'inventory-materials', 'inventory-orders', 'inventory-suppliers'].includes(i.id)),
    operations: visibleMenuItems.filter(i => ['daily-report', 'meeting-minutes', 'procurement', 'equipment', 'fleet', 'resource-planning'].includes(i.id)),
    specialized: visibleMenuItems.filter(i => ['commissioning', 'warranty', 'risk', 'environmental'].includes(i.id)),
    reports: visibleMenuItems.filter(i => ['reports'].includes(i.id)),
    admin: visibleMenuItems.filter(i => ['moderation', 'users', 'settings'].includes(i.id)),
    utilities: visibleMenuItems.filter(i => ['videos'].includes(i.id)),
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* User Role Badge */}
      {user && (
        <View style={styles.roleBadge}>
          <Ionicons 
            name={getRoleIcon(user.role as UserRole)} 
            size={16} 
            color="#fff" 
            style={{ marginRight: 4 }}
          />
          <Text style={styles.roleText}>{getRoleLabel(user.role as UserRole)}</Text>
        </View>
      )}
      
      {/* Communications */}
      {grouped.communications.length > 0 && (
        <MenuSection title="Giao tiếp" items={grouped.communications} />
      )}
      
      {/* Shopping */}
      {grouped.shopping.length > 0 && (
        <MenuSection title="Mua sắm" items={grouped.shopping} />
      )}
      
      {/* New Features */}
      {grouped.newFeatures.length > 0 && (
        <MenuSection title="🚀 Tính năng mới" items={grouped.newFeatures} />
      )}
      
      {/* Construction */}
      {grouped.newFeatures.length > 0 && (
        <MenuSection title="🚀 Tính năng mới" items={grouped.newFeatures} />
      )}
      
      {/* Construction */}
      {grouped.construction.length > 0 && (
        <MenuSection title="Quản lý dự án" items={grouped.construction} />
      )}
      
      {/* Documents */}
      {grouped.documents.length > 0 && (
        <MenuSection title="Tài liệu" items={grouped.documents} />
      )}
      
      {/* Quality & Planning */}
      {grouped.quality.length > 0 && (
        <MenuSection title="Chất lượng & Tiến độ" items={grouped.quality} />
      )}
      
      {/* Finance & Inventory */}
      {grouped.finance.length > 0 && (
        <MenuSection title="Tài chính & Kho" items={grouped.finance} />
      )}
      
      {/* Operations */}
      {grouped.operations.length > 0 && (
        <MenuSection title="Vận hành" items={grouped.operations} />
      )}
      
      {/* Specialized */}
      {grouped.specialized.length > 0 && (
        <MenuSection title="Chuyên môn" items={grouped.specialized} />
      )}
      
      {/* Reports */}
      {grouped.reports.length > 0 && (
        <MenuSection title="Báo cáo & Phân tích" items={grouped.reports} />
      )}
      
      {/* Admin */}
      {grouped.admin.length > 0 && (
        <MenuSection title="Quản trị" items={grouped.admin} />
      )}
      
      {/* Utilities */}
      {grouped.utilities.length > 0 && (
        <MenuSection title="Tiện ích" items={grouped.utilities} />
      )}
    </ScrollView>
  );
}

// ============================================================================
// MENU SECTION
// ============================================================================

function MenuSection({ title, items }: { title: string; items: MenuItem[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.grid}>
        {items.map(item => (
          <MenuCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}

// ============================================================================
// MENU CARD
// ============================================================================

function MenuCard({ item }: { item: MenuItem }) {
  const handlePress = () => {
    router.push(item.route as any);
  };
  
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon} size={28} color="#fff" />
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getRoleIcon(role: UserRole): keyof typeof Ionicons.glyphMap {
  switch (role) {
    case UserRole.ADMIN:
      return 'shield-checkmark';
    case UserRole.MANAGER:
      return 'star';
    case UserRole.STAFF:
      return 'person';
    case UserRole.CUSTOMER:
      return 'person-circle';
    default:
      return 'person';
  }
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Quản trị viên';
    case UserRole.MANAGER:
      return 'Quản lý';
    case UserRole.STAFF:
      return 'Nhân viên';
    case UserRole.CUSTOMER:
      return 'Khách hàng';
    default:
      return 'Người dùng';
  }
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  card: {
    width: '25%',
    padding: 6,
  },
  iconContainer: {
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 12,
    textAlign: 'center',
    color: '#111',
    lineHeight: 16,
  },
});
