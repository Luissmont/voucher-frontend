// Peticiones centralizadas — usa CapacitorHttp para nativo (Android/iOS) y fetch para web.
// CapacitorHttp bypasses el WebView, por lo que no tiene restricciones de CORS ni HTTP cleartext.

import { Capacitor, CapacitorHttp, HttpResponse } from '@capacitor/core';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vaucher_token');
  }
  return null;
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extra,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function handleStatus<T>(
  status: number,
  data: any,
  endpoint: string
): T {
  if (status === 401) {
    if (typeof window !== 'undefined' && !endpoint.startsWith('/auth/')) {
      localStorage.removeItem('vaucher_token');
      window.location.href = '/login';
    }
    throw new ApiError(401, endpoint.startsWith('/auth/') ? 'Credenciales incorrectas' : 'Sesión expirada');
  }
  if (status >= 400) {
    console.error('API ERROR DETAILED:', data);
    const message = Array.isArray(data?.message) ? data.message[0] : (data?.message || 'Error desconocido en la API');
    throw new ApiError(status, message);
  }
  return data as T;
}

// Detects if running inside a Capacitor native app (Android/iOS)
const isNative = () => Capacitor.isNativePlatform();

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders();

    if (isNative()) {
      const res: HttpResponse = await CapacitorHttp.get({ url, headers });
      return handleStatus<T>(res.status, res.data, endpoint);
    }

    const response = await fetch(url, { method: 'GET', headers });
    const data = await response.json().catch(() => ({}));
    return handleStatus<T>(response.status, data, endpoint);
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders();

    if (isNative()) {
      const res: HttpResponse = await CapacitorHttp.post({ url, headers, data: body });
      return handleStatus<T>(res.status, res.data, endpoint);
    }

    const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    return handleStatus<T>(response.status, data, endpoint);
  },

  async patch<T>(endpoint: string, body: any): Promise<T> {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders();

    if (isNative()) {
      const res: HttpResponse = await CapacitorHttp.patch({ url, headers, data: body });
      return handleStatus<T>(res.status, res.data, endpoint);
    }

    const response = await fetch(url, { method: 'PATCH', headers, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    return handleStatus<T>(response.status, data, endpoint);
  },

  async delete(endpoint: string): Promise<void> {
    const url = `${API_URL}${endpoint}`;
    const headers = buildHeaders();

    if (isNative()) {
      const res: HttpResponse = await CapacitorHttp.delete({ url, headers });
      handleStatus<void>(res.status, res.data, endpoint);
      return;
    }

    const response = await fetch(url, { method: 'DELETE', headers });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      handleStatus<void>(response.status, data, endpoint);
    }
  },
};