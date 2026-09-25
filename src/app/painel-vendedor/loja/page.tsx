"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Store, CreditCard, Lock, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getVendorStoreAction, updateVendorStoreAction } from "@/actions/store.actions";

export default function VendorStoreSettingsPage() {
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");

  const [bankName, setBankName] = useState("");
  const [pixKeyType, setPixKeyType] = useState("CNPJ");
  const [pixKey, setPixKey] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getVendorStoreAction().then((store) => {
      if (store) {
        setStoreId(store.id || "");
        setStoreName(store.name || "");
        setSlug(store.slug || "");
        setLocation(store.physical_location || "");
        setWhatsapp(store.whatsapp_number || store.commercial_phone || "");
        setBannerUrl(store.banner_url || "");
        setDescription(store.description || "");
        setBankName(store.bank_name || "");
        setPixKeyType(store.pix_key_type || "CNPJ");
        setPixKey(store.pix_key || "");
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeId) return;

    setIsSaving(true);
    try {
      const res = await updateVendorStoreAction(storeId, {
        name: storeName,
        location,
        whatsapp,
        description,
        bannerUrl,
        bankName,
        pixKeyType,
        pixKey,
      });

      if (res.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-3">
        <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
        <p className="text-xs text-slate-500">Carregando dados da sua loja...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="bras">Storefront Oficial</Badge>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Personalizar Minha Loja & Box</h1>
          <p className="text-xs text-slate-500">
            Configure as informações que seus clientes e sacoleiras verão na sua vitrine dedicada
          </p>
        </div>

        {slug && (
          <Link href={`/loja/${slug}`} target="_blank">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              Ver Loja Pública
            </Button>
          </Link>
        )}
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs font-bold">Informações da loja atualizadas no banco de dados com sucesso!</p>
        </div>
      )}

      {/* 1. DADOS DA VITRINE */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="bg-slate-50/70 border-b pb-3">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600" />
            <CardTitle className="text-base font-bold">1. Identidade Visual & Contato</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Nome da Loja *</Label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ex: Confecções Brás Fashion"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">WhatsApp Comercial *</Label>
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold">Localização no Polo do Brás *</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Shopping Vautier Premium - Corredor B, Box 14"
                required
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold">URL da Imagem do Banner de Capa</Label>
              <Input
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://exemplo.com/banner.jpg"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold">Apresentação da Confecção</Label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva as peças que você fabrica, atacado mínimo e informações de envio..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. DADOS BANCÁRIOS DE REPASSES */}
      <Card className="shadow-xs border-emerald-200">
        <CardHeader className="bg-emerald-50/50 border-b pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <CardTitle className="text-base font-bold">2. Conta Bancária para Recebimento Pix</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Valores das vendas no marketplace são depositados nesta conta com split automático
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Por segurança, a titularidade da conta deve bater com o documento verificado pela moderação do marketplace.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold">Banco</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ex: Nubank, Itaú, Bradesco"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Tipo de Chave Pix</Label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value)}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="CNPJ">CNPJ</option>
                <option value="CPF">CPF</option>
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Celular</option>
                <option value="RANDOM_KEY">Chave Aleatória</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold">Chave Pix</Label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Insira sua chave Pix"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit"
        disabled={isSaving}
        className="w-full sm:w-auto h-12 px-8 font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer disabled:opacity-50"
      >
        {isSaving ? "Salvando Alterações..." : "Salvar Alterações da Loja"}
      </Button>
    </form>
  );
}
