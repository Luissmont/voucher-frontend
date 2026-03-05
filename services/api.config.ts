// Peticiones centralizadas , usenlas para no andar repitiendo los errores


export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async get<T>(endpoint: string): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vaucher_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.startsWith('/auth/')) {
        localStorage.removeItem('vaucher_token');
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Sesión expirada o invalida');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API ERROR DETAILED:", errorData);
      throw new ApiError(response.status, errorData.message || 'Error desconocido en la API');
    }

    return response.json();
  },

  async post<T>(endpoint: string, body: any): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vaucher_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.startsWith('/auth/')) {
        localStorage.removeItem('vaucher_token');
        window.location.href = '/login';
      }
      throw new ApiError(401, 'Credenciales incorrectas');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API ERROR DETAILED:", errorData);
      throw new ApiError(response.status, errorData.message || 'Error desconocido en la API');
    }

    return response.json();
  }
};