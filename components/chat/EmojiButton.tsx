import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const EMOJI_CATEGORIES = {
  smileys: {
    title: 'Mặt cười',
    icon: 'happy-outline',
    emojis: [
      '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂',
      '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋',
      '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳',
      '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖',
      '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯',
    ],
  },
  gestures: {
    title: 'Cử chỉ',
    icon: 'hand-left-outline',
    emojis: [
      '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
      '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃',
    ],
  },
  hearts: {
    title: 'Trái tim',
    icon: 'heart-outline',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
      '💌', '💋', '💏', '👩‍❤️‍👨', '👨‍❤️‍👨', '👩‍❤️‍👩', '💑', '👨‍❤️‍💋‍👨', '👩‍❤️‍💋‍👩',
    ],
  },
  objects: {
    title: 'Đồ vật',
    icon: 'gift-outline',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⭐', '🌟',
      '💫', '✨', '🔥', '💥', '💯', '✅', '❌', '❓', '❗', '⚠️',
      '🚫', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪',
      '📱', '💻', '⌨️', '🖥', '📷', '📸', '📹', '🎥', '📞', '☎️',
    ],
  },
  flags: {
    title: 'Cờ',
    icon: 'flag-outline',
    emojis: [
      '🇻🇳', '🇺🇸', '🇬🇧', '🇫🇷', '🇩🇪', '🇮🇹', '🇪🇸', '🇷🇺', '🇨🇳', '🇯🇵',
      '🇰🇷', '🇮🇳', '🇧🇷', '🇦🇺', '🇨🇦', '🇲🇽', '🇦🇷', '🇨🇱', '🇨🇴', '🇵🇪',
      '🏴', '🏳️', '🏴‍☠️', '🏳️‍🌈', '🏁', '🚩', '🏳️‍⚧️',
    ],
  },
  symbols: {
    title: 'Ký hiệu',
    icon: 'shapes-outline',
    emojis: [
      '♻️', '⚜️', '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '✖️',
      '❌', '❎', '➕', '➖', '➗', '➰', '➿', '〽️', '✳️', '✴️',
      '❇️', '‼️', '⁉️', '❓', '❔', '❕', '❗', '〰️', '©️', '®️',
      '™️', '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣',
    ],
  },
};

type EmojiCategory = keyof typeof EMOJI_CATEGORIES;

interface EmojiButtonProps {
  onSelect: (emoji: string) => void;
}

export function EmojiButton({ onSelect }: EmojiButtonProps) {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const background = useThemeColor({}, 'background');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>('smileys');

  const handleSelectEmoji = (emoji: string) => {
    onSelect(emoji);
    // Don't close modal, allow multiple selections
  };

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)}>
        <Ionicons name="happy-outline" size={24} color={primary} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.emojiContainer,
              { backgroundColor: surface, borderColor: border },
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: border }]}>
              <Text style={[styles.headerTitle, { color: text }]}>
                Chọn emoji
              </Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={textMuted} />
              </Pressable>
            </View>

            {/* Category tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryTabs}
              contentContainerStyle={styles.categoryTabsContent}
            >
              {(Object.keys(EMOJI_CATEGORIES) as EmojiCategory[]).map((cat) => {
                const category = EMOJI_CATEGORIES[cat];
                const isActive = selectedCategory === cat;
                
                return (
                  <Pressable
                    key={cat}
                    style={[
                      styles.categoryTab,
                      {
                        backgroundColor: isActive ? primary + '15' : 'transparent',
                        borderColor: isActive ? primary : border,
                      },
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={20}
                      color={isActive ? primary : textMuted}
                    />
                    <Text
                      style={[
                        styles.categoryTabText,
                        { color: isActive ? primary : textMuted },
                      ]}
                    >
                      {category.title}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Emoji grid */}
            <ScrollView
              style={styles.emojiScroll}
              contentContainerStyle={styles.emojiGrid}
              showsVerticalScrollIndicator={false}
            >
              {EMOJI_CATEGORIES[selectedCategory].emojis.map((emoji, index) => (
                <Pressable
                  key={`${emoji}-${index}`}
                  style={styles.emojiButton}
                  onPress={() => handleSelectEmoji(emoji)}
                >
                  <Text style={styles.emoji}>{emoji}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Footer hint */}
            <View style={[styles.footer, { borderTopColor: border }]}>
              <Text style={[styles.footerText, { color: textMuted }]}>
                Nhấn emoji để thêm vào tin nhắn
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  emojiContainer: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryTabs: {
    maxHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  categoryTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emojiScroll: {
    flex: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  emojiButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emoji: {
    fontSize: 28,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
});
