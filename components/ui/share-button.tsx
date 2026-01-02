import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Alert, Platform, Share, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface ShareButtonProps {
  productId: string;
  productName: string;
  productPrice: number;
  size?: number;
  style?: ViewStyle;
  iconColor?: string;
}

export function ShareButton({
  productId,
  productName,
  productPrice,
  size = 24,
  style,
  iconColor = '#666',
}: ShareButtonProps) {
  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const message = `🏗️ ${productName}\n💰 ${productPrice.toLocaleString('vi-VN')} ₫\n\n📱 Xem chi tiết tại app`;
    const url = `https://yourapp.com/product/${productId}`;

    try {
      if (Platform.OS === 'web') {
        // Web sharing
        if (navigator.share) {
          await navigator.share({
            title: productName,
            text: message,
            url: url,
          });
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(`${message}\n${url}`);
          Alert.alert('Đã sao chép', 'Link đã được sao chép vào clipboard');
        }
      } else {
        // Mobile sharing
        const result = await Share.share({
          message: `${message}\n${url}`,
          title: productName,
        });

        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('Shared via:', result.activityType);
          }
        }
      }
    } catch (error: any) {
      console.error('Share error:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('Lỗi', 'Không thể chia sẻ. Vui lòng thử lại.');
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={handleShare}
      style={[styles.button, style]}
      activeOpacity={0.7}
    >
      <Ionicons name="share-social-outline" size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
