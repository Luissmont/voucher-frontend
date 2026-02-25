import { InitialConfig } from '../models/config.schema';
// import { apiClient } from './api.config'; // <-- para api

export const ConfigService = {
  async saveInitialConfig(data: InitialConfig): Promise<boolean> {
    
    
    console.log("--- MOCK: GUARDANDO CONFIGURACIÓN LOCAL ---");
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaucher_mock_config', JSON.stringify(data));
    }
    return true;

    /* 
    // para api
    try {
      await apiClient.post('/configuracion', data);
      return true;
    } catch (error) {
      throw error;
    }
    */
  }
};