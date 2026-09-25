"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { verifyUserLoginAction, type UserVerificationResult } from "@/actions/auth.actions";
import {
  Store,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Inicializar com parâmetros da URL (após registro do lojista)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    const registeredParam = searchParams.get("registered");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (registeredParam === "true") {
      setSuccessNotice(
        "🎉 Cadastro de lojista realizado! Sua conta foi criada no Supabase. Digite sua senha abaixo para acessar seu painel."
      );
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    setStatusStep("Autenticando credenciais no Supabase...");

    try {
      // 1. Autenticar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setErrorMsg(
            "Seu cadastro foi realizado, mas a confirmação de e-mail está ativa no Supabase. Verifique sua caixa de entrada para confirmar ou desative a confirmação no painel do Supabase."
          );
        } else if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("invalid_grant")
        ) {
          setErrorMsg(
            "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente."
          );
        } else {
          setErrorMsg(error.message);
        }
        setIsLoading(false);
        setStatusStep(null);
        return;
      }

      // 2. Salvar sessão em cookies seguros para o middleware do Next.js
      if (data.session) {
        setStatusStep("Configurando sessão segura...");
        await fetch("/api/auth/set-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });
      }

      // 3. Verificação no banco de dados (Lojista, Loja vinculada e Status)
      setStatusStep("Verificando perfil e dados da loja...");
      const verification: UserVerificationResult = await verifyUserLoginAction(
        data.user.email || email,
        data.user.id
      );

      // 4. Feedback e Redirecionamento inteligente
      const urlRedirect = searchParams.get("redirect");

      if (verification.role === "SELLER") {
        if (verification.store?.status === "PENDING") {
          setStatusStep(
            `Bem-vindo, ${verification.name || "Lojista"}! Sua loja "${verification.store.name}" está em homologação. Redirecionando...`
          );
        } else {
          setStatusStep(
            `Bem-vindo, ${verification.name || "Lojista"}! Acessando o painel de vendas...`
          );
        }

        setTimeout(() => {
          router.push(urlRedirect || "/painel-vendedor/produtos");
          router.refresh();
        }, 600);
      } else if (verification.role === "ADMIN") {
        setStatusStep("Acesso de administrador confirmado. Redirecionando...");
        setTimeout(() => {
          router.push(urlRedirect || "/admin");
          router.refresh();
        }, 600);
      } else {
        setStatusStep("Login realizado com sucesso! Redirecionando...");
        setTimeout(() => {
          router.push(urlRedirect || "/catalogo");
          router.refresh();
        }, 600);
      }
    } catch (err: unknown) {
      console.error("Erro no login:", err);
      setErrorMsg("Ocorreu uma falha ao conectar ao servidor. Tente novamente.");
      setIsLoading(false);
      setStatusStep(null);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
      {/* Cabeçalho do formulário */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 mb-3 shadow-xs">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Acessar Plataforma
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Área exclusiva para Lojistas do Brás e Compradores
        </p>
      </div>

      {/* Alerta de Sucesso (vindo do Cadastro de Lojista) */}
      {successNotice && (
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="leading-snug">{successNotice}</div>
        </div>
      )}

      {/* Alerta de Erro */}
      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="leading-snug">{errorMsg}</div>
        </div>
      )}

      {/* Status de progresso */}
      {statusStep && !errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <span>{statusStep}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Campo E-mail */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
          >
            E-mail
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu-email@exemplo.com"
              required
              disabled={isLoading}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* Campo Senha */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
            >
              Senha
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Botão de Envio */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer text-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verificando Acesso...</span>
            </>
          ) : (
            <>
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divisor */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-slate-400">
            Ainda não vende no Brás?
          </span>
        </div>
      </div>

      {/* Link para o Registro de Lojista */}
      <Link
        href="/registro-vendedor"
        className="w-full py-2.5 px-4 rounded-xl border-2 border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Store className="w-4 h-4 text-emerald-600" />
        <span>Cadastre sua Loja de Confecção</span>
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white flex flex-col justify-between py-8 px-4 sm:px-6">
      {/* Topbar simples */}
      <div className="max-w-4xl mx-auto w-full flex items-center justify-between mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-emerald-700 font-black text-xl tracking-tight"
        >
          <Store className="w-6 h-6 text-emerald-600" />
          <span>
            BRÁS<span className="text-slate-900">MARKET</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Badge variant="bras" className="hidden sm:inline-flex text-[11px]">
            Polo de Confecções
          </Badge>
          <Link
            href="/catalogo"
            className="text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            Ver Catálogo ↗
          </Link>
        </div>
      </div>

      {/* Conteúdo Central */}
      <div className="flex-1 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-sm">Carregando tela de login...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>

      {/* Rodapé simples */}
      <div className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-200/60">
        <p>© 2026 Marketplace Brás & Feira da Madrugada • Todos os direitos reservados</p>
      </div>
    </div>
  );
}
