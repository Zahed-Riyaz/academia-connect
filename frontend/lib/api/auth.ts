import { apiClient } from './client';
import { User } from '../types';

export interface RegisterPayload {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  password: string;
  password2: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<{ user: User; access: string; refresh: string }>('/auth/register/', data),

  login: (data: LoginPayload) =>
    apiClient.post<{ access: string; refresh: string }>('/auth/login/', data),

  logout: (refresh: string) =>
    apiClient.post('/auth/logout/', { refresh }),

  refreshToken: () =>
    apiClient.post<{ access: string }>('/auth/token/refresh/'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    apiClient.post('/auth/password/change/', data),
};
