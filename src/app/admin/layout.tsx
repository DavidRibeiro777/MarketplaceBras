import Link from "next/link";
import { ShieldAlert, Store, Users, ShoppingCart, BarChart3, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Admin */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 font-black text-lg">
              <ShieldAlert className="w-5 h-5 text-emerald-400" />
              <span>PAINEL ADMINISTRATIVO</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px]">
              Dono da Plataforma
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Ver Marketplace ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {children}
      </main>
    </div>
  );
}
