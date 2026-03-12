/**
 * Project Notes Screen - Perfex CRM Style
 * =========================================
 * 
 * Ghi chú dự án:
 * - Quick notes
 * - Color coding
 * - Pin important notes
 * - Search & filter
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import perfexService from '@/services/perfexService';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const NOTE_COLORS = [
  '#fef3c7', // Yellow
  '#CCFBF1', // Blue
  '#dcfce7', // Green
  '#fce7f3', // Pink
  '#e9d5ff', // Purple
  '#fed7aa', // Orange
];

export default function NotesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  useEffect(() => {
    loadNotes();
  }, [projectId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      if (projectId) {
        const response = await perfexService.getProjectNotes(projectId);
        const data: Note[] = (response || []).map((n: any) => ({
          id: n.id || String(Math.random()),
          title: n.name || n.title || 'Untitled',
          content: n.description || n.content || '',
          color: n.color || NOTE_COLORS[0],
          isPinned: n.is_pinned || n.isPinned || false,
          createdAt: n.dateadded || n.createdAt || new Date().toISOString(),
          updatedAt: n.date_updated || n.updatedAt || new Date().toISOString(),
        }));
        setNotes(data);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      // Mock data với dữ liệu thực từ Perfex CRM
      // Projects: Nhà Anh Khương Q9 (15 tỷ), Biệt Thự 3 Tầng Anh Tiến Q7 (10 tỷ)
      setNotes([
        {
          id: '1',
          title: 'Yêu cầu Anh Khương - Nhà Q9',
          content: 'Anh Khương muốn phòng khách rộng, view ra sân vườn. Cần có phòng thờ riêng biệt ở tầng 2. Garage đủ 2 xe.',
          color: '#fef3c7',
          isPinned: true,
          createdAt: '2024-12-30',
          updatedAt: '2024-12-30',
        },
        {
          id: '2',
          title: 'Vật liệu Biệt Thự Anh Tiến',
          content: 'Gạch: Granite cao cấp 80x80\nSơn: Dulux Weathershield\nCửa: Nhôm Xingfa\nMái: Ngói Hạ Long',
          color: '#CCFBF1',
          isPinned: false,
          createdAt: '2024-12-29',
          updatedAt: '2024-12-29',
        },
        {
          id: '3',
          title: 'Ghi chú họp 30/12',
          content: 'Đã thống nhất timeline với 2 dự án:\n- Q9: Hoàn thành thiết kế T1/2025\n- Q7: Khởi công T1/2025',
          color: '#dcfce7',
          isPinned: false,
          createdAt: '2024-12-30',
          updatedAt: '2024-12-30',
        },
        {
          id: '4',
          title: 'Phong thủy nhà Anh Khương',
          content: '- Hướng nhà: Đông Nam\n- Cửa chính: Né hướng Tây\n- Phòng ngủ master: Tầng 2, góc Đông',
          color: '#e9d5ff',
          isPinned: true,
          createdAt: '2024-12-28',
          updatedAt: '2024-12-30',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotes();
    setRefreshing(false);
  };

  const openCreateModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteColor(NOTE_COLORS[0]);
    setShowModal(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!noteTitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }

    if (editingNote) {
      setNotes(notes.map((n) =>
        n.id === editingNote.id
          ? { ...n, title: noteTitle, content: noteContent, color: noteColor, updatedAt: new Date().toISOString() }
          : n
      ));
    } else {
      const newNote: Note = {
        id: String(Date.now()),
        title: noteTitle,
        content: noteContent,
        color: noteColor,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
    }

    setShowModal(false);
  };

  const handleDelete = (note: Note) => {
    Alert.alert(
      'Xóa ghi chú',
      `Bạn có chắc muốn xóa "${note.title}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => setNotes(notes.filter((n) => n.id !== note.id)),
        },
      ]
    );
  };

  const togglePin = (note: Note) => {
    setNotes(notes.map((n) =>
      n.id === note.id ? { ...n, isPinned: !n.isPinned } : n
    ));
  };

  const filteredNotes = notes
    .filter((n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteCard, { backgroundColor: item.color }]}
      onPress={() => openEditModal(item)}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity onPress={() => togglePin(item)}>
          <Ionicons
            name={item.isPinned ? 'pin' : 'pin-outline'}
            size={16}
            color={item.isPinned ? '#f59e0b' : '#666'}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteContent} numberOfLines={4}>{item.content}</Text>
      <Text style={styles.noteDate}>
        {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Ghi chú</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primaryColor }]}
          onPress={openCreateModal}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: cardBg, borderColor }]}>
        <Ionicons name="search-outline" size={18} color="#6b7280" />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Tìm kiếm ghi chú..."
          placeholderTextColor="#6b7280"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Notes Grid */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.loadingText, { color: textColor }]}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item) => item.id}
          renderItem={renderNote}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: textColor }]}>Chưa có ghi chú</Text>
              <Text style={[styles.emptyText, { color: textColor }]}>
                Tạo ghi chú đầu tiên cho dự án
              </Text>
            </View>
          }
        />
      )}

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>
                {editingNote ? 'Sửa ghi chú' : 'Tạo ghi chú'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Tiêu đề"
              placeholderTextColor="#6b7280"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <TextInput
              style={[styles.textarea, { color: textColor, borderColor }]}
              placeholder="Nội dung ghi chú..."
              placeholderTextColor="#6b7280"
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <Text style={[styles.colorLabel, { color: textColor }]}>Màu sắc</Text>
            <View style={styles.colorPicker}>
              {NOTE_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    noteColor === color && styles.colorSelected,
                  ]}
                  onPress={() => setNoteColor(color)}
                >
                  {noteColor === color && (
                    <Ionicons name="checkmark" size={16} color="#333" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[styles.cancelText, { color: textColor }]}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: primaryColor }]}
                onPress={handleSave}
              >
                <Text style={styles.saveText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  noteCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    minHeight: 140,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  noteContent: {
    fontSize: 12,
    color: '#555',
    lineHeight: 18,
    flex: 1,
  },
  noteDate: {
    fontSize: 10,
    color: '#777',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 12,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 120,
  },
  colorLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorSelected: {
    borderWidth: 2,
    borderColor: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
