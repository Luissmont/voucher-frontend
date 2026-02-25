import { z } from 'zod';

export const InitialConfigSchema = z.object({
  salario: z.number().min(1, "El salario es obligatorio"),
  
  frecuencia: z.enum(["Semanal", "Quincenal", "Mensual"]),
  
  diaInicio: z.number().min(1).max(31, "El día debe estar entre 1 y 31"),
  saldoActual: z.number().min(0, "El saldo no puede ser negativo"),
  ahorroHistorico: z.number().min(0, "El ahorro no puede ser negativo"),
});

export type InitialConfig = z.infer<typeof InitialConfigSchema>;