"use client";

import React from "react";
import { Store, MapPin, MessageCircle, ShieldCheck, Star, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type StorefrontHeaderProps = {
  storeInfo: {
    name: string;
    slug: string;
    location: string;
    description: string;
    whatsapp: string;
    rating: number;
    ordersCompleted: number;
    bannerUrl: string;
  };
};

export function StorefrontHeader({ storeInfo }: StorefrontHeaderProps) {
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link da loja copiado para a área de transferência!");
    }
  };

  return (
    <>
      {/* BANNER DA LOJA */}
      <div className="relative h-48 sm:h-64 bg-slate-800 overflow-hidden">
        <img
          src={storeInfo.bannerUrl}
          alt={`Banner ${storeInfo.name}`}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* CARD DE PERFIL DA LOJA */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shrink-0">
              <Store className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {storeInfo.name}
                </h1>
                <Badge variant="bras" className="text-[11px] gap-1 flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Fabricante Homologado
                </Badge>
              </div>

              <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                {storeInfo.location}
              </p>

              <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1 font-bold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  {storeInfo.rating} (Avaliação máxima)
                </span>
                <span>•</span>
                <span>{storeInfo.ordersCompleted}+ pedidos entregues</span>
              </div>
            </div>
          </div>

          {/* Ações de Contato & Redes */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0">
            <a
              href={`https://wa.me/${storeInfo.whatsapp}?text=Olá,%20vi%20sua%20loja%20no%20Marketplace%20do%20Brás%20e%20gostaria%20de%20mais%20informações`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-4 flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp do Lojista
              </Button>
            </a>

            <Button
              variant="outline"
              size="sm"
              className="h-10 px-3 text-xs font-semibold cursor-pointer"
              onClick={handleCopyLink}
            >
              <Share2 className="w-4 h-4 mr-1 text-slate-500" />
              Copiar Link
            </Button>
          </div>
        </div>

        {/* Sobre a Loja */}
        {storeInfo.description && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 mt-4 text-xs text-slate-600 leading-relaxed shadow-2xs">
            <strong className="text-slate-800 font-bold block mb-1">Sobre esta confecção:</strong>
            {storeInfo.description}
          </div>
        )}
      </div>
    </>
  );
}
