# Component Library

Complete reference for all reusable navigation, universal, and layout components in the App Design & Build system.

---

## Table of Contents

1. [Navigation Components](#navigation-components)
2. [Universal Components](#universal-components)
3. [Shared Layouts](#shared-layouts)
4. [Onboarding Components](#onboarding-components)
5. [Usage Examples](#usage-examples)

---

## Navigation Components

### CategoryGrid

Responsive grid displaying all categories.

**File**: `components/navigation/CategoryGrid.tsx`

**Features**:
- 2-column grid layout
- Auto-scrollable with parent ScrollView
- Renders CategoryCard for each category

**Props**: None (reads from `CATEGORIES`)

**Example**:
```tsx
import { CategoryGrid } from '@/components/navigation/CategoryGrid';

<CategoryGrid />
```

---

### CategoryCard

Individual category card with gradient background and animation.

**File**: `components/navigation/CategoryCard.tsx`

**Props**:
```tsx
interface CategoryCardProps {
  id: string;              // Category ID
  label: string;           // Display name
  description: string;     // Category description
  icon: string;            // Ionicons name
  color: string;           // Primary color (hex)
  gradient?: [string, string]; // Optional gradient colors
  moduleCount?: number;    // Number of modules (badge)
}
```

**Features**:
- Gradient background (LinearGradient)
- Press animation (scale effect)
- Module count badge
- Chevron arrow indicator
- Analytics tracking on press

**Example**:
```tsx
<CategoryCard
  id="architecture"
  label="Thiết kế Kiến trúc"
  description="Architecture and design planning"
  icon="construct"
  color="#4ECDC4"
  gradient={["#4ECDC4", "#44A08D"]}
  moduleCount={7}
/>
```

---

### GlobalSearchBar

Clickable search bar that navigates to search screen.

**File**: `components/navigation/GlobalSearchBar.tsx`

**Features**:
- Read-only (navigates to full search)
- Search and filter icons
- Analytics tracking

**Props**: None

**Example**:
```tsx
import { GlobalSearchBar } from '@/components/navigation/GlobalSearchBar';

<GlobalSearchBar />
```

---

### QuickActions

Horizontal scrollable list of quick action shortcuts.

**File**: `components/navigation/QuickActions.tsx`

**Features**:
- Horizontal scroll
- Icon + label cards
- Quick navigation to modules

**Props**: None

**Example**:
```tsx
import { QuickActions } from '@/components/navigation/QuickActions';

<QuickActions />
```

---

### RecentlyViewed

Shows last 5 visited screens with swipeable horizontal list.

**File**: `components/navigation/RecentlyViewed.tsx`

**Features**:
- AsyncStorage persistence
- Horizontal scroll
- Auto-updates on navigation
- Empty state handling

**Props**: None

**Example**:
```tsx
import { RecentlyViewed } from '@/components/navigation/RecentlyViewed';

<RecentlyViewed />
```

---

### AppDrawer

Slide-out navigation drawer from left side.

**File**: `components/navigation/AppDrawer.tsx`

**Props**:
```tsx
interface AppDrawerProps {
  visible: boolean;        // Show/hide drawer
  onClose: () => void;     // Close callback
}
```

**Features**:
- Slide-in animation
- Gradient header
- Favorites (star toggle)
- Recent screens (last 5)
- All categories list
- AsyncStorage persistence
- Analytics tracking

**Example**:
```tsx
import { AppDrawer } from '@/components/navigation/AppDrawer';
import { useState } from 'react';

const [drawerVisible, setDrawerVisible] = useState(false);

<AppDrawer
  visible={drawerVisible}
  onClose={() => setDrawerVisible(false)}
/>

<TouchableOpacity onPress={() => setDrawerVisible(true)}>
  <Ionicons name="menu" size={24} />
</TouchableOpacity>
```

---

### Breadcrumbs

Navigation breadcrumb trail.

**File**: `components/navigation/Breadcrumbs.tsx`

**Props**:
```tsx
interface BreadcrumbItem {
  label: string;           // Display text
  route?: string;          // Optional navigation route
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]; // Array of breadcrumb items
}
```

**Example**:
```tsx
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs';

<Breadcrumbs
  items={[
    { label: 'Home', route: '/' },
    { label: 'Thiết kế Kiến trúc', route: '/categories/architecture' },
    { label: 'Mô phỏng 3D' }, // Last item (no route)
  ]}
/>
```

---

### ContextFAB

Context-aware floating action button.

**File**: `components/navigation/ContextFAB.tsx`

**Props**:
```tsx
interface ContextFABProps {
  icon: string;            // Main icon
  onPress: () => void;     // Press handler
  actions?: Array<{        // Optional expandable actions
    icon: string;
    label: string;
    onPress: () => void;
  }>;
}
```

**Example**:
```tsx
import { ContextFAB } from '@/components/navigation/ContextFAB';

<ContextFAB
  icon="add"
  onPress={() => console.log('Add')}
  actions={[
    { icon: 'camera', label: 'Photo', onPress: () => {} },
    { icon: 'document', label: 'File', onPress: () => {} },
  ]}
/>
```

---

## Universal Components

### UniversalForm

Configurable form component with validation.

**File**: `components/universal/UniversalForm.tsx`

**Props**:
```tsx
interface FormField {
  name: string;                    // Field identifier
  label: string;                   // Display label
  type: 'text' | 'email' | 'phone' | 'number' | 'password' | 
        'textarea' | 'date' | 'select' | 'checkbox';
  placeholder?: string;
  icon?: string;                   // Ionicons name
  required?: boolean;
  validation?: (value: any) => string | undefined; // Custom validator
  options?: Array<{                // For select type
    label: string;
    value: string;
  }>;
}

interface UniversalFormProps {
  fields: FormField[];
  onSubmit: (values: Record<string, any>) => void;
  submitLabel?: string;
  loading?: boolean;
  initialValues?: Record<string, any>;
}
```

**Features**:
- 8 field types
- Auto-validation (email, phone, required)
- Real-time error display
- Loading states
- Custom validation functions

**Example**:
```tsx
import { UniversalForm } from '@/components/universal/UniversalForm';

<UniversalForm
  fields={[
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      icon: 'person',
      required: true,
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      icon: 'mail',
      required: true,
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'phone',
      icon: 'call',
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      icon: 'list',
      options: [
        { label: 'Architecture', value: 'architecture' },
        { label: 'Budget', value: 'budget' },
      ],
    },
  ]}
  onSubmit={(values) => console.log(values)}
  submitLabel="Submit"
  loading={false}
/>
```

---

### UniversalList

Configurable list component with search, sort, and pagination.

**File**: `components/universal/UniversalList.tsx`

**Props**:
```tsx
interface UniversalListProps<T> {
  data: T[];                       // Array of items
  renderItem: (item: T) => ReactNode;
  keyExtractor: (item: T) => string;
  
  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  filterFunction?: (item: T, query: string) => boolean;
  
  // Sort
  sortOptions?: Array<{
    label: string;
    sortFunction: (a: T, b: T) => number;
  }>;
  
  // Pagination
  paginated?: boolean;
  itemsPerPage?: number;
  
  // Layout
  horizontal?: boolean;
  numColumns?: number;
  
  // Empty state
  emptyIcon?: string;
  emptyMessage?: string;
  emptyAction?: { label: string; onPress: () => void };
  
  // Refresh
  onRefresh?: () => Promise<void>;
}
```

**Features**:
- Search with custom filter
- Sort with multiple options
- Pagination with "Load More"
- Empty states
- Pull-to-refresh
- Grid layout
- Horizontal scroll

**Example**:
```tsx
import { UniversalList } from '@/components/universal/UniversalList';

interface Product {
  id: string;
  name: string;
  price: number;
}

<UniversalList<Product>
  data={products}
  renderItem={(product) => (
    <View>
      <Text>{product.name}</Text>
      <Text>${product.price}</Text>
    </View>
  )}
  keyExtractor={(item) => item.id}
  searchable
  searchPlaceholder="Search products..."
  filterFunction={(item, query) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  }
  sortOptions={[
    {
      label: 'Name',
      sortFunction: (a, b) => a.name.localeCompare(b.name),
    },
    {
      label: 'Price',
      sortFunction: (a, b) => a.price - b.price,
    },
  ]}
  paginated
  itemsPerPage={10}
  emptyIcon="cart-outline"
  emptyMessage="No products found"
  emptyAction={{
    label: 'Add Product',
    onPress: () => console.log('Add'),
  }}
/>
```

---

### UniversalCard

Multi-variant card component for displaying information.

**File**: `components/universal/UniversalCard.tsx`

**Props**: (5 variant types)

#### 1. Info Card
```tsx
interface InfoCardProps {
  variant: 'info';
  icon: string;
  title: string;
  description: string;
  badge?: { label: string; color?: string };
  onPress?: () => void;
}
```

#### 2. Action Card
```tsx
interface ActionCardProps {
  variant: 'action';
  icon: string;
  title: string;
  subtitle?: string;
  gradient: [string, string];
  onPress: () => void;
}
```

#### 3. Media Card
```tsx
interface MediaCardProps {
  variant: 'media';
  image: string | ImageSourcePropType;
  title: string;
  description: string;
  tags?: string[];
  footer?: ReactNode;
  onPress?: () => void;
}
```

#### 4. Stat Card
```tsx
interface StatCardProps {
  variant: 'stat';
  icon: string;
  value: string | number;
  label: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: string;
  onPress?: () => void;
}
```

#### 5. Feature Card
```tsx
interface FeatureCardProps {
  variant: 'feature';
  icon: string;
  title: string;
  description: string;
  badge?: { label: string; color?: string };
  onPress?: () => void;
}
```

**Examples**:

```tsx
import { UniversalCard } from '@/components/universal/UniversalCard';

{/* Info Card */}
<UniversalCard
  variant="info"
  icon="information-circle"
  title="Project Status"
  description="All systems operational"
  badge={{ label: 'Active', color: '#6BCF7F' }}
/>

{/* Action Card */}
<UniversalCard
  variant="action"
  icon="add-circle"
  title="New Project"
  subtitle="Start a new project"
  gradient={["#FF6B6B", "#EE5A6F"]}
  onPress={() => console.log('Create project')}
/>

{/* Media Card */}
<UniversalCard
  variant="media"
  image={require('@/assets/images/project.jpg')}
  title="Resort Design"
  description="Luxury beachfront resort"
  tags={['Architecture', 'Commercial']}
  footer={<Text>View Details</Text>}
  onPress={() => console.log('Open project')}
/>

{/* Stat Card */}
<UniversalCard
  variant="stat"
  icon="trending-up"
  value="24"
  label="Active Projects"
  trend="up"
  trendValue="+12%"
  color="#6BCF7F"
/>

{/* Feature Card */}
<UniversalCard
  variant="feature"
  icon="construct"
  title="3D Modeling"
  description="Create stunning 3D visualizations"
  badge={{ label: 'Pro', color: '#FFA500' }}
  onPress={() => console.log('Open 3D')}
/>
```

---

## Shared Layouts

### ModuleLayout

Standard layout for list/grid module pages.

**File**: `components/layouts/ModuleLayout.tsx`

**Props**:
```tsx
interface ModuleLayoutProps {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  showBackButton?: boolean;
  children: ReactNode;
  footerActions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: string;
    onPress: () => void;
  }>;
  scrollable?: boolean;
  noPadding?: boolean;
}
```

**Features**:
- Header with back button + title + subtitle
- Optional headerRight slot
- Scrollable or fixed content
- Footer actions bar
- SafeAreaView support

**Example**:
```tsx
import { ModuleLayout } from '@/components/layouts/ModuleLayout';

<ModuleLayout
  title="Project Dashboard"
  subtitle="Overview of all projects"
  showBackButton
  headerRight={<Ionicons name="settings" size={24} />}
  footerActions={[
    {
      label: 'Add Project',
      variant: 'primary',
      icon: 'add',
      onPress: () => console.log('Add'),
    },
  ]}
  scrollable
>
  {/* Page content */}
  <Text>Dashboard content here</Text>
</ModuleLayout>
```

---

### DetailLayout

Detail page layout with hero image header.

**File**: `components/layouts/DetailLayout.tsx`

**Props**:
```tsx
interface DetailLayoutProps {
  headerImage?: ImageSourcePropType | string;
  headerGradient?: [string, string];
  title: string;
  badge?: { label: string; color?: string };
  metaInfo?: Array<{
    icon: string;
    label: string;
    value: string;
  }>;
  sections: Array<{
    title?: string;
    content: ReactNode;
  }>;
  actions?: Array<{
    label: string;
    icon: string;
    variant?: 'primary' | 'secondary' | 'outline';
    onPress: () => void;
  }>;
}
```

**Features**:
- 240px hero image/gradient
- Circular back button on image
- Curved top title card
- Meta info grid
- Multiple content sections
- Action buttons row

**Example**:
```tsx
import { DetailLayout } from '@/components/layouts/DetailLayout';

<DetailLayout
  headerImage={require('@/assets/images/project.jpg')}
  title="Luxury Resort Project"
  badge={{ label: 'In Progress', color: '#FFA500' }}
  metaInfo={[
    { icon: 'location', label: 'Location', value: 'Phú Quốc' },
    { icon: 'calendar', label: 'Duration', value: '12 months' },
    { icon: 'cash', label: 'Budget', value: '$2.5M' },
  ]}
  sections={[
    {
      title: 'Overview',
      content: <Text>Project description...</Text>,
    },
    {
      title: 'Timeline',
      content: <Text>Timeline details...</Text>,
    },
  ]}
  actions={[
    {
      label: 'Edit',
      icon: 'create',
      variant: 'primary',
      onPress: () => console.log('Edit'),
    },
    {
      label: 'Share',
      icon: 'share-social',
      variant: 'outline',
      onPress: () => console.log('Share'),
    },
  ]}
/>
```

---

### FormLayout

Form page layout with multi-step support.

**File**: `components/layouts/FormLayout.tsx`

**Props**:
```tsx
interface FormLayoutProps {
  title: string;
  description?: string;
  steps?: Array<{
    label: string;
    completed: boolean;
  }>;
  currentStep?: number;
  children: ReactNode;
  actions?: Array<{
    label: string;
    variant?: 'primary' | 'secondary' | 'danger';
    loading?: boolean;
    disabled?: boolean;
    onPress: () => void;
  }>;
}
```

**Features**:
- Header with title + description
- Multi-step progress indicator
- KeyboardAvoidingView
- Scrollable form content
- Footer actions bar
- Step highlighting

**Example**:
```tsx
import { FormLayout } from '@/components/layouts/FormLayout';

<FormLayout
  title="Create Project"
  description="Fill in project details"
  steps={[
    { label: 'Basic Info', completed: true },
    { label: 'Details', completed: false },
    { label: 'Review', completed: false },
  ]}
  currentStep={1}
  actions={[
    {
      label: 'Back',
      variant: 'secondary',
      onPress: () => console.log('Back'),
    },
    {
      label: 'Next',
      variant: 'primary',
      loading: false,
      onPress: () => console.log('Next'),
    },
  ]}
>
  {/* Form content */}
  <UniversalForm fields={[...]} onSubmit={...} />
</FormLayout>
```

---

## Onboarding Components

### OnboardingOverlay

Interactive onboarding tour with tooltips and spotlight effects.

**File**: `components/onboarding/OnboardingOverlay.tsx`

**Props**:
```tsx
interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: () => void;
}
```

**Features**:
- 6-step interactive tour
- Animated tooltips
- Spotlight effects
- Progress dots
- Back/Skip/Next buttons
- AsyncStorage persistence

**Helpers**:
```tsx
// Check if completed
const completed = await hasCompletedOnboarding();

// Reset (for testing)
await resetOnboarding();
```

**Example**:
```tsx
import {
  OnboardingOverlay,
  hasCompletedOnboarding,
} from '@/components/onboarding/OnboardingOverlay';
import { useEffect, useState } from 'react';

const [showOnboarding, setShowOnboarding] = useState(false);

useEffect(() => {
  checkOnboarding();
}, []);

const checkOnboarding = async () => {
  const completed = await hasCompletedOnboarding();
  if (!completed) {
    setShowOnboarding(true);
  }
};

<OnboardingOverlay
  visible={showOnboarding}
  onComplete={() => setShowOnboarding(false)}
/>
```

---

## Usage Patterns

### Pattern 1: Module Page with List
```tsx
import { ModuleLayout } from '@/components/layouts/ModuleLayout';
import { UniversalList } from '@/components/universal/UniversalList';

export default function ProjectListScreen() {
  return (
    <ModuleLayout
      title="Projects"
      showBackButton
      footerActions={[
        { label: 'New', variant: 'primary', onPress: () => {} },
      ]}
    >
      <UniversalList
        data={projects}
        renderItem={(project) => <ProjectCard {...project} />}
        keyExtractor={(p) => p.id}
        searchable
      />
    </ModuleLayout>
  );
}
```

### Pattern 2: Detail Page
```tsx
import { DetailLayout } from '@/components/layouts/DetailLayout';

export default function ProjectDetailScreen({ id }) {
  const project = getProject(id);
  
  return (
    <DetailLayout
      headerImage={project.image}
      title={project.name}
      metaInfo={[...]}
      sections={[...]}
      actions={[...]}
    />
  );
}
```

### Pattern 3: Form Page
```tsx
import { FormLayout } from '@/components/layouts/FormLayout';
import { UniversalForm } from '@/components/universal/UniversalForm';

export default function CreateProjectScreen() {
  return (
    <FormLayout
      title="New Project"
      steps={[...]}
      currentStep={0}
    >
      <UniversalForm
        fields={[...]}
        onSubmit={(values) => console.log(values)}
      />
    </FormLayout>
  );
}
```

---

## Best Practices

1. **Reuse Components**: Always check if a universal component fits before creating custom
2. **Consistent Styling**: Use theme colors from `constants/theme.ts`
3. **Analytics**: Track user interactions with `useAnalytics` hook
4. **Accessibility**: Add `accessibilityLabel` to all interactive elements
5. **Performance**: Use `useMemo` for expensive computations in lists
6. **Error Handling**: Always handle async operations with try/catch
7. **Loading States**: Show loading indicators for async actions

---

**Related Documentation**:
- [Navigation Guide](./NAVIGATION_GUIDE.md)
- [Category Reference](./CATEGORY_REFERENCE.md)
- [Deep Linking Guide](./DEEP_LINKING_GUIDE.md)
