/**
 * Project Data Types
 * Dữ liệu thực tế từ API/CRM - không còn mock data
 * Cleaned for production
 */

import { ProjectStatus, ProjectType } from '@/hooks/useProjects';

/**
 * Project type - matches API data structure
 */
export interface MockProject {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  progress: number;
  location: string;
  budget: number;
  client: {
    id: number | string;
    name: string;
    phone?: string;
    email?: string;
  };
  team: { id: string; name: string; role: string }[];
  start_date: string;
  end_date: string;
  images: string[];
  documents: { id: string; name: string; url: string; size: number; uploaded_at: string }[];
  created_at: string;
  updated_at: string;
}

/**
 * Project images URLs references (for actual project images from API)
 */
export const PROJECT_IMAGES = {
  residential: '',
  commercial: '',
  landscape: '',
  interior: '',
  renovation: '',
};

// Empty - data from CRM/API only
export const MOCK_PROJECTS: MockProject[] = [];

/**
 * Get projects from CRM API
 * Use PerfexProjectsService.getAll() instead of MOCK_PROJECTS
 */
export function getProjects(): MockProject[] {
  return MOCK_PROJECTS;
}

/**
 * Get project by ID from CRM API
 * Use PerfexProjectsService.get(id) instead
 */
export function getProjectById(id: string): MockProject | undefined {
  return MOCK_PROJECTS.find(p => p.id === id);
}

export default MOCK_PROJECTS;
