"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardService } from '@/services/dashboard.service';
import { DashboardData } from '@/models/dashboard.schema';
import {
  Settings, Target, Zap, Plus, Receipt,
  AlertCircle, Calendar, X, DollarSign, Lock,
  TrendingDown, CheckCircle2
} from 'lucide-react';

export default function DashboardScreen() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [activeModal, setActiveModal] = useState<'gasto' | 'ingreso' | 'prueba' | null>(null);
  const [modalError, setModalError] = useState('');

  const [ingresoMonto, setIngresoMonto] = useState('');
  const [reservarIngreso, setReservarIngreso] = useState(false);

  const [gastoNombre, setGastoNombre] = useState('');
  const [gastoMonto, setGastoMonto] = useState('');
  const [gastoCategoria, setGastoCategoria] = useState<'Vital' | 'Recurrente' | 'Variable'>('Variable');
  const [gastoFrecuencia, setGastoFrecuencia] = useState<'Semanal' | 'Quincenal' | 'Mensual'>('Mensual');

  const [pruebaNombre, setPruebaNombre] = useState('');
  const [pruebaMonto, setPruebaMonto] = useState('');

  const fechaHoy = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date());

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const resumen = await DashboardService.getResumen();
      setData(resumen);
    } catch (error: any) {
      console.error("Error cargando dashboard", error);
      // Aquí el error global podría ir en un Toast, pero de momento solo log
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDashboardData(); }, []);

  const closeModal = () => {
    setActiveModal(null);
    setModalError('');
    setIngresoMonto(''); setReservarIngreso(false);
    setGastoNombre(''); setGastoMonto(''); setGastoCategoria('Variable'); setGastoFrecuencia('Mensual');
    setPruebaNombre(''); setPruebaMonto('');
    setIsActionLoading(false);
  };

  const handleIngreso = async () => {
    setIsActionLoading(true);
    setModalError('');
    try {
      await DashboardService.registrarIngresoExtra({ monto: parseFloat(ingresoMonto), reservar: reservarIngreso });
      await loadDashboardData();
      closeModal();
    } catch (error: any) {
      let mensaje = "Error al registrar ingreso extra";
      if (typeof error.response?.data?.message === 'string') {
        mensaje = error.response.data.message;
      } else if (Array.isArray(error.response?.data?.message)) {
        mensaje = error.response.data.message[0];
      } else if (error.message && error.message !== '[object Object]') {
        mensaje = error.message;
      }
      setModalError(mensaje);
      setTimeout(() => setModalError(''), 5000);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGasto = async () => {
    setIsActionLoading(true);
    setModalError('');
    try {
      await DashboardService.registrarGasto({
        nombre: gastoNombre,
        monto: parseFloat(gastoMonto),
        categoria: gastoCategoria,
        frecuencia: gastoCategoria !== 'Variable' ? gastoFrecuencia : undefined
      });
      await loadDashboardData();
      closeModal();
    } catch (error: any) {
      let mensaje = "Error al registrar gasto";
      if (typeof error.response?.data?.message === 'string') {
        mensaje = error.response.data.message;
      } else if (Array.isArray(error.response?.data?.message)) {
        mensaje = error.response.data.message[0];
      } else if (error.message && error.message !== '[object Object]') {
        mensaje = error.message;
      }
      setModalError(mensaje);
      setTimeout(() => setModalError(''), 5000);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#152D4F] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C897] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const montoGastoParseado = parseFloat(gastoMonto) || 0;
  const saldoLibreNuevoGasto = data.saldoActual - montoGastoParseado;

  const montoSimulado = parseFloat(pruebaMonto) || 0;
  const isSimulacionLista = pruebaNombre.trim().length > 0 && montoSimulado > 0;
  const saldoLibreSimulado = data.saldoActual - montoSimulado;

  const pruebaAprobada = montoSimulado <= (data.saldoActual * 0.5);

  return (
    <main className="min-h-screen bg-[#F8FAFC] relative font-sans pb-10">

      <div className="absolute top-0 w-full h-[380px] bg-[#152D4F] rounded-b-[40px] z-0"></div>

      <header className="relative z-10 flex justify-between items-start px-6 pt-12 mb-6">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">VouCher</h1>
          <p className="text-blue-200 text-sm capitalize mt-1">{fechaHoy}</p>
        </div>
        <Link href="/ajustes" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors active:scale-95">
          <Settings size={20} />
        </Link>
      </header>

      <div className="relative z-10 px-6 space-y-4">

        <div className="bg-[#1F3A63] border border-[#2C4A7C]/50 rounded-[24px] p-6 shadow-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-[#00C897]" />
            <span className="text-sm font-medium opacity-90">Saldo Actual</span>
          </div>
          <h2 className="text-[42px] leading-none font-bold tracking-tight mb-1">
            ${data.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-blue-200 text-xs mb-6 opacity-80">Disponible para gastar hoy</p>

          <div className="h-px w-full bg-[#2C4A7C]/80 mb-4"></div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm">Saldo Actual</span>
              <span className="font-bold text-sm">${data.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm">Gastos Pendientes</span>
              <span className="text-red-400 font-bold text-sm">
                -${data.gastosPendientesTotales.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {data.reservadoSiguienteCiclo > 0 && (
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#8B5CF6] text-sm flex items-center gap-1.5">
                  <Lock size={14} /> Reservado (siguiente ciclo)
                </span>
                <span className="text-[#8B5CF6] font-bold text-sm">
                  ${data.reservadoSiguienteCiclo.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-[#2C4A7C]/50 mt-2">
              <span className="text-[#00C897] text-sm font-bold">
                Dinero disponible para metas
              </span>
              <span className="text-[#00C897] font-bold text-sm">
                ${(data.sobranteCicloAnterior ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('prueba')}
          className="w-full bg-[#00C897] hover:bg-[#00b085] text-white font-bold text-lg rounded-2xl py-4 flex justify-center items-center gap-2 shadow-lg shadow-[#00C897]/20 transition-transform active:scale-95"
        >
          <Zap size={20} fill="currentColor" /> Hacer Prueba de Gasto
        </button>

        <div className="flex gap-4 pt-2">
          <button onClick={() => setActiveModal('ingreso')} className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center hover:border-[#00C897] transition-all active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-[#EAFBF6] text-[#00C897] flex items-center justify-center mb-3">
              <Plus size={24} strokeWidth={3} />
            </div>
            <span className="text-[#0B2046] font-bold text-sm mb-1">Ingreso Extra</span>
            <span className="text-gray-400 text-xs">Registrar entrada</span>
          </button>
          <button onClick={() => setActiveModal('gasto')} className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center hover:border-blue-400 transition-all active:scale-95">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Receipt size={24} />
            </div>
            <span className="text-[#0B2046] font-bold text-sm mb-1">Registrar Gasto</span>
            <span className="text-gray-400 text-xs">Variable o extra</span>
          </button>
        </div>

        <Link href="/mis-objetivos" className="block bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mt-2 hover:shadow-md transition-shadow active:scale-95">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EAFBF6] text-[#00C897] flex items-center justify-center">
                <Target size={24} />
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="text-[#0B2046] font-bold">Meta de Crecimiento</h3>
                <p className="text-gray-400 text-xs">Objetivo: ${(data.ahorroBaseEsperado ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} por ciclo</p>
              </div>
            </div>
            <span className="text-[#00C897] text-2xl font-bold mt-1">
              {data.ahorroBaseEsperado > 0 ? Math.min((data.metaCrecimiento.montoAhorrado / data.ahorroBaseEsperado) * 100, 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-3">
            <div className="bg-[#0B2046] h-full rounded-full" style={{ width: `${data.ahorroBaseEsperado > 0 ? Math.min((data.metaCrecimiento.montoAhorrado / data.ahorroBaseEsperado) * 100, 100) : 0}%` }}></div>
          </div>
          <p className="text-gray-500 text-[11px] font-medium">Estás ahorrando ${data.metaCrecimiento.montoAhorrado.toLocaleString('en-US', { minimumFractionDigits: 2 })} de tu dinero libre</p>
        </Link>

        <div className="pt-4">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-[#0B2046] text-lg">Gastos Registrados</h3>
          </div>
          <div className="space-y-3">
            {data.gastosRegistrados.length === 0 && (
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
                <p className="text-gray-500 text-sm">No hay gastos vitales o recurrentes registrados.</p>
              </div>
            )}
            {data.gastosRegistrados.map(comp => (
              <div key={comp.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comp.tipo === 'Vital' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {comp.tipo === 'Vital' ? <AlertCircle size={18} /> : <Calendar size={18} />}
                  </div>
                  <div>
                    <p className="text-[#0B2046] font-bold text-sm">{comp.nombre}</p>
                    <p className="text-gray-400 text-xs">${comp.montoProrrateado.toLocaleString('en-US', { minimumFractionDigits: 2 })} mensual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#0B2046] font-bold text-sm mb-1">${comp.montoProrrateado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  {comp.pagado ? (
                    <span className="bg-[#EAFBF6] text-[#009A74] text-[10px] font-bold px-2 py-0.5 rounded-full">Pagado</span>
                  ) : (
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">Reservado</span>
                  )}
                </div>
              </div>
            ))}

            <Link href="/historial" className="bg-white rounded-2xl p-4 flex items-center justify-center shadow-sm border border-gray-100 hover:border-[#00C897]/50 transition-all text-[#009A74] font-bold text-sm mt-2">
              Ver historial completo →
            </Link>
          </div>
        </div>
      </div>


      {activeModal === 'ingreso' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-[#0B2046] text-xl font-bold mb-1">Ingreso Extra</h2>
            <p className="text-gray-500 text-sm mb-6">Registra ingresos adicionales a tu salario</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Monto del Ingreso</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={ingresoMonto} onChange={e => setIngresoMonto(e.target.value)} />
                </div>
              </div>

              <div className={`border rounded-2xl p-4 flex flex-col transition-colors ${reservarIngreso ? 'bg-[#F5F3FF] border-[#8B5CF6]/30' : 'bg-[#EAFBF6] border-[#00C897]/30'}`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${reservarIngreso ? 'bg-[#8B5CF6]' : 'bg-[#00C897]'}`}></div>
                    <span className="text-[10px] font-bold tracking-wider uppercase text-[#0B2046]">Selector Crítico</span>
                  </div>
                  <button onClick={() => setReservarIngreso(!reservarIngreso)} className={`w-12 h-6 rounded-full p-1 transition-colors ${reservarIngreso ? 'bg-[#8B5CF6]' : 'bg-[#0B2046]'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${reservarIngreso ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <h4 className="font-bold text-[#0B2046] text-sm flex items-center gap-2 mb-1">
                  {reservarIngreso ? <Lock size={16} className="text-[#8B5CF6]" /> : <CheckCircle2 size={16} className="text-[#0B2046]" />}
                  {reservarIngreso ? 'Reservar para siguiente sueldo' : 'Usar en periodo actual'}
                </h4>
                <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium mt-2 ${reservarIngreso ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'bg-[#00C897]/10 text-[#009A74]'}`}>
                  <Lock size={14} />
                  {reservarIngreso ? 'No afectará tu Saldo Actual hoy' : 'Se sumará a tu saldo disponible inmediatamente'}
                </div>
              </div>

              {modalError && (
                <div className="relative text-red-500 text-sm font-medium text-center p-3 pr-8 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => setModalError('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors">
                    <X size={16} />
                  </button>
                  {modalError}
                </div>
              )}

              <button onClick={handleIngreso} disabled={!ingresoMonto || isActionLoading}
                className={`w-full font-bold rounded-2xl py-4 mt-2 transition-colors ${ingresoMonto ? 'bg-[#0B2046] text-white hover:bg-[#1F3A63]' : 'bg-gray-100 text-gray-400'}`}>
                {isActionLoading ? 'Procesando...' : 'Registrar Ingreso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'gasto' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl relative">
            <button onClick={closeModal} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-[#0B2046] text-xl font-bold mb-1">Registrar Gasto</h2>
            <p className="text-gray-500 text-sm mb-6">Oficializa un gasto y actualiza tu saldo</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Nombre del Gasto</label>
                <input type="text" placeholder="Ej: Renta, Supermercado..." className="w-full bg-gray-50 rounded-2xl py-3 px-4 outline-none text-[#0B2046] text-sm"
                  value={gastoNombre} onChange={e => setGastoNombre(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Monto</label>
                <div className="relative border border-gray-200 rounded-2xl bg-white overflow-hidden">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={gastoMonto} onChange={e => setGastoMonto(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Categoría</label>
                <div className="flex gap-2">
                  <button onClick={() => setGastoCategoria('Vital')} className={`flex-1 py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${gastoCategoria === 'Vital' ? 'border-red-400 text-red-500 bg-red-50' : 'border-gray-200 text-gray-500'}`}>
                    <AlertCircle size={20} /> <span className="text-[11px] font-bold">Vital</span>
                  </button>
                  <button onClick={() => setGastoCategoria('Recurrente')} className={`flex-1 py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${gastoCategoria === 'Recurrente' ? 'border-blue-400 text-blue-500 bg-blue-50' : 'border-gray-200 text-gray-500'}`}>
                    <Calendar size={20} /> <span className="text-[11px] font-bold">Recurrente</span>
                  </button>
                  <button onClick={() => setGastoCategoria('Variable')} className={`flex-1 py-3 rounded-2xl border flex flex-col items-center justify-center gap-1 transition-all ${gastoCategoria === 'Variable' ? 'border-[#8B5CF6] text-[#8B5CF6] bg-[#F5F3FF]' : 'border-gray-200 text-gray-500'}`}>
                    <Zap size={20} /> <span className="text-[11px] font-bold">Variable</span>
                  </button>
                </div>
              </div>

              {gastoCategoria !== 'Variable' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Frecuencia del Gasto</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 px-4 outline-none text-[#0B2046] text-sm appearance-none"
                    value={gastoFrecuencia} onChange={(e) => setGastoFrecuencia(e.target.value as 'Semanal' | 'Quincenal' | 'Mensual')}
                  >
                    <option value="Semanal">Semanal</option>
                    <option value="Quincenal">Quincenal</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                  <p className="text-xs text-blue-500 mt-3 font-medium">
                    Este gasto se guardará como <strong>Pagado</strong> y se repetirá de forma {gastoFrecuencia.toLowerCase()}.
                  </p>
                </div>
              )}

              {gastoCategoria === 'Variable' && montoGastoParseado > 0 && (
                <div className="border border-[#8B5CF6]/30 bg-white rounded-2xl p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-[#8B5CF6] font-bold text-sm mb-3 flex items-center gap-2"><Zap size={16} /> Impacto instantáneo</h4>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-500 text-sm">Tu saldo actual:</span>
                    <span className="font-bold text-[#0B2046]">${data.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-center my-1"><TrendingDown className="text-gray-300" size={16} /></div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Después del gasto:</span>
                    <span className={`font-bold text-lg ${saldoLibreNuevoGasto < 0 ? 'text-red-500' : 'text-[#0B2046]'}`}>
                      ${saldoLibreNuevoGasto.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {modalError && (
                <div className="relative text-red-500 text-sm font-medium text-center p-3 pr-8 bg-red-50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-bottom-2">
                  <button onClick={() => setModalError('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 transition-colors">
                    <X size={16} />
                  </button>
                  {modalError}
                </div>
              )}

              <button onClick={handleGasto} disabled={!gastoNombre || !gastoMonto || isActionLoading}
                className={`w-full font-bold rounded-2xl py-4 flex justify-center items-center gap-2 transition-colors mt-2 ${gastoNombre && gastoMonto ? 'bg-[#0B2046] text-white hover:bg-[#1F3A63]' : 'bg-gray-100 text-gray-400'}`}>
                <CheckCircle2 size={20} /> Confirmar Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'prueba' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative">

            <div className="bg-[#0B2046] px-6 pt-6 pb-8 relative">
              <button onClick={closeModal} className="absolute right-4 top-4 text-white/50 hover:text-white"><X size={24} /></button>
              <h2 className="text-white text-xl font-bold mb-1">Simulador de Gasto</h2>
              <p className="text-blue-200 text-sm">Simula una compra antes de realizarla</p>
            </div>

            <div className="p-6 -mt-4 bg-white rounded-t-[24px] relative space-y-4">

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">¿Qué quieres comprar?</label>
                <input type="text" placeholder="Ej: Zapatos deportivos" className="w-full bg-gray-50 rounded-2xl py-4 px-4 outline-none text-[#0B2046] text-sm"
                  value={pruebaNombre} onChange={e => setPruebaNombre(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Precio</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={pruebaMonto} onChange={e => setPruebaMonto(e.target.value)} />
                </div>
              </div>

              {!isSimulacionLista ? (
                <div className="flex flex-col items-center justify-center py-6 text-center text-gray-400">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-2 text-amber-500"><DollarSign size={24} /></div>
                  <p className="text-xs">Ingresa un nombre y precio para ver el impacto</p>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="w-full h-2 bg-gradient-to-r from-[#00C897] via-yellow-400 to-red-500 rounded-full mt-4 relative">
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full shadow-sm" style={{ left: `${Math.min((montoSimulado / data.saldoActual) * 100, 100)}%` }}></div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-500 text-sm">Tu saldo actual:</span>
                      <span className="font-bold text-[#0B2046]">${data.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-center my-1"><TrendingDown className="text-gray-300" size={16} /></div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Después de la compra:</span>
                      <span className={`font-bold text-lg ${saldoLibreSimulado < 0 ? 'text-red-500' : 'text-[#0B2046]'}`}>
                        ${saldoLibreSimulado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className={`border rounded-2xl p-4 flex gap-3 items-start ${pruebaAprobada ? 'border-[#00C897] bg-[#EAFBF6]' : 'border-red-400 bg-red-50'}`}>
                    <div className={`mt-0.5 ${pruebaAprobada ? 'text-[#00C897]' : 'text-red-500'}`}>
                      {pruebaAprobada ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm mb-1 ${pruebaAprobada ? 'text-[#009A74]' : 'text-red-700'}`}>
                        {pruebaAprobada ? 'Compra Segura' : 'Compra Arriesgada'}
                      </h4>
                      <p className={`text-xs ${pruebaAprobada ? 'text-[#009A74]/80' : 'text-red-700/80'}`}>
                        {pruebaAprobada ? 'Esta compra no compromete tus finanzas. Puedes realizarla.' : 'Esta compra supera la mitad de tu dinero libre. Podrías desestabilizar tu mes.'}
                      </p>
                    </div>
                  </div>

                  <button onClick={closeModal} className="w-full bg-[#0B2046] text-white font-bold rounded-2xl py-4 mt-2 hover:bg-[#1F3A63]">
                    Entendido
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}