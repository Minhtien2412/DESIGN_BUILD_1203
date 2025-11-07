/**
 * Team Management Component
 * Displays team members with avatars, roles, and management actions
 */
import { Ionicons } from '@expo/vector-icons';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
  email?: string;
  joinedAt?: string;
};

type TeamManagementProps = {
  members: TeamMember[];
  onAddMember?: () => void;
  onMemberPress?: (member: TeamMember) => void;
  onRemoveMember?: (member: TeamMember) => void;
  editable?: boolean;
};

const ROLE_COLORS: Record<string, string> = {
  'Chủ đầu tư': '#FF9800',
  'Giám đốc dự án': '#2196F3',
  'Kỹ sư thi công': '#4CAF50',
  'Kiến trúc sư': '#9C27B0',
  'Kỹ thuật viên': '#00BCD4',
  'default': '#757575',
};

export default function TeamManagement({
  members,
  onAddMember,
  onMemberPress,
  onRemoveMember,
  editable = false,
}: TeamManagementProps) {
  const getRoleColor = (role: string): string => {
    return ROLE_COLORS[role] || ROLE_COLORS['default'];
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Thành viên dự án</Text>
          <Text style={styles.subtitle}>{members.length} người</Text>
        </View>
        
        {editable && onAddMember && (
          <TouchableOpacity style={styles.addButton} onPress={onAddMember}>
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>Thêm</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Team Grid */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teamScroll}
      >
        {members.map((member) => (
          <TouchableOpacity
            key={member.id}
            style={styles.memberCard}
            onPress={() => onMemberPress?.(member)}
            activeOpacity={0.7}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: getRoleColor(member.role) }]}>
                  <Text style={styles.avatarInitials}>{getInitials(member.name)}</Text>
                </View>
              )}
              
              {/* Remove button (only in edit mode) */}
              {editable && onRemoveMember && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onRemoveMember(member);
                  }}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              )}
            </View>

            {/* Name */}
            <Text style={styles.memberName} numberOfLines={2}>
              {member.name}
            </Text>

            {/* Role Badge */}
            <View style={[styles.roleBadge, { backgroundColor: `${getRoleColor(member.role)}20` }]}>
              <Text style={[styles.roleText, { color: getRoleColor(member.role) }]}>
                {member.role}
              </Text>
            </View>

            {/* Contact Icons */}
            <View style={styles.contactIcons}>
              {member.phone && (
                <View style={styles.contactIcon}>
                  <Ionicons name="call" size={14} color="#4CAF50" />
                </View>
              )}
              {member.email && (
                <View style={styles.contactIcon}>
                  <Ionicons name="mail" size={14} color="#2196F3" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List View (for more details) */}
      <View style={styles.listContainer}>
        {members.map((member, index) => (
          <TouchableOpacity
            key={`list-${member.id}`}
            style={[
              styles.listItem,
              index < members.length - 1 && styles.listItemBorder,
            ]}
            onPress={() => onMemberPress?.(member)}
          >
            {/* Avatar */}
            {member.avatar ? (
              <Image source={{ uri: member.avatar }} style={styles.listAvatar} />
            ) : (
              <View style={[styles.listAvatarPlaceholder, { backgroundColor: getRoleColor(member.role) }]}>
                <Text style={styles.listAvatarInitials}>{getInitials(member.name)}</Text>
              </View>
            )}

            {/* Info */}
            <View style={styles.listInfo}>
              <Text style={styles.listName}>{member.name}</Text>
              <View style={styles.listMeta}>
                <Text style={[styles.listRole, { color: getRoleColor(member.role) }]}>
                  {member.role}
                </Text>
                {member.phone && (
                  <>
                    <Text style={styles.listDot}>•</Text>
                    <Text style={styles.listPhone}>{member.phone}</Text>
                  </>
                )}
              </View>
            </View>

            {/* Actions */}
            <View style={styles.listActions}>
              {member.phone && (
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="call-outline" size={20} color="#4CAF50" />
                </TouchableOpacity>
              )}
              {member.email && (
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="mail-outline" size={20} color="#2196F3" />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#90b44c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  teamScroll: {
    gap: 16,
    paddingBottom: 20,
  },
  memberCard: {
    width: 120,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 20,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contactIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  listAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
  },
  listAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listAvatarInitials: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listRole: {
    fontSize: 13,
    fontWeight: '600',
  },
  listDot: {
    fontSize: 13,
    color: '#ccc',
  },
  listPhone: {
    fontSize: 13,
    color: '#666',
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
