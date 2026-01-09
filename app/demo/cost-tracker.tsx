/**
 * Cost Tracker Demo Screen
 * Demonstrates the Cost Tracker component with sample data
 */

import { Stack } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { AlertProvider } from '../../components/ui';
import CostTracker, { BudgetCategory, CostItem } from '../../components/ui/cost-tracker';
import { SpacingSemantic } from '../../constants/spacing';
import { useThemeColor } from '../../hooks/use-theme-color';

// ============================================
// SAMPLE DATA
// ============================================

const sampleCategories: BudgetCategory[] = [
  {
    id: '1',
    name: 'Materials',
    budgeted: 50000,
    spent: 35000,
    color: '#3B82F6',
    icon: 'cube-outline',
  },
  {
    id: '2',
    name: 'Labor',
    budgeted: 80000,
    spent: 72000,
    color: '#0066CC',
    icon: 'people-outline',
  },
  {
    id: '3',
    name: 'Equipment',
    budgeted: 30000,
    spent: 28500,
    color: '#0066CC',
    icon: 'build-outline',
  },
  {
    id: '4',
    name: 'Permits & Fees',
    budgeted: 15000,
    spent: 16200,
    color: '#000000',
    icon: 'document-text-outline',
  },
  {
    id: '5',
    name: 'Transportation',
    budgeted: 10000,
    spent: 5400,
    color: '#666666',
    icon: 'car-outline',
  },
];

const sampleTransactions: CostItem[] = [
  {
    id: '1',
    category: 'Materials',
    description: 'Cement and aggregates',
    amount: 8500,
    date: 'Nov 1, 2025',
    type: 'expense',
    status: 'paid',
  },
  {
    id: '2',
    category: 'Labor',
    description: 'Weekly payroll - Construction crew',
    amount: 12000,
    date: 'Oct 31, 2025',
    type: 'expense',
    status: 'paid',
  },
  {
    id: '3',
    category: 'Equipment',
    description: 'Excavator rental - Week 4',
    amount: 3500,
    date: 'Oct 30, 2025',
    type: 'expense',
    status: 'approved',
  },
  {
    id: '4',
    category: 'Permits & Fees',
    description: 'Building permit extension',
    amount: 1200,
    date: 'Oct 29, 2025',
    type: 'expense',
    status: 'pending',
  },
  {
    id: '5',
    category: 'Materials',
    description: 'Steel reinforcement bars',
    amount: 15000,
    date: 'Oct 28, 2025',
    type: 'expense',
    status: 'paid',
  },
  {
    id: '6',
    category: 'Transportation',
    description: 'Material delivery - Batch 3',
    amount: 800,
    date: 'Oct 27, 2025',
    type: 'expense',
    status: 'paid',
  },
  {
    id: '7',
    category: 'Payment',
    description: 'Client milestone payment',
    amount: 50000,
    date: 'Oct 25, 2025',
    type: 'income',
    status: 'approved',
  },
];

// Calculate totals
const totalBudget = sampleCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
const totalSpent = sampleCategories.reduce((sum, cat) => sum + cat.spent, 0);

// ============================================
// MAIN COMPONENT
// ============================================

export default function CostTrackerDemo() {
  const background = useThemeColor({}, 'background');

  const handleAddExpense = () => {
    console.log('Add expense clicked');
    // In a real app, navigate to expense form or open modal
  };

  const handleViewCategoryDetails = (categoryId: string) => {
    console.log('View category details:', categoryId);
    // In a real app, navigate to category detail screen
  };

  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'Cost Tracker Demo',
          headerShown: true,
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: background }]}
        contentContainerStyle={styles.content}
      >
        <CostTracker
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          categories={sampleCategories}
          recentTransactions={sampleTransactions}
          onAddExpense={handleAddExpense}
          onViewDetails={handleViewCategoryDetails}
        />
      </ScrollView>
    </AlertProvider>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: SpacingSemantic.md,
  },
});
