import { DashboardData, RegistrarGasto, RegistrarIngresoExtra } from '../models/dashboard.schema';
import { apiClient } from './api.config';

export const DashboardService = {

  async getResumen(): Promise<DashboardData> {
    return apiClient.get('/dashboard/resumen');
  },

  async registrarGasto(data: RegistrarGasto): Promise<boolean> {
    await apiClient.post('/dashboard/gasto', data);
    return true;
  },

  async registrarIngresoExtra(data: RegistrarIngresoExtra): Promise<boolean> {
    await apiClient.post('/dashboard/ingreso-extra', data);
    return true;
  }
};