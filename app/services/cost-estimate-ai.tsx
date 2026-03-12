/**
 * Tư vấn Dự toán Chi phí AI
 * AI-powered construction cost estimation
 * @author AI Assistant
 * @date 13/01/2026
 */

import VoiceInput, { VoiceOutput } from '@/components/ai/VoiceInput';
import { useColors } from '@/hooks/use-colors';
import {
    AIMessage,
    ConsultantContext,
    getConsultantConfig,
    sendConsultMessage,
} from '@/services/aiConsultantService';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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

// ==================== DATA ====================

const CONSTRUCTION_LEVELS = [
  { id: 'basic', name: 'Cơ bản', price: '4.5-5.5', unit: 'triệu/m²', icon: '🏠', color: '#10B981' },
  { id: 'standard', name: 'Tiêu chuẩn', price: '5.5-7', unit: 'triệu/m²', icon: '🏡', color: '#0D9488' },
  { id: 'premium', name: 'Cao cấp', price: '7-10', unit: 'triệu/m²', icon: '🏰', color: '#8B5CF6' },
  { id: 'luxury', name: 'Siêu cao cấp', price: '10-15+', unit: 'triệu/m²', icon: '🏯', color: '#F59E0B' },
];

const MATERIAL_PRICES = [
  { id: 'cement', name: 'Xi măng', price: '95,000 - 110,000', unit: '₫/bao 50kg', icon: '🧱' },
  { id: 'steel', name: 'Sắt thép', price: '15,000 - 18,000', unit: '₫/kg', icon: '🔩' },
  { id: 'brick', name: 'Gạch xây', price: '1,200 - 2,000', unit: '₫/viên', icon: '🧱' },
  { id: 'sand', name: 'Cát', price: '350,000 - 450,000', unit: '₫/m³', icon: '🏖️' },
  { id: 'stone', name: 'Đá', price: '380,000 - 500,000', unit: '₫/m³', icon: '🪨' },
  { id: 'tile', name: 'Gạch ốp lát', price: '150,000 - 500,000', unit: '₫/m²', icon: '🔲' },
];

const LABOR_COSTS = [
  { id: 'mason', name: 'Thợ xây', price: '400,000 - 500,000', unit: '₫/ngày', icon: '👷' },
  { id: 'electrician', name: 'Thợ điện', price: '450,000 - 600,000', unit: '₫/ngày', icon: '⚡' },
  { id: 'plumber', name: 'Thợ nước', price: '400,000 - 550,000', unit: '₫/ngày', icon: '🚿' },
  { id: 'painter', name: 'Thợ sơn', price: '350,000 - 450,000', unit: '₫/ngày', icon: '🎨' },
  { id: 'carpenter', name: 'Thợ mộc', price: '450,000 - 600,000', unit: '₫/ngày', icon: '🪚' },
];

const COST_COMPONENTS = [
  { id: 'foundation', name: 'Móng', percent: '15-20%', icon: '🏗️' },
  { id: 'structure', name: 'Kết cấu thân', percent: '30-35%', icon: '🧱' },
  { id: 'roof', name: 'Mái', percent: '8-12%', icon: '🏠' },
  { id: 'finish', name: 'Hoàn thiện', percent: '25-30%', icon: '✨' },
  { id: 'mep', name: 'Điện nước', percent: '10-15%', icon: '⚡' },
  { id: 'misc', name: 'Phát sinh', percent: '5-10%', icon: '📦' },
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
        <View style={[styles.aiAvatar, { backgroundColor: '#DC2626' }]}>
          <FontAwesome5 name="calculator" size={16} color="#fff" />
        </View>
      )}
      <View style={[
        styles.messageBubble,
        isUser 
          ? { backgroundColor: '#DC2626' } 
          : { backgroundColor: colors.cardBackground },
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
            { color: isUser ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
          ]}>
            {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {!isUser && (
            <VoiceOutput 
              text={message.content} 
              size={18} 
              color={colors.textSecondary}
              activeColor="#DC2626"
            />
          )}
        </View>
      </View>
    </View>
  );
};

