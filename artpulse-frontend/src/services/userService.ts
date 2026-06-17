import apiClient from '../api/apiClient';
import { User } from '../context/AuthContext';

export interface BackendUser {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  isCardValidated?: boolean;
  passwordResetRequired?: boolean;
  createdAt?: string;
}

// Maps backend user to frontend User interface
export function mapBackendUser(u: BackendUser): User & { status?: string } {
  return {
    id: u.id,
    email: u.email,
    name: u.fullName,
    role: u.role.toLowerCase() as User['role'],
    status: u.status?.toUpperCase() === 'DEACTIVATED' ? 'deleted' : 'active',
  } as any;
}

export const userService = {
  // GET /api/users/me — profilul utilizatorului curent
  getMe: async (): Promise<BackendUser> => {
    const response = await apiClient.get<BackendUser>('/users/me');
    return response.data;
  },

  // GET /api/users/admin/all — toti utilizatorii (doar ADMIN)
  getAllUsers: async (): Promise<BackendUser[]> => {
    const response = await apiClient.get<BackendUser[]>('/users/admin/all');
    return response.data;
  },

  // PUT /api/users/{id}/role — schimba rolul (ADMIN)
  updateRole: async (userId: number, role: string): Promise<any> => {
    const response = await apiClient.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  // PUT /api/users/{id}/status — activeaza/dezactiveaza (ADMIN)
  updateStatus: async (userId: number, status: string): Promise<any> => {
    const response = await apiClient.put(`/users/${userId}/status`, { status });
    return response.data;
  },

  // DELETE /api/users/{id} — sterge user (ADMIN) — soft delete
  deleteUser: async (userId: number): Promise<any> => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  // POST /api/users/{id}/reset-password — resetare parola (ADMIN)
  resetPassword: async (userId: number): Promise<any> => {
    const response = await apiClient.post(`/users/${userId}/reset-password`);
    return response.data;
  },
};
