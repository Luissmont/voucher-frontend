import { Gasto } from '../models/gasto.schema';

export const GastoService = {
  async saveGastosIniciales(gastos: Gasto[]): Promise<boolean> {
    console.log("--- MOCK: GUARDANDO GASTOS INICIALES ---", gastos);
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (typeof window !== 'undefined') {
      localStorage.setItem('vaucher_mock_gastos', JSON.stringify(gastos));
    }
    
    return true;

    
  }
};