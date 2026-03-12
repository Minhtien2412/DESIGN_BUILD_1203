/**
 * Role Permission Presets
 * Predefined permission sets for each role
 */

import {
    PermissionAction,
    PermissionModule,
    ROLE_HIERARCHY,
    RolePermissionPreset,
    UserRole,
} from '@/types/permission';

export const ROLE_PERMISSION_PRESETS: RolePermissionPreset[] = [
  // ==================== SUPER ADMIN ====================
  {
    role: UserRole.SUPER_ADMIN,
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    level: ROLE_HIERARCHY[UserRole.SUPER_ADMIN],
    permissions: Object.values(PermissionModule).map((module) => ({
      module,
      actions: Object.values(PermissionAction),
    })),
  },

  // ==================== ADMIN ====================
  {
    role: UserRole.ADMIN,
    name: 'Administrator',
    description: 'Full access except system settings',
    level: ROLE_HIERARCHY[UserRole.ADMIN],
    permissions: Object.values(PermissionModule)
      .filter((module) => module !== PermissionModule.SETTINGS)
      .map((module) => ({
        module,
        actions: Object.values(PermissionAction),
      })),
  },

  // ==================== PROJECT MANAGER ====================
  {
    role: UserRole.PROJECT_MANAGER,
    name: 'Project Manager',
    description: 'Manage projects, tasks, budget, and team',
    level: ROLE_HIERARCHY[UserRole.PROJECT_MANAGER],
    permissions: [
      {
        module: PermissionModule.DASHBOARD,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.ANALYTICS,
        actions: [PermissionAction.VIEW, PermissionAction.EXPORT],
      },
      {
        module: PermissionModule.REPORTS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EXPORT],
      },
      {
        module: PermissionModule.PROJECTS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
          PermissionAction.APPROVE,
        ],
      },
      {
        module: PermissionModule.TASKS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
          PermissionAction.DELETE,
          PermissionAction.APPROVE,
        ],
      },
      {
        module: PermissionModule.TIMELINE,
        actions: [PermissionAction.VIEW, PermissionAction.EDIT],
      },
      {
        module: PermissionModule.MILESTONES,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
          PermissionAction.APPROVE,
        ],
      },
      {
        module: PermissionModule.BUDGET,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
          PermissionAction.APPROVE,
          PermissionAction.EXPORT,
        ],
      },
      {
        module: PermissionModule.MATERIALS,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.EQUIPMENT,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.LABOR,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.QC_QA,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.SAFETY,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.INSPECTIONS,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.DOCUMENTS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.DRAWINGS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.CONTRACTS,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.MESSAGES,
        actions: Object.values(PermissionAction).filter((a) => a !== PermissionAction.DELETE),
      },
      {
        module: PermissionModule.ANNOUNCEMENTS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.NOTIFICATIONS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.PHOTOS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.VIDEOS,
        actions: Object.values(PermissionAction),
      },
    ],
  },

  // ==================== SITE MANAGER ====================
  {
    role: UserRole.SITE_MANAGER,
    name: 'Site Manager',
    description: 'Manage on-site operations, safety, and resources',
    level: ROLE_HIERARCHY[UserRole.SITE_MANAGER],
    permissions: [
      {
        module: PermissionModule.DASHBOARD,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.TASKS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
          PermissionAction.DELETE,
        ],
      },
      {
        module: PermissionModule.MATERIALS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.EQUIPMENT,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.LABOR,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.QC_QA,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.SAFETY,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.INSPECTIONS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.DOCUMENTS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.PHOTOS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.VIDEOS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.MESSAGES,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
    ],
  },

  // ==================== ENGINEER ====================
  {
    role: UserRole.ENGINEER,
    name: 'Engineer',
    description: 'Technical review, QC, and documentation',
    level: ROLE_HIERARCHY[UserRole.ENGINEER],
    permissions: [
      {
        module: PermissionModule.DASHBOARD,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.PROJECTS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.TASKS,
        actions: [PermissionAction.VIEW, PermissionAction.EDIT],
      },
      {
        module: PermissionModule.QC_QA,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.INSPECTIONS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.DOCUMENTS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.DRAWINGS,
        actions: Object.values(PermissionAction),
      },
      {
        module: PermissionModule.PHOTOS,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.REPORTS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE, PermissionAction.EXPORT],
      },
    ],
  },

  // ==================== CONTRACTOR ====================
  {
    role: UserRole.CONTRACTOR,
    name: 'Contractor',
    description: 'Execute work, report progress, manage resources',
    level: ROLE_HIERARCHY[UserRole.CONTRACTOR],
    permissions: [
      {
        module: PermissionModule.DASHBOARD,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.TASKS,
        actions: [PermissionAction.VIEW, PermissionAction.EDIT],
      },
      {
        module: PermissionModule.MATERIALS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.EQUIPMENT,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.LABOR,
        actions: [
          PermissionAction.VIEW,
          PermissionAction.CREATE,
          PermissionAction.EDIT,
        ],
      },
      {
        module: PermissionModule.SAFETY,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.DOCUMENTS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.PHOTOS,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
      {
        module: PermissionModule.MESSAGES,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
    ],
  },

  // ==================== CLIENT ====================
  {
    role: UserRole.CLIENT,
    name: 'Client',
    description: 'View project progress and approve major changes',
    level: ROLE_HIERARCHY[UserRole.CLIENT],
    permissions: [
      {
        module: PermissionModule.DASHBOARD,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.PROJECTS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.TIMELINE,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.BUDGET,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.QC_QA,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.DOCUMENTS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.DRAWINGS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.CONTRACTS,
        actions: [PermissionAction.VIEW, PermissionAction.APPROVE],
      },
      {
        module: PermissionModule.PHOTOS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.VIDEOS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.REPORTS,
        actions: [PermissionAction.VIEW, PermissionAction.EXPORT],
      },
      {
        module: PermissionModule.MESSAGES,
        actions: [PermissionAction.VIEW, PermissionAction.CREATE],
      },
    ],
  },

  // ==================== VIEWER ====================
  {
    role: UserRole.VIEWER,
    name: 'Viewer',
    description: 'Read-only access to project information',
    level: ROLE_HIERARCHY[UserRole.VIEWER],
    permissions: [
      {
        module: PermissionModule.DASHBOARD,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.PROJECTS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.TIMELINE,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.DOCUMENTS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.PHOTOS,
        actions: [PermissionAction.VIEW],
      },
      {
        module: PermissionModule.VIDEOS,
        actions: [PermissionAction.VIEW],
      },
    ],
  },
];

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: UserRole): RolePermissionPreset | undefined {
  return ROLE_PERMISSION_PRESETS.find((preset) => preset.role === role);
}

