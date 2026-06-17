import apiClient from '../api/apiClient';
import { ChatMessage } from '../context/DataContext';

export const messageService = {
  getAllMessages: async (): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>('/messages');
    return response.data;
  },

  createMessage: async (msg: Omit<ChatMessage, 'id' | 'time'>): Promise<ChatMessage> => {
    const response = await apiClient.post<ChatMessage>('/messages', msg);
    return response.data;
  },

  updateMessage: async (id: number, updates: Partial<ChatMessage>): Promise<ChatMessage> => {
    const response = await apiClient.put<ChatMessage>(`/messages/${id}`, updates);
    return response.data;
  }
};
