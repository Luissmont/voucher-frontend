import { z } from 'zod';

export const CompromisoSchema = z.object({
  id: z.string(),
  nombre: z.string(),
  montoProrrateado: z.number(),
  tipo: z.enum(['Vital', 'Recurrente']),
});

export type Compromiso = z.infer<typeof CompromisoSchema>;

export const DashboardDataSchema = z.object({
  saldoProyectado: z.number(),
  saldoActual: z.number(),
  gastosPendientesTotales: z.number(),
  reservadoSiguienteCiclo: z.number(),
  
  metaCrecimiento: z.object({
    porcentajeActual: z.number(), 
    porcentajeObjetivo: z.number(), 
    montoAhorrado: z.number(),
  }),

  compromisosPendientes: z.array(CompromisoSchema),
});

export type DashboardData = z.infer<typeof DashboardDataSchema>;

export const RegistrarGastoVariableSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  esRecurrente: z.boolean(), 
});

export const RegistrarIngresoExtraSchema = z.object({
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  origen: z.string().optional(),
});

export const PruebaGastoSchema = z.object({
  monto: z.number().min(0.01, "Ingresa el monto de la prueba"),
});

export type RegistrarGastoVariable = z.infer<typeof RegistrarGastoVariableSchema>;
export type RegistrarIngresoExtra = z.infer<typeof RegistrarIngresoExtraSchema>;
export type PruebaGasto = z.infer<typeof PruebaGastoSchema>;