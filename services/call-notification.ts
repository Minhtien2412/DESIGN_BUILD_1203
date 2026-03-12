/**
 * Call Notification Service
 * Gửi notification khi có cuộc gọi đến/đi
 */

import { apiFetch } from './api';

export interface CallNotificationPayload {
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'audio' | 'video';
  action: 'incoming' | 'started' | 'ended' | 'missed' | 'rejected';
}

/**
 * Gửi notification về cuộc gọi
 */
export async function sendCallNotification(payload: CallNotificationPayload): Promise<void> {
  try {
    const titles = {
      incoming: `Cuộc gọi ${payload.callType === 'video' ? 'video' : 'thoại'} đến`,
      started: `Đang gọi ${payload.callType === 'video' ? 'video' : 'thoại'}`,
      ended: 'Cuộc gọi kết thúc',
      missed: 'Cuộc gọi nhỡ',
      rejected: 'Cuộc gọi bị từ chối',
    };

    const bodies = {
      incoming: `${payload.callerName} đang gọi ${payload.callType === 'video' ? 'video' : 'cho'} bạn`,
      started: `Cuộc gọi với ${payload.callerName} đã bắt đầu`,
      ended: `Cuộc gọi với ${payload.callerName} đã kết thúc`,
      missed: `Bạn có cuộc gọi nhỡ từ ${payload.callerName}`,
      rejected: `Bạn đã từ chối cuộc gọi từ ${payload.callerName}`,
    };

    const metadata = {
      category: 'call',
      callerId: payload.callerId,
      callerName: payload.callerName,
      callerAvatar: payload.callerAvatar || `https://i.pravatar.cc/150?u=${payload.callerId}`,
      callType: payload.callType,
      callAction: payload.action,
      timestamp: new Date().toISOString(),
    };

    await apiFetch('/notifications', {
      method: 'POST',
      body: JSON.stringify({
        type: 'MESSAGE', // Sử dụng MESSAGE type cho call notifications
        title: titles[payload.action],
        body: bodies[payload.action],
        priority: payload.action === 'incoming' ? 'URGENT' : 'HIGH',
        metadata: JSON.stringify(metadata),
      }),
    });

    console.log(`[CallNotification] Sent ${payload.action} notification for ${payload.callerName}`);
  } catch (error) {
    console.error('[CallNotification] Failed to send notification:', error);
    // Không throw error để không làm gián đoạn flow cuộc gọi
  }
}

/**
 * Gửi notification khi có cuộc gọi đến
 */
export async function notifyIncomingCall(
  callerId: string,
  callerName: string,
  callType: 'audio' | 'video',
  callerAvatar?: string
): Promise<void> {
  return sendCallNotification({
    callerId,
    callerName,
    callerAvatar,
    callType,
    action: 'incoming',
  });
}

/**
 * Gửi notification khi cuộc gọi bắt đầu
 */
export async function notifyCallStarted(
  callerId: string,
  callerName: string,
  callType: 'audio' | 'video',
  callerAvatar?: string
): Promise<void> {
  return sendCallNotification({
    callerId,
    callerName,
    callerAvatar,
    callType,
    action: 'started',
  });
}

/**
 * Gửi notification khi cuộc gọi kết thúc
 */
export async function notifyCallEnded(
  callerId: string,
  callerName: string,
  callType: 'audio' | 'video',
  callerAvatar?: string
): Promise<void> {
  return sendCallNotification({
    callerId,
    callerName,
    callerAvatar,
    callType,
    action: 'ended',
  });
}

/**
 * Gửi notification khi có cuộc gọi nhỡ
 */
export async function notifyMissedCall(
  callerId: string,
  callerName: string,
  callType: 'audio' | 'video',
  callerAvatar?: string
): Promise<void> {
  return sendCallNotification({
    callerId,
    callerName,
    callerAvatar,
    callType,
    action: 'missed',
  });
}

/**
 * Gửi notification khi từ chối cuộc gọi
 */
export async function notifyCallRejected(
  callerId: string,
  callerName: string,
  callType: 'audio' | 'video',
  callerAvatar?: string
): Promise<void> {
  return sendCallNotification({
    callerId,
    callerName,
    callerAvatar,
    callType,
    action: 'rejected',
  });
}
