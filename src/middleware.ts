// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware que protege as rotas do painel do vendedor (/painel-vendedor) e de admin (/admin).
 * Se o lojista não estiver autenticado com a sessão do Supabase, é redirecionado para /auth/login.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas que exigem autenticação ativa
  const protectedPaths = ["/painel-vendedor", "/admin"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Verifica se o token de sessão do Supabase está presente no cookie
  const token =
    request.cookies.get("sb-access-token")?.value ||
    request.cookies.get("supabase-auth-token")?.value;

  if (!token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/painel-vendedor/:path*", "/admin/:path*"],
};
