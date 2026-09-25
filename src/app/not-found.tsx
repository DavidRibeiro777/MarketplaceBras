import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl">
          404
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Página Não Encontrada
        </h2>
        <p className="text-sm text-slate-600 mb-6">
          A página ou loja que você está procurando não existe ou mudou de endereço.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Catálogo do Brás
        </Link>
      </div>
    </div>
  );
}
