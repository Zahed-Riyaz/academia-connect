import { apiClient } from './client';
import { Connection, ConnectionStatus } from '../types';

export const connectionsApi = {
  listConnections: () => apiClient.get<Connection[]>('/connections/'),
  sendRequest: (receiver_id: number) => apiClient.post<Connection>('/connections/', { receiver_id }),
  getPendingRequests: () => apiClient.get<Connection[]>('/connections/requests/'),
  getSentRequests: () => apiClient.get<Connection[]>('/connections/sent/'),
  updateConnection: (id: number, status: 'accepted' | 'rejected') =>
    apiClient.patch<Connection>(`/connections/${id}/`, { status }),
  removeConnection: (id: number) => apiClient.delete(`/connections/${id}/`),
  getStatus: (userId: number) =>
    apiClient.get<{ status: ConnectionStatus }>(`/connections/status/${userId}/`),

  listFollowing: () => apiClient.get('/follows/'),
  listFollowers: () => apiClient.get('/follows/followers/'),
  follow: (user_id: number) => apiClient.post('/follows/', { user_id }),
  unfollow: (followId: number) => apiClient.delete(`/follows/${followId}/`),
};
