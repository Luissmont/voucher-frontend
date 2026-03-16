"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ConfigService } from '@/services/config.service';
import { InitialConfigSchema, InitialConfig } from '@/models/config.schema';
import { Calendar, DollarSign, ChevronRight, ChevronDown } from 'lucide-react';

export default function ConfiguracionScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<InitialConfig>>({
    salario: undefined,
    frecuencia: undefined,
    diaInicio: undefined,
    saldoActual: undefined,
    ahorroHistorico: undefined,
    ahorroBaseEsperado: undefined,
  });

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.frecuencia !== undefined;
      case 2: return formData.salario !== undefined && formData.salario > 0;
      case 3: return formData.diaInicio !== undefined && formData.diaInicio >= 1 && formData.diaInicio <= 99;
      case 4: return formData.saldoActual !== undefined && formData.saldoActual >= 0;
      case 5: return formData.ahorroHistorico !== undefined && formData.ahorroHistorico >= 0;
      default: return false;
    }
  };

  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
      setErrorMsg(''); // Limpiar errores al cambiar de paso
    } else {
      setErrorMsg('');
      const validation = InitialConfigSchema.safeParse(formData);
      if (!validation.success) {
        setErrorMsg("Por favor revisa que todos los campos sean correctos.");
        return;
      }

      // Regla de economía conductual: +23% silencioso
      const ahorroCalculado = (validation.data.ahorroHistorico || 0) * 1.23;
      const dataToSend = { ...validation.data, ahorroBaseEsperado: ahorroCalculado };

      setIsLoading(true);
      try {
        await ConfigService.saveInitialConfig(dataToSend);
        router.push('/configurar-gastos');
      } catch (error: any) {
        setErrorMsg(error.message || "Error al guardar la configuración");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrorMsg('');
    }
  };

  const handleNumberChange = (field: keyof InitialConfig, value: string) => {
    const parsed = parseFloat(value);
    setFormData({ ...formData, [field]: isNaN(parsed) ? undefined : parsed });
  };

  const getDayOptions = () => {
    if (formData.frecuencia === 'Semanal') {
      return [
        { value: 1, label: 'Lunes (1)' },
        { value: 2, label: 'Martes (2)' },
        { value: 3, label: 'Miércoles (3)' },
        { value: 4, label: 'Jueves (4)' },
        { value: 5, label: 'Viernes (5)' },
        { value: 6, label: 'Sábado (6)' },
        { value: 7, label: 'Domingo (7)' },
      ];
    }
    if (formData.frecuencia === 'Quincenal') {
      return [
        { value: 1, label: 'Días 1 y 16' },
        { value: 15, label: 'Días 15 y Último' },
      ];
    }
    if (formData.frecuencia === 'Mensual') {
      const days = Array.from({ length: 28 }, (_, i) => ({ value: i + 1, label: `${i + 1}` }));
      return [...days, { value: 99, label: 'Último día del mes' }];
    }
    return [];
  };

  const dayOptions = getDayOptions();
  const selectedDayOption = dayOptions.find(o => o.value === formData.diaInicio);

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

        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[#0B2046] text-lg font-bold mb-2">Ingreso por Ciclo</h2>
            <p className="text-gray-500 text-sm mb-6">¿Cuánto dinero recibes exactamente en cada pago?</p>
            <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Monto</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                className="w-full bg-gray-50 rounded-xl py-4 pl-12 pr-4 text-[#0B2046] font-medium outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="0.00"
                value={formData.salario || ''}
                onChange={(e) => handleNumberChange('salario', e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-[#0B2046] text-lg font-bold mb-2">Día de Inicio de Ciclo</h2>
            <p className="text-gray-500 text-sm mb-6">¿Cuándo recibes habitualmente tu pago?</p>
            <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Día del mes</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />

              <div
                onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                className="w-full bg-gray-50 rounded-xl py-4 pl-12 pr-12 text-[#0B2046] font-medium outline-none focus:ring-2 focus:ring-[#00C897] cursor-pointer flex items-center justify-between border border-transparent transition-all select-none"
                tabIndex={0}
                onBlur={() => setTimeout(() => setIsDayDropdownOpen(false), 200)}
              >
                <span className={selectedDayOption ? 'text-[#0B2046]' : 'text-gray-400'}>
                  {selectedDayOption ? selectedDayOption.label : 'Selecciona el día'}
                </span>
                <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-transform duration-200 ${isDayDropdownOpen ? 'rotate-180' : ''}`} size={20} />
              </div>

              {isDayDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[240px] overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-200 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  {dayOptions.map(opt => (
                    <div
                      key={opt.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNumberChange('diaInicio', opt.value.toString());
                        setIsDayDropdownOpen(false);
                      }}
                      className={`px-4 py-3 cursor-pointer text-sm font-medium border-b border-gray-50 last:border-0 transition-colors
                        ${formData.diaInicio === opt.value ? 'bg-[#EAFBF6] text-[#009A74]' : 'text-[#0B2046] hover:bg-gray-50'}`}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
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
                min="0"
                step="0.01"
                className="w-full bg-[#1F3A63] border border-[#2C4A7C] rounded-xl py-4 pl-12 pr-4 text-white font-bold text-lg outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="0.00"
                value={formData.saldoActual === undefined ? '' : formData.saldoActual}
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
                min="0"
                step="0.01"
                className="w-full bg-white border border-[#A6E8D7] rounded-xl py-4 pl-12 pr-4 text-[#0B2046] font-bold text-lg outline-none focus:ring-2 focus:ring-[#00C897]"
                placeholder="0.00"
                value={formData.ahorroHistorico === undefined ? '' : formData.ahorroHistorico}
                onChange={(e) => handleNumberChange('ahorroHistorico', e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-500 italic mb-6">Si nunca has ahorrado o no recuerdas, puedes poner $0</p>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl mt-4 mb-2 text-center font-medium animate-in fade-in slide-in-from-bottom-2">
            {errorMsg}
          </div>
        )}

        <div className="mt-auto pt-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={handlePrev}
              type="button"
              className="px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Atrás
            </button>
          )}
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            isLoading={isLoading}
            className={`flex-1 ${!isStepValid() ? "bg-gray-200 text-gray-400 hover:bg-gray-200" : ""}`}
          >
            {step === 5 ? "Sincronizar y Continuar" : "Siguiente"}
            {step < 5 && <ChevronRight size={20} className="ml-2" />}
          </Button>
        </div>

      </div>
    </main>
  );
}