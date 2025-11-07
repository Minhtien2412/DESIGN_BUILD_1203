import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { updateAvatarOnly, uploadDocument, uploadVideo } from '@/services/media';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack } from 'expo-router';
import * as React from 'react';
import { Alert, Image, Platform, ScrollView, View } from 'react-native';

export default function UploadDemoScreen() {
  const textMuted = useThemeColor({}, 'textMuted');
  const [avatarUri, setAvatarUri] = React.useState<string | undefined>(undefined);
  const [videoUrl, setVideoUrl] = React.useState<string | undefined>(undefined);
  const [docUrl, setDocUrl] = React.useState<string | undefined>(undefined);
  const [loading, setLoading] = React.useState<{ avatar?: boolean; video?: boolean; doc?: boolean }>({});

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Cần quyền', 'Hãy cấp quyền truy cập thư viện ảnh');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const uploadAvatar = async () => {
    if (!avatarUri) return;
    setLoading((s) => ({ ...s, avatar: true }));
    const ok = await updateAvatarOnly(avatarUri);
    setLoading((s) => ({ ...s, avatar: false }));
    Alert.alert(ok ? 'Thành công' : 'Lỗi', ok ? 'Đã cập nhật ảnh đại diện' : 'Cập nhật thất bại');
  };

  const pickAndUploadVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return Alert.alert('Cần quyền', 'Hãy cấp quyền truy cập thư viện');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: Platform.OS === 'ios' ? 0.7 : 1 });
    if (result.canceled) return;
    setLoading((s) => ({ ...s, video: true }));
    try {
      const asset = result.assets[0];
  const { url } = await uploadVideo(asset.uri, asset.fileName || undefined);
      setVideoUrl(url);
      Alert.alert('OK', 'Video đã upload');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể upload video');
    } finally {
      setLoading((s) => ({ ...s, video: false }));
    }
  };

  const pickAndUploadDocument = async () => {
    const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (res.canceled) return;
    setLoading((s) => ({ ...s, doc: true }));
    try {
      const asset = res.assets[0];
      const { url } = await uploadDocument(asset.uri, asset.name);
      setDocUrl(url);
      Alert.alert('OK', 'Tài liệu đã upload');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể upload tài liệu');
    } finally {
      setLoading((s) => ({ ...s, doc: false }));
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Upload demo' }} />
      <ScrollView>
        <Container>
          <Section title="Ảnh đại diện (avatar)">
            <View style={{ alignItems: 'center', gap: 12 }}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={{ width: 120, height: 120, borderRadius: 60 }} />
              ) : (
                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#e5e7eb' }} />
              )}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Chọn ảnh" onPress={pickAvatar} />
                <Button title="Tải lên" onPress={uploadAvatar} loading={!!loading.avatar} />
              </View>
              <ThemedText>Route: POST /profile/update (multipart FormData: avatar)</ThemedText>
            </View>
          </Section>

          <Section title="Video">
            <View style={{ gap: 12 }}>
              <Button title="Chọn và upload video" onPress={pickAndUploadVideo} loading={!!loading.video} />
              {videoUrl ? (
                <ThemedText selectable>URL: {videoUrl}</ThemedText>
              ) : (
                <ThemedText style={{ color: textMuted }}>Chưa có video</ThemedText>
              )}
              <ThemedText>Route: POST /api/media/upload/videos (FormData: file)</ThemedText>
            </View>
          </Section>

          <Section title="Tài liệu (PDF, DOCX...)">
            <View style={{ gap: 12 }}>
              <Button title="Chọn và upload tài liệu" onPress={pickAndUploadDocument} loading={!!loading.doc} />
              {docUrl ? (
                <ThemedText selectable>URL: {docUrl}</ThemedText>
              ) : (
                <ThemedText style={{ color: textMuted }}>Chưa có tài liệu</ThemedText>
              )}
              <ThemedText>Route: POST /api/media/upload/documents (FormData: file)</ThemedText>
            </View>
          </Section>
        </Container>
      </ScrollView>
    </ThemedView>
  );
}
