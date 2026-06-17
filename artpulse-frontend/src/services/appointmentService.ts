import apiClient from '../api/apiClient';
import { Appointment } from '../context/DataContext';

export const appointmentService = {
  getAppointments: async (): Promise<Appointment[]> => {
    const response = await apiClient.get<Appointment[]>('/appointments');
    return response.data;
  },

  createAppointment: async (appt: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const response = await apiClient.post<Appointment>('/appointments', appt);
    return response.data;
  }
};
