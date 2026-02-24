import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

// Calculator Types
const CALCULATOR_TYPES = [
  { id: 'paint', name: 'Sơn tường', icon: 'color-palette', unit: 'lít' },
  { id: 'tiles', name: 'Gạch lát', icon: 'grid', unit: 'm²' },
  { id: 'wood', name: 'Sàn gỗ', icon: 'leaf', unit: 'm²' },
  { id: 'wallpaper', name: 'Giấy dán', icon: 'document', unit: 'cuộn' },
  { id: 'concrete', name: 'Bê tông', icon: 'cube', unit: 'm³' },
  { id: 'steel', name: 'Thép', icon: 'barbell', unit: 'kg' },
];

// Room Types
const ROOM_TYPES = [
  { id: 'living', name: 'Phòng khách', avgArea: 25 },
  { id: 'bedroom', name: 'Phòng ngủ', avgArea: 16 },
  { id: 'kitchen', name: 'Nhà bếp', avgArea: 12 },
  { id: 'bathroom', name: 'Phòng tắm', avgArea: 8 },
  { id: 'balcony', name: 'Ban công', avgArea: 6 },
  { id: 'custom', name: 'Tùy chỉnh', avgArea: 0 },
];

export default function DesignCalculatorScreen() {
  const [selectedCalculator, setSelectedCalculator] = useState('paint');
  const [selectedRoom, setSelectedRoom] = useState('custom');
  
  // Paint Calculator States
  const [wallLength, setWallLength] = useState('');
  const [wallHeight, setWallHeight] = useState('');
  const [doorWidth, setDoorWidth] = useState('0.9');
  const [doorHeight, setDoorHeight] = useState('2.1');
  const [windowWidth, setWindowWidth] = useState('1.2');
  const [windowHeight, setWindowHeight] = useState('1.5');
  const [doorCount, setDoorCount] = useState('1');
  const [windowCount, setWindowCount] = useState('2');
  const [coats, setCoats] = useState('2');
  
  // Tiles Calculator States
  const [floorLength, setFloorLength] = useState('');
  const [floorWidth, setFloorWidth] = useState('');
  const [tileSize, setTileSize] = useState('60');
  const [wastePercent, setWastePercent] = useState('10');

  const currentCalculator = CALCULATOR_TYPES.find((c) => c.id === selectedCalculator);

  const calculatePaint = () => {
    const length = parseFloat(wallLength) || 0;
    const height = parseFloat(wallHeight) || 0;
    const dWidth = parseFloat(doorWidth) || 0;
    const dHeight = parseFloat(doorHeight) || 0;
    const wWidth = parseFloat(windowWidth) || 0;
    const wHeight = parseFloat(windowHeight) || 0;
    const dCount = parseInt(doorCount) || 0;
    const wCount = parseInt(windowCount) || 0;
    const layers = parseInt(coats) || 1;

    // Calculate wall area
    const wallArea = length * height;
    
    // Calculate openings area
    const doorArea = dWidth * dHeight * dCount;
    const windowArea = wWidth * wHeight * wCount;
    
    // Net area to paint
    const paintArea = wallArea - doorArea - windowArea;
    
    // Paint coverage (1 liter covers ~10m² per coat)
    const coverage = 10;
    const paintNeeded = (paintArea * layers) / coverage;
    
    // Add 10% buffer
    const paintWithBuffer = paintNeeded * 1.1;

    if (paintArea <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng kích thước');
      return;
    }

    Alert.alert(
      'Kết quả tính toán',
      `Diện tích tường: ${wallArea.toFixed(2)} m²\n` +
      `Diện tích cửa: ${(doorArea + windowArea).toFixed(2)} m²\n` +
      `Diện tích cần sơn: ${paintArea.toFixed(2)} m²\n\n` +
      `Số lượng sơn cần: ${paintWithBuffer.toFixed(2)} lít\n` +
      `(Đã tính ${layers} lớp và dự phòng 10%)`,
      [{ text: 'OK' }]
    );
  };

  const calculateTiles = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;
    const size = parseFloat(tileSize) || 60;
    const waste = parseFloat(wastePercent) || 10;

    // Floor area in m²
    const floorArea = length * width;
    
    // Tile area in m²
    const tileAreaCm = size * size;
    const tileAreaM = tileAreaCm / 10000;
    
    // Number of tiles needed
    const tilesNeeded = floorArea / tileAreaM;
    
    // Add waste percentage
    const tilesWithWaste = tilesNeeded * (1 + waste / 100);

    if (floorArea <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng kích thước');
      return;
    }

    Alert.alert(
      'Kết quả tính toán',
      `Diện tích sàn: ${floorArea.toFixed(2)} m²\n` +
      `Kích thước gạch: ${size}x${size} cm\n\n` +
      `Số viên gạch cần: ${Math.ceil(tilesWithWaste)} viên\n` +
      `(Đã tính thêm ${waste}% dự phòng)\n\n` +
      `Số m² gạch: ${(Math.ceil(tilesWithWaste) * tileAreaM).toFixed(2)} m²`,
      [{ text: 'OK' }]
    );
  };

  const calculateWood = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;
    const waste = parseFloat(wastePercent) || 10;

    const floorArea = length * width;
    
    // Sàn gỗ thường được bán theo m² (12-15mm thick)
    const woodAreaNeeded = floorArea * (1 + waste / 100);
    
    // Average cost per m² (example: 500k VND)
    const avgCostPerSqm = 500000;
    const totalCost = woodAreaNeeded * avgCostPerSqm;

    if (floorArea <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng kích thước');
      return;
    }

    Alert.alert(
      'Kết quả tính toán - Sàn gỗ',
      `Diện tích sàn: ${floorArea.toFixed(2)} m²\n\n` +
      `Diện tích gỗ cần: ${woodAreaNeeded.toFixed(2)} m²\n` +
      `(Đã tính thêm ${waste}% dự phòng)\n\n` +
      `Ước tính chi phí: ${totalCost.toLocaleString('vi-VN')} VND\n` +
      `(Giá trung bình 500k/m²)`,
      [{ text: 'OK' }]
    );
  };

  const calculateConcrete = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;
    const height = parseFloat(wallHeight) || 2.8; // Default thickness

    const volume = (length * width * height);
    
    // Add 5% waste
    const concreteNeeded = volume * 1.05;
    
    // Cement bags (30 bags per m³ for M200 concrete)
    const bags = Math.ceil(concreteNeeded * 30);
    
    // Cost estimation (180k per bag)
    const cost = bags * 180000;

    if (volume <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng kích thước');
      return;
    }

    Alert.alert(
      'Kết quả tính toán - Bê tông',
      `Kích thước: ${length}m × ${width}m × ${height}m\n` +
      `Thể tích: ${volume.toFixed(2)} m³\n\n` +
      `Bê tông cần: ${concreteNeeded.toFixed(2)} m³\n` +
      `(Đã tính thêm 5% dự phòng)\n\n` +
      `Số bao xi măng (M200): ${bags} bao\n` +
      `Ước tính chi phí: ${cost.toLocaleString('vi-VN')} VND`,
      [{ text: 'OK' }]
    );
  };

  const calculateSteel = () => {
    const length = parseFloat(floorLength) || 0;
    const width = parseFloat(floorWidth) || 0;

    const area = length * width;
    const spacing = 0.2; // 20cm spacing standard
    
    // Length bars
    const lengthBars = Math.ceil(width / spacing) * length;
    
    // Width bars  
    const widthBars = Math.ceil(length / spacing) * width;
    
    const totalLength = lengthBars + widthBars;
    
    // Weight (10mm rebar = 0.617kg/m)
    const weight = totalLength * 0.617;
    
    // Cost (18k per kg)
    const cost = weight * 18000;

    if (area <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng kích thước');
      return;
    }

    Alert.alert(
      'Kết quả tính toán - Thép D10',
      `Diện tích đan lưới: ${area.toFixed(2)} m²\n` +
      `Khoảng cách: ${spacing * 100}cm\n\n` +
      `Tổng chiều dài thép: ${totalLength.toFixed(2)} m\n` +
      `Trọng lượng (D10): ${weight.toFixed(2)} kg\n\n` +
      `Ước tính chi phí: ${cost.toLocaleString('vi-VN')} VND\n` +
      `(Giá 18k/kg)`,
      [{ text: 'OK' }]
    );
  };

  const calculateWallpaper = () => {
    const length = parseFloat(wallLength) || 0;
    const height = parseFloat(wallHeight) || 0;
    const dWidth = parseFloat(doorWidth) || 0;
    const dHeight = parseFloat(doorHeight) || 0;
    const wWidth = parseFloat(windowWidth) || 0;
    const wHeight = parseFloat(windowHeight) || 0;
    const dCount = parseInt(doorCount) || 0;
    const wCount = parseInt(windowCount) || 0;

    const wallArea = length * height;
    const doorArea = dWidth * dHeight * dCount;
    const windowArea = wWidth * wHeight * wCount;
    const netArea = wallArea - doorArea - windowArea;
    
    // Standard wallpaper roll: 0.53m × 10m = 5.3m²
    const rollCoverage = 5.3;
    const rollsNeeded = Math.ceil((netArea * 1.1) / rollCoverage); // +10% waste
    
    // Average cost per roll
    const costPerRoll = 250000;
    const totalCost = rollsNeeded * costPerRoll;

    if (netArea <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng kích thước');
      return;
    }

    Alert.alert(
      'Kết quả tính toán - Giấy dán tường',
      `Diện tích tường: ${wallArea.toFixed(2)} m²\n` +
      `Diện tích cửa: ${(doorArea + windowArea).toFixed(2)} m²\n` +
      `Diện tích cần dán: ${netArea.toFixed(2)} m²\n\n` +
      `Số cuộn giấy cần: ${rollsNeeded} cuộn\n` +
      `(Đã tính thêm 10% dự phòng)\n\n` +
      `Ước tính chi phí: ${totalCost.toLocaleString('vi-VN')} VND\n` +
      `(Giá 250k/cuộn)`,
      [{ text: 'OK' }]
    );
  };

  const handleCalculate = () => {
    if (selectedCalculator === 'paint') {
      calculatePaint();
    } else if (selectedCalculator === 'tiles') {
      calculateTiles();
    } else if (selectedCalculator === 'wood') {
      calculateWood();
    } else if (selectedCalculator === 'concrete') {
      calculateConcrete();
    } else if (selectedCalculator === 'steel') {
      calculateSteel();
    } else if (selectedCalculator === 'wallpaper') {
      calculateWallpaper();
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    const room = ROOM_TYPES.find((r) => r.id === roomId);
    if (room && room.avgArea > 0) {
      // Auto-fill approximate dimensions
      const sideLength = Math.sqrt(room.avgArea);
      setFloorLength(sideLength.toFixed(1));
      setFloorWidth(sideLength.toFixed(1));
      setWallLength((sideLength * 4).toFixed(1));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Máy tính thiết kế',
          headerStyle: { backgroundColor: '#0D9488' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
      <View style={styles.container}>
        {/* Hero */}
        <LinearGradient
          colors={['#0D9488', '#14B8A6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Ionicons name="calculator" size={40} color="#fff" />
          <Text style={styles.heroTitle}>Tính toán vật liệu xây dựng</Text>
          <Text style={styles.heroSubtitle}>Nhanh chóng & chính xác</Text>
        </LinearGradient>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Calculator Type Selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn loại tính toán</Text>
            <View style={styles.calculatorGrid}>
              {CALCULATOR_TYPES.map((calc) => (
                <TouchableOpacity
                  key={calc.id}
                  style={[
                    styles.calculatorCard,
                    selectedCalculator === calc.id && styles.calculatorCardActive,
                  ]}
                  onPress={() => setSelectedCalculator(calc.id)}
                >
                  <Ionicons
                    name={calc.icon as any}
                    size={32}
                    color={selectedCalculator === calc.id ? '#fff' : '#0D9488'}
                  />
                  <Text
                    style={[
                      styles.calculatorName,
                      selectedCalculator === calc.id && styles.calculatorNameActive,
                    ]}
                  >
                    {calc.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Room Type Quick Select */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chọn nhanh theo phòng</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomsScroll}
            >
              {ROOM_TYPES.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomChip,
                    selectedRoom === room.id && styles.roomChipActive,
                  ]}
                  onPress={() => handleRoomSelect(room.id)}
                >
                  <Text
                    style={[
                      styles.roomChipText,
                      selectedRoom === room.id && styles.roomChipTextActive,
                    ]}
                  >
                    {room.name}
                  </Text>
                  {room.avgArea > 0 && (
                    <Text style={styles.roomAreaText}>~{room.avgArea}m²</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Paint Calculator */}
          {selectedCalculator === 'paint' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số tường cần sơn</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều dài tường (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 10"
                  keyboardType="decimal-pad"
                  value={wallLength}
                  onChangeText={setWallLength}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều cao tường (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 2.8"
                  keyboardType="decimal-pad"
                  value={wallHeight}
                  onChangeText={setWallHeight}
                />
              </View>

              <Text style={styles.subsectionTitle}>Cửa ra vào</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Rộng (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.9"
                    keyboardType="decimal-pad"
                    value={doorWidth}
                    onChangeText={setDoorWidth}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cao (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2.1"
                    keyboardType="decimal-pad"
                    value={doorHeight}
                    onChangeText={setDoorHeight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng cửa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="number-pad"
                  value={doorCount}
                  onChangeText={setDoorCount}
                />
              </View>

              <Text style={styles.subsectionTitle}>Cửa sổ</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Rộng (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.2"
                    keyboardType="decimal-pad"
                    value={windowWidth}
                    onChangeText={setWindowWidth}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cao (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.5"
                    keyboardType="decimal-pad"
                    value={windowHeight}
                    onChangeText={setWindowHeight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng cửa sổ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="number-pad"
                  value={windowCount}
                  onChangeText={setWindowCount}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lớp sơn</Text>
                <View style={styles.coatSelector}>
                  {['1', '2', '3'].map((coat) => (
                    <TouchableOpacity
                      key={coat}
                      style={[
                        styles.coatButton,
                        coats === coat && styles.coatButtonActive,
                      ]}
                      onPress={() => setCoats(coat)}
                    >
                      <Text
                        style={[
                          styles.coatButtonText,
                          coats === coat && styles.coatButtonTextActive,
                        ]}
                      >
                        {coat} lớp
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Tiles Calculator */}
          {selectedCalculator === 'tiles' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số sàn cần lát</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều dài sàn (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 5"
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều rộng sàn (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 4"
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Kích thước gạch (cm)</Text>
                <View style={styles.tileSizeSelector}>
                  {['30', '40', '60', '80'].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.sizeButton,
                        tileSize === size && styles.sizeButtonActive,
                      ]}
                      onPress={() => setTileSize(size)}
                    >
                      <Text
                        style={[
                          styles.sizeButtonText,
                          tileSize === size && styles.sizeButtonTextActive,
                        ]}
                      >
                        {size}x{size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dự phòng thất thoát (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  keyboardType="number-pad"
                  value={wastePercent}
                  onChangeText={setWastePercent}
                />
                <Text style={styles.inputHint}>Khuyến nghị: 10-15%</Text>
              </View>
            </View>
          )}

          {/* Wood Calculator */}
          {selectedCalculator === 'wood' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số sàn gỗ</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều dài sàn (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 5"
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều rộng sàn (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 4"
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dự phòng thất thoát (%)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  keyboardType="number-pad"
                  value={wastePercent}
                  onChangeText={setWastePercent}
                />
                <Text style={styles.inputHint}>Khuyến nghị: 10-15%</Text>
              </View>
            </View>
          )}

          {/* Wallpaper Calculator */}
          {selectedCalculator === 'wallpaper' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số tường cần dán</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều dài tường (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 10"
                  keyboardType="decimal-pad"
                  value={wallLength}
                  onChangeText={setWallLength}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều cao tường (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 2.8"
                  keyboardType="decimal-pad"
                  value={wallHeight}
                  onChangeText={setWallHeight}
                />
              </View>

              <Text style={styles.subsectionTitle}>Cửa ra vào</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Rộng (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.9"
                    keyboardType="decimal-pad"
                    value={doorWidth}
                    onChangeText={setDoorWidth}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cao (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="2.1"
                    keyboardType="decimal-pad"
                    value={doorHeight}
                    onChangeText={setDoorHeight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng cửa</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  keyboardType="number-pad"
                  value={doorCount}
                  onChangeText={setDoorCount}
                />
              </View>

              <Text style={styles.subsectionTitle}>Cửa sổ</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Rộng (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.2"
                    keyboardType="decimal-pad"
                    value={windowWidth}
                    onChangeText={setWindowWidth}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Cao (m)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.5"
                    keyboardType="decimal-pad"
                    value={windowHeight}
                    onChangeText={setWindowHeight}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số lượng cửa sổ</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2"
                  keyboardType="number-pad"
                  value={windowCount}
                  onChangeText={setWindowCount}
                />
              </View>
            </View>
          )}

          {/* Concrete Calculator */}
          {selectedCalculator === 'concrete' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số móng/sàn bê tông</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều dài (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 5"
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều rộng (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 3"
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Độ dày/Chiều cao (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 0.3"
                  keyboardType="decimal-pad"
                  value={wallHeight}
                  onChangeText={setWallHeight}
                />
                <Text style={styles.inputHint}>Móng: 0.2-0.5m, Sàn: 0.1-0.15m</Text>
              </View>
            </View>
          )}

          {/* Steel Calculator */}
          {selectedCalculator === 'steel' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông số lưới thép</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều dài lưới (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 10"
                  keyboardType="decimal-pad"
                  value={floorLength}
                  onChangeText={setFloorLength}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chiều rộng lưới (m)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 8"
                  keyboardType="decimal-pad"
                  value={floorWidth}
                  onChangeText={setFloorWidth}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputHint}>Mặc định: D10 (Φ10mm), khoảng cách 20cm</Text>
              </View>
            </View>
          )}

          {/* Calculate Button */}
          <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
            <Ionicons name="calculator" size={24} color="#fff" />
            <Text style={styles.calculateButtonText}>Tính toán ngay</Text>
          </TouchableOpacity>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color="#FFFFFF" />
              <Text style={styles.tipsTitle}>Mẹo hữu ích</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color="#52c41a" />
              <Text style={styles.tipText}>
                Luôn tính thêm 10-15% vật liệu dự phòng cho thất thoát
              </Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color="#52c41a" />
              <Text style={styles.tipText}>
                Đo kỹ kích thước trước khi đặt mua để tránh lãng phí
              </Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color="#52c41a" />
              <Text style={styles.tipText}>
                Tham khảo ý kiến chuyên gia nếu công trình phức tạp
              </Text>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: 12,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  calculatorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  calculatorCard: {
    width: (width - 44) / 3,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  calculatorCardActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  calculatorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  calculatorNameActive: {
    color: '#fff',
  },
  roomsScroll: {
    gap: 8,
  },
  roomChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#f5f5f5',
  },
  roomChipActive: {
    backgroundColor: '#fff5f0',
    borderColor: '#0D9488',
  },
  roomChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  roomChipTextActive: {
    color: '#0D9488',
    fontWeight: '600',
  },
  roomAreaText: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  inputHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  coatSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  coatButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  coatButtonActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  coatButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  coatButtonTextActive: {
    color: '#fff',
  },
  tileSizeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  sizeButtonActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  sizeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  sizeButtonTextActive: {
    color: '#fff',
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 13,
    color: '#bbb',
    marginTop: 8,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calculateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  tipsSection: {
    backgroundColor: '#fffbf0',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE58F',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});
