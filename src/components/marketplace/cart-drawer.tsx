"use client";

import React, { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Store,
  Sparkles,
  ArrowRight,
  TrendingDown,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, getStoreGroups, getTotalPrice, getTotalItems } =
    useCartStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !isOpen) return null;

  const storeGroups = getStoreGroups();
  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base text-slate-900">
                Minha Sacola ({totalItems} {totalItems === 1 ? "peça" : "peças"})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo da Sacola */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-bold text-slate-700">Sua sacola está vazia</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Navegue pelo catálogo do Brás e adicione peças para aproveitar preços direto da fábrica.
                </p>
                <Button
                  variant="bras"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="mt-2"
                >
                  Explorar Catálogo
                </Button>
              </div>
            ) : (
              storeGroups.map((group) => (
                <div
                  key={group.storeId}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs"
                >
                  {/* Cabeçalho da Loja */}
                  <div className="bg-slate-50 p-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-800">
                        {group.storeName}
                      </span>
                    </div>
                    <Badge
                      variant={group.isWholesaleActive ? "bras" : "secondary"}
                      className="text-[10px]"
                    >
                      {group.totalQuantity}/{group.minWholesaleQty} peças
                    </Badge>
                  </div>

                  {/* Banner de Incentivo de Atacado da Loja */}
                  <div className="p-2.5 px-3 bg-emerald-50/50 border-b text-[11px]">
                    {group.isWholesaleActive ? (
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Preço de Atacado Ativado! Você economizou {formatCurrency(group.potentialSavings)}.
                        </span>
                      </div>
                    ) : (
                      <div className="text-slate-600">
                        <span className="font-bold text-emerald-700">
                          Faltam apenas {group.piecesRemainingForWholesale}{" "}
                          {group.piecesRemainingForWholesale === 1 ? "peça" : "peças"}
                        </span>{" "}
                        desta loja para liberar o atacado e economizar até{" "}
                        <strong className="text-emerald-700 font-bold">
                          {formatCurrency(group.potentialSavings)}
                        </strong>
                        !
                      </div>
                    )}
                  </div>

                  {/* Lista de Peças da Loja */}
                  <div className="divide-y divide-slate-100 p-2">
                    {group.items.map((item) => {
                      const unitPrice = group.isWholesaleActive ? item.wholesalePrice : item.retailPrice;

                      return (
                        <div key={item.id} className="py-2.5 flex gap-3">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-14 h-16 object-cover rounded-md bg-slate-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-slate-800 truncate leading-tight">
                              {item.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[11px] text-slate-500">
                                Tam: <strong>{item.size}</strong>
                              </span>
                              <span className="text-[11px] text-slate-500">•</span>
                              <span className="text-[11px] text-slate-500">
                                Cor: <strong>{item.color}</strong>
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-emerald-700">
                                  {formatCurrency(unitPrice)}
                                </span>
                                {group.isWholesaleActive && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    {formatCurrency(item.retailPrice)}
                                  </span>
                                )}
                              </div>

                              {/* Controle de Quantidade */}
                              <div className="flex items-center border rounded-md h-7">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="px-2 h-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-xs font-bold text-slate-800">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="px-2 h-full text-slate-500 hover:bg-slate-100 flex items-center justify-center"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Subtotal da Loja */}
                  <div className="p-2.5 px-3 bg-slate-50 border-t flex justify-between items-center text-xs">
                    <span className="text-slate-500">Subtotal da Loja:</span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(group.subtotal)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com Totalizador e Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t bg-slate-50 space-y-3">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-600">Total Geral:</span>
                <span className="text-2xl font-black text-emerald-700">
                  {formatCurrency(totalPrice)}
                </span>
              </div>

              <Link href="/checkout" onClick={() => setIsOpen(false)} className="block">
                <Button className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-2">
                  Finalizar Pedido com Split Pix
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <p className="text-center text-[10px] text-slate-400">
                🔒 Pagamento processado com segurança via Mercado Pago Split
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
