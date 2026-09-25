"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sellerRegisterSchema,
  type SellerRegisterInput,
} from "@/schemas/store.schema";
import { registerSellerAction } from "@/actions/store.actions";
import {
  maskCpf,
  maskCnpj,
  maskPhone,
} from "@/lib/utils";
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
import {
  Store,
  UserCheck,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";

const CATEGORIAS_BRAS = [
  "Moda Feminina (Vestidos, Blusas, Conjuntos)",
  "Jeans & Sarja (Calças, Shorts, Jaquetas)",
  "Moda Masculina (Camisetas, Polos, Bermudas)",
  "Moda Infantil & Bebê",
  "Moda Plus Size",
  "Moda Íntima, Lingerie & Pijamas",
  "Moda Praia & Fitness",
  "Acessórios, Bolsas & Cintos",
  "Calçados & Chinelos",
  "Bijuterias, Semijoias & Folheados",
  "Cama, Mesa & Banho",
];

export function SellerRegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    slug: string;
    storeName: string;
    email: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    formState: { errors },
  } = useForm<SellerRegisterInput>({
    resolver: zodResolver(sellerRegisterSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      cpf: "",
      whatsapp: "",
      storeName: "",
      cnpj: "",
      mainCategory: "",
      description: "",
      physicalLocation: "",
      pixKeyType: "CPF",
      pixKey: "",
      bankName: "",
      bankAgency: "",
      bankAccount: "",
      bankAccountDigit: "",
      bankAccountType: "CHECKING",
      accountHolderDocument: "",
      termsAccepted: true,
    },
  });

  const onSubmit = async (data: SellerRegisterInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const response = await registerSellerAction(data);

      if (!response.success) {
        if (response.errors) {
          // Mapear erros de volta para os campos do React Hook Form
          Object.entries(response.errors).forEach(([field, messages]) => {
            if (messages && messages.length > 0) {
              setError(field as keyof SellerRegisterInput, {
                type: "server",
                message: messages[0],
              });
            }
          });
        }
        setServerError(
          response.message || "Erro ao processar o formulário. Revise os campos."
        );
        return;
      }

      // Sucesso
      setSuccessData({
        slug: response.data?.slug || "",
        storeName: data.storeName,
        email: data.email,
      });
    } catch (err) {
      console.error(err);
      setServerError("Ocorreu um erro de conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se o cadastro foi concluído com sucesso
  if (successData) {
    return (
      <Card className="w-full max-w-xl mx-auto border-emerald-200 bg-white shadow-xl">
        <CardContent className="pt-10 pb-8 text-center px-6">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <Badge variant="bras" className="mb-2">
            Conta de Lojista Criada
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Parabéns, Lojista do Brás!
          </h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            A loja <strong className="text-gray-900">{successData.storeName}</strong> foi cadastrada com sucesso e suas credenciais foram salvas no Supabase. Você já pode fazer login para acessar seu painel de vendas e catálogo.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-left mb-6 text-sm">
            <p className="font-semibold text-gray-800 mb-1">
              Sua URL personalizada no Marketplace será:
            </p>
            <p className="font-mono text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 inline-block break-all">
              meusite.com.br/loja/{successData.slug}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href={`/auth/login?email=${encodeURIComponent(successData.email)}&registered=true`}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-12 px-4 shadow-sm transition-colors text-sm"
            >
              Fazer Login no Painel <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Button
              variant="outline"
              className="h-12 border-slate-300 text-slate-700"
              onClick={() => window.location.reload()}
            >
              Cadastrar Outra Loja
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-3xl mx-auto space-y-8"
      noValidate
    >
      {/* Alerta de erro geral do servidor */}
      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 mt-0.5 text-red-600 shrink-0" />
          <div>
            <p className="font-semibold text-sm">Atenção</p>
            <p className="text-sm">{serverError}</p>
          </div>
        </div>
      )}

      {/* SEÇÃO 1: DADOS DO RESPONSÁVEL */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                1. Responsável pelo Acesso
              </CardTitle>
              <CardDescription className="text-xs">
                Dados pessoais do lojista ou administrador da conta
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome Completo */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="fullName">Nome Completo *</Label>
              <Input
                id="fullName"
                placeholder="Ex: Carlos Eduardo de Souza"
                {...register("fullName")}
                aria-invalid={!!errors.fullName}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail Profissional *</Label>
              <Input
                id="email"
                type="email"
                placeholder="loja@exemplo.com.br"
                {...register("email")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp">WhatsApp Comercial *</Label>
              <Input
                id="whatsapp"
                placeholder="(11) 99999-9999"
                {...register("whatsapp", {
                  onChange: (e) => {
                    setValue("whatsapp", maskPhone(e.target.value));
                  },
                })}
                aria-invalid={!!errors.whatsapp}
              />
              {errors.whatsapp && (
                <p className="text-xs text-red-500">{errors.whatsapp.message}</p>
              )}
            </div>

            {/* CPF */}
            <div className="space-y-1.5">
              <Label htmlFor="cpf">CPF do Titular *</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                {...register("cpf", {
                  onChange: (e) => {
                    setValue("cpf", maskCpf(e.target.value));
                  },
                })}
                aria-invalid={!!errors.cpf}
              />
              {errors.cpf && (
                <p className="text-xs text-red-500">{errors.cpf.message}</p>
              )}
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha de Acesso *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 8 dígitos (A-Z e 0-9)"
                {...register("password")}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Repita sua senha"
                {...register("confirmPassword")}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 2: DADOS DA LOJA E LOCALIZAÇÃO NO BRÁS */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-gray-50/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">
                2. Informações da Loja / Confecção
              </CardTitle>
              <CardDescription className="text-xs">
                Como os compradores e sacoleiras encontrarão você
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome da Loja */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="storeName">Nome Fantasia da Loja / Marca *</Label>
              <Input
                id="storeName"
                placeholder="Ex: Bella Flor Confecções Brás"
                {...register("storeName")}
                aria-invalid={!!errors.storeName}
              />
              {errors.storeName && (
                <p className="text-xs text-red-500">{errors.storeName.message}</p>
              )}
            </div>

            {/* CNPJ */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="cnpj">CNPJ da Empresa</Label>
                <span className="text-[11px] text-muted-foreground">
                  (Opcional para MEI/Autônomos)
                </span>
              </div>
              <Input
                id="cnpj"
                placeholder="00.000.000/0000-00"
                {...register("cnpj", {
                  onChange: (e) => {
                    setValue("cnpj", maskCnpj(e.target.value));
                  },
                })}
                aria-invalid={!!errors.cnpj}
              />
              {errors.cnpj && (
                <p className="text-xs text-red-500">{errors.cnpj.message}</p>
              )}
            </div>

            {/* Categoria Principal */}
            <div className="space-y-1.5">
              <Label htmlFor="mainCategory">Categoria Principal *</Label>
              <select
                id="mainCategory"
                {...register("mainCategory")}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-invalid={!!errors.mainCategory}
              >
                <option value="">Selecione um segmento...</option>
                {CATEGORIAS_BRAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.mainCategory && (
                <p className="text-xs text-red-500">
                  {errors.mainCategory.message}
                </p>
              )}
            </div>

            {/* Localização Física no Brás */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="physicalLocation">
                Localização Física no Brás / Feira da Madrugada
              </Label>
              <Input
                id="physicalLocation"
                placeholder="Ex: Shopping Vautier Premium, Piso 1 - Box 214 / Rua Miller, 340"
                {...register("physicalLocation")}
              />
              <p className="text-[11px] text-muted-foreground">
                Ajuda compradores e sacoleiras a localizarem sua loja presencialmente ou despacharem em excursões.
              </p>
            </div>

            {/* Descrição da Loja */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="description">Breve Descrição da Loja</Label>
              <Textarea
                id="description"
                placeholder="Conte sobre sua confecção, diferencial dos tecidos, envio para todo o Brasil..."
                rows={3}
                {...register("description")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 3: DADOS BANCÁRIOS DO VENDEDOR PARA RECEBIMENTO (PIX / REPASSES) */}
      <Card className="border shadow-sm border-emerald-200">
        <CardHeader className="border-b bg-emerald-50/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg font-bold text-gray-900">
                  3. Dados Bancários para Recebimento
                </CardTitle>
                <Badge variant="bras">Essencial para Vender</Badge>
              </div>
              <CardDescription className="text-xs">
                Conta para onde os valores das suas vendas serão transferidos automaticamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              <strong>Segurança Antitrouxaria:</strong> A conta e chave Pix devem obrigatoriamente estar vinculadas ao CPF ou CNPJ cadastrado. Não são permitidos repasses para contas de terceiros.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de Chave Pix */}
            <div className="space-y-1.5">
              <Label htmlFor="pixKeyType">Tipo de Chave Pix *</Label>
              <select
                id="pixKeyType"
                {...register("pixKeyType")}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Celular</option>
                <option value="RANDOM_KEY">Chave Aleatória (EVP)</option>
              </select>
            </div>

            {/* Chave Pix */}
            <div className="space-y-1.5">
              <Label htmlFor="pixKey">Chave Pix *</Label>
              <Input
                id="pixKey"
                placeholder="Informe sua chave Pix"
                {...register("pixKey")}
                aria-invalid={!!errors.pixKey}
              />
              {errors.pixKey && (
                <p className="text-xs text-red-500">{errors.pixKey.message}</p>
              )}
            </div>

            {/* Nome do Banco */}
            <div className="space-y-1.5">
              <Label htmlFor="bankName">Banco / Instituição *</Label>
              <Input
                id="bankName"
                placeholder="Ex: Nubank, Itaú, Inter, Bradesco..."
                {...register("bankName")}
                aria-invalid={!!errors.bankName}
              />
              {errors.bankName && (
                <p className="text-xs text-red-500">{errors.bankName.message}</p>
              )}
            </div>

            {/* Tipo de Conta */}
            <div className="space-y-1.5">
              <Label htmlFor="bankAccountType">Tipo de Conta *</Label>
              <select
                id="bankAccountType"
                {...register("bankAccountType")}
                className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-base md:text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="CHECKING">Conta Corrente</option>
                <option value="SAVINGS">Conta Poupança</option>
              </select>
            </div>

            {/* Agência e Conta */}
            <div className="space-y-1.5">
              <Label htmlFor="bankAgency">Agência (sem dígito) *</Label>
              <Input
                id="bankAgency"
                placeholder="Ex: 0001"
                {...register("bankAgency")}
                aria-invalid={!!errors.bankAgency}
              />
              {errors.bankAgency && (
                <p className="text-xs text-red-500">{errors.bankAgency.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="bankAccount">Número da Conta *</Label>
                <Input
                  id="bankAccount"
                  placeholder="Ex: 1234567"
                  {...register("bankAccount")}
                  aria-invalid={!!errors.bankAccount}
                />
                {errors.bankAccount && (
                  <p className="text-xs text-red-500">
                    {errors.bankAccount.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bankAccountDigit">Dígito *</Label>
                <Input
                  id="bankAccountDigit"
                  placeholder="0"
                  maxLength={2}
                  {...register("bankAccountDigit")}
                  aria-invalid={!!errors.bankAccountDigit}
                />
                {errors.bankAccountDigit && (
                  <p className="text-xs text-red-500">
                    {errors.bankAccountDigit.message}
                  </p>
                )}
              </div>
            </div>

            {/* Documento do Titular da Conta */}
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="accountHolderDocument">
                CPF ou CNPJ do Titular da Conta Bancária *
              </Label>
              <Input
                id="accountHolderDocument"
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                {...register("accountHolderDocument", {
                  onChange: (e) => {
                    const clean = e.target.value.replace(/\D/g, "");
                    if (clean.length <= 11) {
                      setValue("accountHolderDocument", maskCpf(e.target.value));
                    } else {
                      setValue("accountHolderDocument", maskCnpj(e.target.value));
                    }
                  },
                })}
                aria-invalid={!!errors.accountHolderDocument}
              />
              {errors.accountHolderDocument && (
                <p className="text-xs text-red-500">
                  {errors.accountHolderDocument.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 4: ACEITE DE TERMOS E SUBMIT */}
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50 border">
          <input
            type="checkbox"
            id="termsAccepted"
            className="w-4 h-4 mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            {...register("termsAccepted")}
          />
          <label
            htmlFor="termsAccepted"
            className="text-xs text-gray-600 leading-relaxed cursor-pointer"
          >
            Declaro que sou lojista/fabricante atuante no polo de confecções e concordo com os{" "}
            <strong className="text-gray-900">Termos de Uso</strong> e comissão sobre vendas da plataforma de atacado e varejo do Brás.
          </label>
        </div>
        {errors.termsAccepted && (
          <p className="text-xs text-red-500 font-medium">
            {errors.termsAccepted.message}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-14 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Processando Cadastro da Loja...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Finalizar Cadastro de Lojista
              <ArrowRight className="w-5 h-5" />
            </span>
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Já tem conta cadastrada?{" "}
          <a
            href="/login"
            className="font-semibold text-emerald-600 hover:underline"
          >
            Entrar no Painel do Vendedor
          </a>
        </p>
      </div>
    </form>
  );
}
