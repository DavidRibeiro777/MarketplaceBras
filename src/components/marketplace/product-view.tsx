"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Store,
  MapPin,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Zap,
  TrendingDown,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export type ProductDetailProps = {
  product: {
    id: string;
    title: string;
    slug: string;
    description?: string;
    storeName: string;
    storeSlug: string;
    storeLocation?: string;
    retailPrice: number;
    wholesalePrice: number;
    minWholesaleQty: number;
    categoryName: string;
    images: { url: string; isMain?: boolean }[];
    variations: {
      id: string;
      size: string;
      color: string;
      stock: number;
      sku: string;
    }[];
  };
};

export function ProductView({ product }: ProductDetailProps) {
  const { addItem } = useCartStore();

  const [selectedImage, setSelectedImage] = useState(
    product.images[0]?.url ||
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800"
  );

  // Lista de cores únicas
  const uniqueColors = Array.from(new Set(product.variations.map((v) => v.color)));
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || "");

  // Variações filtradas pela cor selecionada
  const availableVariationsForColor = product.variations.filter(
    (v) => v.color === selectedColor
  );

  // Tamanhos disponíveis para a cor selecionada
  const [selectedSize, setSelectedSize] = useState(
    availableVariationsForColor[0]?.size || ""
  );

  // Variação ativa
  const activeVariation = product.variations.find(
    (v) => v.color === selectedColor && v.size === selectedSize
  );

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Cálculo de desconto percentual
  const discount = Math.round(
    ((product.retailPrice - product.wholesalePrice) / product.retailPrice) * 100
  );

  const handleAddToCart = () => {
    if (!activeVariation) return;

    addItem({
      productId: product.id,
      title: product.title,
      slug: product.slug,
      image: selectedImage,
      storeId: product.storeSlug, // identificador da loja
      storeName: product.storeName,
      storeSlug: product.storeSlug,
      variationId: activeVariation.id,
      size: activeVariation.size,
      color: activeVariation.color,
      sku: activeVariation.sku,
      quantity,
      stock: activeVariation.stock,
      retailPrice: product.retailPrice,
      wholesalePrice: product.wholesalePrice,
      minWholesaleQty: product.minWholesaleQty,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleAddWholesalePack = () => {
    setQuantity(product.minWholesaleQty);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* 1. GALERIA DE FOTOS (ESQUERDA) */}
      <div className="lg:col-span-7 space-y-4">
        {/* Foto Principal com Zoom suave */}
        <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
          <img
            src={selectedImage}
            alt={product.title}
            className="w-full h-full object-cover"
          />

          {discount > 0 && (
            <Badge className="absolute top-4 left-4 bg-emerald-600 text-white font-black text-xs px-3 py-1 shadow-md">
              {discount}% OFF NO ATACADO
            </Badge>
          )}

          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-xs text-white p-2.5 rounded-xl text-xs flex items-center justify-between">
            <span className="font-semibold">{product.categoryName}</span>
            <span className="text-emerald-300 font-bold">
              Mín. {product.minWholesaleQty} peças para atacado
            </span>
          </div>
        </div>

        {/* Miniaturas de Fotos */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img.url)}
                className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === img.url
                    ? "border-emerald-600 shadow-md ring-2 ring-emerald-600/30"
                    : "border-slate-200 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. DADOS DO PRODUTO & SELETOR DE COMPRA (DIREITA) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Bloco da Loja / Fabricante */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Fabricante do Brás:</p>
              <h4 className="font-bold text-sm text-slate-900 leading-tight">
                {product.storeName}
              </h4>
              {product.storeLocation && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  {product.storeLocation}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/loja/${product.storeSlug}`}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Ver Loja ↗
          </Link>
        </div>

        {/* Título */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
            {product.title}
          </h1>
        </div>

        {/* Bloco de Preços B2B / B2C */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-200 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-emerald-700 block uppercase tracking-wide">
                Preço de Atacado (Sacoleiras)
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-emerald-700">
                  {formatCurrency(product.wholesalePrice)}
                </span>
                <span className="text-xs text-slate-500 font-medium">/ peça</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Preço no Varejo:</span>
              <span className="text-lg font-bold text-slate-600 line-through">
                {formatCurrency(product.retailPrice)}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs text-emerald-800">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Preço de atacado liberado com {product.minWholesaleQty}+ peças
            </span>
            <button
              type="button"
              onClick={handleAddWholesalePack}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Comprar Atacado ({product.minWholesaleQty} peças)
            </button>
          </div>
        </div>

        {/* SELETOR DE GRADE: CORES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Cor Escolhida:</span>
            <span className="text-emerald-700 font-semibold">{selectedColor}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {uniqueColors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setSelectedColor(color);
                    const sizes = product.variations.filter((v) => v.color === color);
                    if (sizes.length > 0) setSelectedSize(sizes[0].size);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>

        {/* SELETOR DE GRADE: TAMANHOS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Tamanho da Peça:</span>
            {activeVariation && (
              <span className="text-xs text-slate-500">
                Estoque disponível: <strong>{activeVariation.stock} peças</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableVariationsForColor.map((v) => {
              const isSelected = selectedSize === v.size;
              const isOutOfStock = v.stock <= 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedSize(v.size)}
                  className={`min-w-11 h-10 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isOutOfStock
                      ? "opacity-40 line-through bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                      : isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
        </div>

        {/* QUANTIDADE E BOTÃO DE ADICIONAR */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-xl bg-white h-12 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                className="w-12 h-full text-slate-600 hover:bg-slate-100 rounded-l-xl flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-black text-sm text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((prev) =>
                    Math.min(activeVariation?.stock || 99, prev + 1)
                  )
                }
                className="w-12 h-full text-slate-600 hover:bg-slate-100 rounded-r-xl flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!activeVariation || activeVariation.stock <= 0}
              className="flex-1 h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5 text-white" />
                  Peça Adicionada à Sacola!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Adicionar à Sacola
                </>
              )}
            </Button>
          </div>
        </div>

        {/* BENEFÍCIOS DE LOGÍSTICA DO BRÁS */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Despacho em Excursão:</strong> Enviamos direto para o ônibus de sacoleiras nos estacionamentos do Brás e Pari.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Garantia de Confecção:</strong> Lojista verificado e pagamento retido até confirmação do despacho.
            </span>
          </div>
        </div>

        {/* Descrição Completa */}
        {product.description && (
          <div className="border-t pt-4 space-y-2">
            <h3 className="font-bold text-sm text-slate-900">Descrição da Peça</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
