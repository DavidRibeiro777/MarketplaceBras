"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/schemas/product.schema";
import { createProductAction } from "@/actions/product.actions";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  TrendingDown,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Package,
  UploadCloud,
  ImagePlus,
  Star,
} from "lucide-react";

const TAMANHOS_PADRAO = ["P", "M", "G", "GG", "G1", "G2", "36", "38", "40", "42", "44", "Único"];
const CORES_COMUNS = [
  { name: "Preto", hex: "#000000" },
  { name: "Branco", hex: "#ffffff" },
  { name: "Off White", hex: "#f8f5f0" },
  { name: "Jeans Claro", hex: "#a4c2f4" },
  { name: "Jeans Escuro", hex: "#1c3d5a" },
  { name: "Terracota", hex: "#c86446" },
  { name: "Fúcsia", hex: "#d946ef" },
  { name: "Verde Oliva", hex: "#556b2f" },
  { name: "Areia / Cru", hex: "#e5d3b3" },
];

export function ProductForm({ storeId }: { storeId?: string } = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Estados locais para geração em lote de grade
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["P", "M", "G"]);
  const [selectedColors, setSelectedColors] = useState<string[]>(["Preto", "Off White"]);
  const [batchStock, setBatchStock] = useState<number>(20);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      retailPrice: 59.90,
      wholesalePrice: 29.90,
      minWholesaleQty: 6,
      status: "ACTIVE",
      isFeatured: false,
      images: [
        {
          url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
          isMain: true,
          order: 0,
        },
      ],
      variations: [
        { size: "P", color: "Preto", colorHex: "#000000", stock: 20, sku: "PROD-P-BLK", additionalPrice: 0, isActive: true },
        { size: "M", color: "Preto", colorHex: "#000000", stock: 20, sku: "PROD-M-BLK", additionalPrice: 0, isActive: true },
        { size: "G", color: "Preto", colorHex: "#000000", stock: 20, sku: "PROD-G-BLK", additionalPrice: 0, isActive: true },
      ],
    },
  });

  const { fields: variationFields, replace: replaceVariations, remove: removeVariation } = useFieldArray({
    control,
    name: "variations",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const watchRetailPrice = watch("retailPrice") || 0;
  const watchWholesalePrice = watch("wholesalePrice") || 0;
  const watchMinQty = watch("minWholesaleQty") || 6;
  const watchTitle = watch("title") || "";

  // Cálculo de desconto percentual atacado
  const wholesaleDiscountPercentage =
    watchRetailPrice > 0 && watchWholesalePrice > 0
      ? Math.round(((watchRetailPrice - watchWholesalePrice) / watchRetailPrice) * 100)
      : 0;

  // Função para gerar combinações de grade em lote
  const handleGenerateVariations = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      alert("Selecione pelo menos um tamanho e uma cor para gerar a grade.");
      return;
    }

    const basePrefix = watchTitle
      ? watchTitle.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, "REF")
      : "REF";

    const newVariations = [];

    for (const size of selectedSizes) {
      for (const color of selectedColors) {
        const colorObj = CORES_COMUNS.find((c) => c.name === color);
        const skuColor = color.substring(0, 3).toUpperCase();
        newVariations.push({
          size,
          color,
          colorHex: colorObj?.hex || "#cccccc",
          stock: batchStock,
          sku: `${basePrefix}-${size}-${skuColor}`,
          additionalPrice: 0,
          isActive: true,
        });
      }
    }

    replaceVariations(newVariations);
  };

  // Upload de arquivos selecionados do dispositivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        let finalUrl = "";

        // 1. Tenta upload via rota interna /api/upload (com bucket 'products' no Supabase)
        try {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const json = await res.json();
            if (json.url) {
              finalUrl = json.url;
            }
          }
        } catch (apiErr) {
          console.warn("Aviso upload via /api/upload:", apiErr);
        }

        // 2. Se a API não retornou URL, tenta upload direto no Supabase Storage client
        if (!finalUrl) {
          try {
            const fileExt = file.name.split(".").pop();
            const fileName = `catalog/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
            const { error: storageError } = await supabase.storage
              .from("products")
              .upload(fileName, file, { upsert: true });

            if (!storageError) {
              const { data: pubData } = supabase.storage
                .from("products")
                .getPublicUrl(fileName);
              if (pubData?.publicUrl) {
                finalUrl = pubData.publicUrl;
              }
            }
          } catch (directErr) {
            console.warn("Aviso upload direto Supabase:", directErr);
          }
        }

        // 3. Fallback: Base64 Data URL (garante que a imagem apareça mesmo com storage offline)
        if (!finalUrl) {
          finalUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
        }

        if (finalUrl) {
          appendImage({
            url: finalUrl,
            isMain: imageFields.length === 0 && i === 0,
            order: imageFields.length + i,
          });
        }
      }
    } catch (err) {
      console.error("Erro ao processar imagem:", err);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    appendImage({
      url: imageUrlInput.trim(),
      isMain: imageFields.length === 0,
      order: imageFields.length,
    });
    setImageUrlInput("");
  };

  const handleSetMainImage = (index: number) => {
    const updated = imageFields.map((img, i) => ({
      ...img,
      isMain: i === index,
      order: i === index ? 0 : i + 1,
    }));
    setValue("images", updated);
  };

  const onSubmit = async (data: ProductInput) => {
    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const response = await createProductAction(data, storeId);

      if (!response.success) {
        setServerError(response.message || "Erro ao salvar produto.");
        return;
      }

      setSuccessMessage("Produto cadastrado com sucesso e já sincronizado no banco de dados Supabase!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError("Erro inesperado ao cadastrar o produto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto pb-12" noValidate>
      {/* Alerta de Sucesso */}
      {successMessage && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-emerald-900 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">Produto Publicado com Sucesso!</p>
              <p className="text-xs text-emerald-700">{successMessage}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/catalogo"
              className="flex-1 sm:flex-initial text-center text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              Ver no Catálogo ↗
            </Link>
            <Link
              href="/painel-vendedor/produtos"
              className="flex-1 sm:flex-initial text-center text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 transition-colors"
            >
              Meus Produtos
            </Link>
          </div>
        </div>
      )}

      {/* Alerta de Erro */}
      {serverError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-900">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm">{serverError}</p>
        </div>
      )}

      {/* 1. DADOS PRINCIPAIS DO PRODUTO */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="bg-slate-50/70 border-b pb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <CardTitle className="text-base sm:text-lg font-bold">1. Identificação do Produto</CardTitle>
          </div>
          <CardDescription className="text-xs">Informações principais que aparecerão no catálogo</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título do Produto / Peça de Confecção *</Label>
            <Input
              id="title"
              placeholder="Ex: Vestido Midi Canelado Manga Princesa Fenda Lateral"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição Completa e Detalhes do Tecido *</Label>
            <Textarea
              id="description"
              placeholder="Detalhe a composição do tecido (ex: 96% Viscose, 4% Elastano), caimento, se estica, forro e orientações de lavagem..."
              rows={4}
              {...register("description")}
              aria-invalid={!!errors.description}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* 2. PRECIFICAÇÃO DUPLA: VAREJO VS ATACADO (BRÁS) */}
      <Card className="shadow-xs border-emerald-200">
        <CardHeader className="bg-emerald-50/40 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <CardTitle className="text-base sm:text-lg font-bold">2. Preço de Atacado & Varejo</CardTitle>
            </div>
            {wholesaleDiscountPercentage > 0 && (
              <Badge variant="bras" className="flex items-center gap-1 text-xs">
                <TrendingDown className="w-3.5 h-3.5" />
                {wholesaleDiscountPercentage}% OFF no Atacado
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            No Brás, o preço de atacado é liberado automaticamente a partir da quantidade mínima escolhida
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Preço de Varejo */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border">
              <Label htmlFor="retailPrice" className="text-xs font-semibold text-slate-700">
                Preço de Varejo (1 a {watchMinQty - 1} peças) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-muted-foreground font-semibold">R$</span>
                <Input
                  id="retailPrice"
                  type="number"
                  step="0.01"
                  className="pl-9 font-bold"
                  {...register("retailPrice")}
                />
              </div>
              {errors.retailPrice && <p className="text-xs text-red-500">{errors.retailPrice.message}</p>}
            </div>

            {/* Preço de Atacado */}
            <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <Label htmlFor="wholesalePrice" className="text-xs font-bold text-emerald-800">
                Preço de Atacado ({watchMinQty}+ peças) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-xs text-emerald-700 font-bold">R$</span>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  className="pl-9 font-black text-emerald-800 border-emerald-300 bg-white"
                  {...register("wholesalePrice")}
                />
              </div>
              {errors.wholesalePrice && <p className="text-xs text-red-500">{errors.wholesalePrice.message}</p>}
            </div>

            {/* Quantidade Mínima de Atacado */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50 border">
              <Label htmlFor="minWholesaleQty" className="text-xs font-semibold text-slate-700">
                Mínimo para Atacado *
              </Label>
              <Input
                id="minWholesaleQty"
                type="number"
                min="1"
                className="font-bold text-center"
                {...register("minWholesaleQty")}
              />
              <div className="flex gap-1 pt-1 justify-center">
                {[6, 10, 12].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setValue("minWholesaleQty", qty)}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-200 hover:bg-emerald-200 text-slate-700 hover:text-emerald-800 transition-colors font-medium"
                  >
                    {qty} peças
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. GERADOR DINÂMICO DE GRADE DE CONFECÇÃO */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="bg-slate-50/70 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base sm:text-lg font-bold">3. Grade de Variações (Tamanho & Cor)</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {variationFields.length} variações cadastradas
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Defina os tamanhos e cores disponíveis para controle de estoque por SKU
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Caixa de Geração em Lote */}
          <div className="p-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/30 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                Gerador Rápido de Combinações de Grade
              </span>
            </div>

            {/* Seleção de Tamanhos */}
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">1. Selecione os Tamanhos:</Label>
              <div className="flex flex-wrap gap-1.5">
                {TAMANHOS_PADRAO.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setSelectedSizes((prev) =>
                          isSelected ? prev.filter((s) => s !== size) : [...prev, size]
                        )
                      }
                      className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all border ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Seleção de Cores */}
            <div>
              <Label className="text-xs text-slate-600 mb-1.5 block">2. Selecione as Cores:</Label>
              <div className="flex flex-wrap gap-1.5">
                {CORES_COMUNS.map((col) => {
                  const isSelected = selectedColors.includes(col.name);
                  return (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() =>
                        setSelectedColors((prev) =>
                          isSelected ? prev.filter((c) => c !== col.name) : [...prev, col.name]
                        )
                      }
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-50 text-emerald-900 border-emerald-500 font-bold ring-1 ring-emerald-500"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: col.hex }}
                      />
                      {col.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estoque Inicial e Ação */}
            <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
              <div className="w-full sm:w-48 space-y-1">
                <Label className="text-xs text-slate-600">Estoque inicial por peça:</Label>
                <Input
                  type="number"
                  value={batchStock}
                  onChange={(e) => setBatchStock(Number(e.target.value))}
                  min="0"
                  className="bg-white text-center font-bold h-9"
                />
              </div>

              <Button
                type="button"
                onClick={handleGenerateVariations}
                variant="bras"
                size="sm"
                className="w-full sm:w-auto h-9"
              >
                Gerar Grade Combinada ({selectedSizes.length * selectedColors.length} SKUs)
              </Button>
            </div>
          </div>

          {/* Tabela de Variações Geradas */}
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b font-semibold text-slate-700">
                <tr>
                  <th className="p-3">Tamanho</th>
                  <th className="p-3">Cor</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 w-28 text-center">Estoque</th>
                  <th className="p-3 w-12 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {variationFields.map((field, idx) => (
                  <tr key={field.id} className="hover:bg-slate-50/80">
                    <td className="p-2.5 font-bold">{watch(`variations.${idx}.size`)}</td>
                    <td className="p-2.5 flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border shrink-0"
                        style={{ backgroundColor: watch(`variations.${idx}.colorHex`) || "#ccc" }}
                      />
                      {watch(`variations.${idx}.color`)}
                    </td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-600">
                      <Input
                        className="h-7 text-xs font-mono py-0"
                        {...register(`variations.${idx}.sku`)}
                      />
                    </td>
                    <td className="p-2.5">
                      <Input
                        type="number"
                        min="0"
                        className="h-7 text-xs text-center font-bold py-0"
                        {...register(`variations.${idx}.stock`)}
                      />
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeVariation(idx)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remover variação"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {errors.variations && <p className="text-xs text-red-500">{errors.variations.message}</p>}
        </CardContent>
      </Card>

      {/* 4. FOTOS DO PRODUTO */}
      <Card className="shadow-xs border-slate-200">
        <CardHeader className="bg-slate-50/70 border-b pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <CardTitle className="text-base sm:text-lg font-bold">4. Fotos do Produto</CardTitle>
            </div>
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8"
              disabled={isUploadingImage}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Selecionar Fotos
            </Button>
          </div>
          <CardDescription className="text-xs">
            Fotos nítidas de frente, costas e detalhes aumentam as vendas para sacoleiras
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {/* Input oculto para abrir a janela de seleção de arquivos do computador/celular */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple
            className="hidden"
          />

          {/* Área interativa para clicar e selecionar fotos do dispositivo */}
          <div
            onClick={() => !isUploadingImage && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isUploadingImage
                ? "border-emerald-400 bg-emerald-50/60"
                : "border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20 bg-slate-50/50"
            }`}
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-1" />
                <p className="text-sm font-bold text-slate-800">
                  Enviando foto para o Supabase Storage...
                </p>
                <p className="text-xs text-slate-500">Aguarde o processamento da imagem</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Clique aqui para selecionar fotos do seu computador ou celular
                </p>
                <p className="text-xs text-slate-500 max-w-md">
                  Suporta JPG, PNG ou WEBP até 10MB. Você pode selecionar várias fotos de uma vez.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  <ImagePlus className="w-4 h-4 mr-1.5" /> Abrir Galeria / Arquivos
                </Button>
              </>
            )}
          </div>

          {/* Opção secundária: Inserir por URL direta */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-500 mb-2">
              Ou cole a URL direta de uma foto na internet:
            </span>
            <div className="flex gap-2">
              <Input
                placeholder="https://exemplo.com/foto-do-produto.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="text-xs"
              />
              <Button
                type="button"
                onClick={handleAddImageUrl}
                variant="secondary"
                size="sm"
                disabled={!imageUrlInput.trim()}
              >
                <Plus className="w-4 h-4 mr-1" /> Adicionar Link
              </Button>
            </div>
          </div>

          {/* Galeria de Fotos Adicionadas */}
          {imageFields.length > 0 && (
            <div className="pt-2">
              <span className="block text-xs font-bold text-slate-700 mb-2">
                Fotos Selecionadas ({imageFields.length}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imageFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square shadow-xs"
                  >
                    <img
                      src={field.url}
                      alt="Foto do produto"
                      className="w-full h-full object-cover"
                    />

                    {/* Badge Foto Principal */}
                    {idx === 0 || field.isMain ? (
                      <Badge className="absolute top-2 left-2 bg-emerald-600 text-[10px] font-bold shadow-sm">
                        Foto Principal
                      </Badge>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetMainImage(idx)}
                        className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-xs cursor-pointer"
                        title="Definir como foto principal"
                      >
                        <Star className="w-3 h-3 text-amber-300" />
                        Tornar Principal
                      </button>
                    )}

                    {/* Botão Remover */}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition-transform hover:scale-110 cursor-pointer"
                      title="Excluir foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errors.images && (
            <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.images.message || "Adicione pelo menos 1 foto do produto"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* BOTÃO DE SALVAR */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Salvando Produto e Grade...
          </span>
        ) : (
          "Cadastrar Produto no Catálogo"
        )}
      </Button>
    </form>
  );
}
