import Link from "next/link";
import { Store, Package, Plus, ShoppingCart, BarChart3, Settings, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VendorLogoutButton } from "@/components/vendor/vendor-logout-button";

export default function PainelVendedorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topbar do Painel do Vendedor */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-800 transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-emerald-700 font-black text-lg">
              <Store className="w-5 h-5 text-emerald-600" />
              <span>PAINEL DO LOJISTA</span>
            </div>
            <Badge variant="bras" className="hidden sm:inline-flex text-[11px]">
              Brás & Feira da Madrugada
            </Badge>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/painel-vendedor/produtos/novo"
              className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </Link>
            <VendorLogoutButton />
          </div>
        </div>
      </header>

      {/* Submenu de Navegação Rápida */}
      <div className="bg-white border-b px-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex gap-6 text-xs font-medium text-slate-600 py-3 whitespace-nowrap">
          <Link href="/painel-vendedor/produtos" className="text-emerald-700 font-bold border-b-2 border-emerald-600 pb-2">
            Meus Produtos & Grade
          </Link>
          <Link href="/painel-vendedor/pedidos" className="hover:text-slate-900 pb-2">
            Pedidos & Despacho
          </Link>
          <Link href="/painel-vendedor/loja" className="hover:text-slate-900 pb-2">
            Personalizar Loja / Box
          </Link>
          <Link href="/catalogo" className="hover:text-slate-900 pb-2 text-slate-400">
            Ver Catálogo Público ↗
          </Link>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
