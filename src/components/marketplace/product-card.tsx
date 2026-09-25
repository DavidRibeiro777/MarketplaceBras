"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Store, ShoppingBag } from "lucide-react";
import Link from "next/link";

export type ProductCardProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    storeName: string;
    storeSlug: string;
    storeLocation?: string;
    retailPrice: number;
    wholesalePrice: number;
    minWholesaleQty: number;
    categoryName: string;
    images: { url: string; isMain?: boolean }[];
    variations: { id: string; size: string; color: string; stock: number }[];
  };
  isWholesaleMode?: boolean;
};

export function ProductCard({ product, isWholesaleMode = true }: ProductCardProps) {
  const mainImage =
    product.images.find((img) => img.isMain)?.url ||
    product.images[0]?.url ||
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800";

  // Obter tamanhos únicos da grade
  const uniqueSizes = Array.from(new Set(product.variations.map((v) => v.size)));

  // Desconto no atacado
  const discount = Math.round(
    ((product.retailPrice - product.wholesalePrice) / product.retailPrice) * 100
  );

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      {/* Imagem do Produto com Link */}
      <Link href={`/produto/${product.slug}`} className="relative aspect-[4/5] bg-slate-100 overflow-hidden block">
        <img
          src={mainImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badge de Atacado no topo da foto */}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-emerald-600 text-white font-black text-[11px] px-2 py-0.5 shadow-sm">
            {discount}% OFF NO ATACADO
          </Badge>
        )}

        {/* Categoria */}
        <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded backdrop-blur-xs">
          {product.categoryName}
        </span>
      </Link>

      {/* Conteúdo Informativo */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Loja / Box no Brás */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mb-1">
            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <Link
              href={`/loja/${product.storeSlug}`}
              className="truncate font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
            >
              {product.storeName}
            </Link>
          </div>

          {/* Título do Produto com Link */}
          <Link href={`/produto/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Grade de Tamanhos Disponíveis */}
          <div className="flex items-center gap-1 flex-wrap mt-2">
            <span className="text-[10px] text-slate-400 font-medium">Grade:</span>
            {uniqueSizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200"
              >
                {size}
              </span>
            ))}
            {uniqueSizes.length > 5 && (
              <span className="text-[10px] text-slate-400">+{uniqueSizes.length - 5}</span>
            )}
          </div>
        </div>

        {/* Bloco de Preço: Destaque Inteligente */}
        <div className="pt-2 border-t border-slate-100">
          {isWholesaleMode ? (
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base sm:text-xl font-black text-emerald-700">
                  {formatCurrency(product.wholesalePrice)}
                </span>
                <span className="text-[11px] text-slate-400 line-through">
                  {formatCurrency(product.retailPrice)}
                </span>
              </div>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">
                Preço de Atacado (Mín. {product.minWholesaleQty} peças)
              </p>
            </div>
          ) : (
            <div>
              <span className="text-base sm:text-xl font-black text-slate-900">
                {formatCurrency(product.retailPrice)}
              </span>
              <p className="text-[10px] text-slate-500">
                Preço no Varejo (1 unidade)
              </p>
            </div>
          )}

          {/* Botão de Compra / Ver Grade */}
          <Link href={`/produto/${product.slug}`} className="block mt-3">
            <Button
              size="sm"
              className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs h-9 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Ver Grade & Comprar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
