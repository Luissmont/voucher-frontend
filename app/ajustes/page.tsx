"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { InitialConfig } from '@/models/config.schema';
import { Gasto } from '@/models/gasto.schema';
import { 
  ChevronLeft, User, DollarSign, Calendar, 
  Trash2, LogOut, AlertCircle, Edit3, X, CheckCircle2, Clock, Target
} from 'lucide-react';

export default function AjustesScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Estados de datos
  const [config, setConfig] = useState<any>(null);
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);

  // Modales de UI
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  // Elemento seleccionado
  const [gastoToDelete, setGastoToDelete] = useState<string | null>(null);

  // Formularios
  const [editSalario, setEditSalario] = useState('');
  const [editFrecuencia, setEditFrecuencia] = useState<'Semanal' | 'Quincenal' | 'Mensual'>('Mensual');
  const [editDia, setEditDia] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    const configStr = localStorage.getItem('vaucher_mock_config');
    if (configStr) {
      const parsedConfig = JSON.parse(configStr);
      setConfig(parsedConfig);
      
      const baseParaEditar = parsedConfig.proximoCiclo || parsedConfig;
      setEditSalario(baseParaEditar.salario?.toString() || '');
      setEditFrecuencia(baseParaEditar.frecuencia || 'Mensual');
      setEditDia(baseParaEditar.diaInicio?.toString() || '');
    }

    const gastosStr = localStorage.getItem('vaucher_mock_gastos');
    if (gastosStr) {
      const todosLosGastos = JSON.parse(gastosStr);
      setGastosFijos(todosLosGastos.filter((g: any) => !g.canceladoParaElFuturo));
    }
    
    setIsLoading(false);
  };


  const guardarEdicionCiclo = () => {
    if (!config) return;
    
    const nuevaConfig = {
      ...config,
      proximoCiclo: {
        salario: parseFloat(editSalario),
        frecuencia: editFrecuencia,
        diaInicio: parseInt(editDia)
      }
    };
    
    localStorage.setItem('vaucher_mock_config', JSON.stringify(nuevaConfig));
    setConfig(nuevaConfig);
    setIsEditModalOpen(false);
  };

  const confirmarEliminarGasto = (id: string) => {
    setGastoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const ejecutarEliminarGasto = () => {
    if (gastoToDelete) {
      const gastosStr = localStorage.getItem('vaucher_mock_gastos') || '[]';
      const todosLosGastos = JSON.parse(gastosStr);
      
      
      const nuevaLista = todosLosGastos.map((g: any) => 
        g.id === gastoToDelete ? { ...g, canceladoParaElFuturo: true } : g
      );
      
      localStorage.setItem('vaucher_mock_gastos', JSON.stringify(nuevaLista));
      setGastosFijos(nuevaLista.filter((g: any) => !g.canceladoParaElFuturo));
    }
    setIsDeleteModalOpen(false);
    setGastoToDelete(null);
  };

  const ejecutarCerrarSesion = () => {
    localStorage.clear();
    router.push('/');
  };

  if (isLoading) return <div className="min-h-screen bg-[#F8FAFC]"></div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] relative font-sans pb-10">
      
      <div className="absolute top-0 w-full h-[280px] bg-[#152D4F] rounded-b-[40px] z-0"></div>

      <header className="relative z-10 pt-10 px-6 mb-6">
        <Link href="/dashboard" className="text-white inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity mb-4">
          <ChevronLeft size={18} /> Volver al Dashboard
        </Link>
        <h1 className="text-white text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-blue-200 text-sm mt-1">Administra tu perfil y gastos fijos</p>
      </header>

      <div className="relative z-10 px-6 space-y-6">
        
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          {config?.proximoCiclo && (
             <div className="bg-amber-50 text-amber-600 text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 absolute top-0 left-0 w-full">
               <Clock size={14} /> Tienes cambios programados para el próximo ciclo
             </div>
          )}

          <div className={`flex justify-between items-center mb-6 ${config?.proximoCiclo ? 'mt-6' : ''}`}>
            <h2 className="text-[#0B2046] text-lg font-bold flex items-center gap-2">
              <User className="text-[#00C897]" size={20} /> Mi Perfil Financiero
            </h2>
            <button onClick={() => setIsEditModalOpen(true)} className="text-[#8B5CF6] hover:text-[#7C3AED] transition-colors p-2 bg-[#F5F3FF] rounded-xl active:scale-95">
              <Edit3 size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><DollarSign size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Salario Base Actual</p>
                  <p className="text-[#0B2046] font-bold">${config?.salario?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-50 text-[#8B5CF6] rounded-full flex items-center justify-center"><Calendar size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Frecuencia de Pago</p>
                  <p className="text-[#0B2046] font-bold capitalize">{config?.frecuencia || 'No definida'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EAFBF6] text-[#00C897] rounded-full flex items-center justify-center"><Target size={18} /></div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Día de Inicio de Ciclo</p>
                  <p className="text-[#0B2046] font-bold">Día {config?.diaInicio || '1'} del mes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-[#0B2046] text-lg font-bold flex items-center gap-2 mb-1">
                <Calendar className="text-blue-500" size={20} /> Mis Gastos Fijos
              </h2>
              <p className="text-xs text-gray-500">Estos gastos se repiten cada ciclo automáticamente.</p>
            </div>
            <span className="text-gray-400 text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">{gastosFijos.length}</span>
          </div>

          <div className="space-y-3">
            {gastosFijos.length === 0 ? (
               <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <AlertCircle className="mx-auto text-gray-300 mb-2" size={24} />
                  <p className="text-gray-500 text-sm">No tienes gastos fijos activos para el próximo ciclo.</p>
               </div>
            ) : (
              gastosFijos.map(gasto => (
                <div key={gasto.id} className="border border-gray-100 rounded-2xl p-4 flex items-center justify-between hover:border-gray-200 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${gasto.categoria === 'Vital' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                      {gasto.categoria === 'Vital' ? <AlertCircle size={18} /> : <Calendar size={18} />}
                    </div>
                    <div>
                      <p className="text-[#0B2046] font-bold text-sm">{gasto.nombre}</p>
                      <p className="text-gray-400 text-xs">${gasto.monto.toLocaleString('en-US', { minimumFractionDigits: 2 })} • {gasto.frecuencia || 'Mensual'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => confirmarEliminarGasto(gasto.id!)} 
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all active:scale-95"
                    title="Cancelar para el próximo ciclo"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={() => setIsLogoutModalOpen(true)}
            className="w-full bg-white border border-red-100 text-red-500 font-bold rounded-[24px] p-5 shadow-sm flex items-center justify-center gap-2 hover:bg-red-50 transition-colors active:scale-95"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>

      </div>


      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[32px] p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
            <h2 className="text-[#0B2046] text-xl font-bold mb-1">Editar Ciclo</h2>
            <p className="text-gray-500 text-sm mb-6">Los cambios se aplicarán al iniciar tu próximo ciclo.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Salario Base</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" placeholder="0.00" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={editSalario} onChange={e => setEditSalario(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Frecuencia de Pago</label>
                <select 
                  className="w-full bg-gray-50 rounded-2xl py-4 px-4 outline-none text-[#0B2046] font-medium appearance-none"
                  value={editFrecuencia} onChange={(e) => setEditFrecuencia(e.target.value as 'Semanal'|'Quincenal'|'Mensual')}
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Día de inicio del ciclo</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" placeholder="Ej. 1 o 15" className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={editDia} onChange={e => setEditDia(e.target.value)} />
                </div>
              </div>

              <button onClick={guardarEdicionCiclo} disabled={!editSalario || !editDia} 
                className={`w-full font-bold rounded-2xl py-4 flex justify-center items-center gap-2 transition-colors mt-4 ${editSalario && editDia ? 'bg-[#0B2046] text-white hover:bg-[#1F3A63]' : 'bg-gray-100 text-gray-400'}`}>
                <Clock size={20} /> Programar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Trash2 size={28} />
            </div>
            <h3 className="text-[#0B2046] text-xl font-bold mb-2">¿Cancelar gasto fijo?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              El pago de este ciclo se mantendrá en tu historial, pero ya no se te cobrará automáticamente en los próximos ciclos.
            </p>
            <div className="space-y-3">
              <button onClick={ejecutarEliminarGasto} className="w-full bg-red-600 text-white font-bold rounded-2xl py-3 hover:bg-red-700 transition-colors active:scale-95">
                Sí, cancelar para el futuro
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-white border border-gray-200 text-[#0B2046] font-bold rounded-2xl py-3 hover:bg-gray-50 transition-colors active:scale-95">
                Mantener Gasto
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <LogOut size={28} />
            </div>
            <h3 className="text-[#0B2046] text-xl font-bold mb-2">¿Cerrar Sesión?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Tendrás que volver a ingresar tu correo y contraseña para ver tus datos.
            </p>
            <div className="space-y-3">
              <button onClick={ejecutarCerrarSesion} className="w-full bg-red-600 text-white font-bold rounded-2xl py-3 hover:bg-red-700 transition-colors active:scale-95">
                Cerrar Sesión
              </button>
              <button onClick={() => setIsLogoutModalOpen(false)} className="w-full bg-white border border-gray-200 text-[#0B2046] font-bold rounded-2xl py-3 hover:bg-gray-50 transition-colors active:scale-95">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}