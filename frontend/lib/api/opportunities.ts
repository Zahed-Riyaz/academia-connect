import { apiClient } from './client';
import { Opportunity, CursorPaginatedResponse } from '../types';

export interface OpportunityFilters {
  type?: string;
  required_role?: string;
  research_area?: string;
  institution?: string;
  is_remote?: boolean;
  funding_available?: boolean;
  search?: string;
  ordering?: string;
}

export const opportunitiesApi = {
  list: (params?: OpportunityFilters) =>
    apiClient.get<CursorPaginatedResponse<Opportunity>>('/opportunities/', { params }),
  get: (id: number) => apiClient.get<Opportunity>(`/opportunities/${id}/`),
  create: (data: Partial<Opportunity> & { research_area_ids?: number[] }) =>
    apiClient.post<Opportunity>('/opportunities/', data),
  update: (id: number, data: Partial<Opportunity> & { research_area_ids?: number[] }) =>
    apiClient.patch<Opportunity>(`/opportunities/${id}/`, data),
  delete: (id: number) => apiClient.delete(`/opportunities/${id}/`),
  listMine: () => apiClient.get<Opportunity[]>('/opportunities/my/'),

  listBookmarks: () => apiClient.get('/bookmarks/'),
  addBookmark: (opportunity_id: number) => apiClient.post('/bookmarks/', { opportunity_id }),
  removeBookmark: (opportunity_id: number) => apiClient.delete(`/bookmarks/${opportunity_id}/`),
};
