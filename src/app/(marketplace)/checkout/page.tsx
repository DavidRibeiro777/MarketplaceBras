"use client";

import React, { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { formatCurrency, maskCpf, maskPhone, maskCep } from "@/lib/utils";
import { processCheckoutAction, type CheckoutActionResult } from "@/actions/checkout.actions";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck,
  Truck,
  Bus,
  Zap,
  Lock,
  QrCode,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Store,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { items, getStoreGroups, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Estados do formulário do comprador
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerCpf, setBuyerCpf] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  const [shippingType, setShippingType] = useState<"EXCURSAO_BRAS" | "CORREIOS" | "TRANSPORTADORA">("EXCURSAO_BRAS");
  const [excursaoDetails, setExcursaoDetails] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<CheckoutActionResult | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const storeGroups = getStoreGroups();
  const totalPrice = getTotalPrice();

  // Busca automática do CEP via BrasilAPI
  const handleCepBlur = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length !== 8) return;

    try {
      setIsLoadingCep(true);
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`);
      if (res.ok) {
        const data = await res.json();
        setStreet(data.street || "");
        setNeighborhood(data.neighborhood || "");
        setCity(data.city || "");
        setState(data.state || "");
      }
    } catch (e) {
      console.warn("Erro ao buscar CEP:", e);
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const buyerData = {
      buyerName,
      buyerEmail,
      buyerCpf,
      buyerPhone,
      shippingType,
      excursaoDetails,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      paymentMethod: "PIX" as const,
    };

    const response = await processCheckoutAction(buyerData, storeGroups);

    if (!response.success) {
      setErrorMessage(response.message || "Erro ao processar o pedido. Revise seus dados.");
      setIsSubmitting(false);
      return;
    }

    setOrderResult(response);
    clearCart();
    setIsSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyPix = () => {
    if (orderResult?.pixCopiaECola) {
      navigator.clipboard.writeText(orderResult.pixCopiaECola);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  // Se o pedido foi gerado com sucesso: Exibir Tela de Pagamento PIX com Split
  if (orderResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />

        <main className="max-w-2xl w-full mx-auto px-4 py-12 flex-1">
          <Card className="border-emerald-200 shadow-xl overflow-hidden bg-white">
            <div className="bg-emerald-600 p-6 text-white text-center space-y-2">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto text-white">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black">Pedido Gerado com Sucesso!</h1>
              <p className="text-xs text-emerald-100 font-mono">
                Número do Pedido: <strong>{orderResult.orderNumber}</strong>
              </p>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Card de Pagamento PIX */}
              <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 text-center space-y-3">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Pagamento Instantâneo com Split Automático
                </div>

                <div className="text-3xl font-black text-emerald-700">
                  {formatCurrency(orderResult.totalAmount)}
                </div>

                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Abra o aplicativo do seu banco, escolha a opção <strong>Pix Copia e Cola</strong> e cole o código abaixo:
                </p>

                {/* Código Copia e Cola */}
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={orderResult.pixCopiaECola}
                    className="flex-1 bg-white border rounded-lg px-3 py-2 text-xs font-mono text-slate-600 truncate select-all"
                  />
                  <Button
                    type="button"
                    onClick={handleCopyPix}
                    variant="bras"
                    size="sm"
                    className="shrink-0"
                  >
                    {copiedPix ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-1" /> Copiar Código
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Detalhamento do Split por Vendedor */}
              {orderResult.storesInvolved && orderResult.storesInvolved.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
                    Transparência do Split de Pagamento Mercado Pago:
                  </h3>
                  <div className="space-y-2">
                    {orderResult.storesInvolved.map((split, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-lg border bg-slate-50 text-xs flex justify-between items-center"
                      >
                        <div>
                          <p className="font-bold text-slate-800">{split.storeName}</p>
                          <p className="text-[11px] text-slate-500">
                            Repasse lojista: {formatCurrency(split.sellerNet)} | Comissão plataforma: {formatCurrency(split.platformFee)}
                          </p>
                        </div>
                        <span className="font-black text-slate-900">
                          {formatCurrency(split.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Link href="/catalogo" className="block pt-2">
                <Button variant="outline" className="w-full">
                  Voltar ao Catálogo do Brás
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Se a sacola estiver vazia
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header />
        <main className="max-w-md w-full mx-auto px-4 py-16 text-center space-y-4 flex-1">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Sua sacola está vazia</h2>
          <p className="text-xs text-slate-500">
            Adicione produtos de atacado ou varejo do Brás antes de finalizar sua compra.
          </p>
          <Link href="/catalogo">
            <Button variant="bras" className="mt-2">
              Explorar Produtos do Brás
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/catalogo" className="text-slate-400 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Finalizar Compra</h1>
            <p className="text-xs text-slate-500">
              Pagamento com Split Pix e envio garantido pelo polo comercial do Brás
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 mb-6 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs font-semibold">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleFinishOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LADO ESQUERDO: DADOS DO COMPRADOR & ENTREGA (COL-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. DADOS PESSOAIS */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="bg-slate-50/70 border-b pb-3">
                <CardTitle className="text-base font-bold">1. Dados do Comprador</CardTitle>
                <CardDescription className="text-xs">
                  Para emissão do comprovante e acompanhamento do despacho
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="buyerName" className="text-xs">Nome Completo *</Label>
                  <Input
                    id="buyerName"
                    required
                    placeholder="Seu nome ou razão social"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="buyerEmail" className="text-xs">E-mail *</Label>
                    <Input
                      id="buyerEmail"
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="buyerPhone" className="text-xs">WhatsApp / Celular *</Label>
                    <Input
                      id="buyerPhone"
                      required
                      placeholder="(11) 99999-9999"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(maskPhone(e.target.value))}
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="buyerCpf" className="text-xs">CPF do Titular da Compra *</Label>
                    <Input
                      id="buyerCpf"
                      required
                      placeholder="000.000.000-00"
                      value={buyerCpf}
                      onChange={(e) => setBuyerCpf(maskCpf(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2. FORMA DE ENVIO / LOGÍSTICA DO BRÁS */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="bg-slate-50/70 border-b pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <CardTitle className="text-base font-bold">2. Método de Envio do Brás</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  Selecione como deseja receber suas peças de confecção
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Ônibus de Excursão (Favorito das Sacoleiras) */}
                  <div
                    onClick={() => setShippingType("EXCURSAO_BRAS")}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingType === "EXCURSAO_BRAS"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bus className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs text-slate-900">Ônibus de Excursão</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Entrega no pátio de ônibus de sacoleiras no Brás ou Pari.
                    </p>
                  </div>

                  {/* Correios */}
                  <div
                    onClick={() => setShippingType("CORREIOS")}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingType === "CORREIOS"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span className="font-bold text-xs text-slate-900">Correios (Sedex/PAC)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Envio convencional com código de rastreamento.
                    </p>
                  </div>

                  {/* Transportadora */}
                  <div
                    onClick={() => setShippingType("TRANSPORTADORA")}
                    className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      shippingType === "TRANSPORTADORA"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-xs"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <span className="font-bold text-xs text-slate-900">Transportadora</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Ideal para volumes e fardos pesados de atacado.
                    </p>
                  </div>
                </div>

                {shippingType === "EXCURSAO_BRAS" && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <Label className="text-xs font-bold text-emerald-900">
                      Identificação do Ônibus / Caravana no Brás:
                    </Label>
                    <Input
                      placeholder="Ex: Excursão da Maria - Estacionamento Mega Polo, Vaga 42"
                      value={excursaoDetails}
                      onChange={(e) => setExcursaoDetails(e.target.value)}
                      className="bg-white text-xs"
                    />
                  </div>
                )}

                {/* Endereço de Entrega */}
                <div className="space-y-3 pt-2 border-t">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="zipCode" className="text-xs">CEP *</Label>
                      <Input
                        id="zipCode"
                        required
                        placeholder="00000-000"
                        value={zipCode}
                        onChange={(e) => {
                          const masked = maskCep(e.target.value);
                          setZipCode(masked);
                          if (masked.length === 9) handleCepBlur(masked);
                        }}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="street" className="text-xs">Logradouro *</Label>
                      <Input
                        id="street"
                        required
                        placeholder="Rua, Avenida..."
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="number" className="text-xs">Número *</Label>
                      <Input
                        id="number"
                        required
                        placeholder="123"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label htmlFor="complement" className="text-xs">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, Bloco..."
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="neighborhood" className="text-xs">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        required
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs">Cidade *</Label>
                      <Input
                        id="city"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-xs">UF *</Label>
                      <Input
                        id="state"
                        required
                        maxLength={2}
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* LADO DIREITO: RESUMO DA SACOLA & TOTALIZADOR (COL-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border-emerald-200 shadow-md">
              <CardHeader className="bg-emerald-50/50 border-b pb-3">
                <CardTitle className="text-base font-bold">Resumo por Lojista</CardTitle>
                <CardDescription className="text-xs">
                  {storeGroups.length} {storeGroups.length === 1 ? "loja" : "lojas"} no seu pedido
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-3 divide-y">
                  {storeGroups.map((group) => (
                    <div key={group.storeId} className="pt-2 first:pt-0 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{group.storeName}</span>
                        <span className="font-black text-emerald-700">
                          {formatCurrency(group.subtotal)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{group.totalQuantity} peças</span>
                        {group.isWholesaleActive ? (
                          <span className="text-emerald-600 font-bold">✓ Atacado Ativado</span>
                        ) : (
                          <span>Preço Varejo</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-slate-600">Total a Pagar (Pix):</span>
                    <span className="text-2xl font-black text-emerald-700">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Split automático processado no momento da confirmação Pix.</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Gerando Código Pix...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Confirmar e Pagar via Pix
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </main>
    </div>
  );
}
