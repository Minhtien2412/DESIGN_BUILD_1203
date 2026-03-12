import Badge from '@/components/ui/badge';
import Tabs from '@/components/ui/tabs';
import PortfolioDocsService, {
    type SpecItem,
    type SpecificationGroup,
    MOCK_SPECS,
} from '@/services/portfolioDocsService';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

// Types imported from portfolioDocsService

const TabContent = ({ specs }: { specs: SpecItem[] }) => (
  <View>
    {specs.map((spec, index) => (
      <View key={index} style={styles.specCard}>
        <View style={styles.specHeader}>
          <Text style={styles.category}>{spec.category}</Text>
          <Badge variant="neutral" size="sm">
            <Text style={{ fontSize: 11 }}>{spec.standard}</Text>
          </Badge>
        </View>
        
        <View style={styles.specRow}>
          <Text style={styles.label}>Hạng mục:</Text>
          <Text style={styles.value}>{spec.item}</Text>
        </View>
        
        <View style={styles.specRow}>
          <Text style={styles.label}>Quy cách:</Text>
          <Text style={styles.value}>{spec.specification}</Text>
        </View>
        
        {spec.note && (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>Ghi chú: {spec.note}</Text>
          </View>
        )}
      </View>
    ))}
  </View>
);

export default function SpecScreen() {
  const [activeTab, setActiveTab] = React.useState('structure');
  const [specs, setSpecs] = React.useState<SpecificationGroup>(MOCK_SPECS); // Start with mock
  const [loading, setLoading] = React.useState(false); // Don't block
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchSpecs = React.useCallback(async () => {
    try {
      const data = await PortfolioDocsService.getSpecifications();
      if (Object.keys(data).length > 0) {
        setSpecs(data);
      }
    } catch (err) {
      console.warn('Error fetching specs, using mock data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    // Fetch in background
    const timer = setTimeout(() => {
      fetchSpecs();
    }, 100);
    return () => clearTimeout(timer);
  }, [fetchSpecs]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSpecs();
  }, [fetchSpecs]);

  const tabs = [
    { key: 'structure', label: 'Kết cấu' },
    { key: 'finishing', label: 'Hoàn thiện' },
    { key: 'mep', label: 'Điện nước' },
  ];

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Bảng Spec Hoàn Thiện',
          headerBackTitle: 'Quay lại',
        }}
      />
      
      <View style={styles.container}>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0D9488" />
          </View>
        ) : (
          <ScrollView
            style={styles.tabContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {activeTab === 'structure' && <TabContent specs={specs['Kết cấu'] || []} />}
            {activeTab === 'finishing' && <TabContent specs={specs['Hoàn thiện'] || []} />}
            {activeTab === 'mep' && <TabContent specs={specs['Điện nước'] || []} />}
          </ScrollView>
        )}
      </View>
    </>
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
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  specCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  specHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  category: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0D9488',
  },
  specRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  noteBox: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0D9488',
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
});
