import { serverFetch } from '@/services/serverClient';

export type ServerBid = {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  status?: string;
};

export async function listServerBids(token: string) {
  return await serverFetch<{ bids: ServerBid[] }>('/bids', { method: 'GET', token });
}

export async function getServerBid(token: string, id: string) {
  return await serverFetch<{ bid: ServerBid }>(`/bids/${id}`, { method: 'GET', token });
}

export async function createServerBid(token: string, payload: { title: string; description?: string }) {
  return await serverFetch<{ bid: ServerBid }>('/bids', { method: 'POST', token, body: JSON.stringify(payload) });
}
