/**
 * Services Marketplace Screen
 * Shows list of services with filtering and search
 * Backend: GET /services (PUBLIC API - no auth required!)
 */

import ErrorMessage from "@/components/ui/error-message";
import { SafeScrollView } from "@/components/ui/safe-area";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Colors } from "@/constants/theme";
import { useServices } from "@/hooks/useServices";
import { Service } from "@/services/api/servicesApi";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function ServicesMarketplaceScreen() {
  const {
    services,
    categories,
    loading,
    error,
    retrying,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    refreshServices,
  } = useServices();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshServices();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Services Marketplace</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategory && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat.id && styles.categoryChipTextActive
              ]}>
                {cat.name} ({cat.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Services List */}
      <SafeScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && services.length === 0 ? (
          <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} style={styles.skeletonCard} />
            ))}
          </View>
        ) : retrying ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Retrying...</Text>
          </View>
        ) : error ? (
          <ErrorMessage error={error} onRetry={refreshServices} />
        ) : services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="briefcase-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No services found' : 'No services available'}
            </Text>
            {searchQuery && (
              <Text style={styles.emptySubtext}>
                Try different search keywords
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.servicesList}>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </View>
        )}
      </SafeScrollView>
    </View>
  );
}

// ==================== SERVICE CARD COMPONENT ====================

interface ServiceCardProps {
  service: Service;
}

function ServiceCard({ service }: ServiceCardProps) {
  const handlePress = () => {
    router.push(`/services/${service.id}` as Href);
  };

  return (
    <TouchableOpacity style={styles.serviceCard} onPress={handlePress}>
      {/* Service Image */}
      {service.images?.[0] ? (
        <Image
          source={{ uri: service.images[0] }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.serviceImage, styles.placeholderImage]}>
          <Ionicons name="briefcase" size={32} color="#ccc" />
        </View>
      )}

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <Text style={styles.serviceName} numberOfLines={2}>
          {service.name}
        </Text>
        
        <Text style={styles.serviceDescription} numberOfLines={2}>
          {service.description}
        </Text>

        <View style={styles.serviceFooter}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{service.category}</Text>
          </View>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFA500" />
            <Text style={styles.ratingText}>
              {service.rating !== null ? service.rating.toFixed(1) : 'N/A'}
            </Text>
            <Text style={styles.reviewCount}>
              ({service.reviewCount || 0})
            </Text>
          </View>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>
            {service.price}đ
          </Text>
          <Text style={styles.unit}>/{service.unit}</Text>
        </View>

        {/* Creator Info */}
        {service.creator && (
          <View style={styles.providerInfo}>
            <Ionicons name="person-circle-outline" size={16} color="#666" />
            <Text style={styles.providerName} numberOfLines={1}>
              {service.creator.name}
            </Text>
          </View>
        )}

        {/* Status Badge */}
        {service.status === 'ACTIVE' ? (
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.statusBadgeInactive]}>
            <Text style={styles.statusTextInactive}>Unavailable</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ==================== STYLES ====================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: Colors.light.text,
  },

  // Categories
  categoriesContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },

  // Content
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },

  // Services List
  servicesList: {
    padding: 16,
    gap: 16,
  },

  // Service Card
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: Colors.light.primary + '15',
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  reviewCount: {
    fontSize: 12,
    color: '#999',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  unit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
    gap: 4,
  },
  statusBadgeInactive: {
    backgroundColor: '#F5F5F5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0D9488',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D9488',
  },
  statusTextInactive: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    marginBottom: 16,
  },
});
