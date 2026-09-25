"use client";

import React, { useState, useTransition, useEffect } from "react";
import { ProductCard } from "@/components/marketplace/product-card";
import { useDebounce } from "@/hooks/use-debounce";
import { getProductsAction } from "@/actions/product.actions";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Sparkles, RefreshCw } from "lucide-react";

const CATEGORIAS_FILTRO = [
  "Todas",
  "Moda Feminina",
  "Jeans & Sarja",
  "Moda Masculina",
  "Moda Infantil",
  "Plus Size",
  "Lingerie & Pijamas",
];

export function ProductFeed() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [isWholesaleMode, setIsWholesaleMode] = useState(true);
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const results = await getProductsAction({
        search: debouncedSearch,
        category: selectedCategory,
      });
      setProducts(results as typeof MOCK_PRODUCTS);
    });
  }, [debouncedSearch, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* BARRA DE CONTROLE: BUSCA + ALTERNADOR ATACADO/VAREJO */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Campo de Busca com Debounce */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <Input
              placeholder="Buscar vestidos, calças wide leg, linho, cropped..."
              className="pl-9 h-11 bg-slate-50/70 text-sm border-slate-200 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {isPending && (
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600 animate-spin absolute right-3 top-4" />
            )}
          </div>

          {/* Alternador de Preço: Atacado vs Varejo */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200">
            <button
              type="button"
              onClick={() => setIsWholesaleMode(true)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                isWholesaleMode
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏷️ Preços de Atacado (Sacoleiras)
            </button>
            <button
              type="button"
              onClick={() => setIsWholesaleMode(false)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                !isWholesaleMode
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Preços de Varejo
            </button>
          </div>
        </div>

        {/* Pílulas de Categorias com Scroll Horizontal no Mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
          {CATEGORIAS_FILTRO.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* FEED DE PRODUTOS: GRID RESPONSIVO (2 COLUNAS MOBILE, 3-4 DESKTOP) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-900">
              {selectedCategory === "Todas" ? "Lançamentos Direto da Fábrica" : selectedCategory}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {products.length} peças encontradas
            </Badge>
          </div>

          {isWholesaleMode && (
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 hidden sm:inline-block">
              ✓ Economia média de 40% a 60% por peça no atacado
            </span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center space-y-3">
            <p className="text-slate-500 text-sm">Nenhum produto encontrado para o termo buscado.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("Todas");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWholesaleMode={isWholesaleMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
