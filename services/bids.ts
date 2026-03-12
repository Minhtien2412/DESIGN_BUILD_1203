import { getItem, setItem } from '@/utils/storage';

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export type Bid = {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  participants: string[]; // user ids
  sitePlan?: string; // optional image URI or description
  milestones?: { id: string; title: string; dueDays?: number }[];
  quotes?: Quote[];
  status?: 'open' | 'awarded' | 'closed';
};

export type Quote = {
  id: string;
  companyId: string;
  companyName?: string;
  price: number;
  message?: string;
  timeline?: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected';
};

const STORAGE_KEY = 'bids_v1';

async function readAll(): Promise<Bid[]> {
  const raw = await getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Bid[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(bids: Bid[]) {
  await setItem(STORAGE_KEY, JSON.stringify(bids));
}

export async function listBidsByOwner(ownerId: string): Promise<Bid[]> {
  const all = await readAll();
  return all.filter((b) => b.ownerId === ownerId).sort((a, z) => (a.createdAt < z.createdAt ? 1 : -1));
}

export async function listAllBids(): Promise<Bid[]> {
  const all = await readAll();
  return all.sort((a, z) => (a.createdAt < z.createdAt ? 1 : -1));
}

export async function getBidById(id: string): Promise<Bid | undefined> {
  const all = await readAll();
  return all.find((b) => b.id === id);
}

export async function listBidsJoinedBy(userId: string): Promise<Bid[]> {
  const all = await readAll();
  return all.filter((b) => b.participants.includes(userId)).sort((a, z) => (a.createdAt < z.createdAt ? 1 : -1));
}

export async function createBid(ownerId: string, title: string, description?: string): Promise<Bid> {
  const bid: Bid = {
    id: makeId(),
    title,
    description,
    ownerId,
    createdAt: new Date().toISOString(),
    participants: [],
    milestones: [],
    quotes: [],
    status: 'open',
  };
  const all = await readAll();
  all.push(bid);
  await writeAll(all);
  return bid;
}

export async function createBidWithDetails(
  ownerId: string,
  title: string,
  description?: string,
  sitePlan?: string,
  milestones?: { id?: string; title: string; dueDays?: number }[],
): Promise<Bid> {
  const bid: Bid = {
    id: makeId(),
    title,
    description,
    ownerId,
    createdAt: new Date().toISOString(),
    participants: [],
    sitePlan,
    milestones: (milestones || []).map((m) => ({ id: makeId(), title: m.title, dueDays: m.dueDays })),
    quotes: [],
    status: 'open',
  };
  const all = await readAll();
  all.push(bid);
  await writeAll(all);
  return bid;
}

export async function submitQuote(bidId: string, companyId: string, price: number, message?: string, timeline?: string, companyName?: string): Promise<Quote> {
  const all = await readAll();
  const b = all.find((x) => x.id === bidId);
  if (!b) throw new Error('Bid not found');
  const q: Quote = {
    id: makeId(),
    companyId,
    companyName,
    price,
    message,
    timeline,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };
  b.quotes = b.quotes || [];
  b.quotes.push(q);
  await writeAll(all);
  return q;
}

export async function acceptQuote(bidId: string, quoteId: string, ownerId: string): Promise<void> {
  const all = await readAll();
  const b = all.find((x) => x.id === bidId && x.ownerId === ownerId);
  if (!b) throw new Error('Not found or not owner');
  if (!b.quotes) throw new Error('No quotes');
  // mark all other quotes rejected, mark chosen accepted
  b.quotes = b.quotes.map((q) => ({ ...q, status: q.id === quoteId ? 'accepted' : 'rejected' }));
  b.status = 'awarded';
  await writeAll(all);
}

export async function joinBid(bidId: string, userId: string): Promise<void> {
  const all = await readAll();
  const b = all.find((x) => x.id === bidId);
  if (!b) throw new Error('Bid not found');
  if (!b.participants.includes(userId)) b.participants.push(userId);
  await writeAll(all);
}

export async function leaveBid(bidId: string, userId: string): Promise<void> {
  const all = await readAll();
  const b = all.find((x) => x.id === bidId);
  if (!b) throw new Error('Bid not found');
  b.participants = b.participants.filter((p) => p !== userId);
  await writeAll(all);
}

export async function removeBid(bidId: string, ownerId: string): Promise<void> {
  const all = await readAll();
  const idx = all.findIndex((x) => x.id === bidId && x.ownerId === ownerId);
  if (idx === -1) throw new Error('Not found or not owner');
  all.splice(idx, 1);
  await writeAll(all);
}

export default {
  listBidsByOwner,
  listBidsJoinedBy,
  createBid,
  joinBid,
  leaveBid,
  removeBid,
};
