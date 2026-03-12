import { apiClient } from './api.config';

export type TipoEvento = 'GASTO' | 'GASTO_VARIABLE' | 'INICIO_CICLO';

export interface EventoLineTiempo {
    tipoEvento: TipoEvento;
    fecha: string;
    monto: number;
    titulo: string;
    categoria?: string;
    cumplioMeta?: boolean;
    frecuencia?: string;
}

export const ActividadService = {
    async getLineaTiempo(): Promise<EventoLineTiempo[]> {
        return apiClient.get<EventoLineTiempo[]>('/actividad/linea-tiempo');
    },
};
