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

  const isFormValid = name.length > 0 && email.length > 0 && password.length > 0 && confirmPassword.length > 0;

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
          <Link href="#" className="text-white underline font-medium">
            Términos y Condiciones
          </Link>
        </p>
      </div>
    </main>
  );
}