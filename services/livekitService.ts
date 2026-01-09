import type { ID, LiveKitTokenResponse } from '../types/api';
import { ApiError, apiFetch } from './api';

export interface CreateRoomRequest {
  name: string;
  // Accept string to tolerate differing enums across modules
  type?: any;
  maxParticipants?: number;
}

export class LiveKitService {
  private baseUrl = '/rooms';

  async createRoom(roomData: CreateRoomRequest) {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(roomData),
      });
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Không th? t?o phòng: ${error.message}`);
      }
      throw new Error('Không th? t?o phòng');
    }
  }

  async getRoomToken(roomName: string, identity?: string): Promise<LiveKitTokenResponse> {
    try {
      const params = identity ? `?identity=${identity}` : '';
      const url = `${this.baseUrl}/${encodeURIComponent(roomName)}/token${params}`;
      const response = await apiFetch<LiveKitTokenResponse>(url);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new Error('Không tìm th?y phòng này');
        }
        throw new Error(`Không th? l?y token: ${error.message}`);
      }
      throw new Error('Không th? k?t n?i phòng');
    }
  }

  async createDMRoom(otherUserId: ID, currentUserId?: ID): Promise<LiveKitTokenResponse> {
    const roomName = `dm_${currentUserId || 'current'}_${otherUserId}`;
    const roomData: CreateRoomRequest = {
      name: roomName,
      type: 'dm',
      maxParticipants: 2,
    };

    try {
      await this.createRoom(roomData);
    } catch (error) {
      // Room might already exist, continue to get token
    }

    return await this.getRoomToken(roomName);
  }

  async createGroupCall(groupName: string): Promise<LiveKitTokenResponse> {
    const roomName = `group_${groupName}_${Date.now()}`;
    const roomData: CreateRoomRequest = {
      name: roomName,
      type: 'group',
      maxParticipants: 10,
    };

    await this.createRoom(roomData);
    return await this.getRoomToken(roomName);
  }
}

export const livekitService = new LiveKitService();
