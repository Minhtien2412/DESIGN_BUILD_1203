/**
 * Project Expenses Screen
 * ========================
 * 
 * Track project expenses, receipts, and budgets
 */

import { useThemeColor } from '@/hooks/use-theme-color';
import { useExpenses } from '@/hooks/usePerfexAPI';
import type { Expense } from '@/types/perfex';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const EXPENSE_CATEGORIES = [
  { id: '1', name: 'Materials', icon: 'construct' },
  { id: '2', name: 'Labor', icon: 'people' },
  { id: '3', name: 'Equipment', icon: 'hardware-chip' },
  { id: '4', name: 'Travel', icon: 'car' },
  { id: '5', name: 'Meals', icon: 'restaurant' },
  { id: '6', name: 'Other', icon: 'ellipsis-horizontal' },
];

export default function ExpensesScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  
  const { 
    expenses, 
    stats, 
    loading, 
    error, 
    refresh, 
    createExpense, 
    updateExpense, 
    deleteExpense 
  } = useExpenses();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterBillable, setFilterBillable] = useState<boolean | null>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const cardBg = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');

  // Loading state
  if (loading && expenses.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Expenses</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={[styles.emptyText, { color: textColor, marginTop: 16 }]}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textColor }]}>Expenses</Text>
          <TouchableOpacity onPress={refresh}>
            <Ionicons name="refresh" size={22} color={primaryColor} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={{ color: '#EF4444', marginTop: 16, fontSize: 16 }}>Lỗi tải dữ liệu</Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 12 }}>
            <Text style={{ color: primaryColor, fontWeight: '600' }}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCreate = async (data: {
    categoryId: string;
    amount: number;
    date: Date;
    note: string;
    billable: boolean;
  }) => {
    try {
      await createExpense({
        expense_name: data.note || 'Expense',
        amount: String(data.amount),
        category: data.categoryId,
        date: data.date.toISOString().split('T')[0],
        note: data.note,
        billable: data.billable ? '1' : '0',
      });
      Alert.alert('Success', 'Expense added');
      setShowCreateModal(false);
      await refresh();
    } catch (err) {
      console.error('Create expense error:', err);
      Alert.alert('Error', 'Failed to add expense');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (filterBillable === null) return true;
    return (expense.billable === '1') === filterBillable;
  });

  const getTotalExpenses = () => {
    return filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
  };

  const getBillableExpenses = () => {
    return expenses
      .filter(e => e.billable === '1')
      .reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
  };

  const getInvoicedExpenses = () => {
    return expenses
      .filter(e => e.invoiceid)
      .reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
  };

  const getCategoryIcon = (categoryId: string) => {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return category?.icon || 'cash';
  };

  const getCategoryName = (categoryId: string) => {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderExpense = ({ item }: { item: Expense }) => (
    <View style={[styles.expenseCard, { backgroundColor: cardBg, borderColor }]}>
      <View style={styles.expenseHeader}>
        <View style={[styles.iconCircle, { backgroundColor: primaryColor + '20' }]}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={24} color={primaryColor} />
        </View>
        
        <View style={styles.expenseInfo}>
          <View style={styles.expenseTop}>
            <Text style={[styles.expenseCategory, { color: textColor }]}>
              {getCategoryName(item.category)}
            </Text>
            <Text style={[styles.expenseAmount, { color: primaryColor }]}>
              {formatCurrency(parseFloat(item.amount || '0'))}
            </Text>
          </View>
          
          {item.note && (
            <Text style={[styles.expenseNote, { color: textColor }]} numberOfLines={2}>
              {item.note}
            </Text>
          )}
          
          <View style={styles.expenseMeta}>
            <Text style={[styles.expenseDate, { color: textColor }]}>
              {new Date(item.date).toLocaleDateString()}
            </Text>
            
            {item.billable === '1' && (
              <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
                <Text style={[styles.badgeText, { color: '#22c55e' }]}>Billable</Text>
              </View>
            )}
            
            {item.invoiceid && (
              <View style={[styles.badge, { backgroundColor: '#0D948820' }]}>
                <Text style={[styles.badgeText, { color: '#0D9488' }]}>Invoiced</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={primaryColor} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Expenses</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add-circle" size={28} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: cardBg }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Total</Text>
              <Text style={[styles.statValue, { color: primaryColor }]}>
                {formatCurrency(getTotalExpenses())}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Billable</Text>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>
                {formatCurrency(getBillableExpenses())}
              </Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Invoiced</Text>
              <Text style={[styles.statValue, { color: '#0D9488' }]}>
                {formatCurrency(getInvoicedExpenses())}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: textColor }]}>Pending</Text>
              <Text style={[styles.statValue, { color: '#f59e0b' }]}>
                {formatCurrency(getBillableExpenses() - getInvoicedExpenses())}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor },
              filterBillable === null && { backgroundColor: primaryColor },
            ]}
            onPress={() => setFilterBillable(null)}
          >
            <Text
              style={[
                styles.filterText,
                { color: textColor },
                filterBillable === null && { color: '#fff' },
              ]}
            >
              All ({expenses.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor },
              filterBillable === true && { backgroundColor: '#22c55e' },
            ]}
            onPress={() => setFilterBillable(true)}
          >
            <Text
              style={[
                styles.filterText,
                { color: textColor },
                filterBillable === true && { color: '#fff' },
              ]}
            >
              Billable ({expenses.filter(e => e.billable === '1').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterChip,
              { borderColor },
              filterBillable === false && { backgroundColor: '#6b7280' },
            ]}
            onPress={() => setFilterBillable(false)}
          >
            <Text
              style={[
                styles.filterText,
                { color: textColor },
                filterBillable === false && { color: '#fff' },
              ]}
            >
              Non-billable ({expenses.filter(e => e.billable !== '1').length})
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Expenses List */}
        <FlatList
          data={filteredExpenses}
          renderItem={renderExpense}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="receipt-outline" size={64} color="#6b7280" />
              <Text style={[styles.emptyText, { color: textColor }]}>
                No expenses recorded
              </Text>
            </View>
          }
        />
      </ScrollView>

      <CreateExpenseModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        backgroundColor={backgroundColor}
        cardBg={cardBg}
        textColor={textColor}
        primaryColor={primaryColor}
        borderColor={borderColor}
      />
    </SafeAreaView>
  );
}

