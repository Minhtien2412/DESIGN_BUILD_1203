// Domain barrel: auth
// Centralizes auth-related exports for easier maintenance and refactors.
export { AuthProvider, useAuth } from '@/context/AuthContext';
export * from '@/services/auth';
export { deleteItem, getItem, setItem } from '@/utils/storage';

