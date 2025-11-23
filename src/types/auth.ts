export type UserRole = 'admin' | 'vendedor' | 'cliente';

export interface User {
  id: number;
  email: string;
  nombre: string;
  rol: UserRole;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
