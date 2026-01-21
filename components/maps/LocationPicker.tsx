/**
 * Location Picker Component
 * =========================
 * 
 * Component chọn vị trí với hỗ trợ Google Maps, Goong Maps (Vietnam).
 * Bao gồm search, current location, và map picker.
 * 
 * @author ThietKeResort Team
 * @created 2025-01-12
 */

import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { MAPS_CONFIG, isServiceConfigured } from '../../config/externalApis';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================
// Types
// ============================================
export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  name?: string;
  city?: string;
  district?: string;
  ward?: string;
  street?: string;
  country?: string;
  formattedAddress?: string;
  placeId?: string;
}

interface LocationPickerProps {
  /** Initial location */
  value?: LocationData | null;
  /** Placeholder text */
  placeholder?: string;
  /** On location selected */
  onSelect: (location: LocationData) => void;
  /** Show map in modal */
  showMap?: boolean;
  /** Country filter for search (default: vn) */
  country?: string;
  /** Custom style */
  style?: any;
  /** Error message */
  error?: string;
  /** Label */
  label?: string;
  /** Required */
  required?: boolean;
}

interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types?: string[];
}

// ============================================
// API Functions
// ============================================

// Google Places Autocomplete
async function searchGooglePlaces(
  query: string,
  country: string = 'vn'
): Promise<PlacePrediction[]> {
  const apiKey = MAPS_CONFIG.google.apiKey;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(
      `${MAPS_CONFIG.google.baseUrl}/place/autocomplete/json?` +
      `input=${encodeURIComponent(query)}` +
      `&components=country:${country}` +
      `&language=vi` +
      `&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.predictions.map((p: any) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || '',
        types: p.types,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('[LocationPicker] Google search error:', error);
    return [];
  }
}

// Google Place Details
async function getGooglePlaceDetails(placeId: string): Promise<LocationData | null> {
  const apiKey = MAPS_CONFIG.google.apiKey;
  if (!apiKey) return null;
  
  try {
    const response = await fetch(
      `${MAPS_CONFIG.google.baseUrl}/place/details/json?` +
      `place_id=${placeId}` +
      `&fields=geometry,formatted_address,name,address_components` +
      `&language=vi` +
      `&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      const result = data.result;
      const location = result.geometry.location;
      
      // Parse address components
      const components: Record<string, string> = {};
      result.address_components?.forEach((c: any) => {
        const type = c.types[0];
        components[type] = c.long_name;
      });
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: result.formatted_address,
        name: result.name,
        street: components.route || components.street_address,
        ward: components.sublocality_level_1 || components.sublocality,
        district: components.administrative_area_level_2,
        city: components.administrative_area_level_1,
        country: components.country,
        formattedAddress: result.formatted_address,
        placeId,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[LocationPicker] Google details error:', error);
    return null;
  }
}

