import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Mock data - Construction standards and prices
const MATERIAL_STANDARDS = [
  {
    id: 1,
    category: 'Xi măng',
    items: [
      {
        name: 'Xi măng PCB40',
        unit: 'kg',
        standard: '350-400 kg/m³ bê tông',
        description: 'Dùng cho công trình dân dụng, móng, cột, dầm',
      },
      {
        name: 'Xi măng PCB30',
        unit: 'kg',
        standard: '300-350 kg/m³ bê tông',
        description: 'Dùng cho tường, sàn, công trình nhẹ',
      },
    ],
  },
  {
    id: 2,
    category: 'Cát',
    items: [
      {
        name: 'Cát vàng',
        unit: 'm³',
        standard: '0.4-0.5 m³/m³ bê tông',
        description: 'Cát sông, hạt vừa, không lẫn bùn đất',
      },
      {
        name: 'Cát xây',
        unit: 'm³',
        standard: '1.2-1.4 m³/100m² tường',
        description: 'Dùng xây tường, trát',
      },
    ],
  },
  {
    id: 3,
    category: 'Đá',
    items: [
      {
        name: 'Đá 1x2',
        unit: 'm³',
        standard: '0.8-0.9 m³/m³ bê tông',
        description: 'Dùng đổ bê tông móng, cột, dầm, sàn',
      },
      {
        name: 'Đá 4x6',
        unit: 'm³',
        standard: '0.6-0.7 m³/m³ bê tông',
        description: 'Dùng đổ bê tông nhẹ, lót móng',
      },
    ],
  },
];

const LABOR_PRICES = [
  {
    id: 1,
    category: 'Thợ xây',
    items: [
      {
        name: 'Xây tường gạch',
        unit: 'm²',
        price: '80.000 - 120.000₫',
        region: 'Miền Bắc',
        note: 'Giá tùy độ dày tường và loại gạch',
      },
      {
        name: 'Xây tường gạch',
        unit: 'm²',
        price: '100.000 - 150.000₫',
        region: 'Miền Nam',
        note: 'Bao gồm vật tư phụ, không bao xi măng cát',
      },
      {
        name: 'Trát tường',
        unit: 'm²',
        price: '40.000 - 60.000₫',
        region: 'Toàn quốc',
        note: 'Trát 2 lớp, bóng láng',
      },
    ],
  },
  {
    id: 2,
    category: 'Thợ coffa',
    items: [
      {
        name: 'Đóng ván khuôn móng',
        unit: 'm²',
        price: '80.000 - 100.000₫',
        region: 'Toàn quốc',
        note: 'Bao công cả tháo dỡ',
      },
      {
        name: 'Đóng ván khuôn cột',
        unit: 'm²',
        price: '100.000 - 120.000₫',
        region: 'Toàn quốc',
        note: 'Công tác phức tạp hơn móng',
      },
    ],
  },
  {
    id: 3,
    category: 'Thợ điện nước',
    items: [
      {
        name: 'Lắp đặt điện',
        unit: 'điểm',
        price: '150.000 - 200.000₫',
        region: 'Toàn quốc',
        note: 'Bao gồm đục rãnh, luồn dây, lắp đặt',
      },
      {
        name: 'Lắp đặt nước',
        unit: 'điểm',
        price: '200.000 - 250.000₫',
        region: 'Toàn quốc',
        note: 'Ống PPR, bao thử áp',
      },
    ],
  },
];

const BUILDING_CODES = [
  {
    id: 1,
    code: 'TCVN 2737:1995',
    title: 'Tải trọng và tác động - Tiêu chuẩn thiết kế',
    category: 'Kết cấu',
    description:
      'Quy định về tĩnh tải, hoạt tải, tải trọng gió, động đất cho thiết kế công trình',
  },
  {
    id: 2,
    code: 'TCXDVN 356:2005',
    title: 'Kết cấu bê tông và bê tông cốt thép',
    category: 'Kết cấu',
    description: 'Tiêu chuẩn thiết kế kết cấu bê tông cốt thép',
  },
  {
    id: 3,
    code: 'QCVN 06:2021',
    title: 'Quy chuẩn an toàn cháy cho nhà và công trình',
    category: 'PCCC',
    description: 'Yêu cầu về phòng cháy chữa cháy, lối thoát hiểm',
  },
  {
    id: 4,
    code: 'TCXDVN 362:2005',
    title: 'Quy hoạch xây dựng - Đô thị',
    category: 'Quy hoạch',
    description: 'Tiêu chuẩn về mật độ xây dựng, tỷ lệ xây dựng, chiều cao',
  },
];

