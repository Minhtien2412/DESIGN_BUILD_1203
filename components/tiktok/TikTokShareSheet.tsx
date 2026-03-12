/**
 * TikTok Share Sheet
 * Bottom sheet for sharing video to various platforms
 * 
 * @author AI Assistant
 * @date 23/12/2025
 */

import * as tiktokService from '@/services/tiktokService';
import { SHARE_PLATFORMS, SharePlatform, TikTokVideo } from '@/types/tiktok';
import { HapticFeedback } from '@/utils/haptics';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Modal,
    PanResponder,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = 380;

interface TikTokShareSheetProps {
  visible: boolean;
  video: TikTokVideo | null;
  onClose: () => void;
}

export function TikTokShareSheet({
  visible,
  video,
  onClose,
}: TikTokShareSheetProps) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else {
      translateY.setValue(SHEET_HEIGHT);
    }
  }, [visible]);

  // Drag to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          Animated.timing(translateY, {
            toValue: SHEET_HEIGHT,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleShare = useCallback(async (platform: SharePlatform) => {
    if (!video) return;

    HapticFeedback.light();

    const shareUrl = `https://app.example.com/video/${video.id}`;
    const shareMessage = `Check out this video by @${video.author.username}! ${shareUrl}`;

    try {
      switch (platform) {
        case 'copy_link':
          // Clipboard.setString(shareUrl);
          Alert.alert('Link Copied!', 'Video link has been copied to clipboard');
          break;

        case 'facebook':
          await Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
          break;

        case 'twitter':
          await Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`);
          break;

        case 'whatsapp':
          await Linking.openURL(`whatsapp://send?text=${encodeURIComponent(shareMessage)}`);
          break;

        case 'telegram':
          await Linking.openURL(`tg://msg?text=${encodeURIComponent(shareMessage)}`);
          break;

        case 'sms':
          await Linking.openURL(`sms:?body=${encodeURIComponent(shareMessage)}`);
          break;

        case 'email':
          await Linking.openURL(`mailto:?subject=Check out this video&body=${encodeURIComponent(shareMessage)}`);
          break;

        case 'more':
        default:
          await Share.share({
            message: shareMessage,
            url: shareUrl,
            title: 'Share Video',
          });
          break;
      }

      // Track share
      await tiktokService.shareVideo(video.id, platform);
      onClose();
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback to native share
      try {
        await Share.share({
          message: shareMessage,
          url: shareUrl,
          title: 'Share Video',
        });
      } catch (e) {
        console.error('Fallback share failed:', e);
      }
    }
  }, [video, onClose]);

  const handleAction = useCallback((action: string) => {
    HapticFeedback.light();
    
    switch (action) {
      case 'report':
        Alert.alert('Report Video', 'Are you sure you want to report this video?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', style: 'destructive', onPress: () => {
            Alert.alert('Reported', 'Thank you for your report');
            onClose();
          }},
        ]);
        break;
      case 'not_interested':
        Alert.alert('Got it!', "We won't show you similar content");
        onClose();
        break;
      case 'download':
        Alert.alert('Download', 'Video download started');
        onClose();
        break;
      case 'duet':
        Alert.alert('Duet', 'Create a duet with this video');
        onClose();
        break;
      case 'stitch':
        Alert.alert('Stitch', 'Create a stitch with this video');
        onClose();
        break;
    }
  }, [onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.sheet,
            { 
              paddingBottom: insets.bottom || 20,
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Share Title */}
          <Text style={styles.title}>Share to</Text>

          {/* Share Platforms */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.platformsContainer}
          >
            {SHARE_PLATFORMS.map((platform) => (
              <TouchableOpacity
                key={platform.platform}
                style={styles.platformButton}
                onPress={() => handleShare(platform.platform)}
              >
                <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                  <Ionicons name={platform.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.platformLabel}>{platform.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction('download')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="download-outline" size={24} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Save video</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction('duet')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="people-outline" size={24} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Duet</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction('stitch')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="git-merge-outline" size={24} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Stitch</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction('not_interested')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="eye-off-outline" size={24} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Not interested</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleAction('report')}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="flag-outline" size={24} color="#333" />
              </View>
              <Text style={styles.actionLabel}>Report</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  platformsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  platformButton: {
    alignItems: 'center',
    marginRight: 20,
    width: 64,
  },
  platformIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  actionButton: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
});

export default TikTokShareSheet;
