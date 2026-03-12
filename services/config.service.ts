import { InitialConfig } from '../models/config.schema';
import { apiClient } from './api.config';

export type UserConfig = {
  salario: number;
  frecuencia: string;
  diaInicio: number;
  saldoActual: number;
  ahorroHistorico: number;
};

export const ConfigService = {
  async saveInitialConfig(data: InitialConfig): Promise<boolean> {
    try {
      await apiClient.post('/configuracion', data);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async getConfig(): Promise<UserConfig> {
    return apiClient.get<UserConfig>('/configuracion');
  },

  async getConfiguracionActual(): Promise<UserConfig> {
    return apiClient.get<UserConfig>('/configuracion');
  },

  async getCambiosPendientes(): Promise<{ pendingConfig: Partial<UserConfig> | null }> {
    return apiClient.get<{ pendingConfig: Partial<UserConfig> | null }>('/perfil/pendiente');
  },

  async programarProximoCiclo(data: Partial<{ salario: number; frecuencia: string; diaInicio: number }>): Promise<void> {
    await apiClient.patch('/perfil/proximo-ciclo', data);
  },

  async actualizarMetaAhorro(ahorroBaseEsperado: number): Promise<void> {
    await apiClient.patch('/configuracion/meta-ahorro', { ahorroBaseEsperado });
  },
};