import { SellerRegisterForm } from "@/components/forms/seller-register-form";
import { Badge } from "@/components/ui/badge";
import { Store, ShieldCheck, Zap, Truck, Users } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cadastre sua Loja no Brás | Marketplace Atacado & Varejo",
  description: "Seja um lojista parceiro e venda suas confecções para sacoleiras e lojistas de todo o Brasil com Split Pix garantido.",
};

export default function RegistroVendedorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/50 via-white to-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Cabeçalho de Navegação Simples */}
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-emerald-700 font-black text-xl tracking-tight">
          <Store className="w-6 h-6 text-emerald-600" />
          <span>BRÁS<span className="text-slate-900">MARKET</span></span>
        </Link>
        <Link
          href="/login"
          className="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-lg transition-colors"
        >
          Já sou Lojista
        </Link>
      </div>

      {/* Hero do Cadastro de Lojistas */}
      <div className="max-w-3xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-3">
          <Badge variant="bras" className="px-3 py-1 text-xs">
            Exclusivo para Fabricantes & Lojistas do Brás
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
          Venda suas peças de confecção para todo o Brasil
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          Tenha seu catálogo online dedicado, receba pagamentos por Pix com Split automático e envie por ônibus de excursão ou transportadora.
        </p>

        {/* Pilares de Valor */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 text-left">
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-amber-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Repasse Pix Rápido</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Zero Inadimplência</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">Envio por Excursão</span>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-2.5">
            <Users className="w-5 h-5 text-purple-600 shrink-0" />
            <span className="text-xs font-semibold text-slate-700">+100k Sacoleiras</span>
          </div>
        </div>
      </div>

      {/* Formulário Principal */}
      <div className="max-w-3xl mx-auto">
        <SellerRegisterForm />
      </div>

      {/* Rodapé institucional sutil */}
      <footer className="max-w-3xl mx-auto mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>© 2026 Marketplace Brás & Feira da Madrugada. Todos os direitos reservados.</p>
        <p className="mt-1">
          Polo Comercial do Brás, Pari e Feira da Madrugada • São Paulo - SP
        </p>
      </footer>
    </div>
  );
}
