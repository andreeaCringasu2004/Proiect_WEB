import apiClient from '../api/apiClient';

export const favoriteService = {
  getFavorites: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/favorites');
    return response.data;
  },

  addFavorite: async (productId: number): Promise<void> => {
    await apiClient.post(`/favorites/${productId}`);
  },

  removeFavorite: async (productId: number): Promise<void> => {
    await apiClient.delete(`/favorites/${productId}`);
  }
};
