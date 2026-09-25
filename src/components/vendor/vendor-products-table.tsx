"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Plus, Eye, Edit3, Pause, Play, AlertTriangle, Layers } from "lucide-react";
import Link from "next/link";
import { toggleProductStatusAction } from "@/actions/product.actions";

export type VendorProductItem = {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  retailPrice: number;
  wholesalePrice: number;
  minWholesaleQty: number;
  image: string;
  status: "ACTIVE" | "INACTIVE";
  totalStock: number;
  variationsCount: number;
  variations: { size: string; color: string; stock: number }[];
};

export function VendorProductsTable({ initialProducts }: { initialProducts: VendorProductItem[] }) {
  const [products, setProducts] = useState(initialProducts);

  const handleToggleStatus = async (productId: string, currentStatus: "ACTIVE" | "INACTIVE") => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    await toggleProductStatusAction(productId, nextStatus);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, status: nextStatus } : p))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Catálogo e Controle de Grade</h2>
          <p className="text-xs text-slate-500">
            Gerencie seus modelos, estoque por tamanho/cor e regras de preço de atacado
          </p>
        </div>

        <Link href="/painel-vendedor/produtos/novo">
          <Button variant="bras" size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" /> Cadastrar Nova Peça
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b">
              <tr>
                <th className="p-3 w-16">Foto</th>
                <th className="p-3">Modelo / Confecção</th>
                <th className="p-3">Preço Atacado vs Varejo</th>
                <th className="p-3">Estoque & Grade</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Você ainda não possui peças cadastradas</p>
                      <p className="text-xs text-slate-500 max-w-sm">
                        Cadastre suas primeiras peças de confecção com fotos, tamanhos e preços de atacado para começar a vender.
                      </p>
                      <Link href="/painel-vendedor/produtos/novo">
                        <Button variant="bras" size="sm" className="font-bold gap-1.5 mt-2">
                          <Plus className="w-4 h-4" /> Cadastrar Primeira Peça
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.totalStock < 15;

                  return (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Foto */}
                    <td className="p-3">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="w-12 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                      />
                    </td>

                    {/* Título & Categoria */}
                    <td className="p-3">
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {product.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {product.categoryName} • Ref: {product.slug}
                      </p>
                    </td>

                    {/* Preços */}
                    <td className="p-3">
                      <div className="font-bold text-xs text-emerald-700">
                        {formatCurrency(product.wholesalePrice)}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          (a partir de {product.minWholesaleQty} pçs)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Varejo: {formatCurrency(product.retailPrice)}
                      </div>
                    </td>

                    {/* Grade & Estoque */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className={isLowStock ? "text-amber-600" : "text-slate-800"}>
                          {product.totalStock} peças no total
                        </span>
                        {isLowStock && (
                          <span title="Estoque Baixo">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>{product.variationsCount} variações de grade</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {product.status === "ACTIVE" ? (
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                          À Venda
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-slate-500 font-bold text-[10px]">
                          Pausado
                        </Badge>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/produto/${product.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Ver anúncio na loja"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product.id, product.status)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title={product.status === "ACTIVE" ? "Pausar vendas" : "Ativar vendas"}
                        >
                          {product.status === "ACTIVE" ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
