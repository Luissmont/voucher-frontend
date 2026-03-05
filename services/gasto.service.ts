import { Gasto } from '../models/gasto.schema';
import { apiClient } from './api.config';

export const GastoService = {
  async guardarGastosLote(gastos: Gasto[]): Promise<boolean> {
    try {
      await apiClient.post('/gastos/lote', gastos);
      return true;
    } catch (error) {
      throw error;
    }
  }
};