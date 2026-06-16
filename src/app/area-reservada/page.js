"use client";

import { Lock, ArrowRight, User, Shield, Key, Mail, ChevronLeft, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AreaReservadaPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("client"); // "client" | "admin"
  const [step, setStep] = useState(1); // 1: Credentials, 2: OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao enviar código de verificação.");
      }

      setStep(2);
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Código incorreto.");
      }

      // Store basic session details for personalized greeting
      localStorage.setItem("zuca_user_email", email);
      localStorage.setItem("zuca_user_role", activeTab);

      // Route to correct dashboard
      if (activeTab === "admin") {
        router.push("/area-reservada/dashboard");
      } else {
        router.push("/area-reservada/cliente");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true);
    setError("");
    setOtp("");
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao reenviar código.");
      }

      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const goBackToStep1 = () => {
    setStep(1);
    setOtp("");
    setError("");
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="max-w-md w-full bg-surface p-8 rounded-3xl border border-surface-light shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-mint/5 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Step 1 Title Icon */}
        {step === 1 ? (
          <div className="w-16 h-16 rounded-2xl bg-charcoal flex items-center justify-center mb-6 mx-auto border border-surface-light shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <Lock className="w-8 h-8 text-mint" />
          </div>
        ) : (
          <button 
            onClick={goBackToStep1}
            className="absolute top-6 left-6 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-charcoal transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        )}

        <h1 className="text-3xl font-black text-white text-center mb-2">Área Reservada</h1>
        <p className="text-gray-400 text-sm text-center mb-6 max-w-[300px] mx-auto leading-relaxed">
          {step === 1 
            ? "Selecione o seu portal e insira as suas credenciais para autenticação de segurança."
            : "Inserimos um código de segurança único para validar o seu acesso."
          }
        </p>

        {/* Step 1: Client vs Admin Tab Switching */}
        {step === 1 && (
          <div className="grid grid-cols-2 bg-charcoal p-1.5 rounded-xl border border-surface-light mb-6">
            <button
              onClick={() => { setActiveTab("client"); setError(""); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === "client" 
                  ? "bg-mint text-charcoal shadow-md" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <User className="w-4 h-4" /> Cidadão (Cliente)
            </button>
            <button
              onClick={() => { setActiveTab("admin"); setError(""); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                activeTab === "admin" 
                  ? "bg-mint text-charcoal shadow-md" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" /> Funcionário (Admin)
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-2.5 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}


        {/* FORM WIZARD */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4 text-left">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Cadastrado
              </label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-charcoal border border-surface-light rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mint transition-colors placeholder-gray-600"
                placeholder={activeTab === "client" ? "exemplo@cidadao.co.mz" : "admin@zuca.gov.mz"}
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> Palavra-passe
              </label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-charcoal border border-surface-light rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-mint transition-colors placeholder-gray-600"
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-mint hover:bg-white text-charcoal font-black py-4.5 rounded-xl mt-4 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:shadow-[0_0_25px_rgba(0,255,136,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>Prosseguir para OTP <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                Introduza o código de 6 dígitos
              </label>
              <input 
                type="text" 
                maxLength="6"
                required
                pattern="\d*"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-3xl font-mono tracking-[10px] bg-charcoal border border-surface-light rounded-xl py-4 focus:outline-none focus:border-mint text-mint placeholder-gray-700"
                placeholder="000000"
              />
            </div>

            <div className="text-center text-xs">
              {countdown > 0 ? (
                <span className="text-gray-500">
                  Reenviar código em <strong className="text-gray-300">{countdown}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="text-mint hover:underline font-bold focus:outline-none"
                >
                  Reenviar código de confirmação
                </button>
              )}
            </div>
            
            <button 
              type="submit" 
              disabled={loading || otp.length !== 6}
              className="w-full bg-mint hover:bg-white text-charcoal font-black py-4.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.15)] disabled:opacity-40"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>Verificar e Aceder <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-surface-light text-center text-xs text-gray-500 leading-relaxed">
          {activeTab === "admin" 
            ? "Acesso auditado por chaves criptográficas governamentais."
            : "Portal do Cidadão sob regulamentação legal de proteção de dados."
          }
        </div>
      </div>
    </div>
  );
}
