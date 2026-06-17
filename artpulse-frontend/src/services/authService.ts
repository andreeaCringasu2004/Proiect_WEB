import apiClient from '../api/apiClient';

export interface LoginResponse {
  token: string;
  id: number;
  email: string;
  fullName: string;
  role: string;
  passwordResetRequired?: boolean;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('jwt_token', response.data.token);
      localStorage.setItem('user_info', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    // Call backend logout as well
    return apiClient.post('/auth/logout');
  },

  getCurrentUser: (): LoginResponse | null => {
    const userStr = localStorage.getItem('user_info');
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  // Schimbare parola — orice user autentificat
  // currentPassword = parola actuala sau temporara (ResetPass@2026)
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Reset parola utilizator — doar ADMIN
  // Seteaza parola temporara fixa: ResetPass@2026
  resetUserPassword: async (userId: number) => {
    const response = await apiClient.post(`/users/${userId}/reset-password`);
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string, role: string, physicalAddress?: string): Promise<any> => {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      fullName,
      role,
      physicalAddress
    });
    return response.data;
  }
};
