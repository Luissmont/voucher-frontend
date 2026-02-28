import { LoginRequest, AuthResponse, RegisterRequest } from '../models/auth.schema';

export const AuthService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (typeof window !== 'undefined') {
       localStorage.removeItem('vaucher_mock_config');
       localStorage.removeItem('vaucher_mock_gastos');
       localStorage.removeItem('vaucher_mock_reservado');
       localStorage.removeItem('vaucher_mock_metas_extra'); 
    }

    if (data.email === 'tu@email.com' && data.password === '12345678') {
      return { token: 'mock-jwt', user: { id: '99', email: data.email } };
    }
    throw new Error("401: Credenciales incorrectas"); 
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (typeof window !== 'undefined') {
       localStorage.clear(); 
    }

    return { token: 'mock-jwt-new', user: { id: '100', email: data.email } };
  }
};