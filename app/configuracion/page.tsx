"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ConfigService } from '@/services/config.service';
import { InitialConfigSchema, InitialConfig } from '@/models/config.schema';
import { Calendar, DollarSign, ChevronRight } from 'lucide-react';

export default function ConfiguracionScreen() {
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<InitialConfig>>({
    salario: undefined,
    frecuencia: undefined,
    diaInicio: undefined,
    saldoActual: undefined,
    ahorroHistorico: undefined,
  });

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.salario !== undefined && formData.salario > 0;
      case 2: return formData.frecuencia !== undefined;
      case 3: return formData.diaInicio !== undefined && formData.diaInicio >= 1 && formData.diaInicio <= 31;
      case 4: return formData.saldoActual !== undefined && formData.saldoActual >= 0;
      case 5: return formData.ahorroHistorico !== undefined && formData.ahorroHistorico >= 0;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      const validation = InitialConfigSchema.safeParse(formData);
      if (!validation.success) {
        alert("Por favor revisa que todos los campos sean correctos.");
        return;
      }

      setIsLoading(true);
      try {
        await ConfigService.saveInitialConfig(validation.data);
        router.push('/configurar-gastos');
      } catch (error) {
        alert("Error al guardar la configuración");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNumberChange = (field: keyof InitialConfig, value: string) => {
    const parsed = parseFloat(value);
    setFormData({ ...formData, [field]: isNaN(parsed) ? undefined : parsed });
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <header className="bg-[#0B2046] pt-12 pb-6 px-6">
        <h1 className="text-white text-2xl font-bold">Configuración Inicial</h1>
        <p className="text-blue-200 text-sm mt-1">Configuremos tu perfil financiero</p>
      </header>

      <div className="bg-white py-4 px-6 flex items-center justify-between border-b border-gray-100 shadow-sm z-10">
        {[1, 2, 3, 4, 5].map((num, index) => (
          <React.Fragment key={num}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
              ${step >= num ? 'bg-[#00C897] text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {num}
            </div>
            {index < 4 && (
              <div className={`flex-1 h-0.5 mx-2 transition-colors
                ${step > num ? 'bg-[#00C897]' : 'bg-gray-200'}`} 
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 px-6 pt-8 pb-6 flex flex-col">
        
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[#0B2046] text-lg font-bold mb-2">Salario Neto</h2>
            <p className="text-gray-500 text-sm mb-6">¿Cuánto ganas después de impuestos?</p>
            <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Monto</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="number"
                inputMode="decimal"
                className="w-full bg-gray-50 rounded-xl py-4 pl-12 pr-4 text-[#0B2046] font-medium outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="0.00"
                value={formData.salario || ''}
                onChange={(e) => handleNumberChange('salario', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[#0B2046] text-lg font-bold mb-2">Frecuencia de Pago</h2>
            <p className="text-gray-500 text-sm mb-6">¿Con qué frecuencia recibes tu salario?</p>
            <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Selecciona</label>
            <select 
              className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[#0B2046] font-medium outline-none focus:ring-2 focus:ring-[#00C897] appearance-none"
              value={formData.frecuencia || ""}
              onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value as InitialConfig['frecuencia'] })}
            >
              <option value="" disabled>Selecciona frecuencia</option>
              <option value="Semanal">Semanal</option>
              <option value="Quincenal">Quincenal</option>
              <option value="Mensual">Mensual</option>
            </select>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[#0B2046] text-lg font-bold mb-2">Día de Inicio de Ciclo</h2>
            <p className="text-gray-500 text-sm mb-6">¿Qué día del mes comienza tu ciclo de pago?</p>
            <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Día del mes</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="number"
                inputMode="numeric"
                className="w-full bg-gray-50 rounded-xl py-4 pl-12 pr-4 text-[#0B2046] font-medium outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="Ej. 15"
                value={formData.diaInicio || ''}
                onChange={(e) => handleNumberChange('diaInicio', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-[#152D4F] rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-xs font-bold text-white tracking-wider">CAMPO CRÍTICO</span>
            </div>
            <h2 className="text-white text-xl font-bold mb-2">Saldo Disponible Actual</h2>
            <p className="text-blue-100 text-sm mb-8">¿Cuánto dinero tienes disponible en tu cuenta bancaria ahora mismo?</p>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input 
                type="number"
                inputMode="decimal"
                className="w-full bg-[#1F3A63] border border-[#2C4A7C] rounded-xl py-4 pl-12 pr-4 text-white font-bold text-lg outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="0.00"
                value={formData.saldoActual || ''}
                onChange={(e) => handleNumberChange('saldoActual', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="bg-[#EAFBF6] border border-[#A6E8D7] rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#00C897]"></div>
              <span className="text-xs font-bold text-[#009A74] tracking-wider uppercase">Base para meta de crecimiento</span>
            </div>
            <h2 className="text-[#0B2046] text-xl font-bold mb-2">Ahorro Mensual Histórico</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              ¿Cuánto ahorraste en tu <strong>ciclo de pago anterior</strong> (antes de usar VauCher)? Este dato nos ayudará a calcular tu meta de crecimiento del 23% y medir tu progreso.
            </p>
            <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Ahorro del ciclo anterior</label>
            <div className="relative mb-4">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B2046]/50" size={20} />
              <input 
                type="number"
                inputMode="decimal"
                className="w-full bg-white border border-[#A6E8D7] rounded-xl py-4 pl-12 pr-4 text-[#0B2046] font-bold text-lg outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="0.00"
                value={formData.ahorroHistorico || ''}
                onChange={(e) => handleNumberChange('ahorroHistorico', e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 italic">Si nunca has ahorrado o no recuerdas, puedes poner $0</p>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button 
            onClick={handleNext} 
            disabled={!isStepValid()} 
            isLoading={isLoading}
            className={!isStepValid() ? "bg-gray-200 text-gray-400 hover:bg-gray-200" : ""}
          >
            {step === 5 ? "Sincronizar y Continuar" : "Siguiente"}
            {step < 5 && <ChevronRight size={20} className="ml-2" />}
          </Button>
        </div>

      </div>
    </main>
  );
}