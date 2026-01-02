/**
 * Shopping Archive Layout - Hidden from navigation
 * Contains individual category screens that are now handled by [category].tsx
 * 
 * Archived files (19 total):
 * - Individual category pages: ban-an, ban-hoc, cua, dien, dieu-hoa, gach-men,
 *   noi-that, nuoc, pccc, sofa, son, thiet-bi-bep, thiet-bi-ve-sinh, vat-lieu-xay
 * - Enhanced/duplicate views: equipment-enhanced, materials-enhanced, equipment
 * - Legacy: product-detail, products-from-backend
 * 
 * These are kept for reference. The dynamic [category].tsx handles all categories now.
 */

import { Stack } from 'expo-router';

export default function ShoppingArchiveLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
