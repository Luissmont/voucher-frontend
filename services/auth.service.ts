import { LoginRequest, AuthResponse, RegisterRequest } from '../models/auth.schema';
// import { apiClient, ApiError } from './api.config'; // descomenta cuando usemos api

// capa para login con mocks

export const AuthService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log("--- INICIANDO MOCK LOGIN ---", data);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (data.email === 'tu@email.com' && data.password === '12345678') {
      console.log("--- LOGIN EXITOSO ---");
      return {
        token: 'mock-jwt-token-xyz',
        user: { id: '99', email: data.email },
      };
    } else {
      console.log("--- ERROR MOCK: 401 ---");
      throw new Error("401: Credenciales incorrectas"); 
    }

    /* // 
    // codigo para api
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data);
      return response; // 200 OK

    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) throw new Error('Usuario o contraseña incorrectos');
        if (error.status === 400) throw new Error('Datos inválidos enviados al servidor');
        if (error.status >= 500) throw new Error('Error interno del servidor, intenta más tarde');
      }
      throw new Error('Error de conexión a la red');
    }
    */
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log("--- INICIANDO MOCK REGISTRO ---", data);

    
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (data.email === 'existe@email.com') {
      console.log("--- ERROR MOCK: 400 ---");
      throw new Error("El correo ya está registrado");
    }

    console.log("--- REGISTRO EXITOSO ---");
    return {
      token: 'mock-jwt-token-nuevo-usuario',
      user: { id: '100', email: data.email },
    };

    /* // codigo para api
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password
      });
      return response;
    } catch (error) { ... }
    */
  },
  
};
