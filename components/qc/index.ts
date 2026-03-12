// QC/QA Components Library
// Export all reusable QC components

export { default as SeverityBadge } from './SeverityBadge';
export type { DefectSeverity } from './SeverityBadge';

export { default as StatusBadge } from './StatusBadge';
export type { ChecklistStatus, DefectStatus } from './StatusBadge';

export { default as DefectCard } from './DefectCard';

export { default as ChecklistProgress } from './ChecklistProgress';

export { default as ChecklistItem } from './ChecklistItem';
export type { ChecklistItemData, InspectionResult } from './ChecklistItem';

export { default as ChecklistForm } from './ChecklistForm';

export { default as InspectionTimeline } from './InspectionTimeline';
export type { TimelineEvent } from './InspectionTimeline';

export { default as PhotoUpload } from './PhotoUpload';
