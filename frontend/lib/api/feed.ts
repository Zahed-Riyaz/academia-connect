import { apiClient } from './client';
import { Opportunity, CursorPaginatedResponse } from '../types';

export const feedApi = {
  getFeed: (cursor?: string) =>
    apiClient.get<CursorPaginatedResponse<Opportunity>>('/feed/', { params: cursor ? { cursor } : {} }),
  getDiscover: (cursor?: string) =>
    apiClient.get<CursorPaginatedResponse<Opportunity>>('/feed/discover/', { params: cursor ? { cursor } : {} }),
};
