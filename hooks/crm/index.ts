/**
 * CRM Hooks Index
 * ================
 * 
 * Export all hooks for Perfex CRM integration
 * 
 * Usage:
 * import { useProjectsHub, useCRMTasks, useCRMInvoices } from '@/hooks/crm';
 * 
 * @author Auto-generated
 * @updated 2026-01-03
 */

// Main Dashboard Data Hook
export { useDashboardData } from '../useDashboardData';

// Projects Hub Hook
export { useProjectsHub } from '../useProjectsHub';
export type {
    ProjectStats,
    RecentProject,
    UseProjectsHubReturn
} from '../useProjectsHub';

// Construction Hub Hook
export { useConstructionHub } from '../useConstructionHub';
export type {
    ConstructionMilestone, ConstructionProject, ConstructionStats,
    UseConstructionHubReturn
} from '../useConstructionHub';

// CRM Tasks Hook
export { useCRMTasks } from '../useCRMTasks';
export type {
    CRMTask,
    TasksStats,
    UseCRMTasksReturn
} from '../useCRMTasks';

// CRM Invoices Hook
export { useCRMInvoices } from '../useCRMInvoices';
export type {
    CRMInvoice,
    InvoiceItem,
    InvoicesStats,
    UseCRMInvoicesReturn
} from '../useCRMInvoices';

// CRM Leads Hook  
export { useCRMLeads } from '../useCRMLeads';
export type {
    CRMLead,
    LeadsStats,
    UseCRMLeadsReturn
} from '../useCRMLeads';

// Unified Messaging Hook (Zalo-style)
export { useUnifiedMessaging } from './useUnifiedMessaging';
export type {
    DeliveryStatus, MessageType, User as MessagingUser, OnlineStatus, SendMessageParams, UnifiedConversation,
    UnifiedMessage, UseUnifiedMessagingReturn
} from './useUnifiedMessaging';

// Existing Perfex CRM Hooks - re-export from usePerfexCRM file
export * from '../usePerfexCRM';

// Default export with all hooks
const CRMHooks = {
  useDashboardData: () => import('../useDashboardData').then(m => m.useDashboardData),
  useProjectsHub: () => import('../useProjectsHub').then(m => m.useProjectsHub),
  useConstructionHub: () => import('../useConstructionHub').then(m => m.useConstructionHub),
  useCRMTasks: () => import('../useCRMTasks').then(m => m.useCRMTasks),
  useCRMInvoices: () => import('../useCRMInvoices').then(m => m.useCRMInvoices),
  useCRMLeads: () => import('../useCRMLeads').then(m => m.useCRMLeads),
  useUnifiedMessaging: () => import('./useUnifiedMessaging').then(m => m.useUnifiedMessaging),
};

export default CRMHooks;