// Create Expense Modal
interface CreateExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    categoryId: string;
    amount: number;
    date: Date;
    note: string;
    billable: boolean;
  }) => void;
  backgroundColor: string;
  cardBg: string;
  textColor: string;
  primaryColor: string;
  borderColor: string;
}

function CreateExpenseModal({
  visible,
  onClose,
  onSubmit,
  backgroundColor,
  cardBg,
  textColor,
  primaryColor,
  borderColor,
}: CreateExpenseModalProps) {
  const [categoryId, setCategoryId] = useState('1');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [billable, setBillable] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter valid amount');
      return;
    }
    onSubmit({ categoryId, amount: amountNum, date, note, billable });
    setAmount('');
    setNote('');
    setBillable(true);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              New Expense
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: textColor }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  { borderColor },
                  categoryId === cat.id && { backgroundColor: primaryColor },
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={20}
                  color={categoryId === cat.id ? '#fff' : textColor}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: textColor },
                    categoryId === cat.id && { color: '#fff' },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Amount (VND)"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <TouchableOpacity
            style={[styles.dateButton, { borderColor }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color={textColor} />
            <Text style={[styles.dateButtonText, { color: textColor }]}>
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          <TextInput
            style={[styles.input, styles.textArea, { color: textColor, borderColor }]}
            placeholder="Note / Description"
            placeholderTextColor="#6b7280"
            multiline
            numberOfLines={3}
            value={note}
            onChangeText={setNote}
          />

          <TouchableOpacity
            style={[styles.checkboxRow, { borderColor }]}
            onPress={() => setBillable(!billable)}
          >
            <Ionicons
              name={billable ? 'checkbox' : 'square-outline'}
              size={24}
              color={billable ? primaryColor : '#6b7280'}
            />
            <Text style={[styles.checkboxLabel, { color: textColor }]}>
              Billable to client
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: primaryColor }]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  expenseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseInfo: {
    flex: 1,
  },
  expenseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  expenseCategory: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  expenseNote: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  expenseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  expenseDate: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  checkboxLabel: {
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
