import { Gasto } from '../models/gasto.schema';

export const GastoService = {
  async saveGastosIniciales(gastos: Gasto[]): Promise<boolean> {
    console.log("--- MOCK: ENVIANDO GASTOS A NESTJS ---", gastos);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log("--- MOCK: GASTOS GUARDADOS EXITOSAMENTE ---");
    return true;

    /* // codigo para api
    try {
      // mandamos el arreglo completo al endpoint
      await apiClient.post('/gastos/bulk', { gastos });
      return true;
    } catch (error) {
      throw error;
    }
    */
  }
};