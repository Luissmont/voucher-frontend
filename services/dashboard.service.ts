import { DashboardData, RegistrarGasto, RegistrarIngresoExtra } from '../models/dashboard.schema';
import { InitialConfig } from '../models/config.schema';
import { Gasto } from '../models/gasto.schema';

export const DashboardService = {

  async getResumen(): Promise<DashboardData> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const configStr = typeof window !== 'undefined' ? localStorage.getItem('vaucher_mock_config') : null;
    const gastosStr = typeof window !== 'undefined' ? localStorage.getItem('vaucher_mock_gastos') : null;
    const reservadoStr = typeof window !== 'undefined' ? localStorage.getItem('vaucher_mock_reservado') : null;

    const config: Partial<InitialConfig> = configStr ? JSON.parse(configStr) : { saldoActual: 0, ahorroHistorico: 0 };
    const gastos: Gasto[] = gastosStr ? JSON.parse(gastosStr) : [];
    
    const reservadoSiguienteCiclo = reservadoStr ? parseFloat(reservadoStr) : 0;

    const saldoTotal = config.saldoActual || 0;
    
    const gastosPendientesTotales = gastos
      .filter(g => !g.pagado) 
      .reduce((sum, g) => sum + g.monto, 0);

    
    const saldoActual = saldoTotal - gastosPendientesTotales;

    const baseAhorro = config.ahorroHistorico || 0;
    const objetivoMeta = baseAhorro > 0 ? baseAhorro * 1.23 : 1000; 
    const montoAhorrado = Math.max(0, saldoActual); 
    const porcentajeActual = Math.min(100, Math.round((montoAhorrado / objetivoMeta) * 100));

    const gastosRegistrados = gastos.map(g => ({
        id: g.id || Math.random().toString(),
        nombre: g.nombre,
        montoProrrateado: g.monto, 
        tipo: g.categoria,
        pagado: g.pagado || false 
      }));

    return {
      saldoActual, 
      saldoTotal,  
      gastosPendientesTotales,
      reservadoSiguienteCiclo, 
      metaCrecimiento: {
        porcentajeActual, 
        porcentajeObjetivo: 23,
        montoAhorrado,
      },
      gastosRegistrados,
    };
  },

  async registrarGasto(data: RegistrarGasto): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (typeof window !== 'undefined') {
      const configStr = localStorage.getItem('vaucher_mock_config');
      const config = configStr ? JSON.parse(configStr) : { saldoActual: 0 };

      config.saldoActual = Math.max(0, (config.saldoActual || 0) - data.monto);
      localStorage.setItem('vaucher_mock_config', JSON.stringify(config));

      if (data.categoria !== 'Variable') {
        const gastosStr = localStorage.getItem('vaucher_mock_gastos') || '[]';
        const gastos: Gasto[] = JSON.parse(gastosStr);
        
        gastos.push({
          id: Math.random().toString(), 
          nombre: data.nombre,
          monto: data.monto,
          categoria: data.categoria as 'Vital' | 'Recurrente',
          frecuencia: data.frecuencia as 'Semanal' | 'Quincenal' | 'Mensual', 
          pagado: true 
        });
        
        localStorage.setItem('vaucher_mock_gastos', JSON.stringify(gastos));
      }
    }
    return true;
  },

  async registrarIngresoExtra(data: RegistrarIngresoExtra): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (typeof window !== 'undefined') {
      if (data.reservar) {
        const reservadoActual = parseFloat(localStorage.getItem('vaucher_mock_reservado') || '0');
        localStorage.setItem('vaucher_mock_reservado', (reservadoActual + data.monto).toString());
      } else {
        const configStr = localStorage.getItem('vaucher_mock_config');
        if (configStr) {
          const config = JSON.parse(configStr);
          config.saldoActual = (config.saldoActual || 0) + data.monto;
          localStorage.setItem('vaucher_mock_config', JSON.stringify(config));
        }
      }
    }
    return true;
  }
};