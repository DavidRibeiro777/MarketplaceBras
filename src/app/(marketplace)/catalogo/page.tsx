import { ProductFeed } from "@/components/marketplace/product-feed";
import { Header } from "@/components/layout/header";

export const metadata = {
  title: "Catálogo de Produtos | Marketplace Brás & Feira da Madrugada",
  description: "Compre roupas e confecções direto dos fabricantes do Brás com preço de atacado para revenda.",
};

export default function CatalogoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header com Sacola Interativa */}
      <Header />

      {/* Conteúdo Principal do Catálogo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Catálogo Oficial de Confecções do Brás
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Peças direto da confecção dos shoppings Vautier, Galeria Pagé, Rua Miller e Feira da Madrugada.
          </p>
        </div>

        <ProductFeed />
      </main>
    </div>
  );
}
