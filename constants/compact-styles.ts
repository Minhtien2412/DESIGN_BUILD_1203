/**
 * Compact UI Utilities Theme
 * Giảm kích thước components để hiển thị nhiều nội dung hơn
 */

import { StyleSheet } from 'react-native';
import { Colors } from './theme';

export const COMPACT_STYLES = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  
  // Search Section - Compact
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    padding: 0,
  },
  
  // Sort/Filter Row
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 4,
  },
  
  filterButtonText: {
    fontSize: 11,
    color: '#666',
  },
  
  // Provider Card - Compact
  providerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  
  providerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },
  
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  
  ratingText: {
    fontSize: 11,
    color: '#666',
  },
  
  providerLocation: {
    fontSize: 11,
    color: '#999',
  },
  
  // Stats Row - Compact
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  
  statItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
    marginBottom: 2,
  },
  
  statLabel: {
    fontSize: 10,
    color: '#999',
  },
  
  // Tags - Compact
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 8,
  },
  
  tag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  
  tagText: {
    fontSize: 10,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  
  // Description - Compact
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  
  // Price Section - Compact
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  
  priceUnit: {
    fontSize: 11,
    color: '#999',
  },
  
  // Action Buttons - Compact
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  
  primaryButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
  },
  
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  primaryButtonText: {
    color: '#fff',
  },
  
  secondaryButtonText: {
    color: '#666',
  },
  
  // Badge - Compact
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  
  // Availability Badge
  availabilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  
  availableBackground: {
    backgroundColor: '#dcfce7',
  },
  
  busyBackground: {
    backgroundColor: '#fee2e2',
  },
  
  availabilityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  
  availableText: {
    color: '#16a34a',
  },
  
  busyText: {
    color: '#dc2626',
  },
  
  // Section Header - Compact
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
  },
  
  // Empty State - Compact
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  emptyStateText: {
    fontSize: 13,
    color: '#999',
    marginTop: 12,
  },
  
  // Modal - Compact
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  modalBody: {
    padding: 12,
  },
  
  // Form - Compact
  formGroup: {
    marginBottom: 12,
  },
  
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  
  formInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  formTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  
  submitButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  
  // List Item - Compact
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  
  listItemText: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },
  
  listItemValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
  },
});

// Helper values
export const COMPACT_SIZES = {
  avatar: {
    small: 36,
    medium: 48,
    large: 64,
  },
  icon: {
    small: 16,
    medium: 20,
    large: 24,
  },
  spacing: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
  },
  fontSize: {
    xs: 10,
    sm: 11,
    md: 12,
    lg: 13,
    xl: 14,
    xxl: 16,
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
  },
};
