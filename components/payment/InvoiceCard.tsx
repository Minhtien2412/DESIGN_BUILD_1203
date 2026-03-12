/**
 * Invoice Card Component
 * Reusable card for displaying invoice/payment details
 * 
 * Features:
 * - Status badge with color coding
 * - Amount display with currency formatting
 * - Payment method icon
 * - Due date countdown
 * - Quick actions (pay, view, remind)
 * - Tap to view details
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import {
    Payment,
    formatCurrency,
    getPaymentMethodIcon,
    getPaymentMethodLabel,
    getPaymentStatusColor,
    getPaymentStatusLabel,
} from '@/services/payment-api';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ============================================================================
// Types
// ============================================================================

interface InvoiceCardProps {
  payment: Payment;
  onPress?: (payment: Payment) => void;
  onPay?: (payment: Payment) => void;
  onRemind?: (payment: Payment) => void;
  showActions?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function InvoiceCard({
  payment,
  onPress,
  onPay,
  onRemind,
  showActions = true,
}: InvoiceCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // ============================================================================
  // Calculations
  // ============================================================================

  const statusColor = getPaymentStatusColor(payment.status);
  const statusLabel = getPaymentStatusLabel(payment.status);
  const methodLabel = getPaymentMethodLabel(payment.method);
  const methodIcon = getPaymentMethodIcon(payment.method);

  // Calculate days since created (for overdue warning)
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(payment.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const isOverdue = payment.status === 'pending' && daysSinceCreated > 30;

  // Format date
  const createdDate = new Date(payment.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // ============================================================================
  // Handlers
  // ============================================================================

  const handlePress = () => {
    onPress?.(payment);
  };

  const handlePay = (e: any) => {
    e.stopPropagation();
    onPay?.(payment);
  };

  const handleRemind = (e: any) => {
    e.stopPropagation();
    onRemind?.(payment);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: '#FFF' }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
          {isOverdue && (
            <View style={styles.overdueWarning}>
              <Ionicons name="warning" size={14} color="#000000" />
              <Text style={styles.overdueText}>Quá hạn</Text>
            </View>
          )}
        </View>
        <View style={styles.methodBadge}>
          <Ionicons name={methodIcon as any} size={16} color="#6B7280" />
          <Text style={styles.methodText}>{methodLabel}</Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Số tiền</Text>
        <Text style={styles.amount}>
          {formatCurrency(payment.amount, payment.currency)}
        </Text>
      </View>

      {/* Description */}
      {payment.description && (
        <Text style={styles.description} numberOfLines={2}>
          {payment.description}
        </Text>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
          <Text style={styles.dateText}>{createdDate}</Text>
          {daysSinceCreated > 0 && (
            <Text style={styles.daysText}>({daysSinceCreated} ngày trước)</Text>
          )}
        </View>

        {/* Action Buttons */}
        {showActions && (
          <View style={styles.actions}>
            {payment.status === 'pending' && onPay && (
              <TouchableOpacity
                style={[styles.actionButton, styles.payButton]}
                onPress={handlePay}
              >
                <Ionicons name="card" size={16} color="#FFF" />
                <Text style={styles.payButtonText}>Thanh toán</Text>
              </TouchableOpacity>
            )}
            {payment.status === 'pending' && onRemind && daysSinceCreated > 7 && (
              <TouchableOpacity
                style={[styles.actionButton, styles.remindButton]}
                onPress={handleRemind}
              >
                <Ionicons name="notifications-outline" size={16} color="#0D9488" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Transaction ID (if available) */}
      {payment.transactionId && (
        <View style={styles.transactionInfo}>
          <Ionicons name="receipt-outline" size={12} color="#9CA3AF" />
          <Text style={styles.transactionId}>ID: {payment.transactionId}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  overdueWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000000',
  },
  methodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  methodText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  amountSection: {
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
  },
  daysText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payButton: {
    backgroundColor: '#0D9488',
  },
  payButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
  remindButton: {
    backgroundColor: '#F0FDFA',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  transactionId: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
});
