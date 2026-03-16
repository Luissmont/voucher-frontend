"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/auth.service';
import { RegisterRequestSchema } from '@/models/auth.schema';
import { Eye, EyeOff, ChevronLeft, User, Mail, Lock } from 'lucide-react';

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const isNameValid = /^[a-zA-ZÀ-ÿ\u00f1\u00d1 ]+$/.test(name) && name.length >= 2 && name.length <= 50;
  const isPasswordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validation = RegisterRequestSchema.safeParse({
      name,
      email,
      password,
      confirmPassword
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register(validation.data);
      console.log("Registro exitoso, token:", response.token);
      router.push('/configuracion');
    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    name.length > 0 &&
    email.length > 0 &&
    password.length > 0 &&
    confirmPassword.length > 0 &&
    isNameValid &&
    isPasswordValid &&
    password === confirmPassword;

  return (
    <main className="min-h-screen bg-[#152D4F] flex flex-col px-6 py-8">
      <Link href="/" className="text-white mb-6 inline-flex items-center gap-2 self-start hover:opacity-80 transition-opacity">
        <ChevronLeft size={24} /> Volver
      </Link>

      <div className="w-full max-w-md flex flex-col items-center mx-auto flex-1">

        <div className="mb-4">
          <div className="w-16 h-16 bg-[#2C4A7C] rounded-2xl flex items-center justify-center">
            <span className="text-white text-3xl font-bold">V</span>
          </div>
        </div>

        <h1 className="text-white text-3xl font-bold mb-1">Crear Cuenta</h1>
        <p className="text-gray-300 text-sm mb-8">Comienza tu viaje financiero</p>

        <form onSubmit={handleRegister} className="w-full flex flex-col">
          <Input
            label="Nombre Completo"
            type="text"
            placeholder="Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
            startIcon={<User size={20} />}
          />
          {name.length > 0 && !isNameValid && (
            <p className="text-red-400 text-xs mt-1 ml-1 mb-2">
              El nombre debe tener entre 2 y 50 caracteres, y solo contener letras.
            </p>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            startIcon={<Mail size={20} />}
          />

          <Input
            label="Contraseña"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            startIcon={<Lock size={20} />}
            endIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onEndIconClick={() => setShowPassword(!showPassword)}
          />
          {password.length > 0 && !isPasswordValid && (
            <p className="text-red-400 text-xs mt-1 ml-1 mb-2 leading-tight">
              La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.
            </p>
          )}

          <Input
            label="Confirmar Contraseña"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            startIcon={<Lock size={20} />}
            endIcon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onEndIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
          />

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg mt-2 mb-2 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <div className="mt-6 mb-6">
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!isFormValid}
              className={!isFormValid ? "bg-[#2C4A7C] text-gray-400" : ""}
            >
              Crear Cuenta
            </Button>
          </div>
        </form>

        <p className="text-gray-400 text-xs text-center mt-auto">
          Al crear una cuenta, aceptas nuestros{' '}
          <button
            type="button"
            onClick={() => setIsTermsOpen(true)}
            className="text-white underline font-medium hover:text-[#00C897] transition-colors"
          >
            Términos y Condiciones
          </button>
        </p>
      </div>

      {isTermsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsTermsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 mx-4 mb-auto mt-auto"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[#0B2046] text-xl font-bold">Términos y Condiciones</h2>
                  <p className="text-gray-400 text-xs mt-0.5">VouCher — Última actualización: 16 de marzo de 2026</p>
                </div>
                <button
                  onClick={() => setIsTermsOpen(false)}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors font-bold text-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm text-gray-600 leading-relaxed">

              <p className="text-gray-600 text-sm leading-relaxed">
                <span className="font-semibold text-[#0B2046]">¡Gracias por ser parte de este proyecto!</span>{' '}Antes que nada, queremos agradecerte profundamente por tu tiempo, tu confianza y por participar en esta prueba. Este proyecto no sería posible sin ti. Al registrarte, aceptas los siguientes términos, diseñados exclusivamente para protegerte a ti y a tu información durante el tiempo que compartamos.
              </p>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-1">1. Propósito del Proyecto (Estudio de Ahorro)</h3>
                <p>VouCher no es una institución bancaria ni una aplicación financiera comercial. Es una herramienta de software
                  desarrollada estrictamente con fines de investigación para un estudio de comprobación de métodos de ahorro
                  personal. La aplicación sirve única y exclusivamente para que puedas visualizar, organizar y comprobar tu
                  comportamiento financiero durante el periodo de prueba.</p>
              </section>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-1">2. Temporalidad y Autodestrucción de Datos (Ciclo de 1 Mes)</h3>
                <p>Para garantizar tu total tranquilidad y privacidad, este estudio tiene una duración estricta y limitada de un (1) mes.</p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-gray-500">
                  <li>Al finalizar este periodo de 30 días, la aplicación móvil y la página web serán inhabilitadas por completo.</li>
                  <li>Todos los registros, historiales de gastos, saldos y cuentas de usuario serán eliminados y desechados permanentemente de nuestros servidores y bases de datos.</li>
                  <li>No conservaremos ninguna copia, respaldo ni rastro de tu información financiera una vez concluido el estudio.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-2">3. Privacidad, Análisis de Datos y Exposición</h3>
                <p>Tus datos están protegidos por la propia infraestructura y arquitectura del código de VouCher.</p>
                <div className="mt-3 space-y-2">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-semibold text-[#0B2046] text-xs mb-0.5">El Único Dato a Analizar</p>
                    <p className="text-xs">La única información que será extraída y utilizada para los resultados es tu rendimiento
                      final: evaluar si cumpliste o no con tu meta de ahorro.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-semibold text-[#0B2046] text-xs mb-0.5">Exposición Segura</p>
                    <p className="text-xs">Este resultado será expuesto estrictamente en el entorno de evaluación y presentación
                      de este estudio. Bajo ninguna circunstancia tus datos serán publicados al público en general, ni vendidos,
                      alquilados o cedidos a terceros.</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="font-semibold text-[#0B2046] text-xs mb-0.5">Cero Visibilidad</p>
                    <p className="text-xs">Los creadores y administradores no tienen acceso visual a tus contraseñas ni
                      credenciales. Tampoco analizamos manualmente tus ingresos o gastos; el sistema hace las matemáticas
                      de forma automática.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-1">4. Cuentas de Usuario y Responsabilidad</h3>
                <p>Para participar en el estudio y que el algoritmo funcione, requerimos que crees una cuenta. Eres el único
                  responsable de mantener en secreto tu acceso a la plataforma. Dado que la exactitud de los datos es el motor
                  de este estudio, te invitamos a que los montos que ingreses sean lo más apegados a tu realidad posible, con
                  la total garantía de privacidad ya mencionada.</p>
              </section>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-1">5. Uso Aceptable</h3>
                <p>Al participar, te comprometes a utilizar VouCher de manera ética durante este mes de prueba. Queda prohibido
                  intentar vulnerar la seguridad de la infraestructura, registrar datos de terceras personas sin su consentimiento,
                  o usar la plataforma para actividades ajenas al propósito de este estudio.</p>
              </section>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-1">6. Propiedad Intelectual</h3>
                <p>Todo el código, la arquitectura de base de datos, los algoritmos de ciclos y el diseño visual de VouCher son
                  propiedad de sus creadores. Se prohíbe la copia, distribución o ingeniería inversa del software.</p>
              </section>

              <section>
                <h3 className="text-[#0B2046] font-bold mb-1">7. Limitación de Responsabilidad</h3>
                <p>Al ser una herramienta de investigación temporal, VouCher se entrega "tal cual". No nos hacemos responsables
                  por decisiones financieras personales que tomes basándote en la interfaz de la aplicación, ni por posibles
                  interrupciones temporales del servidor de prueba durante el transcurso del mes.</p>
              </section>

              <div className="bg-[#0B2046] rounded-2xl p-4 text-center">
                <p className="text-white font-semibold text-sm">¡Muchas gracias por ayudarnos a hacer de VouCher una realidad!</p>
              </div>

              <div className="h-2" />
            </div>

            <div className="px-6 py-4 border-t border-gray-100">
              <button
                onClick={() => setIsTermsOpen(false)}
                className="w-full bg-[#0B2046] text-white font-bold rounded-2xl py-4 hover:bg-[#1F3A63] transition-colors active:scale-95"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}