import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    type TextInputProps,
} from 'react-native';

export interface MentionUser {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
}

interface MentionInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  members: MentionUser[];
  placeholder?: string;
  maxLength?: number;
}

export function MentionInput({
  value,
  onChangeText,
  members,
  placeholder = 'Nhập tin nhắn... (@mention để tag)',
  maxLength = 1000,
  ...textInputProps
}: MentionInputProps) {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    detectMention(value, cursorPosition);
  }, [value, cursorPosition, members]);

  const detectMention = (text: string, position: number) => {
    // Find the word at cursor position
    const beforeCursor = text.slice(0, position);
    const words = beforeCursor.split(/\s/);
    const currentWord = words[words.length - 1];

    if (currentWord.startsWith('@')) {
      const query = currentWord.slice(1).toLowerCase();
      setMentionQuery(query);

      // Filter members based on query
      const filtered = members.filter((member) =>
        member.name.toLowerCase().includes(query)
      );

      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSelectMention = (user: MentionUser) => {
    const beforeCursor = value.slice(0, cursorPosition);
    const afterCursor = value.slice(cursorPosition);

    // Find the @ position
    const words = beforeCursor.split(/\s/);
    const lastWord = words[words.length - 1];
    const mentionStartPos = beforeCursor.lastIndexOf(lastWord);

    // Replace @query with @username
    const newText =
      value.slice(0, mentionStartPos) +
      `@${user.name} ` +
      afterCursor;

    onChangeText(newText);
    setShowSuggestions(false);

    // Set cursor position after the mention
    const newCursorPos = mentionStartPos + user.name.length + 2; // +2 for @ and space
    setCursorPosition(newCursorPos);

    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleChangeText = (text: string) => {
    onChangeText(text);
  };

  const handleSelectionChange = (event: any) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  const renderSuggestionItem = ({ item }: { item: MentionUser }) => (
    <Pressable
      style={[styles.suggestionItem, { borderBottomColor: border }]}
      onPress={() => handleSelectMention(item)}
    >
      <View style={[styles.avatarPlaceholder, { backgroundColor: primary + '20' }]}>
        <Text style={[styles.avatarText, { color: primary }]}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.suggestionInfo}>
        <Text style={[styles.suggestionName, { color: text }]}>{item.name}</Text>
        {item.role && (
          <Text style={[styles.suggestionRole, { color: textMuted }]}>{item.role}</Text>
        )}
      </View>
      <Ionicons name="arrow-forward" size={16} color={textMuted} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChangeText}
        onSelectionChange={handleSelectionChange}
        placeholder={placeholder}
        placeholderTextColor={textMuted}
        multiline
        maxLength={maxLength}
        style={[
          styles.input,
          {
            color: text,
            borderColor: border,
          },
        ]}
        {...textInputProps}
      />

      {showSuggestions && suggestions.length > 0 && (
        <View
          style={[
            styles.suggestionsContainer,
            {
              backgroundColor: surface,
              borderColor: border,
            },
          ]}
        >
          <View style={styles.suggestionsHeader}>
            <Text style={[styles.suggestionsTitle, { color: textMuted }]}>
              Gợi ý mention
            </Text>
            <Pressable onPress={() => setShowSuggestions(false)}>
              <Ionicons name="close" size={20} color={textMuted} />
            </Pressable>
          </View>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={renderSuggestionItem}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    maxHeight: 250,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  suggestionRole: {
    fontSize: 13,
  },
});
