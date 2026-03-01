import { apiClient } from './client';
import { Conversation, Message, CursorPaginatedResponse } from '../types';

export const messagingApi = {
  listConversations: () => apiClient.get<Conversation[]>('/conversations/'),
  startConversation: (user_id: number) =>
    apiClient.post<Conversation>('/conversations/', { user_id }),
  getConversation: (id: number) => apiClient.get<Conversation>(`/conversations/${id}/`),
  getMessages: (conversationId: number, cursor?: string) =>
    apiClient.get<CursorPaginatedResponse<Message>>(
      `/conversations/${conversationId}/messages/`,
      { params: cursor ? { cursor } : {} }
    ),
  sendMessage: (conversationId: number, content: string) =>
    apiClient.post<Message>(`/conversations/${conversationId}/messages/`, { content }),
  getUnreadCount: () => apiClient.get<{ unread_count: number }>('/conversations/unread-count/'),
};
