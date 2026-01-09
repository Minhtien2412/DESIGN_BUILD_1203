import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const communityPosts = [
  {
    id: '1',
    author: { name: 'Nguyễn Văn Hùng', avatar: 'https://ui-avatars.com/api/?name=Hung', isVerified: true },
    content: 'Vừa hoàn thành dự án cải tạo phòng khách. Cám ơn đội ngũ thợ tuyệt vời! 🎉',
    images: ['https://via.placeholder.com/400x300', 'https://via.placeholder.com/400x300'],
    likes: 234,
    comments: 45,
    time: '2 giờ trước',
    category: 'showcase',
  },
  {
    id: '2',
    author: { name: 'Trần Thị Mai', avatar: 'https://ui-avatars.com/api/?name=Mai', isVerified: false },
    content: 'Mọi người cho mình hỏi, loại gạch nào phù hợp cho phòng tắm nhỏ 4m2 ạ? Budget khoảng 500k/m2.',
    images: [],
    likes: 56,
    comments: 32,
    time: '5 giờ trước',
    category: 'question',
  },
  {
    id: '3',
    author: { name: 'Công ty XD An Phát', avatar: 'https://ui-avatars.com/api/?name=AP', isVerified: true },
    content: '🔥 Chia sẻ kinh nghiệm chống thấm cho nhà mới xây. Chi tiết trong bài viết.',
    images: ['https://via.placeholder.com/400x300'],
    likes: 567,
    comments: 89,
    time: '1 ngày trước',
    category: 'tips',
  },
];

const categories = [
  { id: 'all', label: 'Tất cả', icon: 'apps-outline' },
  { id: 'showcase', label: 'Khoe nhà', icon: 'home-outline' },
  { id: 'question', label: 'Hỏi đáp', icon: 'help-circle-outline' },
  { id: 'tips', label: 'Kinh nghiệm', icon: 'bulb-outline' },
  { id: 'review', label: 'Đánh giá', icon: 'star-outline' },
];

const topContributors = [
  { id: '1', name: 'Hùng Nguyễn', avatar: 'https://ui-avatars.com/api/?name=Hung', posts: 45 },
  { id: '2', name: 'Mai Trần', avatar: 'https://ui-avatars.com/api/?name=Mai', posts: 38 },
  { id: '3', name: 'An Phát', avatar: 'https://ui-avatars.com/api/?name=AP', posts: 32 },
];

export default function CommunityScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'card');
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const renderPost = ({ item }: { item: typeof communityPosts[0] }) => (
    <View style={[styles.postCard, { backgroundColor: cardBg }]}>
      {/* Author Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.author.avatar }} style={styles.authorAvatar} />
        <View style={styles.authorInfo}>
          <View style={styles.authorNameRow}>
            <Text style={[styles.authorName, { color: textColor }]}>{item.author.name}</Text>
            {item.author.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#2196F3" />
            )}
          </View>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.postContent, { color: textColor }]}>{item.content}</Text>

      {/* Images */}
      {item.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
          {item.images.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.postImage} />
          ))}
        </ScrollView>
      )}

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="share-social-outline" size={20} color="#666" />
          <Text style={styles.actionText}>Chia sẻ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="bookmark-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Cộng đồng', headerShown: true }} />
      
      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={[styles.categoriesContainer, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              activeCategory === cat.id && styles.categoryBtnActive,
            ]}
            onPress={() => setActiveCategory(cat.id)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={16} 
              color={activeCategory === cat.id ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === cat.id && styles.categoryTextActive,
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={communityPosts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Create Post */}
            <TouchableOpacity style={[styles.createPostBtn, { backgroundColor: cardBg }]}>
              <View style={styles.createPostAvatar}>
                <Ionicons name="person-outline" size={20} color="#666" />
              </View>
              <Text style={styles.createPostPlaceholder}>Chia sẻ dự án, đặt câu hỏi...</Text>
              <View style={styles.createPostActions}>
                <Ionicons name="image-outline" size={20} color="#4CAF50" />
                <Ionicons name="videocam-outline" size={20} color="#F44336" />
              </View>
            </TouchableOpacity>

            {/* Top Contributors */}
            <View style={[styles.contributorsCard, { backgroundColor: cardBg }]}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>🏆 Top đóng góp</Text>
              <View style={styles.contributorsRow}>
                {topContributors.map((user, index) => (
                  <View key={user.id} style={styles.contributorItem}>
                    <View style={styles.contributorRank}>
                      <Text style={styles.rankText}>{index + 1}</Text>
                    </View>
                    <Image source={{ uri: user.avatar }} style={styles.contributorAvatar} />
                    <Text style={[styles.contributorName, { color: textColor }]} numberOfLines={1}>
                      {user.name}
                    </Text>
                    <Text style={styles.contributorPosts}>{user.posts} bài</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  categoriesContainer: { maxHeight: 54 },
  categoriesContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    gap: 6,
  },
  categoryBtnActive: { backgroundColor: '#FF6B35' },
  categoryText: { color: '#666', fontSize: 13 },
  categoryTextActive: { color: '#fff' },
  listContent: { padding: 16 },
  createPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostPlaceholder: { flex: 1, marginLeft: 12, color: '#999' },
  createPostActions: { flexDirection: 'row', gap: 12 },
  contributorsCard: { padding: 16, borderRadius: 12, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  contributorsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  contributorItem: { alignItems: 'center', width: '30%', position: 'relative' },
  contributorRank: {
    position: 'absolute',
    top: 0,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFB800',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  contributorAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f0f0f0' },
  contributorName: { fontSize: 12, fontWeight: '500', marginTop: 6 },
  contributorPosts: { color: '#666', fontSize: 11 },
  postCard: { borderRadius: 12, marginBottom: 16, padding: 16 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  authorAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#f0f0f0' },
  authorInfo: { flex: 1, marginLeft: 12 },
  authorNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorName: { fontSize: 14, fontWeight: '600' },
  postTime: { color: '#999', fontSize: 12, marginTop: 2 },
  postContent: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  imagesContainer: { marginHorizontal: -16, paddingHorizontal: 16, marginBottom: 12 },
  postImage: { width: 200, height: 150, borderRadius: 8, marginRight: 8, backgroundColor: '#f0f0f0' },
  postActions: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24, gap: 6 },
  actionText: { color: '#666', fontSize: 13 },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
