/**
 * Admin Permission Management System
 * Allows admin to assign detailed permissions to users
 */

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Local types for admin system
export const USER_ROLES = {
    CLIENT: 'client' as const,
    CONTRACTOR: 'contractor' as const,
    ADMIN: 'admin' as const,
};

export const PERMISSIONS = {
    VIEW_BIDS: 'view_bids' as const,
    BID_PROJECTS: 'bid_projects' as const,
    VIEW_PROGRESS: 'view_progress' as const,
    VIEW_PAYMENTS: 'view_payments' as const,
    VIEW_PRICING: 'view_pricing' as const,
    CHAT_CUSTOMERS: 'chat_customers' as const,
    POST_ARTICLES: 'post_articles' as const,
    LIVE_STREAM: 'live_stream' as const,
    POST_PRODUCTS: 'post_products' as const,
    VIEW_CUSTOMER_INFO: 'view_customer_info' as const,
};

type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

interface AppUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    permissions: Permission[];
    isActive: boolean;
    joinedAt: string;
}

// Mock users data - In real app, fetch from API
const MOCK_USERS: AppUser[] = [
    {
        id: '1',
        name: 'Nguy?n Van A',
        email: 'nguyenvana@example.com',
        phone: '0901234567',
        role: USER_ROLES.CLIENT,
        permissions: [PERMISSIONS.VIEW_BIDS, PERMISSIONS.CHAT_CUSTOMERS],
        isActive: true,
        joinedAt: '2024-01-15',
    },
    {
        id: '2',
        name: 'Tr?n Th? B',
        email: 'tranthib@example.com',
        phone: '0912345678',
        role: USER_ROLES.CONTRACTOR,
        permissions: [PERMISSIONS.VIEW_BIDS, PERMISSIONS.BID_PROJECTS, PERMISSIONS.CHAT_CUSTOMERS, PERMISSIONS.POST_PRODUCTS],
        isActive: true,
        joinedAt: '2024-02-10',
    },
    {
        id: '3',
        name: 'L� Van C',
        email: 'levanc@example.com',
        phone: '0923456789',
        role: USER_ROLES.CONTRACTOR,
        permissions: [PERMISSIONS.VIEW_PROGRESS, PERMISSIONS.VIEW_PAYMENTS],
        isActive: false,
        joinedAt: '2024-03-05',
    },
];

// Permission groups with descriptions
const PERMISSION_GROUPS = {
    'G�i th?u & D? �n': [
        { key: PERMISSIONS.VIEW_BIDS, name: 'Xem g�i th?u', desc: 'C� th? xem danh s�ch v� chi ti?t g�i th?u' },
        { key: PERMISSIONS.BID_PROJECTS, name: '�?u th?u', desc: 'C� th? tham gia d?u th?u d? �n' },
        { key: PERMISSIONS.VIEW_PROGRESS, name: 'Xem ti?n d?', desc: 'Theo d�i ti?n d? th?c hi?n d? �n' },
    ],
    'T�i ch�nh': [
        { key: PERMISSIONS.VIEW_PAYMENTS, name: 'Xem thanh to�n', desc: 'Truy c?p th�ng tin thanh to�n' },
        { key: PERMISSIONS.VIEW_PRICING, name: 'Xem gi� ti?n', desc: 'Xem b�o gi� v� d?nh gi� d?ch v?' },
    ],
    'Giao ti?p & Marketing': [
        { key: PERMISSIONS.CHAT_CUSTOMERS, name: 'Chat kh�ch h�ng', desc: 'Nh?n tin tr?c ti?p v?i kh�ch h�ng' },
        { key: PERMISSIONS.POST_ARTICLES, name: '�ang b�i vi?t', desc: 'T?o v� dang c�c b�i vi?t' },
        { key: PERMISSIONS.LIVE_STREAM, name: 'Live stream', desc: 'Ph�t tr?c ti?p video' },
    ],
    'S?n ph?m & D?ch v?': [
        { key: PERMISSIONS.POST_PRODUCTS, name: '�ang s?n ph?m', desc: '�ang b�n s?n ph?m, v?t li?u' },
        { key: PERMISSIONS.VIEW_CUSTOMER_INFO, name: 'Th�ng tin kh�ch h�ng', desc: 'Xem th�ng tin chi ti?t kh�ch h�ng' },
    ],
};

