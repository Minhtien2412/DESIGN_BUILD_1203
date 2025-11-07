/**
 * HTTP client utility matching ThietKe Resort API pseudo-code
 * Base URL: https://api.thietkeresort.com.vn
 */


const BASE = 'https://api.thietkeresort.com.vn';

/**
 * Generic HTTP client function
 * @param method HTTP method
 * @param path API path
 * @param body Request body (optional)
 * @param token Access token (optional)
 * @returns Parsed JSON response
 */
async function http(method: string, path: string, body?: any, token?: string): Promise<any> {
  const url = path.startsWith('http') ? path : BASE + path;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    method,
    headers,
  };
  
  if (body) {
    config.body = JSON.stringify(body);
  }
  
  const res = await fetch(url, config);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP ${res.status}`);
  }
  
  return res.json();
}

// Auth convenience functions
export const register = (data: any) => http('POST', '/auth/register', data);
export const login = (data: any) => http('POST', '/auth/login', data);
export const refresh = (rtok: string) => http('POST', '/auth/refresh', { refresh_token: rtok });
export const me = (atk: string) => http('GET', '/me', undefined, atk);

// Payments convenience functions
export const listPayments = (atk: string, q: string = '?page=1&page_size=20') => 
  http('GET', '/payments' + q, undefined, atk);

export const createPayment = (atk: string, payload: any) => 
  http('POST', '/payments', payload, atk);

export const getPayment = (atk: string, id: string) => 
  http('GET', `/payments/${id}`, undefined, atk);

export const updatePayment = (atk: string, id: string, payload: any) => 
  http('PATCH', `/payments/${id}`, payload, atk);

export const deletePayment = (atk: string, id: string) => 
  http('DELETE', `/payments/${id}`, undefined, atk);

export const confirmPayment = (atk: string, id: string, payload: any = { status: 'paid' }) => 
  http('POST', `/payments/${id}/confirm`, payload, atk);

// Health check
export const healthCheck = () => http('GET', '/health');

// Export the main http function
export { http };
