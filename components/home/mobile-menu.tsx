import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Menu items với icon và route
const MENU_ITEMS = [
  {
    id: 1,
    title: 'Dịch vụ',
    icon: 'apps-outline' as const,
    route: '/projects?tab=services',
    description: 'Xem tất cả dịch vụ',
    color: '#0066CC'
  },
  {
    id: 2,
    title: 'Tiện ích',
    icon: 'construct-outline' as const,
    route: '/utilities',
    description: 'Công cụ xây dựng',
    color: '#1A1A1A'
  },
  {
    id: 3,
    title: 'Dự án',
    icon: 'briefcase-outline' as const,
    route: '/projects',
    description: 'Quản lý dự án',
    color: '#0080FF'
  },
  {
    id: 4,
    title: 'Video Live',
    icon: 'play-circle-outline' as const,
    route: '/projects?tab=videos',
    description: 'Xem video trực tiếp',
    color: '#FF9F1C'
  },
  {
    id: 5,
    title: 'Thư viện',
    icon: 'images-outline' as const,
    route: '/projects?tab=library',
    description: 'Thư viện thiết kế',
    color: '#9B59B6'
  },
  {
    id: 6,
    title: 'Công ty',
    icon: 'business-outline' as const,
    route: '/utilities/cong-ty-xay-dung',
    description: 'Danh sách công ty',
    color: '#3498DB'
  },
  {
    id: 7,
    title: 'Hồ sơ',
    icon: 'person-outline' as const,
    route: '/profile',
    description: 'Tài khoản của tôi',
    color: '#000000'
  },
  {
    id: 8,
    title: 'Thông báo',
    icon: 'notifications-outline' as const,
    route: '/(tabs)/notifications',
    description: 'Xem thông báo',
    color: '#F39C12',
    badge: 5
  },
  {
    id: 9,
    title: 'Tư vấn',
    icon: 'chatbubbles-outline' as const,
    route: '/call',
    description: 'Tư vấn trực tuyến',
    color: '#16A085'
  },
  {
    id: 10,
    title: 'Admin',
    icon: 'shield-checkmark-outline' as const,
    route: '/admin',
    description: 'Quản trị hệ thống',
    color: '#8E44AD',
    requireAdmin: true
  },
  {
    id: 11,
    title: 'Cài đặt',
    icon: 'settings-outline' as const,
    route: '/profile/settings',
    description: 'Tùy chỉnh ứng dụng',
    color: '#7F8C8D'
  },
  // Item "Xem thêm" để giữ layout đẹp khi chia 4
  {
    id: 999,
    title: 'Xem thêm',
    icon: 'ellipsis-horizontal-circle-outline' as const,
    route: '/projects',
    description: 'Khám phá thêm',
    color: '#95A5A6',
    isPlaceholder: true
  }
];

interface MobileMenuProps {
  visible: boolean;
  onClose: () => void;
  userIsAdmin?: boolean;
}