const PriceCard: React.FC<{
  level: typeof CONSTRUCTION_LEVELS[0];
  selected: boolean;
  onPress: () => void;
  colors: any;
}> = ({ level, selected, onPress, colors }) => (
  <TouchableOpacity
    style={[
      styles.priceCard,
      { backgroundColor: colors.cardBackground },
      selected && { borderColor: level.color, borderWidth: 2 },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.priceCardIcon}>{level.icon}</Text>
    <Text style={[styles.priceCardName, { color: colors.text }]}>{level.name}</Text>
    <Text style={[styles.priceCardPrice, { color: level.color }]}>{level.price}</Text>
    <Text style={[styles.priceCardUnit, { color: colors.textSecondary }]}>{level.unit}</Text>
  </TouchableOpacity>
);

const MaterialPriceItem: React.FC<{
  material: typeof MATERIAL_PRICES[0];
  onPress: () => void;
  colors: any;
}> = ({ material, onPress, colors }) => (
  <TouchableOpacity
    style={[styles.materialItem, { backgroundColor: colors.cardBackground }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.materialIcon}>{material.icon}</Text>
    <View style={styles.materialInfo}>
      <Text style={[styles.materialName, { color: colors.text }]}>{material.name}</Text>
      <Text style={[styles.materialPrice, { color: '#DC2626' }]}>{material.price}</Text>
      <Text style={[styles.materialUnit, { color: colors.textSecondary }]}>{material.unit}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
  </TouchableOpacity>
);

const CostCalculator: React.FC<{
  colors: any;
  onCalculate: (estimate: string) => void;
}> = ({ colors, onCalculate }) => {
  const [area, setArea] = useState('');
  const [floors, setFloors] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('standard');
  
  const calculate = () => {
    const areaNum = parseFloat(area) || 0;
    const floorsNum = parseInt(floors) || 1;
    const totalArea = areaNum * floorsNum;
    
    const level = CONSTRUCTION_LEVELS.find(l => l.id === selectedLevel);
    const priceRange = level?.price || '5.5-7';
    const [minPrice, maxPrice] = priceRange.replace('+', '').split('-').map(p => parseFloat(p));
    
    const minTotal = totalArea * minPrice;
    const maxTotal = totalArea * maxPrice;
    
    const formatMoney = (num: number) => {
      if (num >= 1000) return `${(num / 1000).toFixed(1)} tỷ`;
      return `${num.toFixed(0)} triệu`;
    };
    
    const estimate = `Với diện tích đất ${area}m², xây ${floors} tầng (tổng ${totalArea}m² sàn), hoàn thiện ${level?.name.toLowerCase()}:

💰 **Ước tính chi phí:**
• Phạm vi: ${formatMoney(minTotal)} - ${formatMoney(maxTotal)}

📊 **Phân bổ dự kiến:**
• Phần thô: ${formatMoney(minTotal * 0.55)} - ${formatMoney(maxTotal * 0.55)}
• Hoàn thiện: ${formatMoney(minTotal * 0.35)} - ${formatMoney(maxTotal * 0.35)}
• Phát sinh: ${formatMoney(minTotal * 0.1)} - ${formatMoney(maxTotal * 0.1)}

⚠️ Đây là ước tính sơ bộ, chi phí thực tế có thể thay đổi.`;
    
    onCalculate(estimate);
  };
  
  return (
    <View style={[styles.calculatorContainer, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.calculatorTitle, { color: colors.text }]}>
        🧮 Ước tính nhanh
      </Text>
      
      <View style={styles.calculatorRow}>
        <View style={styles.calculatorField}>
          <Text style={[styles.calculatorLabel, { color: colors.textSecondary }]}>Diện tích đất</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.calculatorInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={area}
              onChangeText={setArea}
              placeholder="100"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>m²</Text>
          </View>
        </View>
        
        <View style={styles.calculatorField}>
          <Text style={[styles.calculatorLabel, { color: colors.textSecondary }]}>Số tầng</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.calculatorInput, { 
                backgroundColor: colors.background, 
                color: colors.text,
                borderColor: colors.border,
              }]}
              value={floors}
              onChangeText={setFloors}
              placeholder="3"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>tầng</Text>
          </View>
        </View>
      </View>
      
      <Text style={[styles.calculatorLabel, { color: colors.textSecondary, marginTop: 12 }]}>
        Mức hoàn thiện
      </Text>
      
      <View style={styles.levelGrid}>
        {CONSTRUCTION_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            style={[
              styles.levelChip,
              { backgroundColor: colors.background },
              selectedLevel === level.id && { backgroundColor: level.color },
            ]}
            onPress={() => setSelectedLevel(level.id)}
          >
            <Text style={styles.levelChipIcon}>{level.icon}</Text>
            <Text style={[
              styles.levelChipName,
              { color: selectedLevel === level.id ? '#fff' : colors.text },
            ]}>
              {level.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.calculateButton, { backgroundColor: '#DC2626' }]}
        onPress={calculate}
        disabled={!area || !floors}
      >
        <FontAwesome5 name="calculator" size={18} color="#fff" />
        <Text style={styles.calculateButtonText}>Tính dự toán</Text>
      </TouchableOpacity>
    </View>
  );
};

