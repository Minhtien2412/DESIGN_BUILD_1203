/**
 * Category Navigation Helpers
 * Extended navigation utilities for the 9-category system
 */

import { CATEGORIES, getCategoryById } from '@/constants/categories';
import { router } from 'expo-router';

export interface Breadcrumb {
  label: string;
  route?: string;
}

/**
 * Navigate to category hub page
 */
export const navigateToCategory = (categoryId: string) => {
  const category = getCategoryById(categoryId);
  if (category) {
    router.push(`/categories/${categoryId}` as any);
  }
};

/**
 * Navigate to module by moduleId
 */
export const navigateToModule = (moduleId: string) => {
  for (const category of CATEGORIES) {
    const module = category.modules.find(m => m.id === moduleId);
    if (module) {
      router.push(module.route as any);
      return;
    }
  }
  console.warn(`Module ${moduleId} not found`);
};

/**
 * Navigate to search with optional query
 */
export const navigateToSearch = (query?: string) => {
  if (query) {
    router.push({ pathname: '/search', params: { q: query } } as any);
  } else {
    router.push('/search' as any);
  }
};

/**
 * Generate breadcrumbs for current route
 */
export const generateBreadcrumbs = (
  currentRoute: string,
  moduleId?: string,
  categoryId?: string
): Breadcrumb[] => {
  const breadcrumbs: Breadcrumb[] = [{ label: 'Trang chủ', route: '/' }];

  if (categoryId) {
    const category = getCategoryById(categoryId);
    if (category) {
      breadcrumbs.push({ label: category.label, route: `/categories/${categoryId}` });
    }
  }

  if (moduleId) {
    for (const category of CATEGORIES) {
      const module = category.modules.find(m => m.id === moduleId);
      if (module) {
        if (!categoryId) {
          breadcrumbs.push({ label: category.label, route: `/categories/${category.id}` });
        }
        breadcrumbs.push({ label: module.label });
        break;
      }
    }
  }

  if (currentRoute.startsWith('/search')) {
    breadcrumbs.push({ label: 'Tìm kiếm' });
  }

  return breadcrumbs;
};

/**
 * Get module context
 */
export const getModuleContext = (moduleId: string) => {
  for (const category of CATEGORIES) {
    const module = category.modules.find(m => m.id === moduleId);
    if (module) {
      return { category, module };
    }
  }
  return null;
};

/**
 * Get related modules
 */
export const getRelatedModules = (moduleId: string, limit = 5) => {
  const context = getModuleContext(moduleId);
  if (!context) return [];
  return context.category.modules.filter(m => m.id !== moduleId).slice(0, limit);
};

/**
 * Parse deep link URL
 */
export const parseDeepLink = (url: string) => {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname;
    
    if (path.startsWith('/categories/')) {
      const categoryId = path.split('/')[2];
      return { type: 'category', categoryId };
    }
    
    if (path === '/search') {
      const query = parsed.searchParams.get('q');
      return { type: 'search', query: query || undefined };
    }
    
    return { type: 'unknown' };
  } catch (error) {
    console.error('Failed to parse deep link:', error);
    return { type: 'error' };
  }
};

/**
 * Handle deep link navigation
 */
export const handleDeepLink = (url: string) => {
  const parsed = parseDeepLink(url);
  
  switch (parsed.type) {
    case 'category':
      if (parsed.categoryId) {
        navigateToCategory(parsed.categoryId);
      }
      break;
    case 'search':
      navigateToSearch(parsed.query);
      break;
    default:
      console.warn('Unknown deep link type:', parsed.type);
  }
};
