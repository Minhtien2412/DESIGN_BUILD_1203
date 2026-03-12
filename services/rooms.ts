import { getItem, setItem } from '@/utils/storage';

export type RoomMessage = { id: string; text: string; sender: string; at: number };
export type RoomParticipant = { id: string; name: string; online?: boolean; lastSeen?: number };
export type RoomIndexItem = { id: string; name: string; subtext?: string; iconUrl?: string; lastUpdate?: number };

const kMsg = (roomId: string) => `room:${roomId}:messages`;
const kPart = (roomId: string) => `room:${roomId}:participants`;
const kRead = (roomId: string, userId: string) => `room:${roomId}:read:${userId}`;
const kIndex = 'room:index:v1';

export async function getRoomMessages(roomId: string): Promise<RoomMessage[]> {
  try { const raw = await getItem(kMsg(roomId)); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
export async function setRoomMessages(roomId: string, list: RoomMessage[]): Promise<void> {
  try { await setItem(kMsg(roomId), JSON.stringify(list)); } catch {}
}
export async function getRoomParticipants(roomId: string): Promise<RoomParticipant[]> {
  try { const raw = await getItem(kPart(roomId)); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
export async function setRoomParticipants(roomId: string, list: RoomParticipant[]): Promise<void> {
  try { await setItem(kPart(roomId), JSON.stringify(list)); } catch {}
}
export async function getRoomLastRead(roomId: string, userId: string): Promise<number> {
  try { const raw = await getItem(kRead(roomId, userId)); return raw ? Number(raw) || 0 : 0; } catch { return 0; }
}
export async function setRoomLastRead(roomId: string, userId: string, ts: number): Promise<void> {
  try { await setItem(kRead(roomId, userId), String(ts)); } catch {}
}

// Room index helpers for listing dynamic rooms in UI
export async function getRoomIndex(): Promise<RoomIndexItem[]> {
  try { const raw = await getItem(kIndex); return raw ? JSON.parse(raw) : []; } catch { return []; }
}

export async function upsertRoomIndex(item: RoomIndexItem): Promise<void> {
  try {
    const list = await getRoomIndex();
    const idx = list.findIndex(x => x.id === item.id);
    if (idx >= 0) list[idx] = { ...list[idx], ...item };
    else list.unshift(item);
    await setItem(kIndex, JSON.stringify(list));
  } catch {}
}

export async function removeRoomFromIndex(id: string): Promise<void> {
  try {
    const list = await getRoomIndex();
    const next = list.filter(r => r.id !== id);
    await setItem(kIndex, JSON.stringify(next));
  } catch {}
}

export async function createQuickRoom(name: string, participants: RoomParticipant[], introText?: string): Promise<string> {
  const id = `room_${Date.now().toString(36)}`;
  const now = Date.now();
  await upsertRoomIndex({ id, name, lastUpdate: now });
  await setRoomParticipants(id, participants);
  if (introText) {
    await setRoomMessages(id, [{ id: `${now}`, text: introText, sender: 'system', at: now }]);
  }
  return id;
}