// ==================== MAIN SCREEN ====================

export default function CostEstimateAIScreen() {
  const colors = useColors();
  const config = getConsultantConfig('cost_estimate');
  
  // State
  const [activeTab, setActiveTab] = useState<'chat' | 'prices' | 'calculator'>('chat');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  
  // Refs
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    const welcomeMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: `💰 **Chào mừng bạn đến với Tư vấn Dự toán AI!**\n\nTôi là chuyên gia dự toán xây dựng AI, sẵn sàng hỗ trợ bạn:\n\n• Ước tính chi phí xây dựng\n• Báo giá vật liệu mới nhất\n• Tính toán nhân công\n• Tư vấn tiết kiệm chi phí\n\nBạn đang muốn dự toán cho công trình gì?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  }, []);
  
  // Build context
  const buildContext = useCallback((): ConsultantContext => {
    const ctx: ConsultantContext = {};
    if (selectedLevel) {
      const level = CONSTRUCTION_LEVELS.find(l => l.id === selectedLevel);
      if (level) ctx.style = level.name;
    }
    return ctx;
  }, [selectedLevel]);
  
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
      const response = await sendConsultMessage(messageText, 'cost_estimate', context);
      
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
  
  const handleQuickQuestion = useCallback((question: string) => {
    handleSendMessage(question);
    setActiveTab('chat');
  }, [handleSendMessage]);
  
  const handleCalculateResult = useCallback((estimate: string) => {
    const aiMessage: AIMessage = {
      id: Date.now().toString(),
      role: 'ai',
      content: estimate,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, aiMessage]);
    setActiveTab('chat');
  }, []);
  
  // Render tabs
  const renderTabs = () => (
    <View style={[styles.tabContainer, { backgroundColor: colors.cardBackground }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'chat' && { backgroundColor: '#DC2626' }]}
        onPress={() => setActiveTab('chat')}
      >
        <Ionicons 
          name="chatbubbles" 
          size={18} 
          color={activeTab === 'chat' ? '#fff' : colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'chat' ? '#fff' : colors.textSecondary }
        ]}>
          Chat
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'prices' && { backgroundColor: '#DC2626' }]}
        onPress={() => setActiveTab('prices')}
      >
        <FontAwesome5 
          name="tags" 
          size={16} 
          color={activeTab === 'prices' ? '#fff' : colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'prices' ? '#fff' : colors.textSecondary }
        ]}>
          Bảng giá
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'calculator' && { backgroundColor: '#DC2626' }]}
        onPress={() => setActiveTab('calculator')}
      >
        <FontAwesome5 
          name="calculator" 
          size={16} 
          color={activeTab === 'calculator' ? '#fff' : colors.textSecondary} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'calculator' ? '#fff' : colors.textSecondary }
        ]}>
          Tính toán
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
          <View style={[styles.loadingContainer, { backgroundColor: colors.cardBackground }]}>
            <ActivityIndicator size="small" color="#DC2626" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Đang tính toán...
            </Text>
          </View>
        )}
      </ScrollView>
      
      {messages.length <= 2 && (
        <View style={styles.quickQuestionsContainer}>
          <Text style={[styles.quickQuestionsTitle, { color: colors.textSecondary }]}>
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
                style={[styles.quickQuestionBtn, { borderColor: '#DC2626' }]}
                onPress={() => handleQuickQuestion(q)}
              >
                <Text style={[styles.quickQuestionText, { color: '#DC2626' }]} numberOfLines={2}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
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
          placeholder="Nhập câu hỏi về chi phí..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: inputText.trim() ? '#DC2626' : colors.border,
          }]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
  
  // Render prices tab
  const renderPricesTab = () => (
    <ScrollView 
      style={styles.pricesContainer}
      contentContainerStyle={styles.pricesContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        🏠 Đơn giá xây dựng trọn gói
      </Text>
      <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
        Cập nhật tháng 01/2026
      </Text>
      
      <View style={styles.priceCardsGrid}>
        {CONSTRUCTION_LEVELS.map((level) => (
          <PriceCard
            key={level.id}
            level={level}
            selected={selectedLevel === level.id}
            onPress={() => {
              setSelectedLevel(level.id);
              handleQuickQuestion(`Chi phí xây nhà mức ${level.name.toLowerCase()} gồm những gì?`);
            }}
            colors={colors}
          />
        ))}
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        🧱 Giá vật liệu
      </Text>
      
      <View style={styles.materialsList}>
        {MATERIAL_PRICES.map((material) => (
          <MaterialPriceItem
            key={material.id}
            material={material}
            onPress={() => handleQuickQuestion(`Giá ${material.name.toLowerCase()} hiện nay và cách chọn chất lượng?`)}
            colors={colors}
          />
        ))}
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        👷 Giá nhân công
      </Text>
      
      <View style={styles.laborList}>
        {LABOR_COSTS.map((labor) => (
          <View key={labor.id} style={[styles.laborItem, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.laborIcon}>{labor.icon}</Text>
            <View style={styles.laborInfo}>
              <Text style={[styles.laborName, { color: colors.text }]}>{labor.name}</Text>
              <Text style={[styles.laborPrice, { color: '#DC2626' }]}>{labor.price}</Text>
            </View>
            <Text style={[styles.laborUnit, { color: colors.textSecondary }]}>{labor.unit}</Text>
          </View>
        ))}
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        📊 Tỷ lệ phân bổ chi phí
      </Text>
      
      <View style={styles.componentsList}>
        {COST_COMPONENTS.map((comp) => (
          <View key={comp.id} style={[styles.componentItem, { backgroundColor: colors.cardBackground }]}>
            <Text style={styles.componentIcon}>{comp.icon}</Text>
            <Text style={[styles.componentName, { color: colors.text }]}>{comp.name}</Text>
            <View style={[styles.componentPercent, { backgroundColor: '#DC262620' }]}>
              <Text style={styles.componentPercentText}>{comp.percent}</Text>
            </View>
          </View>
        ))}
      </View>
      
      {/* Disclaimer */}
      <View style={[styles.disclaimerBox, { backgroundColor: colors.cardBackground }]}>
        <Ionicons name="information-circle" size={24} color="#DC2626" />
        <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
          Giá trên chỉ mang tính chất tham khảo và có thể thay đổi theo thị trường và khu vực.
        </Text>
      </View>
    </ScrollView>
  );
  
  // Render calculator tab
  const renderCalculatorTab = () => (
    <ScrollView 
      style={styles.calculatorTabContainer}
      contentContainerStyle={styles.calculatorTabContent}
      showsVerticalScrollIndicator={false}
    >
      <CostCalculator colors={colors} onCalculate={handleCalculateResult} />
      
      {/* Category questions */}
      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}>
        ❓ Câu hỏi theo chủ đề
      </Text>
      
      {config.categories.map((cat) => (
        <View key={cat.id} style={[styles.categorySection, { backgroundColor: colors.cardBackground }]}>
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
              <Ionicons name="chatbubble-outline" size={16} color="#DC2626" />
              <Text style={[styles.categoryQuestionText, { color: colors.text }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      
      {/* Tips */}
      <View style={[styles.tipsBox, { backgroundColor: '#FEF3C7' }]}>
        <Text style={[styles.tipsTitle, { color: '#92400E' }]}>💡 Mẹo tiết kiệm chi phí</Text>
        <Text style={[styles.tipsText, { color: '#92400E' }]}>
          • Mua vật liệu số lượng lớn để được giảm giá{'\n'}
          • Xây vào mùa thấp điểm (tháng 5-9){'\n'}
          • So sánh giá từ nhiều nhà thầu{'\n'}
          • Tránh thay đổi thiết kế trong quá trình xây
        </Text>
      </View>
    </ScrollView>
  );
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tư vấn Dự toán AI',
          headerShown: true,
          headerStyle: { backgroundColor: colors.cardBackground },
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
            colors={['#DC2626', '#B91C1C']}
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
          {activeTab === 'prices' && renderPricesTab()}
          {activeTab === 'calculator' && renderCalculatorTab()}
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
  
  // Prices tab
  pricesContainer: {
    flex: 1,
  },
  pricesContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: 12,
  },
  
  // Price cards
  priceCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  priceCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  priceCardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  priceCardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  priceCardPrice: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceCardUnit: {
    fontSize: 11,
  },
  
  // Materials list
  materialsList: {
    gap: 8,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  materialIcon: {
    fontSize: 24,
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 14,
    fontWeight: '500',
  },
  materialPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  materialUnit: {
    fontSize: 11,
  },
  
  // Labor list
  laborList: {
    gap: 8,
  },
  laborItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  laborIcon: {
    fontSize: 24,
  },
  laborInfo: {
    flex: 1,
  },
  laborName: {
    fontSize: 14,
    fontWeight: '500',
  },
  laborPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  laborUnit: {
    fontSize: 11,
  },
  
  // Cost components
  componentsList: {
    gap: 8,
  },
  componentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12,
  },
  componentIcon: {
    fontSize: 20,
  },
  componentName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  componentPercent: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  componentPercentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  
  // Calculator tab
  calculatorTabContainer: {
    flex: 1,
  },
  calculatorTabContent: {
    padding: 16,
    paddingBottom: 40,
  },
  calculatorContainer: {
    padding: 16,
    borderRadius: 12,
  },
  calculatorTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  calculatorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  calculatorField: {
    flex: 1,
  },
  calculatorLabel: {
    fontSize: 12,
    marginBottom: 6,
  },
  inputWrapper: {
    position: 'relative',
  },
  calculatorInput: {
    height: 44,
    paddingHorizontal: 12,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  inputUnit: {
    position: 'absolute',
    right: 12,
    top: 12,
    fontSize: 13,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  levelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelChipIcon: {
    fontSize: 16,
  },
  levelChipName: {
    fontSize: 12,
    fontWeight: '500',
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 16,
    gap: 8,
  },
  calculateButtonText: {
    fontSize: 15,
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
  
  // Disclaimer
  disclaimerBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    gap: 12,
    alignItems: 'center',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  
  // Tips box
  tipsBox: {
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
    fontSize: 12,
    lineHeight: 20,
  },
});
