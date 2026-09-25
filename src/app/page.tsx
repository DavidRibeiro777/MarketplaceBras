import Link from "next/link";
import { ShieldCheck, Zap, Truck } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ProductFeed } from "@/components/marketplace/product-feed";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header com Sacola Interativa */}
      <Header />

      {/* Hero Principal Compacto & Mobile-First */}
      <div className="bg-gradient-to-b from-emerald-900 via-emerald-800 to-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs px-3 py-1 rounded-full font-bold">
              🛍️ Direto dos Fabricantes do Brás & Feira da Madrugada
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-3xl mx-auto">
            Compre Roupas no Atacado e Varejo Sem Sair de Casa
          </h1>

          <p className="mt-3 text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed opacity-90">
            Conexão direta com lojas dos shoppings Vautier, Pagé, Azulão e Pari. Preço de fábrica para sacoleiras com envio garantido por excursão ou transportadora.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-emerald-200">
            <span className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-amber-400" /> Pagamento Pix com Split Seguro
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Vendedores Homologados
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-4 h-4 text-blue-400" /> Despacho no Polo do Brás
            </span>
          </div>
        </div>
      </div>

      {/* Vitrine e Catálogo Dinâmico */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductFeed />
      </main>

      {/* Rodapé institucional */}
      <footer className="bg-white border-t py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-bold text-slate-700">BRÁS MARKETPLACE • Polo de Moda Atacadista de São Paulo</p>
          <p>Shopping Vautier, Galeria Pagé Brás, Feira da Madrugada, Rua Miller e Região do Pari.</p>
        </div>
      </footer>
    </div>
  );
}
