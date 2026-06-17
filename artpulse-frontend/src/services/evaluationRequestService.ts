import apiClient from '../api/apiClient';
import { EvalRequest } from '../context/DataContext';

export const evaluationRequestService = {
  getAllRequests: async (): Promise<EvalRequest[]> => {
    const response = await apiClient.get<EvalRequest[]>('/evaluation-requests');
    return response.data;
  },

  createRequest: async (request: Omit<EvalRequest, 'id'>): Promise<EvalRequest> => {
    const response = await apiClient.post<EvalRequest>('/evaluation-requests', request);
    return response.data;
  },

  updateRequest: async (request: EvalRequest): Promise<EvalRequest> => {
    const response = await apiClient.put<EvalRequest>(`/evaluation-requests/${request.id}`, request);
    return response.data;
  }
};
