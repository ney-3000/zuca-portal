"use client";

import { Lock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AreaReservadaPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/area-reservada/dashboard");
    }, 1200);
  };

  return (
    <div className="container mx-auto px-4 py-16 md:py-32 flex flex-col items-center justify-center text-center min-h-[70vh]">
      <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-surface-light shadow-2xl relative overflow-hidden">
        
        <div className="w-16 h-16 rounded-2xl bg-charcoal flex items-center justify-center mb-6 mx-auto border border-surface-light shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <Lock className="w-8 h-8 text-mint" />
        </div>
        
        <h1 className="text-2xl font-black text-white mb-2">Área Reservada</h1>
        <p className="text-gray-400 text-sm mb-8">
          Acesso exclusivo para funcionários governamentais e administradores do sistema Zuca.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nuit ou Email Oficial</label>
            <input 
              type="text" 
              required
              className="w-full bg-charcoal border border-surface-light rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint transition-colors placeholder-gray-600"
              placeholder="Ex: 12345678"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Palavra-passe</label>
            <input 
              type="password" 
              required
              className="w-full bg-charcoal border border-surface-light rounded-xl px-4 py-3 text-white focus:outline-none focus:border-mint transition-colors placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-mint hover:bg-white text-charcoal font-black py-4 rounded-xl mt-4 transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Autenticando..." : <>Autenticar <ArrowRight className="w-5 h-5" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-surface-light text-xs text-gray-500">
          O acesso não autorizado a sistemas do Estado é um crime punível por lei.
        </div>
      </div>
    </div>
  );
}
