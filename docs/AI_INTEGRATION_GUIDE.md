# AI Integration Guide for Project Detail Screens

This guide shows how to integrate AI features into existing project detail screens using the AI components.

## Available Components

### 1. AIInsightsWidget
A compact widget showing AI statistics and quick actions.

**Location:** `components/ai/AIInsightsWidget.tsx`

**Usage:**
```tsx
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';

<AIInsightsWidget
  projectId={projectId}
  totalReports={15}
  progressReports={8}
  qualityReports={7}
/>
```

**Props:**
- `projectId: string` - Required. The project ID
- `totalReports?: number` - Total AI reports count
- `progressReports?: number` - Progress reports count
- `qualityReports?: number` - Quality reports count

### 2. QuickReportsViewer
A list component showing recent AI reports with navigation.

**Location:** `components/ai/QuickReportsViewer.tsx`

**Usage:**
```tsx
import QuickReportsViewer from '@/components/ai/QuickReportsViewer';

<QuickReportsViewer
  projectId={projectId}
  maxItems={5}
/>
```

**Props:**
- `projectId: string` - Required. The project ID
- `maxItems?: number` - Max reports to show (default: 5)

### 3. Full AI Analysis Screen
Complete AI integration screen with all features.

**Location:** `app/projects/[id]/ai-analysis/index.tsx`

**Navigation:**
```tsx
import { router } from 'expo-router';

// Navigate to full AI screen
router.push(`/projects/${projectId}/ai-analysis`);
```

## Integration Example

### Option 1: Add to Existing Project Detail Screen

```tsx
// app/projects/[id]/index.tsx or detail.tsx

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';
import QuickReportsViewer from '@/components/ai/QuickReportsViewer';

export default function ProjectDetailScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView style={styles.container}>
      {/* Existing project info sections */}
      <View style={styles.section}>
        {/* Project header, status, etc. */}
      </View>

      {/* AI Insights Widget */}
      <View style={styles.section}>
        <AIInsightsWidget
          projectId={projectId!}
          totalReports={15}
          progressReports={8}
          qualityReports={7}
        />
      </View>

      {/* Quick Reports Viewer */}
      <View style={styles.section}>
        <QuickReportsViewer
          projectId={projectId!}
          maxItems={3}
        />
      </View>

      {/* Other project sections */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});
```

### Option 2: Add as Tab in Project Detail

If using tabs within project detail:

```tsx
// app/projects/[id]/_layout.tsx

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ProjectLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="overview"
        options={{
          title: 'Tổng quan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai-analysis"
        options={{
          title: 'AI',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="sparkles" size={size} color={color} />
          ),
        }}
      />
      {/* Other tabs */}
    </Tabs>
  );
}
```

### Option 3: Dynamic Stats Integration

Fetch real AI stats and pass to widgets:

```tsx
import React, { useEffect, useState } from 'react';
import { useAIReports } from '@/hooks/useAI';
import AIInsightsWidget from '@/components/ai/AIInsightsWidget';

export default function ProjectDetailScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const { reports, loadReports } = useAIReports();
  const [stats, setStats] = useState({
    total: 0,
    progress: 0,
    quality: 0,
  });

  useEffect(() => {
    if (projectId) {
      loadReports(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    setStats({
      total: reports.length,
      progress: reports.filter((r) => r.reportType === 'PROGRESS').length,
      quality: reports.filter((r) => r.reportType === 'QUALITY').length,
    });
  }, [reports]);

  return (
    <ScrollView>
      <AIInsightsWidget
        projectId={projectId!}
        totalReports={stats.total}
        progressReports={stats.progress}
        qualityReports={stats.quality}
      />
    </ScrollView>
  );
}
```

## Features Provided

### Quick Actions
- **Phân tích ảnh** - Navigate to photo analysis screen
- **Chat với AI** - Open AI chat interface
- **Phát hiện lỗi** - View error detection screen
- **Ước tính VL** - Material estimation screen

### Reports Viewer
- Recent reports list (configurable limit)
- Report type badges (Progress/Quality/Safety)
- Direct navigation to report detail
- Empty states with helpful messages
- Loading and error states

### AI Insights
- Statistics display (total, progress, quality reports)
- Feature highlights
- Quick access to AI tools

## Navigation Flows

### From Widget to AI Screens

```
AIInsightsWidget
  ├── Quick Analyze → /services/ai-assistant/photo-analysis
  ├── Chat → /services/ai-assistant/?projectId={id}
  └── View All → /projects/{id}/ai-analysis

QuickReportsViewer
  ├── Report Card → /services/ai-assistant/progress-report?reportId={id}
  └── View All → /services/ai-assistant/history?projectId={id}

Full AI Screen (/projects/{id}/ai-analysis)
  ├── Phân tích ảnh → /services/ai-assistant/photo-analysis
  ├── Chat với AI → /services/ai-assistant/?projectId={id}
  ├── Phát hiện lỗi → /services/ai-assistant/error-detection?projectId={id}
  └── Ước tính VL → /services/ai-assistant/material-estimation?projectId={id}
```

## Styling Customization

All components use consistent styling from the design system. To customize:

```tsx
// Custom wrapper with different spacing
<View style={{ marginVertical: 20, paddingHorizontal: 10 }}>
  <AIInsightsWidget projectId={projectId} />
</View>

// Or pass custom maxItems to QuickReportsViewer
<QuickReportsViewer
  projectId={projectId}
  maxItems={10} // Show more reports
/>
```

## Best Practices

1. **Always pass projectId** - Required for all AI components
2. **Use dynamic stats** - Fetch real data from useAIReports hook
3. **Handle loading states** - Components have built-in loading/error states
4. **Combine widgets** - Use both AIInsightsWidget and QuickReportsViewer for full experience
5. **Responsive layout** - Components adapt to container width

## Testing

```tsx
// Test with mock data
<AIInsightsWidget
  projectId="test-project-1"
  totalReports={0}  // Test empty state
/>

<QuickReportsViewer
  projectId="test-project-1"
  maxItems={2}  // Test with few items
/>
```

## Next Steps

After integration:
1. Test navigation from widgets to AI screens
2. Verify real-time data updates
3. Test with various report counts (0, 1-5, 10+)
4. Ensure proper error handling
5. Test on different screen sizes

---

For full AI features documentation, see:
- `/services/ai-assistant/` - All AI screens
- `hooks/useAI.ts` - AI hooks documentation
- `services/ai.ts` - API endpoints
