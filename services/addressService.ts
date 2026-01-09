/**
 * Address Service
 * Handle user addresses for checkout/delivery
 */

import { BackendResult, deleteReq, getJson, patchJson, postJson } from './backendClient';

// Types
export interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  province?: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
  type?: 'home' | 'office' | 'other';
  lat?: number;
  lng?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressListResponse {
  addresses: Address[];
  total: number;
}

export interface CreateAddressInput {
  name: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  province?: string;
  postalCode?: string;
  isDefault?: boolean;
  type?: 'home' | 'office' | 'other';
}

// API Endpoints
const ENDPOINTS = {
  list: '/api/users/addresses',
  create: '/api/users/addresses',
  update: (id: string) => `/api/users/addresses/${id}`,
  delete: (id: string) => `/api/users/addresses/${id}`,
  setDefault: (id: string) => `/api/users/addresses/${id}/default`,
};

/**
 * Get all addresses for the current user
 */
export async function getAddresses(): Promise<BackendResult<AddressListResponse>> {
  return getJson<AddressListResponse>(ENDPOINTS.list, { retry: 2 });
}

/**
 * Create a new address
 */
export async function createAddress(
  input: CreateAddressInput
): Promise<BackendResult<Address>> {
  return postJson<Address>(ENDPOINTS.create, input);
}

/**
 * Update an existing address
 */
export async function updateAddress(
  id: string,
  input: Partial<CreateAddressInput>
): Promise<BackendResult<Address>> {
  return patchJson<Address>(ENDPOINTS.update(id), input);
}

/**
 * Delete an address
 */
export async function deleteAddress(
  id: string
): Promise<BackendResult<{ success: boolean }>> {
  return deleteReq(ENDPOINTS.delete(id));
}

/**
 * Set an address as default
 */
export async function setDefaultAddress(
  id: string
): Promise<BackendResult<Address>> {
  return postJson<Address>(ENDPOINTS.setDefault(id), {});
}

// Mock data fallback
export const MOCK_ADDRESSES: Address[] = [
  {
    id: '1',
    name: 'Văn phòng',
    phone: '0912345678',
    address: '123 Nguyễn Huệ',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
    isDefault: true,
    type: 'office',
  },
  {
    id: '2',
    name: 'Nhà riêng',
    phone: '0987654321',
    address: '456 Lê Lợi',
    district: 'Quận 3',
    city: 'TP. Hồ Chí Minh',
    isDefault: false,
    type: 'home',
  },
];

export default {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  MOCK_ADDRESSES,
};
