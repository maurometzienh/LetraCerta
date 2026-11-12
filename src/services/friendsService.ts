import { apiRequest } from './api';
import type { Friend, PendingRequest } from '../types/friends';

export function getFriends() {
  return apiRequest<Friend[]>('/friends', { auth: true });
}

export function getPendingRequests() {
  return apiRequest<PendingRequest[]>('/friends/requests', { auth: true });
}

export function sendFriendRequest(username: string) {
  return apiRequest<{ message: string }>('/friends/requests', {
    method: 'POST',
    body: { username },
    auth: true,
  });
}

export function respondFriendRequest(requestId: number, accept: boolean) {
  return apiRequest<{ message: string }>(`/friends/requests/${requestId}/respond`, {
    method: 'POST',
    body: { accept },
    auth: true,
  });
}