/**
 * Check if a role has permission for a specific action on a module
 */
export function hasRolePermission(
  role: UserRole,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const preset = getRolePermissions(role);
  if (!preset) return false;

  const modulePermission = preset.permissions.find((p) => p.module === module);
  if (!modulePermission) return false;

  return modulePermission.actions.includes(action);
}

/**
 * Get all modules a role can access
 */
export function getRoleModules(role: UserRole): PermissionModule[] {
  const preset = getRolePermissions(role);
  if (!preset) return [];

  return preset.permissions.map((p) => p.module);
}

/**
 * Get all actions a role can perform on a module
 */
export function getRoleModuleActions(
  role: UserRole,
  module: PermissionModule
): PermissionAction[] {
  const preset = getRolePermissions(role);
  if (!preset) return [];

  const modulePermission = preset.permissions.find((p) => p.module === module);
  return modulePermission?.actions || [];
}

/**
 * Check if role level is high enough
 */
export function hasMinimumRoleLevel(userRole: UserRole, minLevel: number): boolean {
  return ROLE_HIERARCHY[userRole] >= minLevel;
}

/**
 * Compare two roles
 */
export function compareRoles(role1: UserRole, role2: UserRole): number {
  return ROLE_HIERARCHY[role1] - ROLE_HIERARCHY[role2];
}

/**
 * Check if user role is higher than target role
 */
export function isHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  return compareRoles(userRole, targetRole) > 0;
}
