/**
 * Tư vấn Nội thất AI
 * AI-powered interior design consultation
 * @author AI Assistant
 * @date 13/01/2026
 */

import VoiceInput, { VoiceOutput } from '@/components/ai/VoiceInput';
import { useColors } from '@/hooks/use-colors';
import {
    AIMessage,
    ConsultantContext,
    getConsultantConfig,
    sendConsultMessage
} from '@/services/aiConsultantService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

// ==================== TYPES ====================

interface RoomInfo {
  roomType: string;
  area: string;
  budget: string;
  style: string;
  features: string[];
}

// ==================== DATA ====================

const INTERIOR_STYLES = [
  { id: 'modern', name: 'Hiện đại', icon: '🏢', color: '#0D9488' },
  { id: 'classic', name: 'Cổ điển', icon: '🏛️', color: '#8B5A2B' },
  { id: 'minimalist', name: 'Tối giản', icon: '⬜', color: '#6B7280' },
  { id: 'scandinavian', name: 'Scandinavian', icon: '🌲', color: '#10B981' },
  { id: 'industrial', name: 'Industrial', icon: '🏭', color: '#374151' },
  { id: 'indochine', name: 'Indochine', icon: '🏮', color: '#DC2626' },
  { id: 'japanese', name: 'Nhật Bản', icon: '🎎', color: '#F59E0B' },
  { id: 'tropical', name: 'Nhiệt đới', icon: '🌴', color: '#059669' },
];

const ROOM_TYPES = [
  { id: 'living', name: 'Phòng khách', icon: '🛋️' },
  { id: 'bedroom', name: 'Phòng ngủ', icon: '🛏️' },
  { id: 'kitchen', name: 'Bếp', icon: '🍳' },
  { id: 'bathroom', name: 'Phòng tắm', icon: '🚿' },
  { id: 'dining', name: 'Phòng ăn', icon: '🍽️' },
  { id: 'office', name: 'Phòng làm việc', icon: '💼' },
  { id: 'kids', name: 'Phòng trẻ em', icon: '🧸' },
  { id: 'balcony', name: 'Ban công', icon: '🌿' },
];

const COLOR_PALETTES = [
  { id: 'neutral', name: 'Trung tính', colors: ['#F5F5F4', '#D6D3D1', '#78716C', '#44403C'] },
  { id: 'warm', name: 'Ấm áp', colors: ['#FEF3C7', '#FBBF24', '#D97706', '#92400E'] },
  { id: 'cool', name: 'Mát mẻ', colors: ['#E0F2FE', '#38BDF8', '#0D9488', '#075985'] },
  { id: 'earth', name: 'Đất', colors: ['#ECFCCB', '#84CC16', '#65A30D', '#3F6212'] },
  { id: 'luxury', name: 'Sang trọng', colors: ['#1E1E1E', '#4A3728', '#C49A6C', '#E5D5C5'] },
];

const FURNITURE_ITEMS = [
  { id: 'sofa', name: 'Sofa', icon: '🛋️' },
  { id: 'bed', name: 'Giường', icon: '🛏️' },
  { id: 'table', name: 'Bàn', icon: '🪑' },
  { id: 'cabinet', name: 'Tủ', icon: '🗄️' },
  { id: 'light', name: 'Đèn', icon: '💡' },
  { id: 'curtain', name: 'Rèm', icon: '🪟' },
];

// ==================== COMPONENTS ====================

