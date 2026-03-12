"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ActividadService, EventoLineTiempo } from '@/services/actividad.service';
import {
    ChevronLeft, Medal, CheckCircle2, AlertCircle, Calendar,
    ShoppingCart, Lock, RefreshCw, Ticket
} from 'lucide-react';

function formatFecha(fechaStr: string) {
    const fecha = new Date(fechaStr);
    return new Intl.DateTimeFormat('es-MX', {
        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(fecha);
}

function IconoGasto({ categoria }: { categoria?: string }) {
    if (!categoria) return <ShoppingCart size={18} />;
    const cat = categoria.toLowerCase();
    if (cat === 'vital') return <AlertCircle size={18} />;
    if (cat === 'recurrente') return <RefreshCw size={18} />;
    if (cat === 'fijo') return <Lock size={18} />;
    if (cat === 'variable') return <Ticket size={18} />;
    return <ShoppingCart size={18} />;
}

export default function HistorialScreen() {
    const [eventos, setEventos] = useState<EventoLineTiempo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        ActividadService.getLineaTiempo()
            .then(setEventos)
            .catch((err: any) => setErrorMsg(err.message || 'Error al cargar el historial'))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <main className="min-h-screen bg-[#F8FAFC] relative font-sans pb-10">

            <div className="absolute top-0 w-full h-[240px] bg-[#152D4F] rounded-b-[40px] z-0" />

            <header className="relative z-10 pt-10 px-6 mb-8">
                <Link
                    href="/dashboard"
                    className="text-white inline-flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity mb-4"
                >
                    <ChevronLeft size={18} /> Volver al Dashboard
                </Link>
                <h1 className="text-white text-3xl font-bold tracking-tight">Historial de Actividad</h1>
                <p className="text-blue-200 text-sm mt-1">Todos tus movimientos financieros</p>
            </header>

            <div className="relative z-10 px-6">

                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-[#00C897] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 font-semibold text-sm px-4 py-3 rounded-2xl text-center">
                        {errorMsg}
                    </div>
                )}

                {!isLoading && !errorMsg && eventos.length === 0 && (
                    <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100 mt-4">
                        <Calendar className="mx-auto text-gray-300 mb-3" size={36} />
                        <p className="text-[#0B2046] font-bold mb-1">Sin actividad registrada</p>
                        <p className="text-gray-400 text-sm">Aquí aparecerán tus movimientos conforme uses la app.</p>
                    </div>
                )}

                {!isLoading && !errorMsg && eventos.length > 0 && (
                    <div className="relative">
                        {/* Línea vertical del timeline */}
                        <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gray-200 z-0" />

                        <div className="space-y-4">
                            {eventos.map((evento, index) => {
                                const esInicioCiclo = evento.tipoEvento === 'INICIO_CICLO';
                                const esGasto = evento.tipoEvento === 'GASTO' || evento.tipoEvento === 'GASTO_VARIABLE';

                                return (
                                    <div key={index} className="flex gap-4 relative z-10">
                                        {/* Dot / Icono del timeline */}
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border-2
                      ${esInicioCiclo
                                                ? 'bg-[#EAFBF6] border-[#00C897] text-[#00C897]'
                                                : 'bg-red-50 border-red-200 text-red-500'
                                            }`}
                                        >
                                            {esInicioCiclo
                                                ? <Medal size={18} />
                                                : <IconoGasto categoria={evento.categoria} />
                                            }
                                        </div>

                                        {/* Tarjeta del evento */}
                                        <div className={`flex-1 rounded-2xl p-4 shadow-sm border transition-all
                      ${esInicioCiclo
                                                ? 'bg-[#EAFBF6] border-[#A6E8D7]'
                                                : 'bg-white border-gray-100'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <h3 className="text-[#0B2046] font-bold text-sm">{evento.titulo}</h3>
                                                        {esInicioCiclo && evento.cumplioMeta && (
                                                            <span className="flex items-center gap-1 bg-[#00C897] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                                <CheckCircle2 size={10} /> Meta cumplida
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-400 text-xs mt-1">{formatFecha(evento.fecha)}</p>

                                                    {(evento.categoria || evento.frecuencia) && (
                                                        <p className="text-gray-500 text-xs mt-1 capitalize">
                                                            {[evento.categoria, evento.frecuencia].filter(Boolean).join(' · ')}
                                                        </p>
                                                    )}
                                                </div>

                                                <span className={`font-bold text-base ml-3 whitespace-nowrap
                          ${esInicioCiclo ? 'text-[#00C897]' : 'text-red-500'}`}
                                                >
                                                    {esInicioCiclo ? '+' : '-'}${Math.abs(evento.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
