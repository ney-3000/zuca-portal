"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShieldCheck, Printer, ArrowLeft, FileText, Smartphone, CreditCard } from "lucide-react";
import Link from "next/link";

export default function PedidoSucessoPage() {
  const router = useRouter();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("zuca_last_checkout");
        if (stored) {
          setCheckoutData(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to parse checkout details from storage:", err);
      }
      setLoading(false);
    }
  }, []);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-charcoal text-gray-200">
        <div className="w-10 h-10 border-4 border-surface-light border-t-mint rounded-full animate-spin"></div>
        <span className="text-sm mt-4 text-gray-400">A processar o seu recibo...</span>
      </div>
    );
  }

  if (!checkoutData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-charcoal text-gray-200 px-4 text-center">
        <div className="w-16 h-16 bg-surface border border-surface-light rounded-full flex items-center justify-center mb-6">
          <FileText className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Nenhum recibo encontrado</h2>
        <p className="text-sm text-gray-400 mb-8 max-w-sm">
          Não foi possível localizar os dados do seu último pagamento. Por favor, volte ao painel principal.
        </p>
        <Link 
          href="/area-reservada/cliente"
          className="bg-mint text-charcoal hover:bg-white px-6 py-3.5 rounded-xl font-bold transition-all text-sm"
        >
          Ir para o Portal do Cidadão
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center min-h-[85vh] text-gray-200 print:bg-white print:text-black">
      
      {/* Receipt Card Container */}
      <div className="w-full max-w-2xl bg-surface rounded-3xl border border-surface-light p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col gap-8 print:border-none print:shadow-none print:bg-white print:p-0">
        
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-mint/5 rounded-full blur-[60px] pointer-events-none print:hidden"></div>

        {/* Success Stamp Banner */}
        <div className="text-center flex flex-col items-center gap-3 border-b border-surface-light/40 pb-8 print:border-b-2 print:border-black">
          <div className="w-20 h-20 rounded-full bg-mint/10 border border-mint/20 flex items-center justify-center text-mint shadow-[0_0_20px_rgba(0,255,136,0.15)] animate-bounce print:hidden">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          
          <h1 className="text-3xl font-black text-white leading-tight tracking-tight print:text-black print:text-2xl mt-2">
            Pagamento Confirmado
          </h1>
          <p className="text-xs text-gray-400 max-w-[340px] leading-relaxed print:text-black">
            A sua taxa pública foi liquidada com sucesso eletronicamente e o recibo de pagamento foi enviado por email.
          </p>

          <div className="inline-flex items-center gap-1.5 text-xs text-mint bg-mint/10 border border-mint/20 px-4 py-1.5 rounded-full font-bold uppercase tracking-wider mt-2 print:text-black print:border-black">
            <ShieldCheck className="w-4 h-4" /> Autenticado Digitalmente
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm border-b border-surface-light/40 pb-8 print:border-b-2 print:border-black print:text-black">
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest print:text-black">Dados de Faturação</h3>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-white text-base print:text-black">{checkoutData.fullName}</span>
              <span className="text-gray-400 print:text-black">NUIT: <strong className="font-mono text-white print:text-black">{checkoutData.nuit}</strong></span>
              <span className="text-gray-400 print:text-black">Telemóvel: {checkoutData.phone || "N/A"}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:border-l md:border-surface-light/40 md:pl-6 print:border-black">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest print:text-black">Detalhes do Recibo</h3>
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400 print:text-black">Referência: <strong className="font-mono text-mint font-bold text-base print:text-black">{checkoutData.refNumber}</strong></span>
              <span className="text-gray-400 print:text-black">Data de Emissão: <span className="text-white font-medium print:text-black">{checkoutData.date}</span></span>
              <span className="text-gray-400 print:text-black">Método de Liquidação: <strong className="text-white uppercase print:text-black">{checkoutData.paymentMethod}</strong></span>
            </div>
          </div>
        </div>

        {/* Item List Table */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest print:text-black">Especificação das Taxas</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm print:text-black">
              <thead>
                <tr className="border-b border-surface-light text-xs text-gray-400 font-bold uppercase tracking-wider print:border-b-2 print:border-black print:text-black">
                  <th className="py-3 pr-4">Descrição do Serviço</th>
                  <th className="py-3 px-4 text-center w-16">Qtd</th>
                  <th className="py-3 px-4 text-right w-32">Preço Unit.</th>
                  <th className="py-3 pl-4 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-light/30">
                {checkoutData.items.map((item, idx) => (
                  <tr key={idx} className="print:border-b print:border-gray-200">
                    <td className="py-3.5 pr-4 text-white font-medium print:text-black">{item.name}</td>
                    <td className="py-3.5 px-4 text-center text-gray-400 font-mono print:text-black">{item.qty}</td>
                    <td className="py-3.5 px-4 text-right text-mint font-mono print:text-black">{item.price.toLocaleString("pt-MZ")} MZN</td>
                    <td className="py-3.5 pl-4 text-right text-mint font-mono font-bold print:text-black">{(item.price * item.qty).toLocaleString("pt-MZ")} MZN</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="2" className="py-5"></td>
                  <td className="py-5 px-4 text-right font-bold text-gray-400 uppercase text-xs print:text-black">Total Pago:</td>
                  <td className="py-5 pl-4 text-right font-black text-mint text-xl font-mono print:text-black">${checkoutData.totalAmount.toLocaleString("pt-MZ")} MZN</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Verification Footer Note */}
        <div className="bg-surface-light border border-dashed border-surface-light/80 p-5 rounded-2xl text-xs text-gray-400 leading-relaxed text-center print:bg-white print:border-black print:text-black">
          Este documento constitui uma fatura-recibo simplificada emitida de acordo com os regulamentos digitais do Ministério da Economia e Finanças da República de Moçambique. O pagamento foi validado eletronicamente e dispensa assinatura manual.
        </div>

        {/* Buttons Panel */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4 print:hidden">
          <Link 
            href="/area-reservada/cliente"
            className="flex-1 bg-surface-light hover:bg-white hover:text-charcoal border border-surface-light hover:border-white text-white font-bold py-4 rounded-xl transition-all text-center flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" /> Voltar ao Portal
          </Link>

          <button
            onClick={handlePrint}
            className="flex-1 bg-mint hover:bg-white text-charcoal font-black py-4 rounded-xl transition-all text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,136,0.15)]"
          >
            <Printer className="w-5 h-5" /> Imprimir Recibo
          </button>
        </div>

      </div>

    </div>
  );
}
