import { Colors } from '@/constants/theme';
import { requestCameraPermission, requestLocationPermission } from '@/hooks/useAppPermissions';
import { apiFetch } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

interface Props {
  projectId: number;
  projectLocation?: { lat: number; lng: number } | null;
  onSuccess?: () => void;
}

export default function LocationCheckIn({ projectId, projectLocation, onSuccess }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(true);
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (location && projectLocation) {
      calculateDistance();
    }
  }, [location, projectLocation]);

  const calculateDistance = () => {
    if (!location || !projectLocation) return;

    // Haversine formula
    const R = 6371e3; // Earth radius in meters
    const φ1 = (projectLocation.lat * Math.PI) / 180;
    const φ2 = (location.coords.latitude * Math.PI) / 180;
    const Δφ = ((location.coords.latitude - projectLocation.lat) * Math.PI) / 180;
    const Δλ = ((location.coords.longitude - projectLocation.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const dist = R * c; // Distance in meters
    setDistance(dist);
    setIsWithinRange(dist <= 500); // Within 500m
  };

  const handleGetLocation = async () => {
    try {
      setLoadingLocation(true);

      // Request permission
      const permissionResult = await requestLocationPermission();
      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập vị trí',
          'Vui lòng cấp quyền truy cập vị trí để check-in tại công trình.'
        );
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation);
    } catch (error) {
      console.error('Failed to get location:', error);
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại. Vui lòng bật GPS và thử lại.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      // Request camera permission
      const permissionResult = await requestCameraPermission();
      if (permissionResult.status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập Camera',
          'Vui lòng cấp quyền camera để chụp ảnh check-in.'
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const handlePickPhoto = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Cần quyền truy cập Thư viện',
          'Vui lòng cấp quyền truy cập thư viện ảnh.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick photo:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async () => {
    if (!location) {
      Alert.alert('Thiếu thông tin', 'Vui lòng lấy vị trí hiện tại trước khi check-in.');
      return;
    }

    try {
      setSubmitting(true);

      // TODO: Upload photo to media server first and get URL
      // For now, use local URI (in production, upload to backend first)
      const photoUrl = photo || null;

      const response = await apiFetch(`/api/projects/${projectId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          notes: notes.trim() || null,
          photo_url: photoUrl,
        }),
      });

      if (response.success) {
        Alert.alert(
          'Thành công',
          response.data.warning || 'Check-in thành công!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setLocation(null);
                setNotes('');
                setPhoto(null);
                setDistance(null);
                onSuccess?.();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Failed to check-in:', error);
      Alert.alert('Lỗi', error.message || 'Không thể check-in. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Location Section */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="location" size={24} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Vị trí hiện tại</Text>
        </View>

        {!location ? (
          <TouchableOpacity
            style={[styles.getLocationButton, { backgroundColor: colors.accent }]}
            onPress={handleGetLocation}
            disabled={loadingLocation}
            activeOpacity={0.7}
          >
            {loadingLocation ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.getLocationButtonText}>Lấy vị trí GPS</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.locationInfo}>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, { color: colors.textMuted }]}>Vĩ độ:</Text>
              <Text style={[styles.locationValue, { color: colors.text }]}>
                {location.coords.latitude.toFixed(6)}°
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, { color: colors.textMuted }]}>Kinh độ:</Text>
              <Text style={[styles.locationValue, { color: colors.text }]}>
                {location.coords.longitude.toFixed(6)}°
              </Text>
            </View>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, { color: colors.textMuted }]}>Độ chính xác:</Text>
              <Text style={[styles.locationValue, { color: colors.text }]}>
                ±{Math.round(location.coords.accuracy || 0)}m
              </Text>
            </View>

            {distance !== null && (
              <View
                style={[
                  styles.distanceBadge,
                  { backgroundColor: isWithinRange ? '#0066CC' : '#0066CC' },
                ]}
              >
                <Ionicons
                  name={isWithinRange ? 'checkmark-circle' : 'warning'}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.distanceBadgeText}>
                  {distance < 1000
                    ? `${Math.round(distance)}m`
                    : `${(distance / 1000).toFixed(1)}km`}{' '}
                  từ công trình
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleGetLocation}
              disabled={loadingLocation}
            >
              <Ionicons name="refresh" size={16} color={colors.accent} />
              <Text style={[styles.refreshButtonText, { color: colors.accent }]}>
                Làm mới vị trí
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Photo Section */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="camera" size={24} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Hình ảnh (không bắt buộc)</Text>
        </View>

        {photo ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.photoRemoveButton}
              onPress={() => setPhoto(null)}
            >
              <Ionicons name="close-circle" size={32} color="#1A1A1A" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={[styles.photoButton, { borderColor: colors.border }]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera-outline" size={32} color={colors.accent} />
              <Text style={[styles.photoButtonText, { color: colors.text }]}>Chụp ảnh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoButton, { borderColor: colors.border }]}
              onPress={handlePickPhoto}
            >
              <Ionicons name="images-outline" size={32} color={colors.accent} />
              <Text style={[styles.photoButtonText, { color: colors.text }]}>Chọn từ thư viện</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Notes Section */}
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="document-text" size={24} color={colors.accent} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Ghi chú (không bắt buộc)</Text>
        </View>

        <TextInput
          style={[
            styles.notesInput,
            { backgroundColor: colors.background, color: colors.text, borderColor: colors.border },
          ]}
          placeholder="Nhập ghi chú về check-in này..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: colors.accent },
          (!location || submitting) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!location || submitting}
        activeOpacity={0.7}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
            <Text style={styles.submitButtonText}>Check-in ngay</Text>
          </>
        )}
      </TouchableOpacity>

      {!isWithinRange && location && (
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={20} color="#0066CC" />
          <Text style={[styles.warningText, { color: colors.textMuted }]}>
            Bạn đang ở ngoài phạm vi công trình (&gt;500m). Check-in vẫn được ghi nhận nhưng có thể
            cần xác minh.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  getLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  getLocationButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  locationInfo: {
    gap: 10,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  locationLabel: {
    fontSize: 14,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  distanceBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
    marginTop: 8,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  photoRemoveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    gap: 8,
  },
  photoButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  notesInput: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F4FF',
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
