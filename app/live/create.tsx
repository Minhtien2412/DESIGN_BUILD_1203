/**
 * Create Live Stream Screen
 * Setup and start a new live broadcast
 */

import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Loader } from '@/components/ui/loader';
import { Section } from '@/components/ui/section';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useLiveStream } from '@/hooks/useLiveStream';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

export default function CreateLiveStreamScreen() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [enableChat, setEnableChat] = useState(true);
  const [enableReactions, setEnableReactions] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [quality, setQuality] = useState<'auto' | '720p' | '1080p'>('auto');

  const { createAndStartStream, isLoading } = useLiveStream();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');

  const handleCreateStream = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a stream title');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a stream');
      return;
    }

    try {
      const stream = await createAndStartStream(title, description);
      
      Alert.alert(
        'Stream Created!',
        'Your live stream is ready to broadcast.',
        [
          {
            text: 'Start Broadcasting',
            onPress: () => router.replace(`/live/${stream.id}` as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create stream');
    }
  };

  return (
    <Container style={{ backgroundColor }}>
      <Stack.Screen
        options={{
          title: 'Create Live Stream',
          headerShown: true,
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="videocam" size={48} color="#000000" />
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Start Live Streaming
          </Text>
          <Text style={[styles.headerSubtitle, { color: useThemeColor({}, 'textMuted') }]}>
            Broadcast live to your audience
          </Text>
        </View>

        {/* Stream Details */}
        <Section title="Stream Details">
          <Input
            label="Stream Title *"
            placeholder="e.g., Construction Site Tour"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />

          <Input
            label="Description (Optional)"
            placeholder="Tell viewers what you'll be showing..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.textArea}
          />
        </Section>

        {/* Stream Settings */}
        <Section title="Stream Settings">
          <View style={[styles.settingRow, { borderBottomColor: borderColor }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Enable Chat
              </Text>
              <Text style={[styles.settingDesc, { color: useThemeColor({}, 'textMuted') }]}>
                Allow viewers to send messages
              </Text>
            </View>
            <Switch
              value={enableChat}
              onValueChange={setEnableChat}
              trackColor={{ false: '#ccc', true: '#000000' }}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.settingRow, { borderBottomColor: borderColor }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Enable Reactions
              </Text>
              <Text style={[styles.settingDesc, { color: useThemeColor({}, 'textMuted') }]}>
                Allow viewers to send reactions
              </Text>
            </View>
            <Switch
              value={enableReactions}
              onValueChange={setEnableReactions}
              trackColor={{ false: '#ccc', true: '#000000' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: textColor }]}>
                Private Stream
              </Text>
              <Text style={[styles.settingDesc, { color: useThemeColor({}, 'textMuted') }]}>
                Only invited viewers can watch
              </Text>
            </View>
            <Switch
              value={isPrivate}
              onValueChange={setIsPrivate}
              trackColor={{ false: '#ccc', true: '#000000' }}
              thumbColor="#fff"
            />
          </View>
        </Section>

        {/* Quality Settings */}
        <Section title="Video Quality">
          <View style={styles.qualityOptions}>
            {(['auto', '720p', '1080p'] as const).map((q) => (
              <Button
                key={q}
                title={q === 'auto' ? 'Auto' : q}
                onPress={() => setQuality(q)}
                variant={quality === q ? 'primary' : 'secondary'}
                style={styles.qualityButton}
              />
            ))}
          </View>
        </Section>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: surfaceColor }]}>
          <Ionicons name="information-circle" size={24} color="#0D9488" />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: textColor }]}>
              Before you start
            </Text>
            <Text style={[styles.infoText, { color: useThemeColor({}, 'textMuted') }]}>
              • Make sure you have a stable internet connection{'\n'}
              • Check your camera and microphone permissions{'\n'}
              • Choose a well-lit location{'\n'}
              • Avoid background noise
            </Text>
          </View>
        </View>

        {/* Create Button */}
        <Button
          title={isLoading ? 'Creating Stream...' : 'Create & Go Live'}
          onPress={handleCreateStream}
          disabled={isLoading || !title.trim()}
          loading={isLoading}
          style={styles.createButton}
        />

        {/* Cancel Button */}
        <Button
          title="Cancel"
          onPress={() => router.back()}
          variant="secondary"
          style={styles.cancelButton}
        />
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Loader />
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
  },
  qualityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  qualityButton: {
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  createButton: {
    marginTop: 32,
  },
  cancelButton: {
    marginTop: 12,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
