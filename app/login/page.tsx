"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthService } from '@/services/auth.service';
import { LoginRequestSchema } from '@/models/auth.schema';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react'; 

export default function LoginScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    const validation = LoginRequestSchema.safeParse({ email, password });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.login(validation.data);
      console.log("Login exitoso, token:", response.token);
      
      alert("¡LOGIN EXITOSO! Redirigiendo al Dashboard...");

    } catch (error: any) {
      setErrorMsg(error.message || 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#152D4F] flex flex-col px-6 py-8">
      <Link href="/" className="text-white mb-8 inline-flex items-center gap-2 self-start hover:opacity-80">
        <ChevronLeft /> Volver
      </Link>

      <div className="w-full max-w-md flex flex-col items-center mx-auto flex-1 justify-center">
        
        <div className="mb-8">
           <div className="w-20 h-20 bg-[#2C4A7C] rounded-2xl flex items-center justify-center">
             {/* <Image src="/images/logo-simple.png" ... /> */}
             <span className="text-white text-4xl font-bold">V</span> 
           </div>
        </div>

        <h1 className="text-white text-3xl font-bold mb-10">Iniciar Sesión</h1>

        <form onSubmit={handleLogin} className="w-full flex flex-col">
          <Input 
            label="Email" 
            type="email" 
            placeholder="tu@email.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input 
            label="Contraseña" 
            type={showPassword ? "text" : "password"} 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            endIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            onEndIconClick={() => setShowPassword(!showPassword)}
          />

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 text-sm p-3 rounded-lg mb-4 text-center font-medium">
              {errorMsg}
            </div>
          )}

          <div className="mt-6">
            <Button type="submit" isLoading={isLoading}>
              Acceder
            </Button>
          </div>
        </form>
         <p className="text-gray-400 text-xs mt-8 text-center">
          Tus datos están seguros y encriptados
        </p>
      </div>
    </main>
  );
}