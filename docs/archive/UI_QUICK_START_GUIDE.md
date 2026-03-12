# Quick Start Guide - New UI Components

## 🚀 Getting Started

Tất cả các components mới đã sẵn sàng để sử dụng! Đây là hướng dẫn nhanh để bắt đầu.

---

## 📦 **1. Design Tokens - Sử dụng trong StyleSheet**

### Typography
```typescript
import { TextVariants, FontSize, FontWeight } from '../constants/typography';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  title: {
    fontSize: TextVariants.h3.fontSize,      // 28px
    fontWeight: TextVariants.h3.fontWeight,  // bold
    lineHeight: TextVariants.h3.lineHeight,  // 36px
  },
  body: {
    fontSize: TextVariants.body2.fontSize,   // 14px
    lineHeight: TextVariants.body2.lineHeight, // 20px
  },
  button: {
    fontSize: FontSize.md,        // 16px
    fontWeight: FontWeight.bold,  // 700
  },
});
```

### Spacing
```typescript
import { Spacing, Layout, IconSize } from '../constants/spacing';

const styles = StyleSheet.create({
  container: {
    padding: Spacing[4],              // 16px
    gap: Spacing[3],                  // 12px
    marginBottom: Spacing[6],         // 24px
  },
  card: {
    padding: Layout.cardPadding,      // 16px
    marginBottom: Layout.cardMargin,  // 12px
  },
  icon: {
    width: IconSize.lg,               // 24px
    height: IconSize.lg,              // 24px
  },
});
```

### Shadows
```typescript
import { Shadows } from '../constants/shadows';

const styles = StyleSheet.create({
  card: {
    ...Shadows.card,           // Elevation 2
    backgroundColor: '#fff',
  },
  modal: {
    ...Shadows.modal,          // Elevation 4
  },
  fab: {
    ...Shadows.fab,            // Elevation 3
  },
});
```

---

## 🎨 **2. Form Components**

### Select/Dropdown

#### Single Select
```typescript
import Select, { SelectOption } from '../components/ui/select';
import { useState } from 'react';

const options: SelectOption[] = [
  { label: 'Option 1', value: 1, icon: 'home' },
  { label: 'Option 2', value: 2, icon: 'settings' },
  { label: 'Option 3', value: 3, disabled: true },
];

function MyForm() {
  const [selected, setSelected] = useState<number>();

  return (
    <Select
      label="Choose an option"
      options={options}
      value={selected}
      onChange={setSelected}
      required
      error={!selected ? 'Please select' : undefined}
    />
  );
}
```

#### Multi-Select with Search
```typescript
const [selected, setSelected] = useState<(string | number)[]>([]);

<Select
  label="Select multiple"
  options={options}
  value={selected}
  onChange={setSelected}
  multiple
  searchable
  placeholder="Search and select..."
/>
```

---

### Radio Group

```typescript
import RadioGroup, { RadioOption } from '../components/ui/radio';

const paymentOptions: RadioOption[] = [
  { 
    label: 'Credit Card', 
    value: 'card',
    description: 'Pay with credit or debit card' 
  },
  { 
    label: 'Cash', 
    value: 'cash',
    description: 'Pay on delivery' 
  },
  { 
    label: 'Bank Transfer', 
    value: 'bank',
    disabled: true 
  },
];

function PaymentForm() {
  const [payment, setPayment] = useState<string | number>();

  return (
    <RadioGroup
      label="Payment Method"
      options={paymentOptions}
      value={payment}
      onChange={setPayment}
      required
      error={!payment ? 'Please select payment method' : undefined}
    />
  );
}
```

**Horizontal Layout:**
```typescript
<RadioGroup
  options={simpleOptions}
  value={value}
  onChange={setValue}
  direction="horizontal"
  size="sm"
/>
```

---

## 💬 **3. Feedback Components**

### Alert/Toast

#### Setup (in _layout.tsx)
```typescript
import { AlertProvider } from '../components/ui/alert';

export default function RootLayout() {
  return (
    <AlertProvider>
      {/* Your app content */}
    </AlertProvider>
  );
}
```

