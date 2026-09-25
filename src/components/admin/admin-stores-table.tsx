"use client";

import React, { useState } from "react";
import { updateStoreStatusAction } from "@/actions/admin.actions";
import { type AdminStoreItem } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Ban, MapPin, CreditCard, ExternalLink } from "lucide-react";
import Link from "next/link";

export function AdminStoresTable({ initialStores }: { initialStores: AdminStoreItem[] }) {
  const [stores, setStores] = useState(initialStores);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (storeId: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    setLoadingId(storeId);
    try {
      await updateStoreStatusAction(storeId, status);
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, status } : s))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: AdminStoreItem["status"]) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-emerald-600 text-white font-bold text-xs">Ativa / Aprovada</Badge>;
      case "PENDING":
        return <Badge className="bg-amber-500 text-white font-bold text-xs">Aguardando Aprovação</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-600 text-white font-bold text-xs">Recusada</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-slate-700 text-white font-bold text-xs">Suspensa</Badge>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b bg-slate-50/70 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-base text-slate-900">Lojistas e Fabricantes do Brás</h2>
          <p className="text-xs text-slate-500">
            Validação de dados cadastrais, localização física e chave Pix para liberação de vendas
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {stores.length} lojas registradas
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 text-slate-700 font-semibold border-b">
            <tr>
              <th className="p-3">Loja / Confecção</th>
              <th className="p-3">Localização no Brás</th>
              <th className="p-3">Dados Bancários / Pix</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Data</th>
              <th className="p-3 text-right">Ações de Moderação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {stores.map((store) => (
              <tr key={store.id} className="hover:bg-slate-50/80 transition-colors">
                {/* Nome e Documento */}
                <td className="p-3">
                  <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    {store.name}
                    <Link
                      href={`/loja/${store.slug}`}
                      target="_blank"
                      className="text-slate-400 hover:text-emerald-600"
                      title="Ver vitrine pública"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    CNPJ: {store.cnpj || "Pessoa Física / MEI"} • Zap: {store.whatsappNumber}
                  </div>
                </td>

                {/* Localização */}
                <td className="p-3">
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate max-w-xs">{store.physicalLocation || "Polo Brás"}</span>
                  </div>
                </td>

                {/* Dados Bancários */}
                <td className="p-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-slate-800 font-semibold">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      {store.bankName || "Banco não inf."}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Pix ({store.pixKeyType}): {store.pixKey}
                    </p>
                  </div>
                </td>

                {/* Status */}
                <td className="p-3 text-center">
                  {getStatusBadge(store.status)}
                </td>

                {/* Data */}
                <td className="p-3 text-center text-slate-500 font-mono text-[11px]">
                  {store.createdAt}
                </td>

                {/* Ações */}
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {store.status !== "APPROVED" && (
                      <Button
                        size="sm"
                        disabled={loadingId === store.id}
                        onClick={() => handleUpdateStatus(store.id, "APPROVED")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-2.5 font-bold cursor-pointer"
                        title="Aprovar Lojista"
                      >
                        <Check className="w-3.5 h-3.5 mr-1" /> Aprovar
                      </Button>
                    )}

                    {store.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={loadingId === store.id}
                        onClick={() => handleUpdateStatus(store.id, "REJECTED")}
                        className="text-xs h-8 px-2.5 font-bold cursor-pointer"
                        title="Recusar Cadastro"
                      >
                        <X className="w-3.5 h-3.5 mr-1" /> Recusar
                      </Button>
                    )}

                    {store.status === "APPROVED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={loadingId === store.id}
                        onClick={() => handleUpdateStatus(store.id, "SUSPENDED")}
                        className="text-xs h-8 px-2 text-slate-600 hover:text-red-700 cursor-pointer"
                        title="Suspender Temporariamente"
                      >
                        <Ban className="w-3.5 h-3.5 mr-1" /> Suspender
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
