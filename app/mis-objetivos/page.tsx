"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DashboardService } from '@/services/dashboard.service';
import { MetaService, Meta } from '@/services/meta.service';
import { ConfigService } from '@/services/config.service';
import { ChevronLeft, Medal, DollarSign, Target, Trash2, Plus, Lock, X } from 'lucide-react';

export default function MisObjetivosScreen() {
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [ahorroBase, setAhorroBase] = useState(0);
  const [metaObjetivo, setMetaObjetivo] = useState(0);
  const [montoAhorradoActual, setMontoAhorradoActual] = useState(0);
  const [porcentajeGeneral, setPorcentajeGeneral] = useState(0);

  const [metas, setMetas] = useState<Meta[]>([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [metaToDelete, setMetaToDelete] = useState<string | null>(null);
  const [isAsignarModalOpen, setIsAsignarModalOpen] = useState(false);
  const [metaToAsignar, setMetaToAsignar] = useState<Meta | null>(null);
  const [montoAsignar, setMontoAsignar] = useState('');
  const [sobranteCicloAnterior, setSobranteCicloAnterior] = useState(0);

  const [diaInicio, setDiaInicio] = useState<number | null>(null);
  const esDiaDeCiclo = diaInicio !== null && new Date().getDate() === diaInicio;

  const [nuevaMetaNombre, setNuevaMetaNombre] = useState('');
  const [nuevaMetaMonto, setNuevaMetaMonto] = useState('');

  const loadData = async () => {
    try {
      const [resumen, metasData, config] = await Promise.all([
        DashboardService.getResumen(),
        MetaService.getMetas(),
        ConfigService.getConfig(),
      ]);

      const ahorroHistorico = config.ahorroHistorico ?? 0;
      const objetivo = ahorroHistorico > 0 ? ahorroHistorico * 1.23 : 1000;

      setAhorroBase(ahorroHistorico);
      setMetaObjetivo(objetivo);
      setMontoAhorradoActual(resumen.metaCrecimiento.montoAhorrado);
      setPorcentajeGeneral(resumen.metaCrecimiento.porcentajeActual);
      setSobranteCicloAnterior(resumen.sobranteCicloAnterior ?? 0);
      setMetas(metasData);
      setDiaInicio(config.diaInicio);
    } catch (err: any) {
      let mensaje = "Error al cargar los datos";
      if (typeof err.response?.data?.message === 'string') {
        mensaje = err.response.data.message;
      } else if (Array.isArray(err.response?.data?.message)) {
        mensaje = err.response.data.message[0];
      } else if (err.message && err.message !== '[object Object]') {
        mensaje = err.message;
      }
      setErrorMsg(mensaje);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCrearMeta = async () => {
    if (!nuevaMetaNombre || !nuevaMetaMonto) return;
    setIsActionLoading(true);
    setErrorMsg('');
    try {
      await MetaService.crearMeta({
        nombre: nuevaMetaNombre,
        objetivo: parseFloat(nuevaMetaMonto),
      });
      setIsCreateModalOpen(false);
      setNuevaMetaNombre('');
      setNuevaMetaMonto('');
      await loadData();
    } catch (err: any) {
      let mensaje = "Error al crear la meta";
      if (typeof err.response?.data?.message === 'string') {
        mensaje = err.response.data.message;
      } else if (Array.isArray(err.response?.data?.message)) {
        mensaje = err.response.data.message[0];
      } else if (err.message && err.message !== '[object Object]') {
        mensaje = err.message;
      }
      setErrorMsg(mensaje);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsActionLoading(false);
    }
  };

  const abrirConfirmacionBorrar = (id: string) => {
    setMetaToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmarBorrado = async () => {
    if (!metaToDelete) return;
    setIsActionLoading(true);
    setErrorMsg('');
    try {
      await MetaService.eliminarMeta(metaToDelete);
      setIsDeleteModalOpen(false);
      setMetaToDelete(null);
      await loadData();
    } catch (err: any) {
      let mensaje = "Error al eliminar la meta";
      if (typeof err.response?.data?.message === 'string') {
        mensaje = err.response.data.message;
      } else if (Array.isArray(err.response?.data?.message)) {
        mensaje = err.response.data.message[0];
      } else if (err.message && err.message !== '[object Object]') {
        mensaje = err.message;
      }
      setErrorMsg(mensaje);
      setTimeout(() => setErrorMsg(''), 5000);
      setIsDeleteModalOpen(false);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAsignarFondos = async () => {
    if (!metaToAsignar || !montoAsignar) return;
    setIsActionLoading(true);
    setErrorMsg('');
    try {
      await MetaService.asignarFondos(metaToAsignar.id, parseFloat(montoAsignar));
      setIsAsignarModalOpen(false);
      setMetaToAsignar(null);
      setMontoAsignar('');
      await loadData();
    } catch (err: any) {
      let mensaje = "Error al asignar fondos";
      if (typeof err.response?.data?.message === 'string') {
        mensaje = err.response.data.message;
      } else if (Array.isArray(err.response?.data?.message)) {
        mensaje = err.response.data.message[0];
      } else if (err.message && err.message !== '[object Object]') {
        mensaje = err.message;
      }
      setErrorMsg(mensaje);
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#F8FAFC]"></div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] relative font-sans pb-24">

      <div className="absolute top-0 w-full h-[320px] bg-[#152D4F] z-0"></div>

      {errorMsg && (
        <div className="fixed top-4 left-4 right-4 z-[60] bg-red-500 text-white text-sm font-semibold px-4 pr-10 py-3 rounded-2xl shadow-lg text-center animate-in fade-in slide-in-from-top-4">
          <button onClick={() => setErrorMsg('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-200 hover:text-white transition-colors">
            <X size={18} />
          </button>
          {errorMsg}
        </div>
      )}

      <header className="relative z-10 pt-10 px-6 mb-6">
        <Link href="/dashboard" className="text-white inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity mb-4">
          <ChevronLeft size={18} /> Volver
        </Link>
        <h1 className="text-white text-3xl font-bold tracking-tight">Mis Objetivos</h1>
        <p className="text-blue-200 text-sm mt-1">Ahorra con propósito</p>
      </header>

      <div className="relative z-10 px-6 space-y-4">

        <div className="bg-[#00C897] rounded-[24px] p-6 shadow-lg text-white">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
                <Medal size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {porcentajeGeneral >= 100 ? "¡Meta Alcanzada!" : "Meta en Progreso"}
                </h2>
                <p className="text-sm font-medium opacity-90 mt-1">
                  🎯 Objetivo: ${metaObjetivo.toLocaleString('en-US', { minimumFractionDigits: 2 })} (+23%)
                </p>
              </div>
            </div>
            <span className="text-3xl font-bold">{porcentajeGeneral}%</span>
          </div>

          <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mb-6">
            <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(porcentajeGeneral, 100)}%` }}></div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-xs font-medium opacity-80 mb-1">Ahorro Base</p>
              <p className="font-bold">${ahorroBase.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex-1 bg-white/10 rounded-xl p-3">
              <p className="text-xs font-medium opacity-80 mb-1">Total Actual</p>
              <p className="font-bold">${montoAhorradoActual.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[#0B2046] font-semibold text-sm mb-1">Fondo de Ahorro General (Sobrante)</p>
            <h3 className="text-[#00C897] text-3xl font-bold mb-2">${sobranteCicloAnterior.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 font-medium">
              <Lock size={12} className="text-[#D97706]" /> Disponible para asignar a metas
            </p>
          </div>
          <div className="w-14 h-14 bg-[#EAFBF6] rounded-full flex items-center justify-center text-[#00C897]">
            <DollarSign size={28} />
          </div>
        </div>

        <div className="pt-4">
          <div className="flex justify-between items-end mb-4 px-1">
            <h3 className="font-bold text-[#0B2046] text-lg">Metas Activas</h3>
            <span className="text-gray-400 text-sm">{metas.length} metas</span>
          </div>

          <div className="space-y-4">
            {metas.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center border border-gray-100">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <Target className="text-gray-400" size={24} />
                </div>
                <p className="text-[#0B2046] font-bold">Sin metas aún</p>
                <p className="text-gray-500 text-sm">Crea tu primera meta de ahorro</p>
              </div>
            ) : (
              metas.map(meta => {
                const porcentaje = Math.min((meta.acumulado / meta.objetivo) * 100, 100);
                const restantes = meta.objetivo - meta.acumulado;
                return (
                  <div key={meta.id} className="bg-white border border-gray-100 rounded-[24px] p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 bg-[#00C897] rounded-full flex items-center justify-center text-white">
                          <Target size={24} />
                        </div>
                        <div>
                          <h4 className="text-[#0B2046] font-bold text-lg">{meta.nombre}</h4>
                          <p className="text-gray-500 text-sm">${meta.acumulado.toFixed(2)} de ${meta.objetivo.toFixed(2)}</p>
                        </div>
                      </div>
                      <button onClick={() => abrirConfirmacionBorrar(meta.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="flex justify-between text-xs text-gray-600 mb-2 font-medium">
                      <span>{Math.floor(porcentaje)}% completado</span>
                      <span>${restantes.toFixed(2)} restantes</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-4">
                      <div className="bg-[#00C897] h-full rounded-full" style={{ width: `${porcentaje}%` }}></div>
                    </div>

                    <button
                      onClick={esDiaDeCiclo ? () => { setMetaToAsignar(meta); setIsAsignarModalOpen(true); } : undefined}
                      disabled={!esDiaDeCiclo}
                      className={`w-full font-bold rounded-xl py-3 flex justify-center items-center gap-2 text-sm transition-colors ${esDiaDeCiclo
                        ? 'bg-[#00C897] text-white hover:bg-[#00b085]'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      {esDiaDeCiclo ? <DollarSign size={16} /> : <Lock size={16} />}
                      {esDiaDeCiclo ? 'Asignar Fondos' : 'Disponible el día de ciclo'}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <button onClick={() => setIsCreateModalOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-[#00C897] hover:bg-[#00b085] rounded-full shadow-lg flex items-center justify-center text-white transition-transform active:scale-95 z-20">
        <Plus size={28} />
      </button>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative">
            <button onClick={() => setIsCreateModalOpen(false)} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h2 className="text-[#0B2046] text-xl font-bold mb-6 text-center pt-2">Nueva Meta de Ahorro</h2>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Nombre de la Meta</label>
                <input type="text" placeholder="Ej: Laptop Nueva..." className="w-full bg-gray-50 rounded-2xl py-4 px-4 outline-none text-[#0B2046] text-sm"
                  value={nuevaMetaNombre} onChange={e => setNuevaMetaNombre(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Monto Objetivo</label>
                <div className="relative border border-gray-200 rounded-2xl bg-white overflow-hidden">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" min="0" step="0.01" placeholder="0.00" className="w-full py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={nuevaMetaMonto} onChange={e => setNuevaMetaMonto(e.target.value)} />
                </div>
              </div>
              <button onClick={handleCrearMeta} disabled={!nuevaMetaNombre || !nuevaMetaMonto}
                className={`w-full font-bold rounded-2xl py-4 mt-2 transition-colors ${nuevaMetaNombre && nuevaMetaMonto ? 'bg-[#00C897] text-white hover:bg-[#00b085]' : 'bg-gray-100 text-gray-400'}`}>
                Crear Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center">
            <h3 className="text-[#0B2046] text-xl font-bold mb-2">¿Cancelar esta meta?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              El dinero ahorrado regresará a tu Fondo de Ahorro General.
            </p>
            <div className="space-y-3">
              <button onClick={confirmarBorrado} className="w-full bg-red-600 text-white font-bold rounded-2xl py-3 hover:bg-red-700 transition-colors">
                Cancelar Meta
              </button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-white border border-gray-200 text-[#0B2046] font-bold rounded-2xl py-3 hover:bg-gray-50 transition-colors">
                Conservar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {isAsignarModalOpen && metaToAsignar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#152D4F]/80 p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-6 shadow-2xl relative">
            <button onClick={() => { setIsAsignarModalOpen(false); setMontoAsignar(''); }} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            <h2 className="text-[#0B2046] text-xl font-bold mb-1 text-center pt-2">Asignar Fondos</h2>
            <p className="text-gray-500 text-sm text-center mb-6">Meta: <span className="font-semibold text-[#0B2046]">{metaToAsignar.nombre}</span></p>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-[#0B2046] mb-2 block">Monto a Asignar</label>
                <div className="relative border border-gray-200 rounded-2xl bg-white overflow-hidden">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input type="number" min="0" step="0.01" max={sobranteCicloAnterior} placeholder="0.00" className="w-full py-4 pl-12 pr-4 outline-none font-bold text-[#0B2046] text-lg"
                    value={montoAsignar} onChange={e => setMontoAsignar(e.target.value)} />
                </div>
              </div>
              <button
                onClick={handleAsignarFondos}
                disabled={!montoAsignar || isActionLoading || sobranteCicloAnterior === 0}
                className={`w-full font-bold rounded-2xl py-4 mt-2 transition-colors ${(montoAsignar && !isActionLoading && sobranteCicloAnterior > 0) ? 'bg-[#00C897] text-white hover:bg-[#00b085]' : 'bg-gray-100 text-gray-400'}`}>
                {isActionLoading ? 'Asignando...' : 'Confirmar Asignación'}
              </button>
              {sobranteCicloAnterior === 0 && (
                <p className="text-sm text-red-500 mt-2 text-center font-medium">Solo puedes asignar fondos usando el sobrante de tu ciclo anterior.</p>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}