/**
 * Construction Site Map View
 * Hiển thị vị trí công trình và người dùng trên bản đồ
 * Note: Map only works on iOS/Android, not on web
 * UPDATED: Lấy dữ liệu thật từ Perfex CRM API
 */

import { Colors } from '@/constants/theme';
import { customersAPI, projectsAPI } from '@/services/perfexAPI';
import type { Customer, Project } from '@/types/perfex';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Conditionally import react-native-maps only on native platforms
let MapView: any;
let Marker: any;
let Circle: any;
let Callout: any;
let PROVIDER_GOOGLE: any;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    Circle = Maps.Circle;
    Callout = Maps.Callout;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.log('react-native-maps not available');
  }
}

// Interface cho construction site hiển thị trên bản đồ
interface ConstructionSite {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  progress: number;
  type: string;
  clientName?: string;
  startDate?: string;
  deadline?: string;
}

// Project status mapping
const PROJECT_STATUS: Record<string, string> = {
  '1': 'Chưa bắt đầu',
  '2': 'Đang thi công',
  '3': 'Tạm dừng',
  '4': 'Hoàn thành',
  '5': 'Hủy bỏ',
};

export default function MapViewScreen() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>([]);
  const [selectedSite, setSelectedSite] = useState<ConstructionSite | null>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Load projects and customer data from API
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Parallel load: user location + projects + customers
      const [locationResult, projectsResult, customersResult] = await Promise.allSettled([
        getUserLocationAsync(),
        projectsAPI.list(),
        customersAPI.list(),
      ]);
      
      // Handle location
      if (locationResult.status === 'fulfilled' && locationResult.value) {
        setUserLocation(locationResult.value);
      } else {
        // Fallback to HCM center
        setUserLocation({ latitude: 10.7769, longitude: 106.7009 });
      }
      
      // Handle projects
      if (projectsResult.status === 'fulfilled') {
        const projects = projectsResult.value;
        const customers = customersResult.status === 'fulfilled' ? customersResult.value : [];
        
        console.log('[Map] Loaded', projects.length, 'projects,', customers.length, 'customers');
        
        // Create customer lookup map (by userid, not id)
        const customerMap = new Map<string, Customer>();
        customers.forEach(c => {
          // Perfex uses 'userid' for customer ID in some places
          const customerId = (c as any).userid || c.id;
          customerMap.set(customerId, c);
        });
        
        // Estimated coordinates based on city/address for Vietnam locations
        const getEstimatedCoords = (customer: Customer | undefined, projectName: string): { lat: number, lng: number } => {
          // Default HCM center
          let lat = 10.7769;
          let lng = 106.7009;
          
          const city = customer?.city?.toLowerCase() || '';
          const address = customer?.address?.toLowerCase() || projectName.toLowerCase();
          
          // Match specific areas in HCM
          if (address.includes('quận 7') || address.includes('phú mỹ hưng')) {
            lat = 10.7295; lng = 106.7218;
          } else if (address.includes('quận 9') || address.includes('thủ đức')) {
            lat = 10.8480; lng = 106.7770;
          } else if (address.includes('quận 2') || address.includes('thảo điền')) {
            lat = 10.8017; lng = 106.7381;
          } else if (address.includes('tân phú') || address.includes('tân kỳ')) {
            lat = 10.7921; lng = 106.6283;
          } else if (address.includes('bình thạnh')) {
            lat = 10.8063; lng = 106.7023;
          } else if (address.includes('bình phước') || city.includes('bình phước')) {
            lat = 11.7512; lng = 106.9037;
          } else if (city.includes('hồ chí minh') || city.includes('ho chi minh')) {
            // Random offset within HCM
            lat = 10.7769 + (Math.random() - 0.5) * 0.08;
            lng = 106.7009 + (Math.random() - 0.5) * 0.08;
          }
          
          // Add small random offset to prevent exact overlapping
          lat += (Math.random() - 0.5) * 0.01;
          lng += (Math.random() - 0.5) * 0.01;
          
          return { lat, lng };
        };
        
        // Convert ALL projects to construction sites (no filtering)
        const sites = projects.map(p => {
          const customer = customerMap.get(p.clientid);
          
          // Try to get real coordinates first
          let lat = parseFloat((p as any).latitude || customer?.latitude || '0');
          let lng = parseFloat((p as any).longitude || customer?.longitude || '0');
          
          // If no real coords, estimate from address
          if (!lat || !lng || lat === 0 || lng === 0) {
            const estimated = getEstimatedCoords(customer, p.name);
            lat = estimated.lat;
            lng = estimated.lng;
          }
          
          // Clean up address (remove HTML)
          let cleanAddress = (customer?.address || customer?.city || 'Không có địa chỉ')
            .replace(/<br\s*\/?>/gi, ', ')
            .replace(/<[^>]*>/g, '')
            .replace(/\r\n/g, ', ')
            .trim();
          
          return {
            id: p.id,
            name: p.name,
            address: cleanAddress,
            latitude: lat,
            longitude: lng,
            status: PROJECT_STATUS[p.status] || 'Không xác định',
            progress: parseInt(p.progress || '0', 10),
            type: getProjectType(p),
            clientName: customer?.company,
            startDate: p.start_date,
            deadline: p.deadline,
          };
        });
        
        console.log('[Map] Converted', sites.length, 'sites');
        setConstructionSites(sites.length > 0 ? sites : getMockSites());
      } else {
        console.error('Failed to load projects:', projectsResult.reason);
        setConstructionSites(getMockSites());
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Không thể tải dữ liệu công trình');
      setConstructionSites(getMockSites());
    } finally {
      setLoading(false);
    }
  };

  // Get user location async
  const getUserLocationAsync = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  };

  // Determine project type based on name/description
  const getProjectType = (project: Project): string => {
    const name = (project.name + ' ' + (project.description || '')).toLowerCase();
    if (name.includes('biệt thự') || name.includes('villa')) return 'Biệt thự';
    if (name.includes('nhà phố')) return 'Nhà phố';
    if (name.includes('chung cư') || name.includes('căn hộ')) return 'Chung cư';
    if (name.includes('văn phòng') || name.includes('office')) return 'Văn phòng';
    if (name.includes('nhà xưởng') || name.includes('factory')) return 'Nhà xưởng';
    return 'Công trình';
  };

  // Mock data fallback
  const getMockSites = (): ConstructionSite[] => [
    { id: '1', name: 'Dự án Vinhomes Grand Park', address: 'Quận 9, TP.HCM', latitude: 10.8231, longitude: 106.7197, status: 'Đang thi công', progress: 75, type: 'Biệt thự' },
    { id: '2', name: 'Nhà phố Thảo Điền', address: 'Quận 2, TP.HCM', latitude: 10.8076, longitude: 106.7441, status: 'Hoàn thành', progress: 95, type: 'Nhà phố' },
    { id: '3', name: 'Cao ốc An Phú', address: 'Quận 2, TP.HCM', latitude: 10.8019, longitude: 106.7378, status: 'Đang thi công', progress: 60, type: 'Chung cư' },
    { id: '4', name: 'Villa Landmark 81', address: 'Bình Thạnh, TP.HCM', latitude: 10.7944, longitude: 106.7219, status: 'Chưa bắt đầu', progress: 30, type: 'Villa' },
  ];

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const getMarkerColor = (progress: number) => {
    if (progress >= 90) return '#10B981'; // Green - Hoàn thiện
    if (progress >= 50) return '#3B82F6'; // Blue - Đang thi công
    return '#F59E0B'; // Orange - Mới khởi công
  };

  const navigateToSite = (siteId: string | number) => {
    router.push(`/construction/progress?id=${siteId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  // Web fallback - Map not supported on web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bản đồ công trình</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Web Not Supported Message */}
        <View style={styles.webFallbackContainer}>
          <Ionicons name="map-outline" size={80} color={Colors.light.primary} />
          <Text style={styles.webFallbackTitle}>Bản đồ chỉ khả dụng trên Mobile</Text>
          <Text style={styles.webFallbackText}>
            Vui lòng mở ứng dụng trên thiết bị iOS hoặc Android để xem bản đồ công trình.
          </Text>
          
          {/* Construction Sites List for Web */}
          <View style={styles.sitesList}>
            <Text style={styles.sitesListTitle}>Các công trình:</Text>
            {constructionSites.map((site) => (
              <TouchableOpacity
                key={site.id}
                style={styles.siteItem}
                onPress={() => navigateToSite(site.id)}
              >
                <View style={[styles.siteMarker, { backgroundColor: getMarkerColor(site.progress) }]} />
                <View style={styles.siteInfo}>
                  <Text style={styles.siteName}>{site.name}</Text>
                  <Text style={styles.siteAddress}>{site.address}</Text>
                  <Text style={styles.siteProgress}>Tiến độ: {site.progress}%</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bản đồ công trình</Text>
        <TouchableOpacity
          onPress={() => setMapType(mapType === 'standard' ? 'satellite' : 'standard')}
          style={styles.mapTypeButton}
        >
          <Ionicons name="layers" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Map */}
      {userLocation && (
        <MapView
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          mapType={mapType}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
        >
          {/* User Location Circle */}
          <Circle
            center={userLocation}
            radius={500}
            fillColor="rgba(59, 130, 246, 0.2)"
            strokeColor="rgba(59, 130, 246, 0.5)"
            strokeWidth={2}
          />

          {/* Construction Site Markers */}
          {constructionSites.map((site) => (
            <Marker
              key={site.id}
              coordinate={{
                latitude: site.latitude,
                longitude: site.longitude,
              }}
              pinColor={getMarkerColor(site.progress)}
              onPress={() => setSelectedSite(site)}
            >
              <View style={styles.customMarker}>
                <View
                  style={[
                    styles.markerDot,
                    { backgroundColor: getMarkerColor(site.progress) },
                  ]}
                >
                  <Ionicons name="business" size={16} color="#fff" />
                </View>
                <View
                  style={[
                    styles.markerTriangle,
                    { borderTopColor: getMarkerColor(site.progress) },
                  ]}
                />
              </View>

              <Callout
                style={styles.callout}
                onPress={() => navigateToSite(site.id)}
              >
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle}>{site.name}</Text>
                  <Text style={styles.calloutAddress}>{site.address}</Text>
                  <View style={styles.calloutInfo}>
                    <View style={styles.calloutBadge}>
                      <Ionicons name="construct" size={12} color={Colors.light.primary} />
                      <Text style={styles.calloutType}>{site.type}</Text>
                    </View>
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressText}>{site.progress}%</Text>
                    </View>
                  </View>
                  <Text style={styles.calloutLink}>Xem chi tiết →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Chú thích:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Khởi công (&lt;50%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Đang thi công (50-90%)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.legendText}>Hoàn thiện (&gt;90%)</Text>
          </View>
        </View>
      </View>

      {/* Refresh + My Location Buttons */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={loadData}
        >
          <Ionicons name="locate" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      {/* Sites count indicator */}
      <View style={styles.siteCountBadge}>
        <Ionicons name="business" size={14} color="#fff" />
        <Text style={styles.siteCountText}>{constructionSites.length} công trình</Text>
      </View>

      {/* Bottom Sheet - Site Info */}
      {selectedSite && (
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedSite(null)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>

          <Text style={styles.siteName}>{selectedSite.name}</Text>
          <Text style={styles.siteAddress}>{selectedSite.address}</Text>

          <View style={styles.siteDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="home" size={18} color={Colors.light.primary} />
              <Text style={styles.detailLabel}>Loại:</Text>
              <Text style={styles.detailValue}>{selectedSite.type}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.light.primary} />
              <Text style={styles.detailLabel}>Trạng thái:</Text>
              <Text style={styles.detailValue}>{selectedSite.status}</Text>
            </View>

            <View style={styles.detailItem}>
              <Ionicons name="trending-up" size={18} color={Colors.light.primary} />
              <Text style={styles.detailLabel}>Tiến độ:</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${selectedSite.progress}%`,
                        backgroundColor: getMarkerColor(selectedSite.progress),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressPercent}>{selectedSite.progress}%</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => navigateToSite(selectedSite.id)}
          >
            <Text style={styles.viewDetailsText}>Xem chi tiết</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: Colors.light.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  mapTypeButton: {
    padding: 8,
  },
  map: {
    flex: 1,
  },
  customMarker: {
    alignItems: 'center',
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  callout: {
    width: 250,
    padding: 0,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  calloutAddress: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  calloutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  calloutBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  calloutType: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  progressBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  calloutLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'right',
  },
  legend: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 80,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  legendItems: {
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },
  myLocationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  siteName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  siteAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  siteDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  detailValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    minWidth: 35,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 12,
  },
  viewDetailsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  // Web fallback styles
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  webFallbackText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
    marginBottom: 32,
  },
  sitesList: {
    width: '100%',
    maxWidth: 600,
  },
  sitesListTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  siteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  siteMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  siteInfo: {
    flex: 1,
  },
  siteProgress: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  floatingButtons: {
    position: 'absolute',
    bottom: 120,
    right: 16,
    gap: 12,
  },
  refreshButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  siteCountBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 80,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  siteCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
