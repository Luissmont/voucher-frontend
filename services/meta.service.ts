import { apiClient } from './api.config';

export type Meta = {
    id: string;
    nombre: string;
    objetivo: number;
    acumulado: number;
    progresoPorcentaje?: number;
};

export type CrearMetaData = {
    nombre: string;
    objetivo: number;
    acumuladoInicial?: number;
};

export const MetaService = {
    async getMetas(): Promise<Meta[]> {
        return apiClient.get<Meta[]>('/metas');
    },

    async crearMeta(data: CrearMetaData): Promise<Meta> {
        return apiClient.post<Meta>('/metas', data);
    },

    async asignarFondos(id: string, monto: number): Promise<{ message: string; meta: Meta }> {
        return apiClient.patch(`/metas/${id}/fondos`, { monto });
    },

    async eliminarMeta(id: string): Promise<void> {
        await apiClient.delete(`/metas/${id}`);
    },
};
