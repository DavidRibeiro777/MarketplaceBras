"use client";

import React, { useState } from "react";
import { type VendorOrderDisplay, updateOrderStatusAction } from "@/actions/order.actions";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  Bus,
  CheckCircle2,
  Clock,
  MessageCircle,
  ArrowRight,
  MapPin,
  DollarSign,
} from "lucide-react";

export function VendorOrdersTable({ initialOrders }: { initialOrders: VendorOrderDisplay[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (orderId: string, status: VendorOrderDisplay["status"]) => {
    setLoadingId(orderId);
    try {
      await updateOrderStatusAction(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } finally {
      setLoadingId(null);
    }
  };

  const getStatusBadge = (status: VendorOrderDisplay["status"]) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-emerald-600 text-white font-bold">Pago via Pix (Separar)</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-600 text-white font-bold">Em Separação no Brás</Badge>;
      case "SHIPPED":
        return <Badge className="bg-purple-600 text-white font-bold">Despachado no Ônibus</Badge>;
      case "DELIVERED":
        return <Badge className="bg-slate-700 text-white font-bold">Entregue</Badge>;
      case "PENDING_PAYMENT":
        return <Badge variant="secondary" className="text-slate-500">Aguardando Pix</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pedidos Recebidos & Despacho</h2>
          <p className="text-xs text-slate-500">
            Acompanhe as compras de sacoleiras e gerencie o envio para os ônibus de caravana ou transportadora
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Nenhum pedido recebido ainda</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Assim que clientes e sacoleiras realizarem compras das suas peças no catálogo ou na sua loja, os pedidos para separação e despacho aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
          const isExcursao = order.shippingType.toLowerCase().includes("ônibus");

          return (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {order.createdAt} • Comprador: <strong>{order.buyerName}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right self-end sm:self-auto">
                  <a
                    href={`https://wa.me/${order.buyerPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Falar no WhatsApp
                    </Button>
                  </a>
                </div>
              </div>

              {/* Informações de Despacho & Itens */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Logística */}
                <div className="p-3 rounded-lg bg-slate-50 border space-y-1">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    {isExcursao ? (
                      <Bus className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Truck className="w-4 h-4 text-blue-600" />
                    )}
                    {order.shippingType}
                  </div>
                  {order.shippingDetails && (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {order.shippingDetails}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Destino: {order.destinationCity}
                  </p>
                </div>

                {/* Peças e Grade */}
                <div className="p-3 rounded-lg bg-slate-50 border space-y-1">
                  <span className="font-bold text-slate-800 block">
                    Peças Solicitadas ({order.itemsCount} itens):
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {order.itemsSummary}
                  </p>
                </div>

                {/* Financeiro Líquido */}
                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 block">
                    Seu Repasse Líquido:
                  </span>
                  <div className="text-lg font-black text-emerald-700">
                    {formatCurrency(order.sellerNetAmount)}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Total Bruto: {formatCurrency(order.totalAmount)} (Comissão de 8.5% já descontada)
                  </p>
                </div>
              </div>

              {/* Ações de Status */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-500 font-medium">
                  Avançar fluxo operacional de despacho:
                </span>

                <div className="flex items-center gap-2">
                  {order.status === "PAID" && (
                    <Button
                      size="sm"
                      disabled={loadingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, "PROCESSING")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 font-bold cursor-pointer"
                    >
                      Iniciar Separação da Grade
                    </Button>
                  )}

                  {order.status === "PROCESSING" && (
                    <Button
                      size="sm"
                      disabled={loadingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 font-bold cursor-pointer"
                    >
                      {isExcursao ? "Confirmar Entrega no Ônibus" : "Marcar como Postado"}
                    </Button>
                  )}

                  {order.status === "SHIPPED" && (
                    <Button
                      size="sm"
                      disabled={loadingId === order.id}
                      onClick={() => handleUpdateStatus(order.id, "DELIVERED")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-bold cursor-pointer"
                    >
                      Finalizar Pedido Entregue
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}
    </div>
  );
}
