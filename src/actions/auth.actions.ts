"use server";

import { getSupabaseAdmin } from "@/lib/supabase";

export interface UserVerificationResult {
  success: boolean;
  message?: string;
  role: "SELLER" | "ADMIN" | "BUYER";
  name?: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    status: string;
  } | null;
  redirectUrl: string;
}

/**
 * Server Action para verificar o tipo de conta (Lojista, Admin ou Comprador)
 * e o status da loja após o login no Supabase.
 */
export async function verifyUserLoginAction(
  email: string,
  supabaseUid?: string
): Promise<UserVerificationResult> {
  try {
    const dbAdmin = getSupabaseAdmin();

    // 1. Buscar usuário na tabela public.users
    let userQuery = dbAdmin.from("users").select("id, name, email, role, supabase_uid");

    if (supabaseUid) {
      userQuery = userQuery.or(`supabase_uid.eq.${supabaseUid},email.eq.${email}`);
    } else {
      userQuery = userQuery.eq("email", email);
    }

    const { data: user, error: userError } = await userQuery.maybeSingle();

    if (userError) {
      console.warn("Aviso ao buscar dados do usuário pós-login:", userError.message);
    }

    // Se o usuário existir e o supabase_uid ainda não estiver salvo, atualiza
    if (user && supabaseUid && (!user.supabase_uid || user.supabase_uid !== supabaseUid)) {
      await dbAdmin
        .from("users")
        .update({ supabase_uid: supabaseUid })
        .eq("id", user.id);
    }

    // 2. Se for Lojista (SELLER)
    if (user?.role === "SELLER") {
      const { data: store, error: storeError } = await dbAdmin
        .from("stores")
        .select("id, name, slug, status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (storeError) {
        console.warn("Aviso ao buscar loja do lojista:", storeError.message);
      }

      return {
        success: true,
        role: "SELLER",
        name: user.name,
        store: store
          ? {
              id: store.id,
              name: store.name,
              slug: store.slug,
              status: store.status,
            }
          : null,
        redirectUrl: "/painel-vendedor/produtos",
      };
    }

    // 3. Se for Administrador (ADMIN)
    if (user?.role === "ADMIN") {
      return {
        success: true,
        role: "ADMIN",
        name: user.name,
        redirectUrl: "/admin",
      };
    }

    // 4. Caso padrão / Comprador (BUYER)
    return {
      success: true,
      role: (user?.role as any) || "BUYER",
      name: user?.name || email.split("@")[0],
      redirectUrl: "/catalogo",
    };
  } catch (error) {
    console.error("Erro na verificação de usuário:", error);
    return {
      success: true,
      role: "BUYER",
      redirectUrl: "/catalogo",
    };
  }
}
