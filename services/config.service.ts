import { InitialConfig } from '../models/config.schema';
import { apiClient } from './api.config';

export const ConfigService = {
  async saveInitialConfig(data: InitialConfig): Promise<boolean> {
    try {
      await apiClient.post('/configuracion', data);
      return true;
    } catch (error) {
      throw error;
    }
  }
};