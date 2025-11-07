import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Company } from '@/types/auth';
import { useState } from 'react';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';

interface CompanySwitcherProps {
  style?: any;
}

/**
 * Company switcher component for multi-tenant users
 * Allows switching between associated companies
 */
export function CompanySwitcher({ style }: CompanySwitcherProps) {
  const { user, currentCompany, switchCompany } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  if (!user || !user.companies || user.companies.length <= 1) {
    return null; // Don't show if user has only one company or no companies
  }

  const handleCompanySelect = async (company: Company) => {
    await switchCompany(company.id);
    setModalVisible(false);
  };

  const renderCompanyItem = ({ item }: { item: Company }) => (
    <TouchableOpacity
      style={{
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        backgroundColor: currentCompany?.id === item.id ? '#f0f8ff' : 'white',
      }}
      onPress={() => handleCompanySelect(item)}
    >
      <Text
        style={{
          fontSize: 16,
          fontWeight: currentCompany?.id === item.id ? 'bold' : 'normal',
          color: currentCompany?.id === item.id ? tintColor : textColor,
        }}
      >
        {item.name}
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: '#666',
          marginTop: 4,
        }}
      >
        {item.description || 'Không có mô tả'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={style}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          backgroundColor,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#e0e0e0',
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 16,
            color: textColor,
          }}
          numberOfLines={1}
        >
          {currentCompany?.name || 'Chọn công ty'}
        </Text>
        <Text style={{ fontSize: 16, color: tintColor }}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: '70%',
            }}
          >
            <View
              style={{
                padding: 20,
                borderBottomWidth: 1,
                borderBottomColor: '#e0e0e0',
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: textColor,
                }}
              >
                Chọn công ty
              </Text>
            </View>

            <FlatList
              data={user.companies}
              keyExtractor={(item) => item.id}
              renderItem={renderCompanyItem}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={{
                padding: 16,
                backgroundColor: '#f8f9fa',
                borderTopWidth: 1,
                borderTopColor: '#e0e0e0',
              }}
              onPress={() => setModalVisible(false)}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 16,
                  color: '#6c757d',
                }}
              >
                Hủy
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
