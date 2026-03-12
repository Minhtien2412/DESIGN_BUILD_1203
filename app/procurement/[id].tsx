/**
 * Purchase Order Detail Screen
 */

import { ThemedText } from '@/components/themed-text';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePurchaseOrder } from '@/hooks/useProcurement';
import type { PurchaseOrderStatus } from '@/types/procurement';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PurchaseOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const backgroundColor = useThemeColor('background');
  const surfaceColor = useThemeColor('surface');
  const textColor = useThemeColor('text');
  const textMutedColor = useThemeColor('textMuted');
  const borderColor = useThemeColor('border');
  const tintColor = useThemeColor('tint');

  const [selectedTab, setSelectedTab] = useState<'details' | 'items' | 'tracking'>('details');

  const { order: purchaseOrder, loading } = usePurchaseOrder(id);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText type="default" style={{ color: textMutedColor, marginTop: 16 }}>
          Loading purchase order...
        </ThemedText>
      </View>
    );
  }

  if (!purchaseOrder) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={48} color={textMutedColor} />
        <ThemedText type="default" style={{ color: textMutedColor, marginTop: 16 }}>
          Purchase order not found
        </ThemedText>
      </View>
    );
  }

  const getStatusColor = (status: PurchaseOrderStatus) => {
    const statusMap: Partial<Record<PurchaseOrderStatus, string>> = {
      DRAFT: '#6b7280',
      SENT: '#0D9488',
      CONFIRMED: '#666666',
      PARTIALLY_RECEIVED: '#0D9488',
      RECEIVED: '#0D9488',
      CANCELLED: '#000000',
      CLOSED: '#6b7280',
    };
    return statusMap[status] || textMutedColor;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      <Container>
        {/* Header */}
        <Section>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
            <ThemedText type="default" style={{ marginLeft: 8 }}>Back</ThemedText>
          </TouchableOpacity>

          <ThemedText type="title" style={styles.title}>
            {purchaseOrder.orderNumber}
          </ThemedText>

          <View style={styles.headerBadges}>
            <View style={[styles.badge, { backgroundColor: getStatusColor(purchaseOrder.status) }]}>
              <Text style={styles.badgeText}>
                {purchaseOrder.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
        </Section>

        {/* Summary Card */}
        <Section>
          <View style={[styles.summaryCard, { backgroundColor: surfaceColor, borderColor }]}>
            <View style={styles.summaryRow}>
              <ThemedText type="default" style={{ color: textMutedColor }}>Supplier</ThemedText>
              <ThemedText type="title">{purchaseOrder.vendorName}</ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="default" style={{ color: textMutedColor }}>Total Amount</ThemedText>
              <ThemedText type="title" style={{ color: tintColor }}>
                {purchaseOrder.total.toLocaleString()} {purchaseOrder.currency}
              </ThemedText>
            </View>
            <View style={styles.summaryRow}>
              <ThemedText type="default" style={{ color: textMutedColor }}>Items</ThemedText>
              <ThemedText type="default">{purchaseOrder.items.length} items</ThemedText>
            </View>
            {(() => {
              const totalQty = purchaseOrder.items.reduce((sum, item) => sum + item.quantity, 0);
              const receivedQty = purchaseOrder.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
              const receivedPercentage = totalQty > 0 ? (receivedQty / totalQty) * 100 : 0;
              return receivedPercentage > 0 && (
                <View style={styles.summaryRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Received</ThemedText>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${receivedPercentage}%`,
                            backgroundColor: receivedPercentage === 100 ? '#0D9488' : tintColor,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText type="default" style={{ marginLeft: 8 }}>
                      {receivedPercentage.toFixed(0)}%
                    </ThemedText>
                  </View>
                </View>
              );
            })()}
          </View>
        </Section>

        {/* Tab Selector */}
        <Section>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                { 
                  borderColor, 
                  backgroundColor: selectedTab === 'details' ? tintColor : surfaceColor,
                  borderBottomWidth: selectedTab === 'details' ? 2 : 0,
                  borderBottomColor: tintColor
                }
              ]}
              onPress={() => setSelectedTab('details')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'details' ? '#fff' : textColor }]}
              >
                Details
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { 
                  borderColor, 
                  backgroundColor: selectedTab === 'items' ? tintColor : surfaceColor,
                  borderBottomWidth: selectedTab === 'items' ? 2 : 0,
                  borderBottomColor: tintColor
                }
              ]}
              onPress={() => setSelectedTab('items')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'items' ? '#fff' : textColor }]}
              >
                Items
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                { 
                  borderColor, 
                  backgroundColor: selectedTab === 'tracking' ? tintColor : surfaceColor,
                  borderBottomWidth: selectedTab === 'tracking' ? 2 : 0,
                  borderBottomColor: tintColor
                }
              ]}
              onPress={() => setSelectedTab('tracking')}
            >
              <ThemedText
                type="default"
                style={[styles.tabText, { color: selectedTab === 'tracking' ? '#fff' : textColor }]}
              >
                Tracking
              </ThemedText>
            </TouchableOpacity>
          </View>
        </Section>

        {/* Details Tab */}
        {selectedTab === 'details' && (
          <>
            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Order Information</ThemedText>
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Order Date</ThemedText>
                  <ThemedText type="default">
                    {new Date(purchaseOrder.orderDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Required Date</ThemedText>
                  <ThemedText type="default">
                    {new Date(purchaseOrder.requiredDate).toLocaleDateString()}
                  </ThemedText>
                </View>
                {purchaseOrder.deliveryDate && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Expected Delivery</ThemedText>
                    <ThemedText type="default">
                      {new Date(purchaseOrder.deliveryDate).toLocaleDateString()}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Payment Terms</ThemedText>
                  <ThemedText type="default">{purchaseOrder.paymentTerms.replace('_', ' ')}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Delivery Terms</ThemedText>
                  <ThemedText type="default">{purchaseOrder.deliveryTerms}</ThemedText>
                </View>
              </View>
            </Section>

            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Supplier Details</ThemedText>
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Name</ThemedText>
                  <ThemedText type="default">{purchaseOrder.vendorName}</ThemedText>
                </View>
                {purchaseOrder.vendorContact && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Contact Person</ThemedText>
                    <ThemedText type="default">{purchaseOrder.vendorContact.name}</ThemedText>
                  </View>
                )}
                {purchaseOrder.vendorContact?.email && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Email</ThemedText>
                    <ThemedText type="default">{purchaseOrder.vendorContact.email}</ThemedText>
                  </View>
                )}
                {purchaseOrder.vendorContact?.phone && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Phone</ThemedText>
                    <ThemedText type="default">{purchaseOrder.vendorContact.phone}</ThemedText>
                  </View>
                )}
              </View>
            </Section>

            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Delivery Address</ThemedText>
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <ThemedText type="default">{purchaseOrder.deliveryLocation}</ThemedText>
                {purchaseOrder.notes && (
                  <View style={[styles.noteBox, { backgroundColor, marginTop: 12 }]}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>
                      Notes: {purchaseOrder.notes}
                    </ThemedText>
                  </View>
                )}
              </View>
            </Section>

            <Section>
              <ThemedText type="title" style={styles.sectionTitle}>Financial Summary</ThemedText>
              <View style={[styles.infoCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={{ color: textMutedColor }}>Subtotal</ThemedText>
                  <ThemedText type="default">
                    {purchaseOrder.subtotal.toLocaleString()} {purchaseOrder.currency}
                  </ThemedText>
                </View>
                {purchaseOrder.tax !== undefined && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>
                      Tax ({purchaseOrder.taxRate}%)
                    </ThemedText>
                    <ThemedText type="default">
                      {purchaseOrder.tax.toLocaleString()} {purchaseOrder.currency}
                    </ThemedText>
                  </View>
                )}
                {purchaseOrder.shippingCost !== undefined && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Shipping</ThemedText>
                    <ThemedText type="default">
                      {purchaseOrder.shippingCost.toLocaleString()} {purchaseOrder.currency}
                    </ThemedText>
                  </View>
                )}
                {purchaseOrder.discount !== undefined && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>
                      Discount {purchaseOrder.discountType === 'PERCENTAGE' ? '(%)' : ''}
                    </ThemedText>
                    <ThemedText type="default" style={{ color: '#0D9488' }}>
                      -{purchaseOrder.discount.toLocaleString()} {purchaseOrder.currency}
                    </ThemedText>
                  </View>
                )}
                <View style={[styles.infoRow, styles.totalRow]}>
                  <ThemedText type="title">Total</ThemedText>
                  <ThemedText type="title" style={{ color: tintColor }}>
                    {purchaseOrder.total.toLocaleString()} {purchaseOrder.currency}
                  </ThemedText>
                </View>
              </View>
            </Section>

            {purchaseOrder.notes && (
              <Section>
                <ThemedText type="title" style={styles.sectionTitle}>Notes</ThemedText>
                <View style={[styles.noteBox, { backgroundColor: surfaceColor, borderColor }]}>
                  <ThemedText type="default">{purchaseOrder.notes}</ThemedText>
                </View>
              </Section>
            )}
          </>
        )}

        {/* Items Tab */}
        {selectedTab === 'items' && (
          <Section>
            {purchaseOrder.items.map((item, index) => (
              <View key={item.id} style={[styles.itemCard, { backgroundColor: surfaceColor, borderColor }]}>
                <View style={styles.itemHeader}>
                  <ThemedText type="title">{item.itemName}</ThemedText>
                  <View style={[styles.smallBadge, { backgroundColor: item.receivedQuantity >= item.quantity ? '#0D9488' : tintColor }]}>
                    <ThemedText type="default" style={styles.badgeText}>
                      {item.receivedQuantity >= item.quantity ? 'RECEIVED' : 'PENDING'}
                    </ThemedText>
                  </View>
                </View>

                {item.specification && (
                  <ThemedText type="default" style={{ color: textMutedColor, marginTop: 4 }}>
                    {item.specification}
                  </ThemedText>
                )}

                <View style={styles.itemDetails}>
                  <View style={styles.itemDetailRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Quantity</ThemedText>
                    <ThemedText type="default">
                      {item.quantity} {item.unit}
                    </ThemedText>
                  </View>
                  <View style={styles.itemDetailRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Unit Price</ThemedText>
                    <ThemedText type="default">
                      {item.unitPrice.toLocaleString()} {purchaseOrder.currency}
                    </ThemedText>
                  </View>
                  <View style={styles.itemDetailRow}>
                    <ThemedText type="default" style={{ color: textMutedColor }}>Total</ThemedText>
                    <ThemedText type="title" style={{ color: tintColor }}>
                      {item.total.toLocaleString()} {purchaseOrder.currency}
                    </ThemedText>
                  </View>
                </View>

                {item.receivedQuantity !== undefined && (
                  <View style={[styles.receivedBar, { backgroundColor, marginTop: 12, padding: 8, borderRadius: 6 }]}>
                    <View style={styles.receivedInfo}>
                      <ThemedText type="default" style={{ color: textMutedColor }}>
                        Received: {item.receivedQuantity} / {item.quantity} {item.unit}
                      </ThemedText>
                      <ThemedText type="default" style={{ color: tintColor, fontWeight: '600' }}>
                        {((item.receivedQuantity / item.quantity) * 100).toFixed(0)}%
                      </ThemedText>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </Section>
        )}

        {/* Tracking Tab */}
        {selectedTab === 'tracking' && (
          <Section>
            <View style={[styles.timelineCard, { backgroundColor: surfaceColor, borderColor }]}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineDot, { backgroundColor: tintColor }]} />
                <View style={styles.timelineContent}>
                  <ThemedText type="defaultSemiBold">Order Created</ThemedText>
                  <ThemedText type="default" style={{ color: textMutedColor }}>
                    {new Date(purchaseOrder.orderDate).toLocaleString()}
                  </ThemedText>
                  <ThemedText type="default" style={{ color: textMutedColor }}>
                    By {purchaseOrder.createdByName}
                  </ThemedText>
                </View>
              </View>

              {purchaseOrder.approvedBy && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#0D9488' }]} />
                  <View style={styles.timelineContent}>
                    <ThemedText type="defaultSemiBold">Approved</ThemedText>
                    {purchaseOrder.approvedDate && (
                      <ThemedText type="default" style={{ color: textMutedColor }}>
                        {new Date(purchaseOrder.approvedDate).toLocaleString()}
                      </ThemedText>
                    )}
                    <ThemedText type="default" style={{ color: textMutedColor }}>
                      By {purchaseOrder.approvedByName}
                    </ThemedText>
                  </View>
                </View>
              )}

              {purchaseOrder.status === 'SENT' && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#0D9488' }]} />
                  <View style={styles.timelineContent}>
                    <ThemedText type="defaultSemiBold">Sent to Supplier</ThemedText>
                    <ThemedText type="default" style={{ color: textMutedColor }}>
                      {purchaseOrder.vendorName}
                    </ThemedText>
                  </View>
                </View>
              )}

              {purchaseOrder.deliveryDate && (
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, { backgroundColor: '#0D9488' }]} />
                  <View style={styles.timelineContent}>
                    <ThemedText type="defaultSemiBold">Delivered</ThemedText>
                    <ThemedText type="default" style={{ color: textMutedColor }}>
                      {new Date(purchaseOrder.deliveryDate).toLocaleString()}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </Section>
        )}
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  smallBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  noteBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemDetails: {
    marginTop: 12,
    gap: 8,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receivedBar: {
  },
  receivedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    paddingBottom: 16,
    position: 'relative',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
});