#### Usage (in any component)
```typescript
import { useAlert } from '../components/ui/alert';

function MyComponent() {
  const { showAlert } = useAlert();

  const handleSuccess = () => {
    showAlert({
      type: 'success',
      title: 'Success!',
      message: 'Item added to cart',
      duration: 3000,
      position: 'top',
    });
  };

  const handleError = () => {
    showAlert({
      type: 'error',
      title: 'Error',
      message: 'Something went wrong',
      duration: 4000,
    });
  };

  return (
    <Button title="Show Alert" onPress={handleSuccess} />
  );
}
```

**Available Types:** `success`, `error`, `warning`, `info`

---

### Modal/Dialog

#### Basic Modal
```typescript
import Modal from '../components/ui/modal';
import { Button } from '../components/ui/button';
import { useState } from 'react';

function MyComponent() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button title="Open Modal" onPress={() => setVisible(true)} />
      
      <Modal
        visible={visible}
        onClose={() => setVisible(false)}
        title="Edit Profile"
        size="md"
        footer={
          <>
            <Button 
              title="Cancel" 
              variant="secondary" 
              onPress={() => setVisible(false)} 
            />
            <Button 
              title="Save" 
              variant="primary" 
              onPress={handleSave} 
            />
          </>
        }
      >
        <Text>Your form content here</Text>
      </Modal>
    </>
  );
}
```

#### Confirm Dialog
```typescript
import { ConfirmDialog } from '../components/ui/modal';

function DeleteButton() {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    // Delete logic here
    setShowConfirm(false);
  };

  return (
    <>
      <Button title="Delete" onPress={() => setShowConfirm(true)} />
      
      <ConfirmDialog
        visible={showConfirm}
        title="Confirm Delete"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
```

**Modal Sizes:** `sm`, `md`, `lg`, `full`

---

### Skeleton Loaders

#### Loading State Pattern
```typescript
import { SkeletonCard, SkeletonList, SkeletonText } from '../components/ui/skeleton';

function ProductList() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  if (loading) {
    return (
      <View>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductCard product={item} />}
    />
  );
}
```

#### Available Skeleton Components
```typescript
// Base skeleton
<Skeleton width={200} height={20} borderRadius={8} />

// Text placeholder
<SkeletonText lines={3} />

// Circle (avatar)
<SkeletonCircle size={48} />

// Card
<SkeletonCard />

// Avatar with text
<SkeletonAvatar />

// List of avatars
<SkeletonList count={5} />
```

---

## 🏷️ **4. Badge Components**

### Basic Badge
```typescript
import Badge from '../components/ui/badge';

function StatusIndicator() {
  return (
    <>
      <Badge variant="success" size="md">Active</Badge>
      <Badge variant="error" size="sm">Inactive</Badge>
      <Badge variant="warning" size="lg">Pending</Badge>
    </>
  );
}
```

**Variants:** `primary`, `secondary`, `success`, `error`, `warning`, `info`, `neutral`  
**Sizes:** `sm`, `md`, `lg`

### Outline Badge
```typescript
<Badge variant="primary" outline>Featured</Badge>
```

### Dot Badge
```typescript
<Badge variant="success" dot />
```

### Notification Badge
```typescript
import { NotificationBadge } from '../components/ui/badge';
import { Ionicons } from '@expo/vector-icons';

function NotificationIcon() {
  const unreadCount = 5;

  return (
    <View style={{ position: 'relative' }}>
      <Ionicons name="notifications" size={24} />
      <NotificationBadge count={unreadCount} max={99} />
    </View>
  );
}
```

---

## 📋 **5. Complete Form Example**

