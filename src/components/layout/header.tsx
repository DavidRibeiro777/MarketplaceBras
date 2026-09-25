"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Store, ShoppingBag, Plus, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cart-store";
import { supabase } from "@/lib/supabaseClient";

export function Header() {
  const { getTotalItems, setIsOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);

    // Carregar sessão ativa do Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
    });

    // Escutar eventos de login/logout em tempo real
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    window.location.href = "/";
  };

  const totalItems = mounted ? getTotalItems() : 0;

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo do Brás */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-emerald-700 font-black text-xl">
            <Store className="w-6 h-6 text-emerald-600" />
            <span>BRÁS<span className="text-slate-900">MARKET</span></span>
          </Link>
          <Badge variant="bras" className="hidden sm:inline-flex text-[11px]">
            Polo de Confecções
          </Badge>
        </div>

        {/* Ações: Catálogo, Painel / Login e Sacola de Compras */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/catalogo"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            Catálogo
          </Link>

          {mounted && currentUser ? (
            /* Estado quando o usuário/lojista ESTÁ LOGADO */
            <>
              <Link
                href="/painel-vendedor/produtos/novo"
                className="hidden sm:flex text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Cadastrar Peça
              </Link>

              <Link
                href="/painel-vendedor/produtos"
                className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Painel do Lojista</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Estado quando o usuário NÃO está logado */
            <>
              <Link
                href="/auth/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                Entrar
              </Link>

              <Link
                href="/registro-vendedor"
                className="text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
              >
                Sou Lojista
              </Link>
            </>
          )}

          {/* Botão da Sacola com Contador Dinâmico */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            aria-label="Ver sacola de compras"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
