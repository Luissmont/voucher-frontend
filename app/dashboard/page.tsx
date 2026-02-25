"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardService } from '@/services/dashboard.service';
import { DashboardData } from '@/models/dashboard.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Settings, Target, Zap, Plus, Receipt, 
  AlertCircle, Calendar, Lock, X, DollarSign, CheckCircle2 
} from 'lucide-react';

export default function DashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false); 

  const [activeModal, setActiveModal] = useState<'gasto' | 'ingreso' | 'prueba' | null>(null);

  const [gastoForm, setGastoForm] = useState({ nombre: '', monto: '' });
  const [ingresoMonto, setIngresoMonto] = useState('');
  const [pruebaMonto, setPruebaMonto] = useState('');

  const fechaHoy = new Intl.DateTimeFormat('es-ES', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).format(new Date());

  const loadDashboardData = async () => {
    try {
      const resumen = await DashboardService.getResumen();
      setData(resumen);
    } catch (error) {
      console.error("Error cargando dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const closeModal = () => {
    setActiveModal(null);
    setGastoForm({ nombre: '', monto: '' });
    setIngresoMonto('');
    setPruebaMonto('');
    setIsActionLoading(false);
  };


  const handleRegistrarGasto = async () => {
    const monto = parseFloat(gastoForm.monto);
    if (!gastoForm.nombre || isNaN(monto) || monto <= 0) return;
    setIsActionLoading(true);
    try {
      await DashboardService.registrarGastoVariable({ nombre: gastoForm.nombre, monto, esRecurrente: false });
      await loadDashboardData(); 
      closeModal();
    } catch (error) { alert("Error al registrar gasto"); setIsActionLoading(false); }
  };

  const handleRegistrarIngreso = async () => {
    const monto = parseFloat(ingresoMonto);
    if (isNaN(monto) || monto <= 0) return;
    setIsActionLoading(true);
    try {
      await DashboardService.registrarIngresoExtra({ monto });
      await loadDashboardData(); 
      closeModal();
    } catch (error) { alert("Error al registrar ingreso"); setIsActionLoading(false); }
  };

  const handlePruebaGasto = async () => {
    const monto = parseFloat(pruebaMonto);
    if (isNaN(monto) || monto <= 0) return;
    setIsActionLoading(true);
    try {
      const resultado = await DashboardService.simularPruebaGasto({ monto });
      alert(resultado.mensaje); 
      closeModal();
    } catch (error) { alert("Error en la prueba de gasto"); setIsActionLoading(false); }
  };

  const montoGastoNumber = parseFloat(gastoForm.monto) || 0;
  const nuevoSaldoProyectado = (data?.saldoProyectado || 0) - montoGastoNumber;


  if (isLoading || !data) {
    return (
      <div className="min-h-screen bg-[#0B2046] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#00C897] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans pb-10 relative overflow-hidden">
      
      <div className="bg-[#0B2046] px-6 pt-12 pb-36 rounded-b-[3rem] absolute top-0 w-full -z-10 shadow-2xl"></div>

      <header className="flex justify-between items-start px-6 pt-12 mb-6">
        <div>
          <h1 className="text-white text-3xl font-bold tracking-tight">VouCher</h1>
          <p className="text-blue-200 text-sm capitalize mt-1">{fechaHoy}</p>
        </div>
        <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors">
          <Settings size={20} />
        </Link>
      </header>

      <div className="px-6 space-y-4 flex-1 overflow-y-auto pb-6">
        
        {/* TARJETA SALDOS */}
        <div className="bg-[#1F3A63] border border-[#2C4A7C] rounded-[24px] p-6 shadow-xl text-white">
           <div className="flex items-center gap-2 mb-2">
            <Target size={16} className="text-[#00C897]" />
            <span className="text-sm font-medium opacity-90">Saldo Proyectado</span>
          </div>
          <h2 className="text-5xl font-bold tracking-tight mb-1">
            ${data.saldoProyectado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-blue-200 text-xs mb-6 opacity-80">Disponible al final del mes</p>
          <div className="h-px w-full bg-[#2C4A7C]/60 mb-4"></div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm opacity-90">Saldo Actual</span>
              <span className="font-bold text-sm">${data.saldoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100 text-sm opacity-90">Gastos Pendientes</span>
              <span className="text-red-400 font-bold text-sm">-${data.gastosPendientesTotales.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
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
          <button 
            onClick={() => setActiveModal('ingreso')}
            className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start hover:border-[#00C897] transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-[#EAFBF6] text-[#00C897] flex items-center justify-center mb-3">
              <Plus size={20} strokeWidth={3} />
            </div>
            <span className="text-[#0B2046] font-bold text-sm">Ingreso Extra</span>
          </button>
          <button 
            onClick={() => setActiveModal('gasto')}
            className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-start hover:border-blue-400 transition-all active:scale-95"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-3">
              <Receipt size={20} />
            </div>
            <span className="text-[#0B2046] font-bold text-sm">Registrar Gasto</span>
          </button>
        </div>

        <Link href="#" className="block bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-2 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
               <div className="w-10 h-10 rounded-xl bg-[#EAFBF6] text-[#00C897] flex items-center justify-center">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-[#0B2046] font-bold">Meta de Crecimiento</h3>
                <p className="text-gray-400 text-xs">Objetivo: {data.metaCrecimiento.porcentajeObjetivo}% mensual</p>
              </div>
            </div>
            <span className="text-[#00C897] text-2xl font-bold">{data.metaCrecimiento.porcentajeActual}%</span>
          </div>
          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden mb-2">
            <div 
              className="bg-[#00C897] h-full rounded-full transition-all duration-1000" 
              style={{ width: `${(data.metaCrecimiento.porcentajeActual / data.metaCrecimiento.porcentajeObjetivo) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-[11px] font-medium">
            Estás ahorrando ${data.metaCrecimiento.montoAhorrado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </Link>

        <div className="pt-4 pb-6">
          <div className="flex justify-between items-end mb-3 px-1">
            <h3 className="font-bold text-[#0B2046] text-lg">Compromisos Pendientes</h3>
            <span className="text-gray-400 text-sm">{data.compromisosPendientes.length} gastos</span>
          </div>
          <div className="space-y-3">
            {data.compromisosPendientes.map(comp => (
              <div key={comp.id} className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${comp.tipo === 'Vital' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    {comp.tipo === 'Vital' ? <AlertCircle size={18} /> : <Calendar size={18} />}
                  </div>
                  <div>
                    <p className="text-[#0B2046] font-bold text-sm">{comp.nombre}</p>
                    <p className="text-gray-400 text-xs">${comp.montoProrrateado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#0B2046] font-bold text-sm">${comp.montoProrrateado.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[#00C897] text-[10px] font-bold uppercase">Prorrateado</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

     
      {activeModal === 'gasto' && (
        <ModalContainer onClose={closeModal} title="Registrar Gasto Variable">
          <div className="space-y-4">
            <Input label="¿Qué vas a comprar?" placeholder="Ej. Café, Uber, Cine" value={gastoForm.nombre} onChange={e => setGastoForm({...gastoForm, nombre: e.target.value})} />
            <div>
              <label className="text-sm font-semibold text-[#0B2046] mb-1 block">Monto</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="number" inputMode="decimal" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-[#0B2046] text-lg font-bold text-[#0B2046]"
                  value={gastoForm.monto} onChange={e => setGastoForm({...gastoForm, monto: e.target.value})} autoFocus />
              </div>
            </div>

            {montoGastoNumber > 0 && (
               <div className="bg-[#F5F3FF] border border-[#8B5CF6]/30 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                 <h4 className="text-[#6D28D9] font-bold text-sm mb-2 flex items-center gap-2">
                   <Zap size={16} /> Impacto en tu mes
                 </h4>
                 <div className="flex justify-between items-center bg-white/60 rounded-lg p-3">
                   <div>
                     <p className="text-xs text-[#6D28D9]">Nuevo Saldo Proyectado:</p>
                     <p className={`text-xl font-bold ${nuevoSaldoProyectado < 0 ? 'text-red-500' : 'text-[#6D28D9]'}`}>
                        ${nuevoSaldoProyectado.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                     </p>
                   </div>
                   {nuevoSaldoProyectado < 0 && (
                     <span className="text-red-500 text-xs font-bold bg-red-100 px-2 py-1 rounded-full">¡Cuidado! Saldo negativo</span>
                   )}
                 </div>
               </div>
            )}

            <Button onClick={handleRegistrarGasto} isLoading={isActionLoading} disabled={!gastoForm.nombre || montoGastoNumber <= 0}>Confirmar Gasto</Button>
          </div>
        </ModalContainer>
      )}

      {activeModal === 'ingreso' && (
        <ModalContainer onClose={closeModal} title="Registrar Ingreso Extra">
           <div className="space-y-6">
            <p className="text-gray-500 text-sm">Este dinero se sumará a tu Saldo Actual disponible.</p>
            <div>
              <label className="text-sm font-semibold text-[#0B2046] mb-1 block">Monto del Ingreso</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00C897]" size={24} />
                <input type="number" inputMode="decimal" placeholder="0.00" className="w-full bg-[#EAFBF6] border border-[#00C897] rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#00C897] text-2xl font-bold text-[#00C897]"
                  value={ingresoMonto} onChange={e => setIngresoMonto(e.target.value)} autoFocus />
              </div>
            </div>
            <Button onClick={handleRegistrarIngreso} isLoading={isActionLoading} disabled={parseFloat(ingresoMonto) <= 0} className="bg-[#00C897] hover:bg-[#00b085]">Sumar al Saldo</Button>
          </div>
        </ModalContainer>
      )}

       {activeModal === 'prueba' && (
        <ModalContainer onClose={closeModal} title="Simulador de Gasto">
           <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start">
              <Zap className="text-blue-500 shrink-0" size={24} />
              <p className="text-blue-800 text-sm">Esta es una simulación. No afectará tu saldo real, pero te diremos si es seguro hacerlo.</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#0B2046] mb-1 block">¿Cuánto quieres gastar?</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input type="number" inputMode="decimal" placeholder="0.00" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#0B2046] text-2xl font-bold text-[#0B2046]"
                  value={pruebaMonto} onChange={e => setPruebaMonto(e.target.value)} autoFocus />
              </div>
            </div>
            <Button onClick={handlePruebaGasto} isLoading={isActionLoading} disabled={parseFloat(pruebaMonto) <= 0} className="bg-[#0B2046] hover:bg-[#1F3A63]">
              <Zap size={20} className="mr-2" /> Simular Impacto
            </Button>
          </div>
        </ModalContainer>
      )}

    </main>
  );
}

const ModalContainer = ({ children, onClose, title }: { children: React.ReactNode, onClose: () => void, title: string }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#0B2046]/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-white w-full sm:w-[450px] rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 duration-300 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[#0B2046] text-xl font-bold w-full text-center pl-6">{title}</h2>
        <button onClick={onClose} className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-[#0B2046] transition-colors absolute right-6 top-6">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);