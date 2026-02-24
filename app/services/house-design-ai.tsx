/**
 * Tư vấn Thiết kế Nhà AI
 * AI-powered house design consultation
 * @author AI Assistant
 * @date 13/01/2026
 */

import VoiceInput, { VoiceOutput } from '@/components/ai/VoiceInput';
import { useColors } from '@/hooks/use-colors';
import {
    AIMessage,
    ConsultantCategory,
    ConsultantContext,
    getConsultantConfig,
    sendConsultMessage,
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
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// ==================== TYPES ====================

interface ProjectInfo {
  landArea: string;
  floors: string;
  bedrooms: string;
  budget: string;
  style: string;
  location: string;
}

// ==================== DATA ====================

const DESIGN_STYLES = [
  { id: 'modern', name: 'Hiện đại', icon: '🏢' },
  { id: 'neoclassic', name: 'Tân cổ điển', icon: '🏛️' },
  { id: 'minimalist', name: 'Tối giản', icon: '⬜' },
  { id: 'indochine', name: 'Indochine', icon: '🏮' },
  { id: 'tropical', name: 'Nhiệt đới', icon: '🌴' },
  { id: 'japanese', name: 'Nhật Bản', icon: '🎎' },
];

const BUDGET_RANGES = [
  { id: 'low', name: 'Dưới 1 tỷ', range: '< 1 tỷ' },
  { id: 'medium', name: '1-2 tỷ', range: '1-2 tỷ' },
  { id: 'high', name: '2-5 tỷ', range: '2-5 tỷ' },
  { id: 'premium', name: 'Trên 5 tỷ', range: '> 5 tỷ' },
];

const PROJECT_TYPES = [
  { id: 'townhouse', name: 'Nhà phố', icon: '🏠' },
  { id: 'villa', name: 'Biệt thự', icon: '🏡' },
  { id: 'apartment', name: 'Căn hộ', icon: '🏢' },
  { id: 'garden_house', name: 'Nhà vườn', icon: '🌳' },
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
        <View style={[styles.aiAvatar, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        isUser 
          ? { backgroundColor: colors.primary } 
          : { backgroundColor: colors.card },
      ]}>        <Text style={[
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
              activeColor={colors.primary}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const QuickQuestionButton: React.FC<{
  question: string;
  onPress: () => void;
  colors: any;
}> = ({ question, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.quickQuestionBtn, { borderColor: colors.primary }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.quickQuestionText, { color: colors.primary }]} numberOfLines={2}>
      {question}
    </Text>
  </TouchableOpacity>
);

const CategoryCard: React.FC<{
  category: ConsultantCategory;
  onPress: () => void;
  colors: any;
}> = ({ category, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.categoryCard, { backgroundColor: colors.card }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.categoryIcon}>{category.icon}</Text>
    <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
    <Text style={[styles.categoryCount, { color: colors.textMuted }]}>
      {category.questions.length} câu hỏi
    </Text>
  </TouchableOpacity>
);

const ProjectInfoForm: React.FC<{
  projectInfo: ProjectInfo;
  onUpdate: (info: ProjectInfo) => void;
  colors: any;
}> = ({ projectInfo, onUpdate, colors }) => {
  return (
    <View style={[styles.formSection, { backgroundColor: colors.card }]}>
      <Text style={[styles.formTitle, { color: colors.text }]}>
        📋 Thông tin dự án (tùy chọn)
      </Text>
      
      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textMuted }]}>Diện tích đất</Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={projectInfo.landArea}
            onChangeText={(text) => onUpdate({ ...projectInfo, landArea: text })}
            placeholder="VD: 100"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          <Text style={[styles.formUnit, { color: colors.textMuted }]}>m²</Text>
        </View>
        
        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textMuted }]}>Số tầng</Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={projectInfo.floors}
            onChangeText={(text) => onUpdate({ ...projectInfo, floors: text })}
            placeholder="VD: 3"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          <Text style={[styles.formUnit, { color: colors.textMuted }]}>tầng</Text>
        </View>
      </View>
      
      <View style={styles.formRow}>
        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textMuted }]}>Phòng ngủ</Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={projectInfo.bedrooms}
            onChangeText={(text) => onUpdate({ ...projectInfo, bedrooms: text })}
            placeholder="VD: 4"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
          <Text style={[styles.formUnit, { color: colors.textMuted }]}>phòng</Text>
        </View>
        
        <View style={styles.formField}>
          <Text style={[styles.formLabel, { color: colors.textMuted }]}>Vị trí</Text>
          <TextInput
            style={[styles.formInput, { 
              backgroundColor: colors.background, 
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={projectInfo.location}
            onChangeText={(text) => onUpdate({ ...projectInfo, location: text })}
            placeholder="VD: Hà Nội"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
    </View>
  );
};

// ==================== MAIN SCREEN ====================

export default function HouseDesignAIScreen() {
  const colors = useColors();
  const config = getConsultantConfig('house_design');
  
  // State
  const [activeTab, setActiveTab] = useState<'chat' | 'categories' | 'info'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ConsultantCategory | null>(null);
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>({
    landArea: '',
    floors: '',
    bedrooms: '',
    budget: '',
    style: '',
    location: '',
  });
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  
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
      content: `🏠 **Chào mừng bạn đến với Tư vấn Thiết kế Nhà AI!**\n\nTôi là trợ lý AI chuyên về thiết kế kiến trúc nhà ở. Tôi có thể giúp bạn:\n\n• Tư vấn phong cách thiết kế\n• Bố trí mặt bằng hợp lý\n• Ước tính chi phí thiết kế\n• Giải đáp thắc mắc về kiến trúc\n\nHãy cho tôi biết bạn cần hỗ trợ gì nhé!`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);
  
  // Build context from project info
  const buildContext = useCallback((): ConsultantContext => {
    const ctx: ConsultantContext = {};
    if (projectInfo.landArea) ctx.area = parseFloat(projectInfo.landArea);
    if (projectInfo.budget) ctx.budget = projectInfo.budget;
    if (projectInfo.location) ctx.location = projectInfo.location;
    if (projectInfo.style) ctx.style = projectInfo.style;
    if (projectInfo.floors || projectInfo.bedrooms) {
      ctx.requirements = [];
      if (projectInfo.floors) ctx.requirements.push(`${projectInfo.floors} tầng`);
      if (projectInfo.bedrooms) ctx.requirements.push(`${projectInfo.bedrooms} phòng ngủ`);
    }
    return ctx;
  }, [projectInfo]);
  
  // Send message
  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText || isLoading) return;
    
    // Add user message
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    try {
      const context = buildContext();
      const response = await sendConsultMessage(messageText, 'house_design', context);
      
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
  
  // Handle category select
  const handleCategorySelect = useCallback((category: ConsultantCategory) => {
    setSelectedCategory(category);
  }, []);
  
  // Render tabs
  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chat' && { backgroundColor: colors.primary }]}
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
        style={[styles.tab, activeTab === 'categories' && { backgroundColor: colors.primary }]}
        onPress={() => setActiveTab('categories')}
      >
        <Ionicons 
          name="grid" 
          size={18} 
          color={activeTab === 'categories' ? '#fff' : colors.textMuted} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'categories' ? '#fff' : colors.textMuted }
        ]}>
          Chủ đề
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'info' && { backgroundColor: colors.primary }]}
        onPress={() => setActiveTab('info')}
      >
        <Ionicons 
          name="document-text" 
          size={18} 
          color={activeTab === 'info' ? '#fff' : colors.textMuted} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'info' ? '#fff' : colors.textMuted }
        ]}>
          Dự án
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render chat tab
  const renderChatTab = () => (
    <>
      {/* Messages */}
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
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textMuted }]}>
              Đang trả lời...
            </Text>
          </View>
        )}
      </ScrollView>
      
      {/* Quick questions */}
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
              <QuickQuestionButton
                key={idx}
                question={q}
                onPress={() => handleQuickQuestion(q)}
                colors={colors}
              />
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
        <VoiceInput 
          onTextReceived={(text) => handleSendMessage(text)}
          disabled={isLoading}
        />
        <TextInput
          ref={inputRef}
          style={[styles.textInput, { 
            backgroundColor: colors.background, 
            color: colors.text,
            borderColor: colors.border,
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nhập câu hỏi của bạn..."
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: inputText.trim() ? colors.primary : colors.border,
          }]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
  
  // Render categories tab
  const renderCategoriesTab = () => (
    <ScrollView 
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
      showsVerticalScrollIndicator={false}
    >
      {selectedCategory ? (
        // Category questions
        <View>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.primary }]}>Quay lại</Text>
          </TouchableOpacity>
          
          <View style={[styles.categoryHeader, { backgroundColor: colors.card }]}>
            <Text style={styles.categoryHeaderIcon}>{selectedCategory.icon}</Text>
            <Text style={[styles.categoryHeaderTitle, { color: colors.text }]}>
              {selectedCategory.name}
            </Text>
          </View>
          
          {selectedCategory.questions.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.questionItem, { backgroundColor: colors.card }]}
              onPress={() => handleQuickQuestion(q)}
            >
              <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
              <Text style={[styles.questionText, { color: colors.text }]}>{q}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Categories grid
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            📂 Chủ đề tư vấn
          </Text>
          
          <View style={styles.categoriesGrid}>
            {config.categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onPress={() => handleCategorySelect(cat)}
                colors={colors}
              />
            ))}
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            🏠 Loại công trình
          </Text>
          
          <View style={styles.typesRow}>
            {PROJECT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeChip, { backgroundColor: colors.card }]}
                onPress={() => handleQuickQuestion(`Tư vấn thiết kế ${type.name.toLowerCase()}`)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeName, { color: colors.text }]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
            🎨 Phong cách thiết kế
          </Text>
          
          <View style={styles.stylesGrid}>
            {DESIGN_STYLES.map((style) => (
              <TouchableOpacity
                key={style.id}
                style={[
                  styles.styleChip,
                  { backgroundColor: colors.card },
                  projectInfo.style === style.id && { borderColor: colors.primary, borderWidth: 2 },
                ]}
                onPress={() => {
                  setProjectInfo(prev => ({ ...prev, style: style.id }));
                  handleQuickQuestion(`Tư vấn thiết kế phong cách ${style.name}`);
                }}
              >
                <Text style={styles.styleIcon}>{style.icon}</Text>
                <Text style={[styles.styleName, { color: colors.text }]}>{style.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
  
  // Render info tab
  const renderInfoTab = () => (
    <ScrollView 
      style={styles.infoContainer}
      contentContainerStyle={styles.infoContent}
      showsVerticalScrollIndicator={false}
    >
      <ProjectInfoForm
        projectInfo={projectInfo}
        onUpdate={setProjectInfo}
        colors={colors}
      />
      
      <View style={[styles.formSection, { backgroundColor: colors.card, marginTop: 16 }]}>
        <Text style={[styles.formTitle, { color: colors.text }]}>
          💰 Ngân sách
        </Text>
        
        <View style={styles.budgetGrid}>
          {BUDGET_RANGES.map((budget) => (
            <TouchableOpacity
              key={budget.id}
              style={[
                styles.budgetChip,
                { backgroundColor: colors.background },
                projectInfo.budget === budget.id && { 
                  backgroundColor: colors.primary,
                },
              ]}
              onPress={() => setProjectInfo(prev => ({ ...prev, budget: budget.id }))}
            >
              <Text style={[
                styles.budgetText,
                { color: projectInfo.budget === budget.id ? '#fff' : colors.text },
              ]}>
                {budget.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <TouchableOpacity
        style={[styles.consultButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          const parts = [];
          if (projectInfo.landArea) parts.push(`diện tích ${projectInfo.landArea}m²`);
          if (projectInfo.floors) parts.push(`${projectInfo.floors} tầng`);
          if (projectInfo.bedrooms) parts.push(`${projectInfo.bedrooms} phòng ngủ`);
          
          const budgetLabel = BUDGET_RANGES.find(b => b.id === projectInfo.budget)?.range;
          if (budgetLabel) parts.push(`ngân sách ${budgetLabel}`);
          
          const styleLabel = DESIGN_STYLES.find(s => s.id === projectInfo.style)?.name;
          if (styleLabel) parts.push(`phong cách ${styleLabel}`);
          
          if (projectInfo.location) parts.push(`tại ${projectInfo.location}`);
          
          const question = parts.length > 0
            ? `Tư vấn thiết kế nhà với ${parts.join(', ')}`
            : 'Tư vấn thiết kế nhà cho tôi';
          
          handleQuickQuestion(question);
        }}
      >
        <MaterialCommunityIcons name="robot" size={24} color="#fff" />
        <Text style={styles.consultButtonText}>Tư vấn theo thông tin</Text>
      </TouchableOpacity>
      
      <View style={[styles.tipsSection, { backgroundColor: colors.card }]}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>💡 Mẹo tư vấn</Text>
        <Text style={[styles.tipsText, { color: colors.textMuted }]}>
          • Cung cấp thông tin dự án để nhận tư vấn chính xác hơn{'\n'}
          • Hỏi cụ thể về từng vấn đề (diện tích, chi phí, phong cách...){'\n'}
          • Có thể đặt câu hỏi tiếp nối để làm rõ thông tin
        </Text>
      </View>
    </ScrollView>
  );
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tư vấn Thiết kế Nhà AI',
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
            colors={['#0D9488', '#0F766E']}
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
          
          {/* Tabs */}
          {renderTabs()}
          
          {/* Tab content */}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'categories' && renderCategoriesTab()}
          {activeTab === 'info' && renderInfoTab()}
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
  
  // Categories
  categoriesContainer: {
    flex: 1,
  },
  categoriesContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
  },
  
  // Back button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
  },
  
  // Category header
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  categoryHeaderIcon: {
    fontSize: 32,
  },
  categoryHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  
  // Question item
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    gap: 12,
  },
  questionText: {
    flex: 1,
    fontSize: 14,
  },
  
  // Types
  typesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  typeIcon: {
    fontSize: 18,
  },
  typeName: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Styles
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: (width - 48) / 3,
  },
  styleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  styleName: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // Info tab
  infoContainer: {
    flex: 1,
  },
  infoContent: {
    padding: 16,
  },
  formSection: {
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formField: {
    flex: 1,
    position: 'relative',
  },
  formLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  formInput: {
    height: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
    paddingRight: 40,
  },
  formUnit: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    fontSize: 13,
  },
  
  // Budget
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  budgetChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  budgetText: {
    fontSize: 13,
    fontWeight: '500',
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
  
  // Tips
  tipsSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