```typescript
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Select, { SelectOption } from '../components/ui/select';
import RadioGroup, { RadioOption } from '../components/ui/radio';
import { Button } from '../components/ui/button';
import { useAlert } from '../components/ui/alert';
import { Spacing } from '../constants/spacing';

const categories: SelectOption[] = [
  { label: 'Electronics', value: 'electronics', icon: 'laptop' },
  { label: 'Furniture', value: 'furniture', icon: 'bed' },
  { label: 'Tools', value: 'tools', icon: 'hammer' },
];

const priorities: RadioOption[] = [
  { label: 'High', value: 'high', description: 'Urgent orders' },
  { label: 'Normal', value: 'normal', description: 'Standard processing' },
  { label: 'Low', value: 'low', description: 'When available' },
];

function OrderForm() {
  const { showAlert } = useAlert();
  const [category, setCategory] = useState<string | number>();
  const [priority, setPriority] = useState<string | number>();

  const handleSubmit = () => {
    if (!category) {
      showAlert({
        type: 'error',
        message: 'Please select a category',
      });
      return;
    }

    if (!priority) {
      showAlert({
        type: 'error',
        message: 'Please select priority',
      });
      return;
    }

    // Submit logic here
    showAlert({
      type: 'success',
      title: 'Order Submitted',
      message: 'Your order has been placed successfully',
    });
  };

  return (
    <View style={styles.form}>
      <Select
        label="Product Category"
        options={categories}
        value={category}
        onChange={setCategory}
        required
        searchable
      />

      <RadioGroup
        label="Order Priority"
        options={priorities}
        value={priority}
        onChange={setPriority}
        required
      />

      <Button 
        title="Submit Order" 
        onPress={handleSubmit}
        variant="primary"
        size="lg"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: Spacing[4],
    gap: Spacing[4],
  },
});
```

---

## 🎯 **6. Shopping Module Integration Example**

Update your product list screen with new components:

```typescript
// app/shopping/[category].tsx
import { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import Select, { SelectOption } from '../../components/ui/select';
import Badge from '../../components/ui/badge';
import { SkeletonCard } from '../../components/ui/skeleton';
import { useAlert } from '../../components/ui/alert';
import { Spacing, Layout } from '../../constants/spacing';

const sortOptions: SelectOption[] = [
  { label: 'Most Popular', value: 'popular', icon: 'star' },
  { label: 'Price: Low to High', value: 'price-asc', icon: 'arrow-up' },
  { label: 'Price: High to Low', value: 'price-desc', icon: 'arrow-down' },
  { label: 'Newest', value: 'newest', icon: 'time' },
];

export default function CategoryScreen() {
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [sortBy, setSortBy] = useState('popular');

  useEffect(() => {
    loadProducts();
  }, [sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      // Fetch products
      const data = await fetchProducts({ sortBy });
      setProducts(data);
    } catch (error) {
      showAlert({
        type: 'error',
        message: 'Failed to load products',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sort Filter */}
      <Select
        label="Sort By"
        options={sortOptions}
        value={sortBy}
        onChange={setSortBy}
        size="md"
        style={styles.sortSelect}
      />

      {/* Product List */}
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />
    </View>
  );
}

function ProductCard({ product }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>{product.price} VND</Text>
        {product.badge && (
          <Badge variant="success" size="sm">
            {product.badge}
          </Badge>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.screenPadding.horizontal,
  },
  sortSelect: {
    marginBottom: Spacing[4],
  },
  grid: {
    gap: Layout.cardGap,
  },
  card: {
    flex: 1,
    margin: Spacing[2],
  },
  // ... other styles
});
```

---

## ✅ **Testing Checklist**

Sau khi tích hợp components, hãy kiểm tra:

- [ ] Select dropdown mở/đóng đúng
- [ ] Search trong Select hoạt động
- [ ] Radio buttons chọn đúng 1 option
- [ ] Alert/Toast hiển thị và tự động đóng
- [ ] Modal có thể đóng bằng overlay press
- [ ] Skeleton loaders hiển thị khi loading
- [ ] Badge hiển thị đúng màu cho mỗi variant
- [ ] Tất cả components responsive trên nhiều kích thước màn hình
- [ ] Dark mode hoạt động tốt với tất cả components

---

## 🔗 **Resources**

- **Full Documentation:** `UI_DEVELOPMENT_ROADMAP.md`
- **Progress Tracking:** `UI_DEVELOPMENT_PROGRESS.md`
- **Component Examples:** Xem code examples trong mỗi component file

---

## 💡 **Tips & Best Practices**

1. **Always wrap app with AlertProvider** để sử dụng global alerts
2. **Use Skeleton loaders** thay vì loading spinners cho UX tốt hơn
3. **Combine Badge với Icons** để tạo notification indicators
4. **Use Modal sizes appropriately:**
   - `sm`: Confirmations, simple forms
   - `md`: Standard forms
   - `lg`: Complex forms with multiple sections
   - `full`: Full-screen content
5. **Leverage design tokens** thay vì hardcode values

---

**Bắt đầu ngay! 🚀** Tất cả components đã sẵn sàng để sử dụng trong project của bạn.