export function MobileMenu({ visible, onClose, userIsAdmin = false }: MobileMenuProps) {
  const [activeSection, setActiveSection] = useState<'main' | 'utilities' | 'profile'>('main');

  // Filter menu items based on admin status
  const filteredItems = MENU_ITEMS.filter(item => 
    !item.requireAdmin || (item.requireAdmin && userIsAdmin)
  );

  const handleItemPress = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 200);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <Pressable 
          style={{ flex: 1 }} 
          onPress={onClose}
        />
        
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: SCREEN_HEIGHT * 0.85,
          paddingBottom: 20
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0'
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#111' }}>
              Menu
            </Text>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#f5f5f5',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Ionicons name="close" size={20} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Section Tabs */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingVertical: 12,
            gap: 8,
            borderBottomWidth: 1,
            borderBottomColor: '#f0f0f0'
          }}>
            <TouchableOpacity
              onPress={() => setActiveSection('main')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeSection === 'main' ? '#0066CC' : '#f5f5f5'
              }}
            >
              <Text style={{ 
                fontSize: 13, 
                fontWeight: '600',
                color: activeSection === 'main' ? '#fff' : '#666'
              }}>
                Chính
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveSection('utilities')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeSection === 'utilities' ? '#0066CC' : '#f5f5f5'
              }}
            >
              <Text style={{ 
                fontSize: 13, 
                fontWeight: '600',
                color: activeSection === 'utilities' ? '#fff' : '#666'
              }}>
                Tiện ích
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setActiveSection('profile')}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeSection === 'profile' ? '#0066CC' : '#f5f5f5'
              }}
            >
              <Text style={{ 
                fontSize: 13, 
                fontWeight: '600',
                color: activeSection === 'profile' ? '#fff' : '#666'
              }}>
                Cá nhân
              </Text>
            </TouchableOpacity>
          </View>

          {/* Menu Items Grid */}
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ 
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 10
            }}
          >
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              gap: 12
            }}>
              {filteredItems.map((item) => {
                // Calculate width to show 4 items per row with proper spacing
                const itemWidth = (SCREEN_WIDTH - 40 - 36) / 4; // 40 padding, 36 gaps

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => handleItemPress(item.route)}
                    activeOpacity={0.7}
                    style={{
                      width: itemWidth,
                      alignItems: 'center',
                      marginBottom: 12,
                      opacity: item.isPlaceholder ? 0.5 : 1
                    }}
                  >
                    {/* Icon Container */}
                    <View style={{
                      width: 56,
                      height: 56,
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 8,
                      position: 'relative'
                    }}>
                      {/* Icon Background Circle (subtle) */}
                      <View style={{
                        position: 'absolute',
                        width: 56,
                        height: 56,
                        borderRadius: 28,
                        backgroundColor: `${item.color}15`,
                      }} />
                      
                      <Ionicons 
                        name={item.icon} 
                        size={28} 
                        color={item.color} 
                      />
                      
                      {/* Badge */}
                      {item.badge && item.badge > 0 && (
                        <View style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: '#FF3B30',
                          borderRadius: 10,
                          minWidth: 20,
                          height: 20,
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 6,
                          borderWidth: 2,
                          borderColor: '#fff'
                        }}>
                          <Text style={{ 
                            color: '#fff', 
                            fontSize: 10, 
                            fontWeight: '700' 
                          }}>
                            {item.badge > 9 ? '9+' : item.badge}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Title */}
                    <Text 
                      style={{ 
                        fontSize: 11, 
                        fontWeight: '600',
                        color: item.isPlaceholder ? '#999' : '#333',
                        textAlign: 'center',
                        lineHeight: 14
                      }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>

                    {/* Description (optional, only show for some items) */}
                    {!item.isPlaceholder && item.description && false && (
                      <Text 
                        style={{ 
                          fontSize: 9, 
                          color: '#999',
                          textAlign: 'center',
                          marginTop: 2
                        }}
                        numberOfLines={1}
                      >
                        {item.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Quick Actions */}
            <View style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: '#f8f8f8',
              borderRadius: 12
            }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '600', 
                color: '#666',
                marginBottom: 12
              }}>
                Truy cập nhanh
              </Text>
              
              <View style={{ gap: 10 }}>
                <TouchableOpacity
                  onPress={() => handleItemPress('/call')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: '#fff',
                    borderRadius: 10
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#E8F5E9',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="call-outline" size={20} color="#0066CC" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
                      Gọi tư vấn ngay
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      Hỗ trợ 24/7
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleItemPress('/projects?tab=services')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 12,
                    backgroundColor: '#fff',
                    borderRadius: 10
                  }}
                >
                  <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#0080FF15',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons name="rocket-outline" size={20} color="#0080FF" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#333' }}>
                      Bắt đầu dự án
                    </Text>
                    <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                      Tạo dự án mới
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#999" />
                </TouchableOpacity>
              </View>
            </View>

            {/* App Info */}
            <View style={{
              marginTop: 20,
              alignItems: 'center',
              paddingBottom: 10
            }}>
              <Text style={{ fontSize: 11, color: '#999' }}>
                App Xây Dựng v1.0.0
              </Text>
              <Text style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>
                © 2025 Thiết Kế Resort
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