const ChatMessage: React.FC<{
  message: AIMessage;
  colors: any;
}> = ({ message, colors }) => {
  const isUser = message.role === 'user';
  
  return (
    <View style={[
      styles.messageContainer,
      isUser ? styles.userMessage : styles.aiMessage,
    ]}>
      {!isUser && (
        <View style={[styles.aiAvatar, { backgroundColor: '#8B5A2B' }]}>
          <MaterialCommunityIcons name="sofa" size={18} color="#fff" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        isUser 
          ? { backgroundColor: '#8B5A2B' } 
          : { backgroundColor: colors.card },
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? '#fff' : colors.text },
        ]}>
          {message.content}
        </Text>
        <View style={styles.messageFooter}>
          <Text style={[
            styles.messageTime,
            { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textMuted },
          ]}>
            {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isUser && (
            <VoiceOutput 
              text={message.content} 
              size={18} 
              color={colors.textMuted}
              activeColor="#8B5A2B"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const StyleCard: React.FC<{
  style: typeof INTERIOR_STYLES[0];
  selected: boolean;
  onPress: () => void;
  colors: any;
}> = ({ style, selected, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.styleCard,
      { backgroundColor: colors.card },
      selected && { borderColor: style.color, borderWidth: 2 },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.styleIconBg, { backgroundColor: style.color + '20' }]}>
      <Text style={styles.styleCardIcon}>{style.icon}</Text>
    </View>
    <Text style={[styles.styleCardName, { color: colors.text }]}>{style.name}</Text>
    {selected && (
      <View style={[styles.checkmark, { backgroundColor: style.color }]}>
        <Ionicons name="checkmark" size={12} color="#fff" />
      </View>
    )}
  </TouchableOpacity>
);

const ColorPaletteCard: React.FC<{
  palette: typeof COLOR_PALETTES[0];
  onPress: () => void;
  colors: any;
}> = ({ palette, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.paletteCard, { backgroundColor: colors.card }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.paletteName, { color: colors.text }]}>{palette.name}</Text>
    <View style={styles.paletteColors}>
      {palette.colors.map((color, idx) => (
        <View key={idx} style={[styles.paletteColor, { backgroundColor: color }]} />
      ))}
    </View>
  </TouchableOpacity>
);

// ==================== MAIN SCREEN ====================

export default function InteriorDesignAIScreen() {
  const colors = useColors();
  const config = getConsultantConfig('interior_design');
  
  // State
  const [activeTab, setActiveTab] = useState<'chat' | 'styles' | 'room'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [roomInfo, setRoomInfo] = useState<RoomInfo>({
    roomType: '',
    area: '',
    budget: '',
    style: '',
    features: [],
  });
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Welcome message
    const welcomeMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: `🛋️ **Chào mừng bạn đến với Tư vấn Nội thất AI!**\n\nTôi là chuyên gia thiết kế nội thất AI, sẵn sàng giúp bạn:\n\n• Tư vấn phong cách nội thất\n• Gợi ý phối màu, chọn đồ\n• Tối ưu không gian phòng\n• Ước tính chi phí nội thất\n\nBạn đang cần tư vấn cho phòng nào?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);
  
  // Build context
  const buildContext = useCallback((): ConsultantContext => {
    const ctx: ConsultantContext = {};
    if (roomInfo.area) ctx.area = parseFloat(roomInfo.area);
    if (roomInfo.budget) ctx.budget = roomInfo.budget;
    if (roomInfo.style || selectedStyle) ctx.style = roomInfo.style || selectedStyle;
    if (roomInfo.roomType) ctx.projectType = roomInfo.roomType;
    return ctx;
  }, [roomInfo, selectedStyle]);
  
  // Send message
  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;
    
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      const context = buildContext();
      const response = await sendConsultMessage(messageText, 'interior_design', context);
      
      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Send message error:', error);
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [inputText, isLoading, buildContext]);
  
  // Handle quick question
  const handleQuickQuestion = useCallback((question: string) => {
    handleSendMessage(question);
    setActiveTab('chat');
  }, [handleSendMessage]);
  
  // Render tabs
  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chat' && { backgroundColor: '#8B5A2B' }]}
        onPress={() => setActiveTab('chat')}
      >
        <Ionicons 
          name="chatbubbles" 
          size={18} 
          color={activeTab === 'chat' ? '#fff' : colors.textMuted} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'chat' ? '#fff' : colors.textMuted }
        ]}>
          Chat
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'styles' && { backgroundColor: '#8B5A2B' }]}
        onPress={() => setActiveTab('styles')}
      >
        <Ionicons 
          name="color-palette" 
          size={18} 
          color={activeTab === 'styles' ? '#fff' : colors.textMuted} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'styles' ? '#fff' : colors.textMuted }
        ]}>
          Phong cách
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'room' && { backgroundColor: '#8B5A2B' }]}
        onPress={() => setActiveTab('room')}
      >
        <Ionicons 
          name="home" 
          size={18} 
          color={activeTab === 'room' ? '#fff' : colors.textMuted} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'room' ? '#fff' : colors.textMuted }
        ]}>
          Phòng
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render chat tab
  const renderChatTab = () => (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} colors={colors} />
        ))}
        
        {isLoading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="small" color="#8B5A2B" />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Đang trả lời...
            </Text>
          </View>
        )}
      </ScrollView>
      
      {messages.length <= 2 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={[styles.quickQuestionsTitle, { color: colors.textMuted }]}>
            💡 Câu hỏi gợi ý:
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickQuestionsScroll}
          >
            {config.quickQuestions.map((q, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.quickQuestionBtn, { borderColor: '#8B5A2B' }]}
                onPress={() => handleQuickQuestion(q)}
              >
                <Text style={[styles.quickQuestionText, { color: '#8B5A2B' }]} numberOfLines={2}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <VoiceInput 
          onTextReceived={(text) => handleSendMessage(text)}
          disabled={isLoading}
        />
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: colors.background, 
            color: colors.text,
            borderColor: colors.border,
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập câu hỏi về nội thất..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: inputText.trim() ? '#8B5A2B' : colors.border,
          }]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
  
  // Render styles tab
  const renderStylesTab = () => (
    <ScrollView 
      style={styles.stylesContainer}
      contentContainerStyle={styles.stylesContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🎨 Phong cách nội thất
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>
        Chọn phong cách yêu thích để được tư vấn
      </Text>
      
      <View style={styles.stylesGrid}>
        {INTERIOR_STYLES.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            selected={selectedStyle === style.id}
            onPress={() => setSelectedStyle(style.id)}
            colors={colors}
          />
        ))}
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        🎨 Bảng màu gợi ý
      </Text>
      
      <View style={styles.palettesContainer}>
        {COLOR_PALETTES.map((palette) => (
          <ColorPaletteCard
            key={palette.id}
            palette={palette}
            onPress={() => handleQuickQuestion(`Tư vấn phối màu theo bảng màu ${palette.name.toLowerCase()}`)}
            colors={colors}
          />
        ))}
      </View>
      
      {selectedStyle && (
        <TouchableOpacity
          style={[styles.consultButton, { backgroundColor: '#8B5A2B' }]}
          onPress={() => {
            const styleName = INTERIOR_STYLES.find(s => s.id === selectedStyle)?.name;
            handleQuickQuestion(`Tư vấn chi tiết về phong cách nội thất ${styleName}`);
          }}
        >
          <MaterialCommunityIcons name="robot" size={24} color="#fff" />
          <Text style={styles.consultButtonText}>
            Tư vấn phong cách {INTERIOR_STYLES.find(s => s.id === selectedStyle)?.name}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
  
  // Render room tab
  const renderRoomTab = () => (
    <ScrollView 
      style={styles.roomContainer}
      contentContainerStyle={styles.roomContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🏠 Chọn loại phòng
      </Text>
      
      <View style={styles.roomsGrid}>
        {ROOM_TYPES.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[
              styles.roomCard,
              { backgroundColor: colors.card },
              roomInfo.roomType === room.id && { borderColor: '#8B5A2B', borderWidth: 2 },
            ]}
            onPress={() => setRoomInfo(prev => ({ ...prev, roomType: room.id }))}
          >
            <Text style={styles.roomIcon}>{room.icon}</Text>
            <Text style={[styles.roomName, { color: colors.text }]}>{room.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={[styles.roomFormSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>
          📐 Thông tin phòng
        </Text>
        
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>Diện tích</Text>
            <TextInput
              style={[styles.formInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={roomInfo.area}
              onChangeText={(text) => setRoomInfo(prev => ({ ...prev, area: text }))}
              placeholder="VD: 25"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>Ngân sách</Text>
            <TextInput
              style={[styles.formInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={roomInfo.budget}
              onChangeText={(text) => setRoomInfo(prev => ({ ...prev, budget: text }))}
              placeholder="VD: 50 triệu"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 20 }]}>
        🛋️ Đồ nội thất quan tâm
      </Text>
      
      <View style={styles.furnitureGrid}>
        {FURNITURE_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.furnitureChip,
              { backgroundColor: colors.card },
              roomInfo.features.includes(item.id) && { backgroundColor: '#8B5A2B' },
            ]}
            onPress={() => {
              setRoomInfo(prev => ({
                ...prev,
                features: prev.features.includes(item.id)
                  ? prev.features.filter(f => f !== item.id)
                  : [...prev.features, item.id],
              }));
            }}
          >
            <Text style={styles.furnitureIcon}>{item.icon}</Text>
            <Text style={[
              styles.furnitureName,
              { color: roomInfo.features.includes(item.id) ? '#fff' : colors.text },
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.consultButton, { backgroundColor: '#8B5A2B', marginTop: 20 }]}
        onPress={() => {
          const parts = [];
          const roomName = ROOM_TYPES.find(r => r.id === roomInfo.roomType)?.name;
          if (roomName) parts.push(roomName);
          if (roomInfo.area) parts.push(`diện tích ${roomInfo.area}m²`);
          if (roomInfo.budget) parts.push(`ngân sách ${roomInfo.budget}`);
          
          const furnitureNames = roomInfo.features
            .map(f => FURNITURE_ITEMS.find(item => item.id === f)?.name)
            .filter(Boolean);
          if (furnitureNames.length) parts.push(`quan tâm: ${furnitureNames.join(', ')}`);
          
          const question = parts.length > 0
            ? `Tư vấn thiết kế nội thất ${parts.join(', ')}`
            : 'Tư vấn thiết kế nội thất cho tôi';
          
          handleQuickQuestion(question);
        }}
      >
        <MaterialCommunityIcons name="robot" size={24} color="#fff" />
        <Text style={styles.consultButtonText}>Tư vấn theo thông tin</Text>
      </TouchableOpacity>
      
      {/* Category questions */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        ❓ Câu hỏi theo chủ đề
      </Text>
      
      {config.categories.map((cat) => (
        <View key={cat.id} style={[styles.categorySection, { backgroundColor: colors.card }]}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
          </View>
          
          {cat.questions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryQuestion}
              onPress={() => handleQuickQuestion(q)}
            >
              <Ionicons name="chatbubble-outline" size={16} color="#8B5A2B" />
              <Text style={[styles.categoryQuestionText, { color: colors.text }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  );
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tư vấn Nội thất AI',
          headerShown: true,
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <LinearGradient
            colors={['#8B5A2B', '#6B4423']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerIcon}>{config.icon}</Text>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{config.title}</Text>
                <Text style={styles.headerSubtitle}>{config.description}</Text>
              </View>
            </View>
          </LinearGradient>
          
          {renderTabs()}
          
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'styles' && renderStylesTab()}
          {activeTab === 'room' && renderRoomTab()}
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 80,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiMessage: {
    alignSelf: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 8,
  },
  messageTime: {
    fontSize: 10,
  },
  
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },
  
  // Quick questions
  quickQuestionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  quickQuestionsTitle: {
    fontSize: 13,
    marginBottom: 8,
  },
  quickQuestionsScroll: {
    gap: 8,
  },
  quickQuestionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 200,
  },
  quickQuestionText: {
    fontSize: 13,
  },
  
  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Styles tab
  stylesContainer: {
    flex: 1,
  },
  stylesContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  styleCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
  },
  styleIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  styleCardIcon: {
    fontSize: 24,
  },
  styleCardName: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Palettes
  palettesContainer: {
    gap: 8,
  },
  paletteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: '500',
    width: 80,
  },
  paletteColors: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  paletteColor: {
    flex: 1,
    height: 32,
    borderRadius: 4,
  },
  
  // Room tab
  roomContainer: {
    flex: 1,
  },
  roomContent: {
    padding: 16,
    paddingBottom: 40,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  roomCard: {
    width: (width - 40) / 4,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  roomIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roomName: {
    fontSize: 11,
    textAlign: 'center',
  },
  
  // Form
  roomFormSection: {
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  formLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  formInput: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  
  // Furniture
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  furnitureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  furnitureIcon: {
    fontSize: 16,
  },
  furnitureName: {
    fontSize: 13,
  },
  
  // Consult button
  consultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  consultButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Category section
  categorySection: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
  },
  categoryQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  categoryQuestionText: {
    flex: 1,
    fontSize: 13,
  },
});
