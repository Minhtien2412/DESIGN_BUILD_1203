import { Container } from '@/components/ui/container';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  joinedDate: string;
}

const ROLE_CONFIG = {
  owner: { label: 'Chủ dự án', color: '#0D9488', icon: 'star' },
  architect: { label: 'Kiến trúc sư', color: '#007AFF', icon: 'easel' },
  engineer: { label: 'Kỹ sư', color: '#34C759', icon: 'construct' },
  contractor: { label: 'Nhà thầu', color: '#FFB800', icon: 'hammer' },
  supervisor: { label: 'Giám sát', color: '#666666', icon: 'eye' },
  worker: { label: 'Công nhân', color: '#999', icon: 'people' },
};

export default function ProjectTeamScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const projectId = params.id as string;

  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Nguyễn Văn A',
      role: 'owner',
      phone: '0901234567',
      email: 'nguyenvana@gmail.com',
      status: 'active',
      joinedDate: '2025-01-01',
    },
    {
      id: '2',
      name: 'Trần Thị B',
      role: 'architect',
      phone: '0912345678',
      email: 'tranthib@gmail.com',
      status: 'active',
      joinedDate: '2025-01-05',
    },
    {
      id: '3',
      name: 'Lê Văn C',
      role: 'engineer',
      phone: '0923456789',
      email: 'levanc@gmail.com',
      status: 'active',
      joinedDate: '2025-01-10',
    },
    {
      id: '4',
      name: 'Phạm Thị D',
      role: 'contractor',
      phone: '0934567890',
      email: 'phamthid@gmail.com',
      status: 'active',
      joinedDate: '2025-01-15',
    },
    {
      id: '5',
      name: 'Hoàng Văn E',
      role: 'supervisor',
      phone: '0945678901',
      email: 'hoangvane@gmail.com',
      status: 'inactive',
      joinedDate: '2025-01-20',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [addModalVisible, setAddModalVisible] = useState(false);

  const filteredTeam =
    filter === 'all' ? team : team.filter(m => m.status === filter);

  const handleCall = (phone: string) => {
    Alert.alert('Gọi điện', `Gọi đến ${phone}`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Gọi ngay', onPress: () => console.log('Call:', phone) },
    ]);
  };

  const handleMessage = (memberId: string, name: string) => {
    router.push(`/messages/chat/${memberId}` as any);
  };

  const handleRemoveMember = (memberId: string, name: string) => {
    Alert.alert('Xóa thành viên', `Bạn có chắc muốn xóa ${name} khỏi dự án?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => setTeam(prev => prev.filter(m => m.id !== memberId)),
      },
    ]);
  };

  const renderMemberItem = ({ item }: { item: TeamMember }) => {
    const roleConfig = ROLE_CONFIG[item.role as keyof typeof ROLE_CONFIG];

    return (
      <View style={styles.memberCard}>
        <View style={styles.memberHeader}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {item.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Text>
            </View>
          )}

          <View style={styles.memberInfo}>
            <View style={styles.memberNameRow}>
              <Text style={styles.memberName}>{item.name}</Text>
              {item.status === 'inactive' && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>Tạm ngưng</Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleConfig.color + '20' },
              ]}
            >
              <Ionicons
                name={roleConfig.icon as any}
                size={14}
                color={roleConfig.color}
              />
              <Text style={[styles.roleText, { color: roleConfig.color }]}>
                {roleConfig.label}
              </Text>
            </View>

            <View style={styles.contactRow}>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={14} color="#666" />
                <Text style={styles.contactText}>{item.phone}</Text>
              </View>
              {item.email && (
                <View style={styles.contactItem}>
                  <Ionicons name="mail" size={14} color="#666" />
                  <Text style={styles.contactText} numberOfLines={1}>
                    {item.email}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.joinedDate}>
              Tham gia: {new Date(item.joinedDate).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>

        <View style={styles.memberActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={20} color="#007AFF" />
            <Text style={styles.actionBtnText}>Gọi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleMessage(item.id, item.name)}
          >
            <Ionicons name="chatbubble" size={20} color="#34C759" />
            <Text style={styles.actionBtnText}>Nhắn tin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleRemoveMember(item.id, item.name)}
          >
            <Ionicons name="person-remove" size={20} color="#000000" />
            <Text style={styles.actionBtnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Đội ngũ dự án</Text>
        </View>
        <TouchableOpacity
          onPress={() => setAddModalVisible(true)}
          style={styles.addBtn}
        >
          <Ionicons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[styles.filterText, filter === 'all' && styles.filterTextActive]}
            >
              Tất cả
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{team.length}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'active' && styles.filterTabActive]}
            onPress={() => setFilter('active')}
          >
            <Ionicons
              name="checkmark-circle"
              size={16}
              color={filter === 'active' ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.filterText,
                filter === 'active' && styles.filterTextActive,
              ]}
            >
              Hoạt động
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {team.filter(m => m.status === 'active').length}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'inactive' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('inactive')}
          >
            <Ionicons
              name="pause-circle"
              size={16}
              color={filter === 'inactive' ? '#fff' : '#666'}
            />
            <Text
              style={[
                styles.filterText,
                filter === 'inactive' && styles.filterTextActive,
              ]}
            >
              Tạm ngưng
            </Text>
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {team.filter(m => m.status === 'inactive').length}
              </Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Team Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={28} color="#0D9488" />
          <Text style={styles.statValue}>{team.length}</Text>
          <Text style={styles.statLabel}>Tổng thành viên</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={28} color="#34C759" />
          <Text style={styles.statValue}>
            {team.filter(m => m.status === 'active').length}
          </Text>
          <Text style={styles.statLabel}>Hoạt động</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="briefcase" size={28} color="#007AFF" />
          <Text style={styles.statValue}>
            {Object.keys(ROLE_CONFIG).filter(role =>
              team.some(m => m.role === role)
            ).length}
          </Text>
          <Text style={styles.statLabel}>Vai trò</Text>
        </View>
      </View>

      {/* Member List */}
      <FlatList
        data={filteredTeam}
        renderItem={renderMemberItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Chưa có thành viên</Text>
            <Text style={styles.emptyDesc}>Thêm thành viên mới cho dự án</Text>
          </View>
        }
      />

      {/* Add Member Modal */}
      <AddTeamMemberModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAdd={(member) => {
          setTeam(prev => [...prev, {
            ...member,
            id: Date.now().toString(),
            status: 'active',
            joinedDate: new Date().toISOString().split('T')[0],
          }]);
          setAddModalVisible(false);
        }}
      />
    </Container>
  );
}

// Add Team Member Modal Component
interface AddTeamMemberModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (member: Omit<TeamMember, 'id' | 'status' | 'joinedDate'>) => void;
}

function AddTeamMemberModal({ visible, onClose, onAdd }: AddTeamMemberModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<keyof typeof ROLE_CONFIG>('worker');
  
  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thành viên');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return;
    }
    
    onAdd({ name: name.trim(), phone: phone.trim(), email: email.trim(), role });
    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setRole('worker');
    setSearchQuery('');
  };

  const handleClose = () => {
    setName('');
    setPhone('');
    setEmail('');
    setRole('worker');
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.container}>
          {/* Header */}
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>Thêm thành viên</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
            {/* Search User (stub) */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>Tìm kiếm người dùng</Text>
              <View style={modalStyles.searchBox}>
                <Ionicons name="search" size={20} color="#999" />
                <TextInput
                  style={modalStyles.searchInput}
                  placeholder="Email hoặc số điện thoại..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              {searchQuery.length > 0 && (
                <Text style={modalStyles.hint}>
                  Tìm kiếm trong hệ thống (chức năng đang phát triển)
                </Text>
              )}
            </View>

            {/* Manual Input */}
            <View style={modalStyles.divider}>
              <View style={modalStyles.dividerLine} />
              <Text style={modalStyles.dividerText}>HOẶC NHẬP THỦ CÔNG</Text>
              <View style={modalStyles.dividerLine} />
            </View>

            {/* Name */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>Họ và tên *</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="Nguyễn Văn A"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>Email *</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>Số điện thoại *</Text>
              <TextInput
                style={modalStyles.input}
                placeholder="0901234567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Role Selector */}
            <View style={modalStyles.section}>
              <Text style={modalStyles.label}>Vai trò</Text>
              <View style={modalStyles.roleGrid}>
                {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      modalStyles.roleCard,
                      role === key && { 
                        borderColor: config.color, 
                        borderWidth: 2,
                        backgroundColor: config.color + '10' 
                      }
                    ]}
                    onPress={() => setRole(key as keyof typeof ROLE_CONFIG)}
                  >
                    <Ionicons 
                      name={config.icon as any} 
                      size={24} 
                      color={role === key ? config.color : '#999'} 
                    />
                    <Text style={[
                      modalStyles.roleLabel,
                      role === key && { color: config.color, fontWeight: '700' }
                    ]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={modalStyles.footer}>
            <TouchableOpacity 
              style={[modalStyles.btn, modalStyles.btnCancel]} 
              onPress={handleClose}
            >
              <Text style={modalStyles.btnCancelText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[modalStyles.btn, modalStyles.btnSubmit]} 
              onPress={handleSubmit}
            >
              <Text style={modalStyles.btnSubmitText}>Thêm thành viên</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D9488',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    padding: 8,
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: '#0D9488',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterBadge: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0D9488',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 1,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  memberHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  inactiveBadge: {
    backgroundColor: '#FF3B3020',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inactiveBadgeText: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '600',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contactRow: {
    gap: 8,
    marginBottom: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  joinedDate: {
    fontSize: 12,
    color: '#999',
  },
  memberActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    fontStyle: 'italic',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#999',
    letterSpacing: 1,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    fontSize: 15,
    color: '#333',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#f8f8f8',
  },
  btnCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  btnSubmit: {
    backgroundColor: '#0D9488',
  },
  btnSubmitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