const TABS = [
  { id: 'area', name: 'Tính diện tích', icon: 'calculator-outline' },
  { id: 'standards', name: 'Định mức', icon: 'document-text-outline' },
  { id: 'prices', name: 'Giá nhân công', icon: 'cash-outline' },
  { id: 'codes', name: 'Quy chuẩn', icon: 'book-outline' },
];

interface AccordionItemProps {
  item: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isExpanded, onToggle }) => {
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
          <View style={styles.accordionTitleSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="cube-outline" size={20} color={Colors.light.primary} />
          </View>
          <Text style={styles.accordionTitle}>{item.category || item.code}</Text>
        </View>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#999"
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.accordionContent}>
          {item.items ? (
            // Material standards or labor prices
            item.items.map((subItem: any, idx: number) => (
              <View key={idx} style={styles.subItem}>
                <View style={styles.subItemHeader}>
                  <Text style={styles.subItemName}>{subItem.name}</Text>
                  <View style={styles.unitBadge}>
                    <Text style={styles.unitText}>{subItem.unit}</Text>
                  </View>
                </View>
                <View style={styles.subItemRow}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.light.success} />
                  <Text style={styles.subItemStandard}>
                    {subItem.standard || subItem.price}
                  </Text>
                </View>
                {subItem.region && (
                  <View style={styles.subItemRow}>
                    <Ionicons name="location" size={16} color={Colors.light.info} />
                    <Text style={styles.subItemRegion}>{subItem.region}</Text>
                  </View>
                )}
                <Text style={styles.subItemDescription}>
                  {subItem.description || subItem.note}
                </Text>
              </View>
            ))
          ) : (
            // Building codes
            <View style={styles.codeDetail}>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Tiêu đề:</Text>
                <Text style={styles.codeValue}>{item.title}</Text>
              </View>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Lĩnh vực:</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>
              <View style={styles.codeRow}>
                <Text style={styles.codeLabel}>Mô tả:</Text>
                <Text style={styles.codeDescription}>{item.description}</Text>
              </View>
              <TouchableOpacity style={styles.downloadButton}>
                <Ionicons name="download-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.downloadButtonText}>Tải tài liệu</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function ConstructionLookupScreen() {
  const [activeTab, setActiveTab] = useState('area');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // Area calculator state
  const [length, setLength] = useState<string>('10'); // m
  const [width, setWidth] = useState<string>('5'); // m
  const [floors, setFloors] = useState<string>('2'); // count
  const [setbackFront, setSetbackFront] = useState<string>('0');
  const [setbackBack, setSetbackBack] = useState<string>('0');
  const [setbackLeft, setSetbackLeft] = useState<string>('0');
  const [setbackRight, setSetbackRight] = useState<string>('0');
  const [mezzanine, setMezzanine] = useState<boolean>(false);
  const [roofType, setRoofType] = useState<'none' | 'slab' | 'tile'>('none');

  const getCurrentData = () => {
    switch (activeTab) {
      case 'standards':
        return MATERIAL_STANDARDS;
      case 'prices':
        return LABOR_PRICES;
      case 'codes':
        return BUILDING_CODES;
      default:
        return [];
    }
  };

  const filteredData = getCurrentData().filter((item: any) => {
    const searchLower = searchQuery.toLowerCase();
    if (activeTab === 'codes') {
      return (
        item.code.toLowerCase().includes(searchLower) ||
        item.title.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower)
      );
    } else {
      return item.category.toLowerCase().includes(searchLower);
    }
  });

  const handleToggle = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tra cứu xây dựng',
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Search Bar or Calculator Header */}
        {activeTab === 'area' ? (
          <View style={styles.searchSection}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#333' }}>
              Tính diện tích xây dựng
            </Text>
            <Text style={{ marginTop: 6, fontSize: 12, color: '#666' }}>
              Nhập kích thước lô đất và thông số công trình để ước tính tổng diện tích xây dựng.
            </Text>
          </View>
        ) : (
          <View style={styles.searchSection}>
            <View className="search-bar" style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder={
                  activeTab === 'codes'
                    ? 'Tìm mã quy chuẩn, tiêu đề...'
                    : 'Tìm kiếm vật tư, công việc...'
                }
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabs}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && styles.tabActive]}
                onPress={() => {
                  setActiveTab(tab.id);
                  setExpandedId(null);
                  setSearchQuery('');
                }}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={20}
                  color={activeTab === tab.id ? Colors.light.primary : '#999'}
                />
                <Text
                  style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#0066CC" />
          <Text style={styles.infoBannerText}>
            {activeTab === 'area' && 'Kết quả chỉ mang tính tham khảo, chưa thay thế hồ sơ thiết kế.'}
            {activeTab === 'standards' && 'Định mức vật tư tham khảo cho 1m³ bê tông'}
            {activeTab === 'prices' && 'Giá nhân công tham khảo, chưa bao gồm VAT'}
            {activeTab === 'codes' && 'Quy chuẩn và tiêu chuẩn xây dựng Việt Nam'}
          </Text>
        </View>

        {/* Content */}
        {activeTab === 'area' ? (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Calculator form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Thông số lô đất (m)</Text>
              <View style={styles.row2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Chiều dài</Text>
                  <TextInput keyboardType="numeric" value={length} onChangeText={setLength} style={styles.input} placeholder="VD: 10" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Chiều rộng</Text>
                  <TextInput keyboardType="numeric" value={width} onChangeText={setWidth} style={styles.input} placeholder="VD: 5" />
                </View>
              </View>

              <Text style={[styles.cardTitle, { marginTop: 16 }]}>Khoảng lùi (m)</Text>
              <View style={styles.row2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Trước</Text>
                  <TextInput keyboardType="numeric" value={setbackFront} onChangeText={setSetbackFront} style={styles.input} placeholder="0" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Sau</Text>
                  <TextInput keyboardType="numeric" value={setbackBack} onChangeText={setSetbackBack} style={styles.input} placeholder="0" />
                </View>
              </View>
              <View style={styles.row2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Trái</Text>
                  <TextInput keyboardType="numeric" value={setbackLeft} onChangeText={setSetbackLeft} style={styles.input} placeholder="0" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Phải</Text>
                  <TextInput keyboardType="numeric" value={setbackRight} onChangeText={setSetbackRight} style={styles.input} placeholder="0" />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Cấu hình công trình</Text>
              <View style={styles.row2}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Số tầng</Text>
                  <TextInput keyboardType="numeric" value={floors} onChangeText={setFloors} style={styles.input} placeholder="VD: 2" />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Sân thượng</Text>
                  <View style={styles.chipsRow}>
                    {(['none','slab','tile'] as const).map(rt => (
                      <TouchableOpacity key={rt} onPress={() => setRoofType(rt)} style={[styles.chip, roofType===rt && styles.chipActive]}>
                        <Text style={[styles.chipText, roofType===rt && styles.chipTextActive]}>
                          {rt==='none'?'Không':rt==='slab'?'BTCT 50%':'Mái ngói 30%'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.label}>Tầng lửng</Text>
                <View style={styles.chipsRow}>
                  <TouchableOpacity onPress={() => setMezzanine(false)} style={[styles.chip, !mezzanine && styles.chipActive]}>
                    <Text style={[styles.chipText, !mezzanine && styles.chipTextActive]}>Không</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setMezzanine(true)} style={[styles.chip, mezzanine && styles.chipActive]}>
                    <Text style={[styles.chipText, mezzanine && styles.chipTextActive]}>Có (70%)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Results */}
            <AreaResult
              length={length}
              width={width}
              floors={floors}
              setbackFront={setbackFront}
              setbackBack={setbackBack}
              setbackLeft={setbackLeft}
              setbackRight={setbackRight}
              mezzanine={mezzanine}
              roofType={roofType}
            />

            <View style={{ height: 20 }} />
          </ScrollView>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {filteredData.map((item) => (
              <AccordionItem
                key={item.id}
                item={item}
                isExpanded={expandedId === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}

            {filteredData.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Không tìm thấy kết quả</Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.resetButtonText}>Xóa tìm kiếm</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        )}

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Ionicons name="alert-circle-outline" size={16} color="#0066CC" />
          <Text style={styles.bottomInfoText}>
            Thông tin mang tính chất tham khảo. Liên hệ chuyên gia để được tư vấn chi tiết.
          </Text>
        </View>
      </View>
    </>
  );
}

// --- Calculator helper + UI ---
type AreaProps = {
  length: string;
  width: string;
  floors: string;
  setbackFront: string;
  setbackBack: string;
  setbackLeft: string;
  setbackRight: string;
  mezzanine: boolean;
  roofType: 'none' | 'slab' | 'tile';
};

const clamp0 = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

function computeArea(p: AreaProps) {
  const L = clamp0(parseFloat(p.length));
  const W = clamp0(parseFloat(p.width));
  const F = Math.max(0, Math.floor(parseFloat(p.floors) || 0));
  const sf = clamp0(parseFloat(p.setbackFront));
  const sb = clamp0(parseFloat(p.setbackBack));
  const sl = clamp0(parseFloat(p.setbackLeft));
  const sr = clamp0(parseFloat(p.setbackRight));

  const effL = Math.max(0, L - (sf + sb));
  const effW = Math.max(0, W - (sl + sr));
  const floorArea = effL * effW; // m2

  const mezz = p.mezzanine ? 0.7 * floorArea : 0;
  const roof = p.roofType === 'slab' ? 0.5 * floorArea : p.roofType === 'tile' ? 0.3 * floorArea : 0;
  const total = floorArea * F + mezz + roof;

  return { effL, effW, floorArea, mezz, roof, total };
}

const AreaResult: React.FC<AreaProps> = (props) => {
  const result = useMemo(() => computeArea(props), [props.length, props.width, props.floors, props.setbackFront, props.setbackBack, props.setbackLeft, props.setbackRight, props.mezzanine, props.roofType]);
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Kết quả ước tính</Text>
      <View style={styles.resultRow}>
        <Ionicons name="resize-outline" size={18} color={Colors.light.primary} />
        <Text style={styles.resultText}>Kích thước hiệu dụng: {result.effW.toFixed(2)} x {result.effL.toFixed(2)} m</Text>
      </View>
      <View style={styles.resultRow}>
        <Ionicons name="grid-outline" size={18} color={Colors.light.primary} />
        <Text style={styles.resultText}>Diện tích 1 sàn: {result.floorArea.toFixed(2)} m²</Text>
      </View>
      {props.mezzanine && (
        <View style={styles.resultRow}>
          <Ionicons name="layers-outline" size={18} color={Colors.light.primary} />
          <Text style={styles.resultText}>Tầng lửng (70%): {result.mezz.toFixed(2)} m²</Text>
        </View>
      )}
      {props.roofType !== 'none' && (
        <View style={styles.resultRow}>
          <Ionicons name="home-outline" size={18} color={Colors.light.primary} />
          <Text style={styles.resultText}>Mái ({props.roofType === 'slab' ? 'BTCT 50%' : 'Ngói 30%'}): {result.roof.toFixed(2)} m²</Text>
        </View>
      )}
      <View style={[styles.resultRow, { marginTop: 6 }]}> 
        <Ionicons name="calculator-outline" size={18} color={Colors.light.success} />
        <Text style={[styles.resultText, { fontWeight: '700', color: '#111' }]}>Tổng diện tích: {result.total.toFixed(2)} m²</Text>
      </View>
      <Text style={{ marginTop: 8, fontSize: 12, color: '#777' }}>
        Lưu ý: Công thức tham khảo (tầng lửng 70%, sân thượng BTCT 50%, mái ngói 30%). Quy chuẩn có thể thay đổi theo địa phương và hồ sơ thiết kế.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    marginLeft: 6,
  },
  tabTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  infoBanner: {
    backgroundColor: '#E8F4FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 8,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: '#1976d2',
    marginLeft: 8,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  accordionItem: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.chipBackground,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  subItem: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  subItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  subItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  unitBadge: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unitText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1976d2',
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subItemStandard: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066CC',
    marginLeft: 6,
  },
  subItemRegion: {
    fontSize: 13,
    color: '#0066CC',
    marginLeft: 6,
  },
  subItemDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginTop: 4,
  },
  codeDetail: {
    paddingTop: 12,
  },
  codeRow: {
    marginBottom: 12,
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    lineHeight: 20,
  },
  categoryBadge: {
    backgroundColor: Colors.light.chipBackground,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.success,
  },
  codeDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.chipBackground,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    marginTop: 16,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bottomInfoText: {
    flex: 1,
    fontSize: 11,
    color: '#0066CC',
    marginLeft: 8,
    lineHeight: 16,
  },
  // --- Calculator styles ---
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
  },
  row2: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    color: '#333',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#E8F4FF',
    borderColor: '#90caf9',
  },
  chipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#1976d2',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  resultText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
});
