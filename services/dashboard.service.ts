import { 
  DashboardData, 
  RegistrarGastoVariable, 
  RegistrarIngresoExtra, 
  PruebaGasto 
} from '../models/dashboard.schema';
import { InitialConfig } from '../models/config.schema';
import { Gasto } from '../models/gasto.schema';
// import { apiClient } from './api.config'; // <-- par api

export const DashboardService = {


  async getResumen(): Promise<DashboardData> {
    console.log("--- MOCK: CALCULANDO DASHBOARD ---");
    await new Promise(resolve => setTimeout(resolve, 500));

    const configStr = typeof window !== 'undefined' ? localStorage.getItem('vaucher_mock_config') : null;
    const gastosStr = typeof window !== 'undefined' ? localStorage.getItem('vaucher_mock_gastos') : null;

    const config: Partial<InitialConfig> = configStr ? JSON.parse(configStr) : { saldoActual: 0, ahorroHistorico: 0 };
    const gastos: Gasto[] = gastosStr ? JSON.parse(gastosStr) : [];

    const saldoActual = config.saldoActual || 0;
    
    const gastosPendientesTotales = gastos
      .filter(g => !g.pagado)
      .reduce((sum, g) => sum + g.monto, 0);

    const saldoProyectado = saldoActual - gastosPendientesTotales;

    const compromisosPendientes = gastos
      .filter(g => !g.pagado)
      .map(g => ({
        id: g.id || Math.random().toString(),
        nombre: g.nombre,
        montoProrrateado: g.monto, 
        tipo: g.categoria
      }));

    return {
      saldoProyectado,
      saldoActual,
      gastosPendientesTotales,
      reservadoSiguienteCiclo: 0, 
      metaCrecimiento: {
        porcentajeActual: 0, 
        porcentajeObjetivo: 23,
        montoAhorrado: config.ahorroHistorico || 0, 
      },
      compromisosPendientes,
    };

    /* para api:
    // const response = await apiClient.get<DashboardData>('/dashboard/resumen');
    // return response;
    */
  },


  
  async registrarGastoVariable(data: RegistrarGastoVariable): Promise<boolean> {
    console.log("--- MOCK: REGISTRANDO GASTO VARIABLE ---", data);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (typeof window !== 'undefined') {
      const gastosStr = localStorage.getItem('vaucher_mock_gastos') || '[]';
      const gastos: Gasto[] = JSON.parse(gastosStr);
      gastos.push({
        id: Math.random().toString(),
        nombre: data.nombre,
        monto: data.monto,
        categoria: data.esRecurrente ? 'Recurrente' : 'Vital', 
        frecuencia: 'Mensual',
        pagado: false 
      });
      localStorage.setItem('vaucher_mock_gastos', JSON.stringify(gastos));
    }
    
    return true;

    /* // para api:
    // await apiClient.post('/movimientos/gasto-variable', data);
    // return true;
    */
  },


  
  async registrarIngresoExtra(data: RegistrarIngresoExtra): Promise<boolean> {
    console.log("--- MOCK: REGISTRANDO INGRESO EXTRA ---", data);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (typeof window !== 'undefined') {
      const configStr = localStorage.getItem('vaucher_mock_config');
      if (configStr) {
        const config: Partial<InitialConfig> = JSON.parse(configStr);
        config.saldoActual = (config.saldoActual || 0) + data.monto;
        localStorage.setItem('vaucher_mock_config', JSON.stringify(config));
      }
    }

    return true;

    /* para api:
    // await apiClient.post('/movimientos/ingreso-extra', data);
    // return true;
    */
  },


  //prueba de gasost backend
  async simularPruebaGasto(data: PruebaGasto): Promise<{ aprobado: boolean, mensaje: string }> {
    console.log("--- MOCK: ENVIANDO PRUEBA AL BACKEND ---", data);
    
    // sinula api con delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Si intentan gastar más de 5000, lanzamos advertencia.
    // operacion de api , simulada
    const aprobado = data.monto <= 5000;

    return {
      aprobado,
      mensaje: aprobado 
        ? " Gasto Aprobado: No afecta tus compromisos vitales." 
        : " Gasto Arriesgado: Podrías no completar tu renta u otros compromisos."
    };

    /* // para api):
    // return await apiClient.post('/simulador/prueba-gasto', data);
    */
  }
};