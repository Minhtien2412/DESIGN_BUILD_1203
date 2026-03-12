/**
 * Construction Map Integration Example
 * Demonstrates how to use TaskForm and StageForm with ConstructionMapCanvas
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import ConstructionMapCanvas from '@/components/construction/ConstructionMapCanvas';

/**
 * Example Screen with Full Construction Map Integration
 * Shows canvas with forms, controls, and lists
 */
export default function ConstructionMapIntegrationExample() {
  const projectId = 'project-123'; // Replace with actual project ID

  const handleTaskSelect = (taskId: string) => {
    console.log('Task selected:', taskId);
    // Handle task selection (e.g., show details, highlight on canvas)
  };

  const handleStageSelect = (stageId: string) => {
    console.log('Stage selected:', stageId);
    // Handle stage selection (e.g., show details, highlight on canvas)
  };

  return (
    <View style={styles.container}>
      <ConstructionMapCanvas
        projectId={projectId}
        showControls={true}
        showTaskList={false}
        showStageList={false}
        onTaskSelect={handleTaskSelect}
        onStageSelect={handleStageSelect}
        autoSaveInterval={30000}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

/**
 * USAGE GUIDE
 * ===========
 * 
 * 1. Basic Integration:
 *    <ConstructionMapCanvas projectId="your-project-id" />
 * 
 * 2. With Controls and Lists:
 *    <ConstructionMapCanvas
 *      projectId="project-123"
 *      showControls={true}
 *      showTaskList={true}
 *      showStageList={true}
 *    />
 * 
 * 3. With Custom Handlers:
 *    <ConstructionMapCanvas
 *      projectId="project-123"
 *      onTaskSelect={(id) => console.log('Task:', id)}
 *      onStageSelect={(id) => console.log('Stage:', id)}
 *    />
 * 
 * 4. Creating Tasks & Stages:
 *    - Click the floating "+ Task" button (bottom-right, blue)
 *    - Click the floating "+ Stage" button (bottom-right, green)
 *    - Fill in the form fields
 *    - Click "Tạo mới" to create
 * 
 * 5. Editing Tasks & Stages:
 *    - Click on a task/stage card
 *    - Click the edit button (if available in card)
 *    - Modify fields in the form
 *    - Click "Cập nhật" to save
 * 
 * FEATURES INCLUDED:
 * ==================
 * 
 * ✅ Canvas Rendering
 *    - Real-time map display
 *    - Pan and zoom controls
 *    - Active users indicator
 *    - Sync status badge
 * 
 * ✅ Task Management
 *    - Create new tasks via modal form
 *    - Edit existing tasks
 *    - Status picker (Pending, In-Progress, Completed, Blocked)
 *    - Priority selector (Low, Medium, High)
 *    - Assignee picker
 *    - Start/End date inputs
 *    - Progress tracking
 *    - Form validation
 * 
 * ✅ Stage Management
 *    - Create new stages via modal form
 *    - Edit existing stages
 *    - Status picker (Pending, Active, Completed, Cancelled)
 *    - Color picker (10 predefined colors)
 *    - Order/numbering
 *    - Duration calculator
 *    - Form validation
 * 
 * ✅ Real-time Collaboration
 *    - WebSocket synchronization
 *    - Multi-user presence
 *    - Auto-save functionality
 *    - Optimistic updates
 * 
 * ✅ UI/UX
 *    - Floating Action Buttons (FAB) for quick creation
 *    - Modal forms with slide animation
 *    - Keyboard-aware input handling
 *    - Loading states
 *    - Error messages
 *    - Vietnamese language support
 * 
 * PROPS REFERENCE:
 * ================
 * 
 * ConstructionMapCanvas Props:
 * ---------------------------
 * @param projectId           - Required. The project ID to load
 * @param showControls        - Optional. Show zoom/pan controls (default: true)
 * @param showTaskList        - Optional. Show task list sidebar (default: false)
 * @param showStageList       - Optional. Show stage list sidebar (default: false)
 * @param onTaskSelect        - Optional. Callback when task is selected
 * @param onStageSelect       - Optional. Callback when stage is selected
 * @param autoSaveInterval    - Optional. Auto-save interval in ms (default: 3000)
 * 
 * TaskForm Props:
 * ---------------
 * @param visible             - Boolean to show/hide modal
 * @param task                - Task object for edit mode (null for create)
 * @param projectId           - Project ID
 * @param onSubmit            - Async callback with TaskFormData
 * @param onCancel            - Callback to close form
 * @param assigneeOptions     - Array of {id, name} for assignee picker
 * 
 * StageForm Props:
 * ----------------
 * @param visible             - Boolean to show/hide modal
 * @param stage               - Stage object for edit mode (null for create)
 * @param projectId           - Project ID
 * @param onSubmit            - Async callback with StageFormData
 * @param onCancel            - Callback to close form
 * @param existingStages      - Array of stages for dependencies
 * 
 * INTEGRATION WORKFLOW:
 * =====================
 * 
 * 1. User clicks "+ Task" FAB
 * 2. TaskForm modal opens (create mode)
 * 3. User fills in fields:
 *    - Name (required)
 *    - Description
 *    - Status (picker)
 *    - Priority (picker)
 *    - Assignee (picker)
 *    - Start/End dates
 * 4. User clicks "Tạo mới"
 * 5. Form validates input
 * 6. If valid, calls onSubmit → handleTaskFormSubmit
 * 7. handleTaskFormSubmit calls createTask from useConstructionMap
 * 8. API request sent to backend
 * 9. On success:
 *    - Form closes
 *    - Task added to canvas
 *    - WebSocket broadcasts update
 *    - Other users see new task in real-time
 * 10. On error:
 *     - Error message shown in form
 *     - User can retry
 * 
 * Same workflow applies for stages with StageForm.
 * 
 * NEXT STEPS:
 * ===========
 * 
 * Week 2 Day 3: Drag & Drop
 * - Click and drag tasks on canvas
 * - Visual feedback during drag
 * - Snap to grid
 * - WebSocket sync for position updates
 * 
 * Week 2 Day 4: Advanced Filtering
 * - Multi-criteria filters
 * - Date range picker
 * - Status combinations
 * - Save filter presets
 * 
 * Week 2 Day 5: Project Integration
 * - Connect to main project list
 * - Project creation flow
 * - Template selection
 */
