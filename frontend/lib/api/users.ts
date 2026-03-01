import { apiClient } from './client';
import { User, Publication, ResearchInterest, PaginatedResponse } from '../types';

export const usersApi = {
  getMe: () => apiClient.get<User>('/users/me/'),
  updateMe: (data: Partial<User & { profile: Partial<User['profile']> & { research_interest_ids?: number[] } }>) =>
    apiClient.patch<User>('/users/me/', data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('profile_picture', file);
    return apiClient.post<{ profile_picture: string }>('/users/me/avatar/', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUser: (id: number) => apiClient.get<User>(`/users/${id}/`),
  listUsers: (params?: Record<string, string>) =>
    apiClient.get<PaginatedResponse<User>>('/users/', { params }),

  getMyPublications: () => apiClient.get<Publication[]>('/users/me/publications/'),
  getUserPublications: (userId: number) => apiClient.get<Publication[]>(`/users/${userId}/publications/`),
  createPublication: (data: Omit<Publication, 'id' | 'created_at'>) =>
    apiClient.post<Publication>('/users/me/publications/', data),
  updatePublication: (id: number, data: Partial<Publication>) =>
    apiClient.patch<Publication>(`/users/me/publications/${id}/`, data),
  deletePublication: (id: number) => apiClient.delete(`/users/me/publications/${id}/`),

  listResearchInterests: (search?: string) =>
    apiClient.get<ResearchInterest[]>('/research-interests/', { params: search ? { search } : {} }),
  createResearchInterest: (name: string) =>
    apiClient.post<ResearchInterest>('/research-interests/', { name }),
};