export default function AdminPermissionManager() {
    const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [tempPermissions, setTempPermissions] = useState<Permission[]>([]);

    // Filter users based on search and role
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             user.phone.includes(searchQuery);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Open permission modal
    const openPermissionModal = (user: AppUser) => {
        setSelectedUser(user);
        setTempPermissions([...user.permissions]);
        setShowPermissionModal(true);
    };

    // Toggle permission
    const togglePermission = (permission: Permission) => {
        if (tempPermissions.includes(permission)) {
            setTempPermissions(tempPermissions.filter(p => p !== permission));
        } else {
            setTempPermissions([...tempPermissions, permission]);
        }
    };

    // Save permissions
    const savePermissions = () => {
        if (!selectedUser) return;

        setUsers(users.map(user => 
            user.id === selectedUser.id 
                ? { ...user, permissions: [...tempPermissions] }
                : user
        ));

        Alert.alert('Th�nh c�ng', `�� c?p nh?t quy?n cho ${selectedUser.name}`);
        setShowPermissionModal(false);
        setSelectedUser(null);
    };

    // Toggle user active status
    const toggleUserStatus = (userId: string) => {
        setUsers(users.map(user => 
            user.id === userId 
                ? { ...user, isActive: !user.isActive }
                : user
        ));
    };

    // Render user item
    const renderUserItem = ({ item: user }: { item: AppUser }) => (
        <View style={styles.userCard}>
            <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userPhone}>{user.phone}</Text>
                </View>
                <View style={styles.userActions}>
                    <View style={[styles.roleBadge, { 
                        backgroundColor: user.role === USER_ROLES.CLIENT ? '#E8F4FF' : 
                                        user.role === USER_ROLES.CONTRACTOR ? '#E8F5E8' : '#FFE5E5' 
                    }]}>
                        <Text style={[styles.roleText, {
                            color: user.role === USER_ROLES.CLIENT ? '#1976D2' : 
                                   user.role === USER_ROLES.CONTRACTOR ? '#388E3C' : '#D32F2F'
                        }]}>
                            {user.role === USER_ROLES.CLIENT ? '?? Kh�ch h�ng' : 
                             user.role === USER_ROLES.CONTRACTOR ? '?? Nh� th?u' : '?? Admin'}
                        </Text>
                    </View>
                    
                    <View style={styles.statusContainer}>
                        <Text style={styles.statusLabel}>Ho?t d?ng:</Text>
                        <Switch
                            value={user.isActive}
                            onValueChange={() => toggleUserStatus(user.id)}
                            trackColor={{ false: '#ccc', true: '#0066CC' }}
                            thumbColor={user.isActive ? '#fff' : '#fff'}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.permissionSummary}>
                <Text style={styles.permissionTitle}>Quy?n hi?n t?i ({user.permissions.length}):</Text>
                <View style={styles.permissionTags}>
                    {user.permissions.slice(0, 3).map((permission: Permission, index: number) => (
                        <View key={index} style={styles.permissionTag}>
                            <Text style={styles.permissionTagText}>
                                {Object.values(PERMISSION_GROUPS).flat()
                                    .find(p => p.key === permission)?.name || permission}
                            </Text>
                        </View>
                    ))}
                    {user.permissions.length > 3 && (
                        <View style={[styles.permissionTag, styles.moreTag]}>
                            <Text style={styles.permissionTagText}>+{user.permissions.length - 3}</Text>
                        </View>
                    )}
                </View>
            </View>

            <TouchableOpacity 
                style={styles.editPermissionButton}
                onPress={() => openPermissionModal(user)}
            >
                <MaterialCommunityIcons name="shield-edit" size={20} color="#007AFF" />
                <Text style={styles.editPermissionText}>Ch?nh s?a quy?n</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Qu?n l� ph�n quy?n</Text>
                <Text style={styles.subtitle}>Ph�n quy?n chi ti?t cho ngu?i d�ng</Text>
            </View>

            {/* Search and Filter */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#666" />
                    <TextInput
                        style={styles.searchInput}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="T�m ngu?i d�ng..."
                        placeholderTextColor="#999"
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
                    {[
                        { key: 'all', label: 'T?t c?', icon: 'people' },
                        { key: USER_ROLES.CLIENT, label: 'Kh�ch h�ng', icon: 'home' },
                        { key: USER_ROLES.CONTRACTOR, label: 'Nh� th?u', icon: 'hammer' },
                        { key: USER_ROLES.ADMIN, label: 'Admin', icon: 'shield' },
                    ].map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[styles.filterButton, filterRole === filter.key && styles.filterButtonActive]}
                            onPress={() => setFilterRole(filter.key)}
                        >
                            <Ionicons 
                                name={filter.icon as any} 
                                size={16} 
                                color={filterRole === filter.key ? '#007AFF' : '#666'} 
                            />
                            <Text style={[styles.filterText, filterRole === filter.key && styles.filterTextActive]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Users List */}
            <FlatList
                data={filteredUsers}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />

            {/* Permission Modal */}
            <Modal
                visible={showPermissionModal}
                animationType="slide"
                presentationStyle="pageSheet"
            >
                <SafeAreaView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity 
                            onPress={() => setShowPermissionModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                        <View style={styles.modalHeaderInfo}>
                            <Text style={styles.modalTitle}>Ph�n quy?n ngu?i d�ng</Text>
                            <Text style={styles.modalSubtitle}>{selectedUser?.name}</Text>
                        </View>
                        <TouchableOpacity 
                            onPress={savePermissions}
                            style={styles.saveButton}
                        >
                            <Text style={styles.saveButtonText}>Luu</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent}>
                        {Object.entries(PERMISSION_GROUPS).map(([groupName, permissions]) => (
                            <View key={groupName} style={styles.permissionGroup}>
                                <Text style={styles.groupTitle}>{groupName}</Text>
                                {permissions.map((permission) => (
                                    <View key={permission.key} style={styles.permissionItem}>
                                        <View style={styles.permissionInfo}>
                                            <Text style={styles.permissionName}>{permission.name}</Text>
                                            <Text style={styles.permissionDesc}>{permission.desc}</Text>
                                        </View>
                                        <Switch
                                            value={tempPermissions.includes(permission.key)}
                                            onValueChange={() => togglePermission(permission.key)}
                                            trackColor={{ false: '#ccc', true: '#007AFF' }}
                                            thumbColor="#fff"
                                        />
                                    </View>
                                ))}
                            </View>
                        ))}
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#333',
    },
    filterContainer: {
        flexDirection: 'row',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f8f9fa',
        marginRight: 8,
        gap: 6,
    },
    filterButtonActive: {
        backgroundColor: '#E8F4FF',
    },
    filterText: {
        fontSize: 14,
        color: '#666',
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#007AFF',
        fontWeight: '600',
    },
    listContainer: {
        padding: 16,
        gap: 16,
    },
    userCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    userHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: '#666',
    },
    userActions: {
        alignItems: 'flex-end',
        gap: 12,
    },
    roleBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusLabel: {
        fontSize: 12,
        color: '#666',
    },
    permissionSummary: {
        marginBottom: 16,
    },
    permissionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    permissionTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    permissionTag: {
        backgroundColor: '#e9ecef',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    moreTag: {
        backgroundColor: '#007AFF',
    },
    permissionTagText: {
        fontSize: 11,
        color: '#495057',
        fontWeight: '500',
    },
    editPermissionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: '#f8f9fa',
        borderWidth: 1,
        borderColor: '#007AFF',
        gap: 8,
    },
    editPermissionText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
    },
    modalCloseButton: {
        padding: 4,
    },
    modalHeaderInfo: {
        flex: 1,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    permissionGroup: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    permissionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f8f9fa',
    },
    permissionInfo: {
        flex: 1,
        marginRight: 16,
    },
    permissionName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    permissionDesc: {
        fontSize: 12,
        color: '#666',
        lineHeight: 16,
    },
});
