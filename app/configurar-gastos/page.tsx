"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GastoService } from '@/services/gasto.service';
import { Gasto, GastoSchema } from '@/models/gasto.schema';
import { DollarSign, Plus, X, AlertCircle, Calendar, Trash2 } from 'lucide-react';

export default function ConfigurarGastosScreen() {
  const router = useRouter();

  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [nombre, setNombre] = useState('');
  const [monto, setMonto] = useState<number | undefined>(undefined);
  const [categoria, setCategoria] = useState<Gasto['categoria']>('Vital');
  const [frecuencia, setFrecuencia] = useState<Gasto['frecuencia']>('Mensual');
  const [pagado, setPagado] = useState(false);

  const abrirModal = () => {
    setNombre('');
    setMonto(undefined);
    setCategoria('Vital');
    setFrecuencia('Mensual');
    setPagado(false);
    setIsModalOpen(true);
  };

  const agregarGasto = () => {
    const nuevoGasto = {
      id: Math.random().toString(36).substr(2, 9), // id momentaneo pal mock
      nombre,
      monto: monto || 0,
      categoria,
      frecuencia,
      pagado,
    };

    const validation = GastoSchema.safeParse(nuevoGasto);
    if (!validation.success) {
      alert(validation.error.issues[0].message);
      return;
    }

    setGastos([...gastos, nuevoGasto as Gasto]);
    setIsModalOpen(false);
  };

  const eliminarGasto = (id: string) => {
    setGastos(gastos.filter(g => g.id !== id));
  };

  const continuarAlDashboard = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      await GastoService.guardarGastosLote(gastos);
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || "Error al enviar el lote de gastos");
    } finally {
      setIsLoading(false);
    }
  };

  const gastosVitales = gastos.filter(g => g.categoria === 'Vital');
  const gastosRecurrentes = gastos.filter(g => g.categoria === 'Recurrente');

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col relative">
      <header className="bg-[#0B2046] pt-12 pb-6 px-6">
        <h1 className="text-white text-2xl font-bold">Configurar Gastos</h1>
        <p className="text-blue-200 text-sm mt-1">Define tus compromisos mensuales</p>
      </header>

      <div className="flex-1 px-6 pt-8 pb-32 overflow-y-auto">
        {gastos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center mt-20 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-6">
              <DollarSign className="text-[#0B2046]" size={40} />
            </div>
            <h2 className="text-[#0B2046] text-xl font-bold mb-2">Sin gastos configurados</h2>
            <p className="text-gray-500 text-sm max-w-[250px]">
              Agrega tus gastos vitales y recurrentes para calcular tu saldo proyectado
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-300">

            {gastosVitales.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <AlertCircle size={18} className="text-red-500" />
                  <h3 className="font-bold text-[#0B2046]">Gastos Vitales</h3>
                </div>
                <div className="space-y-3">
                  {gastosVitales.map(gasto => (
                    <GastoCard key={gasto.id} gasto={gasto} onEliminar={eliminarGasto} colorType="vital" />
                  ))}
                </div>
              </div>
            )}

            {gastosRecurrentes.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Calendar size={18} className="text-blue-500" />
                  <h3 className="font-bold text-[#0B2046]">Gastos Recurrentes</h3>
                </div>
                <div className="space-y-3">
                  {gastosRecurrentes.map(gasto => (
                    <GastoCard key={gasto.id} gasto={gasto} onEliminar={eliminarGasto} colorType="recurrente" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-white via-white to-transparent pt-10 pb-6 px-6">
        <button
          onClick={abrirModal}
          className="absolute right-6 -top-6 w-14 h-14 bg-[#00C897] hover:bg-[#00b085] rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
        >
          <Plus size={28} />
        </button>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl mb-4 text-center font-medium animate-in fade-in slide-in-from-bottom-2">
            {errorMsg}
          </div>
        )}

        <Button onClick={continuarAlDashboard} isLoading={isLoading}>
          Continuar al Dashboard &gt;
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B2046]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full sm:w-[400px] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#0B2046] text-xl font-bold w-full text-center pl-6">Agregar Gasto</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-1 block">Nombre del gasto</label>
                <input
                  type="text"
                  placeholder="Ej: Renta, Netflix, Gym"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#0B2046]"
                  value={nombre} onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-1 block">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number" inputMode="decimal" placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-8 pr-4 outline-none focus:border-[#0B2046]"
                    value={monto || ''} onChange={(e) => setMonto(parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-1 block">Categoría</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setCategoria('Vital')}
                    className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all
                      ${categoria === 'Vital' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-100 bg-white text-gray-400'}`}
                  >
                    <AlertCircle size={24} />
                    <span className="text-sm font-medium">Vital</span>
                  </button>
                  <button
                    onClick={() => setCategoria('Recurrente')}
                    className={`flex-1 py-3 flex flex-col items-center justify-center gap-1 rounded-xl border-2 transition-all
                      ${categoria === 'Recurrente' ? 'border-blue-400 bg-blue-50 text-blue-600' : 'border-gray-100 bg-white text-gray-400'}`}
                  >
                    <Calendar size={24} />
                    <span className="text-sm font-medium">Recurrente</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-1 block">Frecuencia del Gasto</label>
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#0B2046] appearance-none"
                  value={frecuencia} onChange={(e) => setFrecuencia(e.target.value as Gasto['frecuencia'])}
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                </select>
                <p className="text-xs text-gray-400 mt-1 ml-1">¿Cada cuánto pagas este gasto?</p>
              </div>

              <div className="bg-[#FFFDF0] border border-yellow-200 rounded-xl p-4 flex items-center justify-between mt-2">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0B2046]">¿Ya pagaste esto este mes?</span>
                  <span className="text-xs text-gray-500">Solo para configuración inicial</span>
                </div>
                <button
                  onClick={() => setPagado(!pagado)}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out relative
                    ${pagado ? 'bg-[#00C897]' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-200
                    ${pagado ? 'translate-x-6' : 'translate-x-0'}`}
                  />
                </button>
              </div>

              <div className="pt-4">
                <Button onClick={agregarGasto} disabled={!nombre || !monto}>
                  Agregar Gasto
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const GastoCard = ({ gasto, onEliminar, colorType }: { gasto: Gasto, onEliminar: (id: string) => void, colorType: 'vital' | 'recurrente' }) => {
  const isVital = colorType === 'vital';

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
          ${isVital ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
          {isVital ? <AlertCircle size={20} /> : <Calendar size={20} />}
        </div>
        <div>
          <h4 className="font-bold text-[#0B2046] text-sm uppercase">{gasto.nombre}</h4>
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0B2046]">${gasto.monto.toFixed(2)}</span>
            {gasto.pagado && (
              <span className="bg-[#EAFBF6] text-[#009A74] text-[10px] font-bold px-2 py-0.5 rounded-full">Pagado</span>
            )}
          </div>
        </div>
      </div>
      <button onClick={() => onEliminar(gasto.id!)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
        <Trash2 size={20} />
      </button>
    </div>
  );
};