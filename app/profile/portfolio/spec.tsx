import Badge from '@/components/ui/badge';
import Tabs from '@/components/ui/tabs';
import { Stack } from 'expo-router';
import * as React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type SpecItem = {
  category: string;
  item: string;
  specification: string;
  standard: string;
  note?: string;
};

const MOCK_SPECS: { [key: string]: SpecItem[] } = {
  'Kết cấu': [
    {
      category: 'Móng',
      item: 'Bê tông móng',
      specification: 'Bê tông M250',
      standard: 'TCVN 3118:2021',
      note: 'Sử dụng xi măng PCB40',
    },
    {
      category: 'Cột',
      item: 'Bê tông cột',
      specification: 'Bê tông M300',
      standard: 'TCVN 3118:2021',
    },
    {
      category: 'Dầm',
      item: 'Bê tông dầm',
      specification: 'Bê tông M300',
      standard: 'TCVN 3118:2021',
    },
  ],
  'Hoàn thiện': [
    {
      category: 'Sàn',
      item: 'Gạch lát sàn',
      specification: 'Gạch granite 60x60cm',
      standard: 'TCVN 6855:2016',
      note: 'Màu kem, chống trơn',
    },
    {
      category: 'Tường',
      item: 'Sơn tường',
      specification: 'Sơn Dulux nội thất cao cấp',
      standard: 'ISO 9001:2015',
      note: 'Màu trắng sữa',
    },
    {
      category: 'Trần',
      item: 'Trần thạch cao',
      specification: 'Tấm Gyproc 12mm',
      standard: 'TCVN 7398:2017',
    },
  ],
  'Điện nước': [
    {
      category: 'Điện',
      item: 'Dây dẫn điện',
      specification: 'Dây Cadivi 2x2.5mm²',
      standard: 'TCVN 6610:2013',
    },
    {
      category: 'Nước',
      item: 'Ống cấp nước',
      specification: 'Ống PPR Tiền Phong Φ21',
      standard: 'TCVN 6151:2009',
    },
    {
      category: 'Thiết bị vệ sinh',
      item: 'Bồn cầu',
      specification: 'TOTO CW818W',
      standard: 'ISO 9001',
      note: 'Xả nhấn, tiết kiệm nước',
    },
  ],
};

const TabContent = ({ specs }: { specs: SpecItem[] }) => (
  <ScrollView style={styles.tabContent}>
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
  </ScrollView>
);

export default function SpecScreen() {
  const [activeTab, setActiveTab] = React.useState('structure');

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
        
        {activeTab === 'structure' && <TabContent specs={MOCK_SPECS['Kết cấu']} />}
        {activeTab === 'finishing' && <TabContent specs={MOCK_SPECS['Hoàn thiện']} />}
        {activeTab === 'mep' && <TabContent specs={MOCK_SPECS['Điện nước']} />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    color: '#3B82F6',
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
    borderLeftColor: '#F59E0B',
  },
  noteText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
});
