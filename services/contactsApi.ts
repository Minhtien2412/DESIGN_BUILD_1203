/**
 * Contacts API Services
 * Handles contact creation and listing
 */

import { ApiError, apiFetch } from './api';

// Types
export type CreateContactPayload = {
  full_name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  project_type?: string;
  budget?: string;
  location?: string;
};

export type Contact = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  message?: string;
  source?: string;
  project_type?: string;
  budget?: string;
  location?: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed';
  created_at: string;
  updated_at?: string;
};

export type ContactsListResponse = {
  contacts: Contact[];
  total: number;
  page?: number;
  limit?: number;
};

/**
 * Create a new contact
 * POST /api/contacts
 */
export async function createContact(payload: CreateContactPayload): Promise<{ id: string }> {
  try {
    const response = await apiFetch<{ id: string }>('/api/contacts', {
      method: 'POST',
      data: payload,
    });
    
    if (!response.id) {
      throw new Error('Không nhận được ID từ server');
    }
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Tạo liên hệ thất bại';
      throw new Error(message);
    }
    throw new Error('Tạo liên hệ thất bại. Vui lòng kiểm tra kết nối mạng.');
  }
}

/**
 * Get list of contacts
 * GET /api/contacts
 */
export async function listContacts(params?: {
  page?: number;
  limit?: number;
  status?: Contact['status'];
}): Promise<Contact[]> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/api/contacts${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiFetch<Contact[] | ContactsListResponse>(url, {
      method: 'GET',
    });
    
    // Handle both array response and paginated response
    if (Array.isArray(response)) {
      return response;
    }
    
    return response.contacts || [];
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Không thể lấy danh sách liên hệ';
      throw new Error(message);
    }
    throw new Error('Không thể lấy danh sách liên hệ. Vui lòng kiểm tra kết nối mạng.');
  }
}

/**
 * Get a single contact by ID
 * GET /api/contacts/:id
 */
export async function getContact(id: string): Promise<Contact> {
  try {
    const response = await apiFetch<Contact>(`/api/contacts/${id}`, {
      method: 'GET',
    });
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Không thể lấy thông tin liên hệ';
      throw new Error(message);
    }
    throw new Error('Không thể lấy thông tin liên hệ');
  }
}

/**
 * Update contact status
 * PATCH /api/contacts/:id
 */
export async function updateContactStatus(
  id: string,
  status: Contact['status']
): Promise<Contact> {
  try {
    const response = await apiFetch<Contact>(`/api/contacts/${id}`, {
      method: 'PATCH',
      data: { status },
    });
    
    return response;
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Không thể cập nhật trạng thái';
      throw new Error(message);
    }
    throw new Error('Không thể cập nhật trạng thái liên hệ');
  }
}

/**
 * Delete a contact
 * DELETE /api/contacts/:id
 */
export async function deleteContact(id: string): Promise<void> {
  try {
    await apiFetch(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      const message = error.data?.error || error.data?.message || 'Không thể xóa liên hệ';
      throw new Error(message);
    }
    throw new Error('Không thể xóa liên hệ');
  }
}
