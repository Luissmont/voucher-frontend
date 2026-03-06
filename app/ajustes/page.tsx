"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConfigService } from '@/services/config.service';
import { GastoService } from '@/services/gasto.service';
import { AuthService } from '@/services/auth.service';
import {
  ChevronLeft, User, DollarSign, Calendar,
  Trash2, LogOut, AlertCircle, Edit3, X, Clock, Target
} from 'lucide-react';

export default function AjustesScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [config, setConfig] = useState<any>(null);
  const [tienesCambiosPendientes, setTienesCambiosPendientes] = useState(false);
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [gastoToDelete, setGastoToDelete] = useState<string | null>(null);

  // Formulario de edición — guardamos valor original para detectar cambios
  const [editSalario, setEditSalario] = useState('');
  const [editFrecuencia, setEditFrecuencia] = useState<'Semanal' | 'Quincenal' | 'Mensual'>('Mensual');
  const [editDia, setEditDia] = useState('');

  const cargarDatos = async () => {
    try {
      const [configData, pendienteData, gastosFijosData] = await Promise.all([
        ConfigService.getConfiguracionActual(),
        ConfigService.getCambiosPendientes(),
        GastoService.getGastosFijos(),
      ]);

      setConfig(configData);
      setTienesCambiosPendientes(pendienteData.pendingConfig !== null);
      setGastosFijos(gastosFijosData);

      // Pre-llenar formulario de edición con valores actuales
      setEditSalario(configData.salario?.toString() || '');
      setEditFrecuencia((configData.frecuencia as 'Semanal' | 'Quincenal' | 'Mensual') || 'Mensual');
      setEditDia(configData.diaInicio?.toString() || '');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const guardarEdicionCiclo = async () => {
    if (!config) return;
    setIsActionLoading(true);
    setErrorMsg('');

    // Solo enviar campos que el usuario modificó
    const body: Record<string, any> = {};
    const nuevoSalario = parseFloat(editSalario);
    const nuevoDia = parseInt(editDia);

    if (!isNaN(nuevoSalario) && nuevoSalario !== config.salario) {
      body.salario = nuevoSalario;
    }
    if (editFrecuencia !== config.frecuencia) {
      body.frecuencia = editFrecuencia;
    }
    if (!isNaN(nuevoDia) && nuevoDia !== config.diaInicio) {
      body.diaInicio = nuevoDia;
    }

    if (Object.keys(body).length === 0) {
      setIsEditModalOpen(false);
      setIsActionLoading(false);
      return;
    }

    try {
      await ConfigService.programarProximoCiclo(body);
      setIsEditModalOpen(false);
      setTienesCambiosPendientes(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al programar cambios');
    } finally {
      setIsActionLoading(false);
    }
  };

  const confirmarEliminarGasto = (id: string) => {
    setGastoToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const ejecutarEliminarGasto = async () => {
    if (!gastoToDelete) return;
    setIsActionLoading(true);
    setErrorMsg('');
    try {
      await GastoService.eliminarGastoFijo(gastoToDelete);
      // Quitar del estado local sin recargar toda la vista
      setGastosFijos(prev => prev.filter(g => g.id !== gastoToDelete));
      setIsDeleteModalOpen(false);
      setGastoToDelete(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cancelar el gasto');
      setIsDeleteModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const ejecutarCerrarSesion = () => {
    AuthService.logout();
    router.push('/');
  };

  if (isLoading) return <div className="min-h-screen bg-[#F8FAFC]"></div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] relative font-sans pb-10">

      <div className="absolute top-0 w-full h-[280px] bg-[#152D4F] rounded-b-[40px] z-0"></div>

      {errorMsg && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-500 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg text-center">
          {errorMsg}
        </div>
      )}

      <header className="relative z-10 pt-10 px-6 mb-6">
        <Link href="/dashboard" className="text-white inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity mb-4">
          <ChevronLeft size={18} /> Volver al Dashboard
        </Link>
        <h1 className="text-white text-3xl font-bold tracking-tight">Ajustes</h1>
        <p className="text-blue-200 text-sm mt-1">Administra tu perfil y gastos fijos</p>
      </header>

      <div className="relative z-10 px-6 space-y-6">

        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          {tienesCambiosPendientes && (
            <div className="bg-amber-50 text-amber-600 text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 absolute top-0 left-0 w-full">
              <Clock size={14} /> Tienes cambios programados para el próximo ciclo
            </div>
          )}

          <div className={`flex justify-between items-center mb-6 ${tienesCambiosPendientes ? 'mt-6' : ''}`}>
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
                      <p className="text-gray-400 text-xs">${gasto.monto?.toLocaleString('en-US', { minimumFractionDigits: 2 })} • {gasto.frecuencia || 'Mensual'}</p>
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
                  value={editFrecuencia} onChange={(e) => setEditFrecuencia(e.target.value as 'Semanal' | 'Quincenal' | 'Mensual')}
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

              <button onClick={guardarEdicionCiclo} disabled={isActionLoading}
                className={`w-full font-bold rounded-2xl py-4 flex justify-center items-center gap-2 transition-colors mt-4 ${!isActionLoading ? 'bg-[#0B2046] text-white hover:bg-[#1F3A63]' : 'bg-gray-100 text-gray-400'}`}>
                <Clock size={20} /> {isActionLoading ? 'Programando...' : 'Programar Cambios'}
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
              <button onClick={ejecutarEliminarGasto} disabled={isActionLoading} className="w-full bg-red-600 text-white font-bold rounded-2xl py-3 hover:bg-red-700 transition-colors active:scale-95">
                {isActionLoading ? 'Cancelando...' : 'Sí, cancelar para el futuro'}
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