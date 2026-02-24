import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; 
import { Button } from '@/components/ui/Button';
import { ShieldCheck, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#152D4F] flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md flex flex-col items-center">
        
        <div className="mb-6">
           <div className="w-24 h-24 bg-[#00C897] rounded-2xl flex items-center justify-center relative overflow-hidden">
             <span className="text-white text-5xl font-bold">V</span> 
           </div>
        </div>

        <h1 className="text-white text-4xl font-bold mb-3">VauCher</h1>
        <p className="text-gray-300 text-center text-lg mb-10 leading-relaxed">
          Tu asistente inteligente de planificación financiera
        </p>

        <div className="w-full space-y-4 mb-10">
          
          <FeatureCard 
            icon={
              <Image 
                src="/shield.svg" 
                alt="Escudo" 
                width={24} 
                height={24} 
                unoptimized 
              />
            }
            text="Evita gastos impulsivos con saldo proyectado"
          />
          
          <FeatureCard 
            icon={
              <Image 
                src="/up.svg" 
                alt="Gráfica" 
                width={24} 
                height={24} 
                unoptimized
              />
            }
            text="Meta de crecimiento del 23% automática"
          />
          
          <FeatureCard 
            icon={
              <Image 
                src="/star.svg" 
                alt="Estrellas" 
                width={24} 
                height={24} 
                unoptimized
              />
            }
            text="Control total de tus finanzas personales"
          />
        </div>

        <div className="w-full space-y-4">
          <Link href="/registro" className="w-full block">
            <Button className="flex items-center justify-center gap-2">
              Crear Cuenta <ArrowRight size={20} />
            </Button>
          </Link>
          
          <Link href="/login" className="w-full block">
             <Button variant="outline">
              Iniciar Sesión
            </Button>
          </Link>
        </div>

      </div>
    </main>
  );
}

const FeatureCard = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="bg-[#1F3A63] p-4 rounded-2xl flex items-center gap-4 border border-[#2C4A7C]/50">
    <div className="bg-[#2C4A7C]/50 p-3 rounded-xl">
    {icon}
    </div>
    <p className="text-white font-medium text-sm flex-1">{text}</p>
  </div>
);