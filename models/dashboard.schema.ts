import { z } from 'zod';

export const CompromisoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  montoProrrateado: z.number(),
  tipo: z.enum(['Vital', 'Recurrente']),
  pagado: z.boolean(),
});

export type Compromiso = z.infer<typeof CompromisoSchema>;

export const DashboardDataSchema = z.object({
  saldoActual: z.number(), 
  saldoTotal: z.number(),  
  gastosPendientesTotales: z.number(),
  reservadoSiguienteCiclo: z.number(),
  metaCrecimiento: z.object({
    porcentajeActual: z.number(),
    porcentajeObjetivo: z.number(),
    montoAhorrado: z.number(),
  }),
  gastosRegistrados: z.array(CompromisoSchema),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

export const RegistrarGastoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  categoria: z.enum(['Vital', 'Recurrente', 'Variable']),
  frecuencia: z.enum(['Semanal', 'Quincenal', 'Mensual']).optional(),
});

export const RegistrarIngresoExtraSchema = z.object({
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  origen: z.string().optional(),
  reservar: z.boolean(),
});

export type RegistrarGasto = z.infer<typeof RegistrarGastoSchema>;
export type RegistrarIngresoExtra = z.infer<typeof RegistrarIngresoExtraSchema>;