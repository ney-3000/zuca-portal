"use client";

import { useEffect, useState } from "react";
import { 
  User, Mail, FileText, CheckCircle2, Clock, AlertCircle, ArrowLeft,
  Smartphone, Monitor, Cpu, MapPin, ExternalLink, ShieldAlert, Award
} from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
  const [email, setEmail] = useState("cidadao@exemplo.co.mz");
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("zuca_user_email");
      if (storedEmail) setEmail(storedEmail);

      // Load active session tracking logs from localStorage to display to the user
      const localLogs = JSON.parse(localStorage.getItem("zuca_local_visitors") || "[]");
      const currentUuid = localStorage.getItem("zuca_visitor_uuid");
      if (currentUuid) {
        const currentSession = localLogs.find(log => log.visitor_uuid === currentUuid);
        if (currentSession) {
          setSessionInfo(currentSession);
        }
      }
    }
  }, []);

  const documentRequests = [
    {
      id: "REQ-2026-9041",
      title: "Renovação do Bilhete de Identidade (BI)",
      date: "10 Jun 2026",
      status: "Em Emissão",
      color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      description: "Recolha de dados biométricos concluída no posto de atendimento Maputo-Cidade.",
      step: 3,
      totalSteps: 4
    },
    {
      id: "REQ-2026-8710",
      title: "Registo Fiscal do Contribuinte (NUIT)",
      date: "04 Jun 2026",
      status: "Concluído",
      color: "text-mint bg-mint/10 border-mint/20",
      description: "NUIT emitido com sucesso. Cartão digital disponível para exportação em PDF.",
      step: 4,
      totalSteps: 4
    },
    {
      id: "REQ-2026-7712",
      title: "Pedido de Licenciamento Comercial",
      date: "28 Mai 2026",
      status: "Em Análise",
      color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
      description: "Documentação societária sob validação da Conservatória do Registo de Entidades.",
      step: 2,
      totalSteps: 4
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 min-h-[90vh] text-gray-200">
      
      {/* Header back link & Title */}
      <div className="flex flex-col gap-2 border-b border-surface-light pb-6">
        <Link href="/area-reservada" className="text-xs text-mint font-bold hover:underline flex items-center gap-1 uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Terminar Sessão
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              Portal do Cidadão
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Aceda aos seus documentos e acompanhe os seus requerimentos públicos num único local.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-surface border border-surface-light rounded-2xl px-5 py-3.5">
            <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center border border-mint/20 shrink-0">
              <User className="w-5 h-5 text-mint" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Cidadão Autenticado</span>
              <span className="text-sm font-semibold text-white truncate max-w-[200px]" title={email}>
                {email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Left - Requsts & Actions | Right - Security info / Session log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 cols span on desktop) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Quick Citizen Actions Grid */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-mint" /> Ações Rápidas do Cidadão
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface p-6 rounded-2xl border border-surface-light hover:border-mint hover:bg-surface-light transition-all flex flex-col justify-between min-h-[140px] group cursor-pointer">
                <div>
                  <h3 className="font-bold text-white group-hover:text-mint transition-colors">Nova Emissão de Documento</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Solicite renovação de BI, Passaporte, Cartas de Condução e Certidões de Registo Civil.</p>
                </div>
                <div className="text-xs text-mint font-bold uppercase tracking-wider flex items-center gap-1 mt-4">
                  Iniciar Pedido <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="bg-surface p-6 rounded-2xl border border-surface-light hover:border-mint hover:bg-surface-light transition-all flex flex-col justify-between min-h-[140px] group cursor-pointer">
                <div>
                  <h3 className="font-bold text-white group-hover:text-mint transition-colors">Consultar Declaração Fiscal</h3>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">Consulte o seu enquadramento de impostos sobre o rendimento (IRPS) e comprove o seu NUIT.</p>
                </div>
                <div className="text-xs text-mint font-bold uppercase tracking-wider flex items-center gap-1 mt-4">
                  Visualizar Taxas <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Request Tracker Timeline */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-mint" /> Estado dos Seus Requerimentos Activos
            </h2>
            <div className="flex flex-col gap-4">
              {documentRequests.map((req, idx) => (
                <div key={idx} className="bg-surface p-6 rounded-2xl border border-surface-light flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-surface-light/40 pb-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 font-mono font-semibold">{req.id} • Submetido em {req.date}</span>
                      <h3 className="font-bold text-white text-base mt-0.5">{req.title}</h3>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full border font-bold text-center w-fit ${req.color}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {req.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-gray-500 font-semibold">
                      <span>Progresso do Processo</span>
                      <span>Etapa {req.step} de {req.totalSteps}</span>
                    </div>
                    <div className="w-full bg-charcoal h-2.5 rounded-full overflow-hidden border border-surface-light">
                      <div 
                        className="bg-mint h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(req.step / req.totalSteps) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right column: Security / Visitor session logs */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          
          <div className="bg-surface rounded-2xl border border-surface-light p-6 flex flex-col gap-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-surface-light pb-4">
              <ShieldAlert className="w-5 h-5 text-mint" /> Segurança da Sessão
            </h2>

            <p className="text-xs text-gray-400 leading-relaxed">
              O Portal Zuca audita a segurança do seu acesso guardando dados de sessão para monitorização e prevenção de acessos não autorizados.
            </p>

            {sessionInfo ? (
              <div className="flex flex-col gap-4 bg-charcoal p-4.5 rounded-xl border border-surface-light">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Endereço IP Registado</span>
                  <span className="font-mono text-sm text-white font-semibold">{sessionInfo.ip_address}</span>
                </div>
                
                <div className="flex items-center gap-3 border-t border-surface-light/40 pt-3">
                  <div className="p-2 bg-surface rounded-lg border border-surface-light text-mint">
                    {sessionInfo.is_mobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Dispositivo Detetado</span>
                    <span className="text-xs text-white font-semibold">{sessionInfo.device_model}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-surface-light/40 pt-3">
                  <div className="p-2 bg-surface rounded-lg border border-surface-light text-mint">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Ecrã e Navegador</span>
                    <span className="text-xs text-white font-semibold">{sessionInfo.browser_name} • {sessionInfo.screen_resolution}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-surface-light/40 pt-3">
                  <div className="p-2 bg-surface rounded-lg border border-surface-light text-mint">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Cidade / País</span>
                    <span className="text-xs text-white font-semibold">{sessionInfo.location_city}, {sessionInfo.location_country}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-surface-light/40 pt-3">
                  <div className="p-2 bg-surface rounded-lg border border-surface-light text-mint">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-1">Visitas & Tempo Activo</span>
                    <span className="text-xs text-white font-semibold">Registo: {sessionInfo.visit_count} visitas • {Math.round(sessionInfo.session_duration)}s ativos</span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-charcoal p-4 rounded-xl border border-surface-light text-center py-6 text-xs text-gray-500">
                A obter informações de segurança do dispositivo...
              </div>
            )}

            <div className="text-[10px] text-gray-500 text-center">
              Identificador Único: <br />
              <span className="font-mono text-[9px] break-all">{sessionInfo?.visitor_uuid || "Carregando..."}</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
