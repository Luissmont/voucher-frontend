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
  },

  async getGastosFijos(): Promise<any[]> {
    const todos = await apiClient.get<any[]>('/gastos');
    return todos.filter((g: any) => !g.canceladoParaElFuturo);
  },

  async eliminarGastoFijo(id: string): Promise<void> {
    await apiClient.delete(`/gastos/${id}`);
  },
};