// Goong Places Search (Vietnam)
async function searchGoongPlaces(query: string): Promise<PlacePrediction[]> {
  const apiKey = MAPS_CONFIG.goong.apiKey;
  if (!apiKey) return [];
  
  try {
    const response = await fetch(
      `${MAPS_CONFIG.goong.baseUrl}/Place/AutoComplete?` +
      `api_key=${apiKey}` +
      `&input=${encodeURIComponent(query)}` +
      `&limit=10`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK') {
      return data.predictions.map((p: any) => ({
        placeId: p.place_id,
        description: p.description,
        mainText: p.structured_formatting?.main_text || p.description,
        secondaryText: p.structured_formatting?.secondary_text || '',
        types: p.types,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('[LocationPicker] Goong search error:', error);
    return [];
  }
}

// Goong Place Details
async function getGoongPlaceDetails(placeId: string): Promise<LocationData | null> {
  const apiKey = MAPS_CONFIG.goong.apiKey;
  if (!apiKey) return null;
  
  try {
    const response = await fetch(
      `${MAPS_CONFIG.goong.baseUrl}/Place/Detail?` +
      `api_key=${apiKey}` +
      `&place_id=${placeId}`
    );
    
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      const result = data.result;
      const location = result.geometry.location;
      
      // Parse compound info
      const compound = result.compound || {};
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: result.formatted_address,
        name: result.name,
        ward: compound.commune,
        district: compound.district,
        city: compound.province,
        formattedAddress: result.formatted_address,
        placeId,
      };
    }
    
    return null;
  } catch (error) {
    console.error('[LocationPicker] Goong details error:', error);
    return null;
  }
}

// Reverse geocode
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  // Try Goong first (better for Vietnam)
  const goongKey = MAPS_CONFIG.goong.apiKey;
  if (goongKey) {
    try {
      const response = await fetch(
        `${MAPS_CONFIG.goong.baseUrl}/Geocode?` +
        `api_key=${goongKey}` +
        `&latlng=${lat},${lng}`
      );
      
      const data = await response.json();
      if (data.status === 'OK' && data.results?.[0]) {
        return data.results[0].formatted_address;
      }
    } catch (error) {
      console.error('[LocationPicker] Goong reverse geocode error:', error);
    }
  }
  
  // Fallback to Google
  const googleKey = MAPS_CONFIG.google.apiKey;
  if (googleKey) {
    try {
      const response = await fetch(
        `${MAPS_CONFIG.google.baseUrl}/geocode/json?` +
        `latlng=${lat},${lng}` +
        `&language=vi` +
        `&key=${googleKey}`
      );
      
      const data = await response.json();
      if (data.status === 'OK' && data.results?.[0]) {
        return data.results[0].formatted_address;
      }
    } catch (error) {
      console.error('[LocationPicker] Google reverse geocode error:', error);
    }
  }
  
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// ============================================
// Main Component
// ============================================
export function LocationPicker({
  value,
  placeholder = 'Nhập địa chỉ hoặc chọn vị trí...',
  onSelect,
  showMap = true,
  country = 'vn',
  style,
  error,
  label,
  required,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Theme
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const secondaryText = useThemeColor({}, 'tabIconDefault');
  const errorColor = '#ef4444';

  // Use Goong for Vietnam, Google otherwise
  const useGoong = country === 'vn' && isServiceConfigured('goong');

  // Search places
  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    
    if (text.length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }
    
    // Debounce
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      
      let results: PlacePrediction[] = [];
      
      if (useGoong) {
        results = await searchGoongPlaces(text);
      }
      
      // Fallback to Google if Goong returns nothing
      if (results.length === 0 && isServiceConfigured('googlemaps')) {
        results = await searchGooglePlaces(text, country);
      }
      
      setPredictions(results);
      setShowPredictions(results.length > 0);
      setLoading(false);
    }, 300);
  }, [useGoong, country]);

  // Select place
  const handleSelectPlace = useCallback(async (prediction: PlacePrediction) => {
    setLoading(true);
    setShowPredictions(false);
    
    let location: LocationData | null = null;
    
    if (useGoong) {
      location = await getGoongPlaceDetails(prediction.placeId);
    }
    
    if (!location && isServiceConfigured('googlemaps')) {
      location = await getGooglePlaceDetails(prediction.placeId);
    }
    
    if (location) {
      setQuery(location.address);
      onSelect(location);
    } else {
      // Fallback
      setQuery(prediction.description);
    }
    
    setLoading(false);
  }, [useGoong, onSelect]);

  // Get current location
  const handleCurrentLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Vui lòng cấp quyền truy cập vị trí');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const { latitude, longitude } = location.coords;
      const address = await reverseGeocode(latitude, longitude);
      
      const locationData: LocationData = {
        latitude,
        longitude,
        address,
        formattedAddress: address,
      };
      
      setQuery(address);
      onSelect(locationData);
    } catch (error) {
      console.error('[LocationPicker] Current location error:', error);
      alert('Không thể lấy vị trí hiện tại');
    } finally {
      setLoadingLocation(false);
    }
  }, [onSelect]);

  // Clear input
  const handleClear = useCallback(() => {
    setQuery('');
    setPredictions([]);
    setShowPredictions(false);
  }, []);

  // Static map URL
  const getStaticMapUrl = useCallback((lat: number, lng: number) => {
    const googleKey = MAPS_CONFIG.google.apiKey;
    if (googleKey) {
      return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=400x200&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${googleKey}`;
    }
    
    // Goong Static Map
    const goongKey = MAPS_CONFIG.goong.maptilesKey;
    if (goongKey) {
      return `https://api.goong.io/staticmap?center=${lng},${lat}&zoom=15&size=400x200&marker=${lng},${lat}&api_key=${goongKey}`;
    }
    
    return null;
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: textColor }]}>{label}</Text>
          {required && <Text style={[styles.required, { color: errorColor }]}>*</Text>}
        </View>
      )}

      {/* Input Container */}
      <View style={[
        styles.inputContainer,
        { backgroundColor: cardColor, borderColor: error ? errorColor : '#e5e7eb' },
      ]}>
        <Ionicons name="location-outline" size={20} color={secondaryText} />
        
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={secondaryText}
          value={query}
          onChangeText={handleSearch}
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
        />
        
        {loading && <ActivityIndicator size="small" color={primaryColor} />}
        
        {query.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={secondaryText} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={handleCurrentLocation} 
          style={styles.locationButton}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator size="small" color={primaryColor} />
          ) : (
            <Ionicons name="navigate" size={20} color={primaryColor} />
          )}
        </TouchableOpacity>
      </View>

      {/* Error */}
      {error && (
        <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>
      )}

      {/* Predictions List */}
      {showPredictions && predictions.length > 0 && (
        <View style={[styles.predictionsContainer, { backgroundColor: cardColor }]}>
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.predictionItem}
                onPress={() => handleSelectPlace(item)}
              >
                <Ionicons name="location" size={18} color={secondaryText} />
                <View style={styles.predictionText}>
                  <Text style={[styles.predictionMain, { color: textColor }]} numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  <Text style={[styles.predictionSecondary, { color: secondaryText }]} numberOfLines={1}>
                    {item.secondaryText}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Selected Location Preview */}
      {value && showMap && (
        <TouchableOpacity 
          style={[styles.mapPreview, { borderColor: '#e5e7eb' }]}
          onPress={() => setMapModalVisible(true)}
        >
          {getStaticMapUrl(value.latitude, value.longitude) ? (
            <Image
              source={{ uri: getStaticMapUrl(value.latitude, value.longitude)! }}
              style={styles.mapImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mapPlaceholder, { backgroundColor: cardColor }]}>
              <Ionicons name="map-outline" size={32} color={secondaryText} />
              <Text style={[styles.mapPlaceholderText, { color: secondaryText }]}>
                Xem bản đồ
              </Text>
            </View>
          )}
          
          <View style={styles.mapOverlay}>
            <Ionicons name="expand-outline" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  required: {
    marginLeft: 4,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  locationButton: {
    padding: 8,
    marginRight: -4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
  },
  predictionsContainer: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionsList: {
    maxHeight: 250,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  predictionText: {
    flex: 1,
  },
  predictionMain: {
    fontSize: 14,
    fontWeight: '500',
  },
  predictionSecondary: {
    fontSize: 12,
    marginTop: 2,
  },
  mapPreview: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    height: 120,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 12,
    marginTop: 4,
  },
  mapOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    padding: 6,
  },
});

export default LocationPicker;
