import { LoginRequest, AuthResponse, RegisterRequest } from '../models/auth.schema';

import { apiClient } from './api.config';

export const AuthService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: data.email,
      password: data.password,
    });

    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('vaucher_token', response.token);
    }

    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (typeof window !== 'undefined' && response.token) {
      localStorage.setItem('vaucher_token', response.token);
    }

    return response;
  }
};