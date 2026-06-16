"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Mail, FileText, CheckCircle2, Clock, AlertCircle, ArrowLeft, ArrowRight,
  Smartphone, Monitor, Cpu, MapPin, ExternalLink, ShieldAlert, Award,
  ShoppingCart, Plus, Minus, Trash2, CreditCard, DollarSign, Check, X, ShieldCheck
} from "lucide-react";
import Link from "next/link";

export default function ClientDashboard() {
  const router = useRouter();
  const [email, setEmail] = useState("cidadao@exemplo.co.mz");
  const [sessionInfo, setSessionInfo] = useState(null);
  
  // Cart & Checkout states
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Form, 2: Mobile Prompt, 3: Success
  
  // Checkout Form fields
  const [fullName, setFullName] = useState("");
  const [nuit, setNuit] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa"); // "mpesa" | "emola" | "mkesh" | "simo" | "reference"
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // User Document Requests
  const [documentRequests, setDocumentRequests] = useState([
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
  ]);

  // Catalog of Mozambican citizen service fees
  const serviceCatalog = [
    { id: "srv_bi", name: "Emissão de Bilhete de Identidade (BI)", price: 250, desc: "Taxa única de emissão ou renovação civil." },
    { id: "srv_cart", name: "Renovação de Carta de Condução", price: 850, desc: "Validação médica e emissão biométrica INATRO." },
    { id: "srv_pass", name: "Emissão de Passaporte Biométrico", price: 3000, desc: "Pedido eletrónico urgente do passaporte nacional." },
    { id: "srv_alvara", name: "Alvará de Licenciamento Comercial", price: 1500, desc: "Taxa anual de exploração e registo industrial." },
    { id: "srv_trans", name: "Licenciamento de Transportes (Chapa)", price: 2500, desc: "Vistoria e emissão da licença de rota urbana." },
    { id: "srv_edm", name: "Vistoria Técnica de Energia (EDM)", price: 350, desc: "Deslocação de técnico para análise de ramal elétrico." },
    { id: "srv_vaga", name: "Taxa de Publicação de Vaga (Bolsa MZN)", price: 1200, desc: "Direito de publicação de anúncio na rede pública." },
    { id: "srv_saude", name: "Seguro de Saúde Público Estendido", price: 1800, desc: "Contribuição anual familiar no Serviço Nacional de Saúde." }
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("zuca_user_email");
      if (storedEmail) {
        setEmail(storedEmail);
        setFullName(storedEmail.split("@")[0].toUpperCase()); // Guess a default name
      }

      // Load active session tracking logs from localStorage
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

  useEffect(() => {
    if (isCartOpen || isCheckoutOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen, isCheckoutOpen]);

  // Cart operations
  const addToCart = (item) => {
    setCart((prevCart) => {
      const existing = prevCart.find(i => i.id === item.id);
      if (existing) {
        return prevCart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prevCart, { ...item, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== id));
  };

  const getCartTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  const getCartCount = () => {
    return cart.reduce((acc, item) => acc + item.qty, 0);
  };

  // Checkout operations
  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setCheckoutStep(1);
    setErrorMessage("");
    setIsCheckoutOpen(true);
  };

  const handleSubmitCheckoutForm = (e) => {
    e.preventDefault();
    if (!nuit || nuit.length !== 9 || isNaN(nuit)) {
      setErrorMessage("Por favor, introduza um NUIT válido com 9 algarismos.");
      return;
    }
    setErrorMessage("");
    
    // Switch to step 2 (mobile pin prompt simulation for M-Pesa / e-Mola / mKesh)
    if (paymentMethod === "mpesa" || paymentMethod === "emola" || paymentMethod === "mkesh") {
      setCheckoutStep(2);
      // Simulate mobile push payment confirmation delay
      setTimeout(() => {
        processPayment();
      }, 4000);
    } else {
      processPayment();
    }
  };

  const processPayment = async () => {
    setIsPaying(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/services/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: fullName,
          nuit,
          phone,
          paymentMethod,
          cartItems: cart,
          totalAmount: getCartTotal()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocorreu um erro ao processar o seu pagamento.");
      }

      // Save order details to localStorage for redirection success page
      const successData = {
        refNumber: data.refNumber,
        date: data.date,
        paymentMethod: paymentMethod,
        fullName: fullName,
        nuit: nuit,
        totalAmount: getCartTotal(),
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price }))
      };
      localStorage.setItem("zuca_last_checkout", JSON.stringify(successData));

      // Append paid items to timeline requests
      const newRequests = cart.map((item, idx) => ({
        id: `REQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        title: item.name,
        date: new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: "Pago",
        color: "text-mint bg-mint/10 border-mint/20",
        description: `Taxa liquidada com sucesso eletronicamente via ${paymentMethod.toUpperCase()}. Referência: ${data.refNumber}.`,
        step: 1,
        totalSteps: 4
      }));

      setDocumentRequests(prev => [...newRequests, ...prev]);
      setCart([]); // Clear cart
      setIsCheckoutOpen(false); // Close checkout drawer
      router.push("/area-reservada/cliente/pedido-sucesso"); // Redirect!
    } catch (err) {
      setErrorMessage(err.message);
      setCheckoutStep(1); // Go back to edit form
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col gap-8 min-h-[90vh] text-gray-200 relative">
      
      {/* Header back link & Title */}
      <div className="flex flex-col gap-2 border-b border-surface-light pb-6">
        <div className="flex justify-between items-center">
          <Link href="/area-reservada" className="text-xs text-mint font-bold hover:underline flex items-center gap-1 uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Terminar Sessão
          </Link>
          
          {/* Cart Header Badge Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative bg-surface hover:bg-surface-light border border-surface-light p-3.5 rounded-2xl transition-all text-white flex items-center gap-2 group"
          >
            <ShoppingCart className="w-5 h-5 text-mint group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Carrinho</span>
            {getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-mint text-charcoal text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight flex items-center gap-3">
              Portal do Cidadão
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Consulte os seus requerimentos públicos e liquide taxas e emolumentos nacionais.
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column (2 cols span) */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Services & Fees Catalogue */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-mint" /> Catálogo de Taxas e Emolumentos Públicos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {serviceCatalog.map((service) => (
                <div 
                  key={service.id} 
                  className="bg-surface p-5 rounded-2xl border border-surface-light hover:border-mint/50 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-white group-hover:text-mint transition-colors text-sm sm:text-base leading-tight">
                        {service.name}
                      </h3>
                      <span className="font-mono text-xs text-mint font-bold bg-mint/10 border border-mint/20 px-2 py-1 rounded shrink-0">
                        {service.price} MZN
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => addToCart(service)}
                    className="w-full bg-charcoal hover:bg-mint hover:text-charcoal border border-surface-light group-hover:border-mint/30 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar ao Carrinho
                  </button>
                </div>
              ))}
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

        {/* Right column: Security / Session log */}
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

      {/* ================= SHOPPING CART DRAWER ================= */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[99999] bg-charcoal/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-charcoal border-l border-surface-light h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-surface-light flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-mint" /> O seu Carrinho ({getCartCount()})
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-400 hover:text-white p-2 rounded-lg bg-surface hover:bg-surface-light transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-surface border border-surface-light flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Carrinho Vazio</h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px] leading-relaxed">Consulte o nosso catálogo de taxas públicas para adicionar serviços.</p>
                  </div>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-surface p-4 rounded-xl border border-surface-light flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-white text-sm leading-tight">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex justify-between items-center mt-2 border-t border-surface-light/40 pt-3">
                      <div className="flex items-center gap-2.5">
                        <button 
                          onClick={() => updateQty(item.id, -1)}
                          className="bg-charcoal hover:bg-surface-light border border-surface-light p-1.5 rounded-lg text-gray-300 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-white text-sm font-mono">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)}
                          className="bg-charcoal hover:bg-surface-light border border-surface-light p-1.5 rounded-lg text-gray-300 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-sm text-mint font-bold">
                        {(item.price * item.qty).toLocaleString('pt-MZ')} MZN
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Total & Checkout Button */}
            {cart.length > 0 && (
              <div className="p-6 pb-safe border-t border-surface-light bg-surface flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Emolumentos:</span>
                  <span className="font-mono text-2xl text-mint font-black">{getCartTotal().toLocaleString('pt-MZ')} MZN</span>
                </div>
                <button
                  onClick={handleOpenCheckout}
                  className="w-full bg-mint hover:bg-white text-charcoal font-black py-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
                >
                  Proceder para Pagamento <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ================= CHECKOUT DRAWER / MODAL ================= */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[99999] bg-charcoal/85 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-charcoal border-l border-surface-light h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-surface-light flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-mint" /> Finalizar Liquidação
              </h2>
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                disabled={isPaying}
                className="text-gray-400 hover:text-white p-2 rounded-lg bg-surface hover:bg-surface-light transition-all disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Checkout Flow Container */}
            <div className="flex-1 overflow-y-auto p-6 pb-safe flex flex-col">
              
              {errorMessage && (
                <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* STEP 1: BILLING DETAILS FORM */}
              {checkoutStep === 1 && (
                <form onSubmit={handleSubmitCheckoutForm} className="flex flex-col gap-5 flex-1">
                  
                  {/* Name field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nome do Cidadão</label>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-mint transition-colors"
                      placeholder="NOME COMPLETO"
                    />
                  </div>

                  {/* NUIT field */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">NUIT (9 dígitos)</label>
                    <input 
                      type="text"
                      required
                      maxLength="9"
                      pattern="\d*"
                      value={nuit}
                      onChange={(e) => setNuit(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-mint transition-colors font-mono"
                      placeholder="Ex: 102948201"
                    />
                  </div>

                  {/* Payment Methods selector */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Método de Liquidação</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("mpesa")}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          paymentMethod === "mpesa" 
                            ? "bg-red-600/10 border-red-600 text-red-400 font-extrabold" 
                            : "bg-surface border-surface-light text-gray-400 hover:text-white"
                        }`}
                      >
                        M-Pesa <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("emola")}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          paymentMethod === "emola" 
                            ? "bg-yellow-600/10 border-yellow-600 text-yellow-400 font-extrabold" 
                            : "bg-surface border-surface-light text-gray-400 hover:text-white"
                        }`}
                      >
                        e-Mola <span className="w-2 h-2 rounded-full bg-yellow-600"></span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("mkesh")}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          paymentMethod === "mkesh" 
                            ? "bg-orange-600/10 border-orange-600 text-orange-400 font-extrabold" 
                            : "bg-surface border-surface-light text-gray-400 hover:text-white"
                        }`}
                      >
                        mKesh <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("reference")}
                        className={`p-3.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${
                          paymentMethod === "reference" 
                            ? "bg-blue-600/10 border-blue-600 text-blue-400 font-extrabold" 
                            : "bg-surface border-surface-light text-gray-400 hover:text-white"
                        }`}
                      >
                        Ref. Bancária <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      </button>
                    </div>
                  </div>

                  {/* Phone field (conditionally displayed for mobile wallets) */}
                  {(paymentMethod === "mpesa" || paymentMethod === "emola" || paymentMethod === "mkesh") && (
                    <div className="flex flex-col gap-1.5 animate-in fade-in duration-200">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        Número de Telemóvel (+258)
                      </label>
                      <input 
                        type="tel"
                        required
                        pattern="8[2-7]\d{7}"
                        maxLength="9"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-mint transition-colors font-mono"
                        placeholder="Ex: 841234567"
                      />
                      <span className="text-[10px] text-gray-500">Deve começar por 82, 83, 84, 85, 86 ou 87.</span>
                    </div>
                  )}

                  {/* Reference guide message */}
                  {paymentMethod === "reference" && (
                    <div className="bg-surface-light p-4 rounded-xl border border-surface-light text-xs text-gray-400 leading-relaxed animate-in fade-in duration-200">
                      Será gerada uma Entidade e Referência de pagamento. Poderá liquidar este valor em qualquer ATM da rede SIMO ou via Mobile Banking.
                    </div>
                  )}

                  {/* Cart review list */}
                  <div className="mt-auto border-t border-surface-light/40 pt-4 flex flex-col gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Serviços Selecionados:</span>
                    <div className="max-h-[140px] overflow-y-auto flex flex-col gap-1.5">
                      {cart.map(i => (
                        <div key={i.id} className="flex justify-between items-center text-xs text-gray-300 bg-surface/50 p-2 rounded border border-surface-light/30">
                          <span>{i.name} <strong className="text-gray-500">x{i.qty}</strong></span>
                          <span className="font-mono text-white">{(i.price * i.qty).toLocaleString('pt-MZ')} MZN</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-mint hover:bg-white text-charcoal font-black py-4 rounded-xl text-center transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
                  >
                    Confirmar e Pagar <DollarSign className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: MOBILE WALLET PIN PROMPT SIMULATION */}
              {checkoutStep === 2 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-10 animate-in fade-in duration-300">
                  <div className="relative">
                    {/* Ring spinner */}
                    <div className="w-20 h-20 rounded-full border-4 border-surface-light border-t-mint animate-spin"></div>
                    <Smartphone className="w-8 h-8 text-mint absolute inset-0 m-auto animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-2 max-w-[280px]">
                    <h3 className="text-lg font-black text-white">Pedido de PIN Enviado</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Enviámos um pedido de confirmação para o telemóvel <strong className="text-white font-mono">+258 {phone}</strong> via <span className="uppercase text-mint font-semibold">{paymentMethod}</span>.
                    </p>
                    <p className="text-xs text-gray-500 animate-pulse mt-4">
                      Por favor, introduza o seu PIN no seu telemóvel para autorizar a liquidação de {getCartTotal().toLocaleString('pt-MZ')} MZN...
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: SUCCESS PAYMENT RECEIPT DISPLAY */}
              {checkoutStep === 3 && checkoutResult && (
                <div className="flex-1 flex flex-col gap-6 animate-in zoom-in-95 duration-300">
                  <div className="text-center py-6 flex flex-col items-center gap-2.5">
                    <div className="w-16 h-16 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center text-mint mb-2 shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight">Pagamento Concluído</h3>
                    <p className="text-xs text-gray-400 max-w-[280px] leading-relaxed">
                      A sua taxa foi liquidada e o recibo de pagamento foi enviado para o e-mail: <br />
                      <strong className="text-white font-semibold">{email}</strong>
                    </p>
                  </div>

                  {/* Digital Receipt Specs Card */}
                  <div className="bg-surface rounded-2xl border border-surface-light p-5 flex flex-col gap-3.5">
                    <div className="flex justify-between items-center text-xs text-gray-500 font-bold border-b border-surface-light pb-2 uppercase tracking-wider">
                      <span>Fatura Recibo Simplificada</span>
                      <span className="text-mint flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Pago</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Referência de Liquidação</span>
                      <strong className="font-mono text-white text-sm">{checkoutResult.refNumber}</strong>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Data de Emissão</span>
                      <span className="text-white font-medium">{checkoutResult.date}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Método de Liquidação</span>
                      <span className="text-white font-medium uppercase">{paymentMethod}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Nome do Contribuinte</span>
                      <span className="text-white font-medium">{fullName}</span>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400">
                      <span>NUIT</span>
                      <span className="text-white font-medium font-mono">{nuit}</span>
                    </div>

                    <div className="border-t border-dashed border-surface-light pt-3 flex justify-between items-end">
                      <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Liquidado:</span>
                      <span className="font-mono text-lg text-mint font-black">
                        {(checkoutResult.totalAmount || 0).toLocaleString('pt-MZ')} MZN
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-full bg-surface-light hover:bg-white hover:text-charcoal text-white font-bold py-3.5 rounded-xl transition-all text-center mt-auto"
                  >
                    Voltar ao Portal
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
