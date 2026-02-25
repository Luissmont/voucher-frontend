import { z } from 'zod';

export const GastoSchema = z.object({
  id: z.string().optional(), 
  nombre: z.string().min(1, "El nombre del gasto es obligatorio"),
  monto: z.number().min(0.01, "El monto debe ser mayor a 0"),
  categoria: z.enum(["Vital", "Recurrente"]),
  frecuencia: z.enum(["Semanal", "Quincenal", "Mensual"]),
  pagado: z.boolean(),
});

export type Gasto = z.infer<typeof GastoSchema>;