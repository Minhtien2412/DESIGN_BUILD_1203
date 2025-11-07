import { Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Layout, SpacingSemantic } from '../../constants/spacing';
import { TextVariants } from '../../constants/typography';
import { useThemeColor } from '../../hooks/use-theme-color';

// Import all new UI components
import {
    AlertProvider,
    Avatar,
    AvatarGroup,
    Badge,
    Button,
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Checkbox,
    CheckboxGroup,
    ChipGroup,
    ConfirmDialog,
    ListItem,
    Modal,
    NotificationBadge,
    ProductCardNew,
    RadioGroup,
    SectionHeader,
    Select,
    SkeletonCard,
    TabPanel,
    Tabs,
    useAlert
} from '../../components/ui';

// ============================================
// DEMO SCREEN - Test All UI Components
// ============================================

const DemoContent = () => {
  const { showAlert } = useAlert();
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const primary = useThemeColor({}, 'primary');

  // State for form components
  const [selectedCategory, setSelectedCategory] = useState<string | number>('');
  const [paymentMethod, setPaymentMethod] = useState<string | number>('card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [notifications, setNotifications] = useState(['email']);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedFilters, setSelectedFilters] = useState(['new']);
  const [loading, setLoading] = useState(false);

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[TextVariants.h1, { color: text }]}>UI Components Demo</Text>
        <Text style={[TextVariants.body2, { color: text, opacity: 0.7 }]}>
          Test all 16 Phase 1 Week 1 components
        </Text>
      </View>

      {/* Section 1: Form Components */}
      <View style={styles.section}>
        <SectionHeader title="Form Components" />

        {/* Select */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Select</Text>
          <Select
            label="Category"
            options={[
              { label: 'Electronics', value: 'electronics' },
              { label: 'Fashion', value: 'fashion' },
              { label: 'Home & Garden', value: 'home' },
              { label: 'Sports', value: 'sports' },
            ]}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(Array.isArray(val) ? val[0] : val)}
            searchable
            placeholder="Choose a category"
          />
        </View>

        {/* RadioGroup */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>RadioGroup</Text>
          <RadioGroup
            label="Payment Method"
            options={[
              { label: 'Credit Card', value: 'card', description: 'Visa, MasterCard, AMEX' },
              { label: 'Bank Transfer', value: 'bank', description: 'Direct transfer' },
              { label: 'Cash on Delivery', value: 'cod', description: 'Pay when delivered' },
            ]}
            value={paymentMethod}
            onChange={(val) => setPaymentMethod(val)}
          />
        </View>

        {/* Checkbox */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Checkbox</Text>
          <Checkbox
            checked={agreedToTerms}
            onChange={setAgreedToTerms}
            label="I agree to terms and conditions"
            description="You must accept to continue"
          />
        </View>

        {/* CheckboxGroup */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>CheckboxGroup</Text>
          <CheckboxGroup
            options={[
              { value: 'email', label: 'Email', description: 'Receive email updates' },
              { value: 'sms', label: 'SMS', description: 'Text notifications' },
              { value: 'push', label: 'Push', description: 'App notifications' },
            ]}
            value={notifications}
            onChange={setNotifications}
          />
        </View>
      </View>

      {/* Section 2: Feedback Components */}
      <View style={styles.section}>
        <SectionHeader title="Feedback Components" />

        {/* Alert/Toast */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Alert Toast</Text>
          <View style={styles.buttonRow}>
            <Button
              title="Success"
              onPress={() => showAlert({ type: 'success', message: 'Success!' })}
              style={{ flex: 1 }}
            />
            <Button
              title="Error"
              onPress={() => showAlert({ type: 'error', message: 'Error occurred!' })}
              style={{ flex: 1 }}
            />
            <Button
              title="Warning"
              onPress={() => showAlert({ type: 'warning', message: 'Warning!' })}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Modal */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Modal</Text>
          <Button title="Open Modal" onPress={() => setModalVisible(true)} />
          <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Demo Modal">
            <Text style={{ color: text }}>This is modal content. Press outside to close.</Text>
          </Modal>
        </View>

        {/* ConfirmDialog */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>ConfirmDialog</Text>
          <Button title="Delete Item" onPress={() => setConfirmVisible(true)} />
          <ConfirmDialog
            visible={confirmVisible}
            title="Confirm Delete"
            message="Are you sure you want to delete this item?"
            onConfirm={() => {
              setConfirmVisible(false);
              showAlert({ type: 'success', message: 'Item deleted' });
            }}
            onCancel={() => setConfirmVisible(false)}
          />
        </View>

        {/* Skeleton */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Skeleton</Text>
          <Button
            title="Toggle Loading"
            onPress={() => {
              setLoading(!loading);
            }}
          />
          {loading ? <SkeletonCard /> : <Card><CardContent><Text>Content loaded!</Text></CardContent></Card>}
        </View>

        {/* Badges */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Badges</Text>
          <View style={styles.badgeRow}>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </View>
          <View style={{ marginTop: 16, alignItems: 'flex-start' }}>
            <View style={{ position: 'relative' }}>
              <Text style={{ color: text }}>Notifications</Text>
              <NotificationBadge count={5} />
            </View>
          </View>
        </View>
      </View>

      {/* Section 3: Display Components */}
      <View style={styles.section}>
        <SectionHeader title="Display Components" />

        {/* Card */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Card</Text>
          <Card variant="elevated">
            <CardHeader title="Card Title" subtitle="Card subtitle" />
            <CardContent>
              <Text style={{ color: text }}>This is card content with composable parts.</Text>
            </CardContent>
            <CardActions>
              <Button title="Cancel" variant="ghost" />
              <Button title="Save" />
            </CardActions>
          </Card>
        </View>

        {/* ProductCard */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>ProductCard</Text>
          <ProductCardNew
            image={require('../../assets/images/react-logo.png')}
            title="React Native Product"
            price="500,000₫"
            rating={4.5}
            badge="New"
            onPress={() => showAlert({ type: 'info', message: 'Product clicked' })}
          />
        </View>

        {/* Avatar & AvatarGroup */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Avatar</Text>
          <View style={styles.avatarRow}>
            <Avatar name="John Doe" size="sm" onlineStatus="online" />
            <Avatar name="Jane Smith" size="md" onlineStatus="away" />
            <Avatar name="Bob Wilson" size="lg" onlineStatus="offline" />
          </View>
          <Text style={[TextVariants.h3, { color: text, marginTop: 16, marginBottom: 8 }]}>
            AvatarGroup
          </Text>
          <AvatarGroup
            avatars={[
              { id: '1', name: 'User 1' },
              { id: '2', name: 'User 2' },
              { id: '3', name: 'User 3' },
              { id: '4', name: 'User 4' },
              { id: '5', name: 'User 5' },
            ]}
            max={3}
          />
        </View>

        {/* Tabs */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>Tabs</Text>
          <Tabs
            tabs={[
              { key: 'details', label: 'Details' },
              { key: 'reviews', label: 'Reviews', badge: 24 },
              { key: 'specs', label: 'Specs' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="line"
          />
          <TabPanel activeTab={activeTab} tabKey="details">
            <Text style={{ color: text, padding: 16 }}>Details content</Text>
          </TabPanel>
          <TabPanel activeTab={activeTab} tabKey="reviews">
            <Text style={{ color: text, padding: 16 }}>Reviews content (24 reviews)</Text>
          </TabPanel>
          <TabPanel activeTab={activeTab} tabKey="specs">
            <Text style={{ color: text, padding: 16 }}>Specifications content</Text>
          </TabPanel>
        </View>

        {/* Chips */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>ChipGroup</Text>
          <ChipGroup
            chips={[
              { key: 'new', label: 'New Arrivals' },
              { key: 'sale', label: 'On Sale' },
              { key: 'trending', label: 'Trending' },
              { key: 'featured', label: 'Featured' },
            ]}
            selected={selectedFilters}
            onChange={setSelectedFilters}
            multiSelect
          />
        </View>

        {/* ListItem */}
        <View style={styles.componentDemo}>
          <Text style={[TextVariants.h3, { color: text, marginBottom: 8 }]}>ListItem</Text>
          <ListItem
            title="Settings"
            subtitle="Manage your preferences"
            leading={<Avatar name="User" size="sm" />}
            badge={3}
            onPress={() => showAlert({ type: 'info', message: 'Settings clicked' })}
          />
          <ListItem
            title="Notifications"
            subtitle="Alerts and updates"
            leading={<Avatar name="Bell" size="sm" />}
            onPress={() => showAlert({ type: 'info', message: 'Notifications clicked' })}
          />
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

// Wrap with AlertProvider
export default function UIComponentsDemo() {
  return (
    <AlertProvider>
      <Stack.Screen
        options={{
          title: 'UI Components Demo',
          headerShown: true,
        }}
      />
      <DemoContent />
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
  header: {
    padding: Layout.screenPadding.horizontal,
    paddingTop: SpacingSemantic.lg,
    paddingBottom: SpacingSemantic.md,
  },
  section: {
    paddingHorizontal: Layout.screenPadding.horizontal,
    marginBottom: SpacingSemantic.xl,
  },
  componentDemo: {
    marginBottom: SpacingSemantic.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SpacingSemantic.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SpacingSemantic.sm,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: SpacingSemantic.md,
    alignItems: 'center',
  },
});
