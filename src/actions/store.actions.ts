"use server";

import { getSupabaseAdmin, supabase } from "@/lib/supabase";
import { sellerRegisterSchema, type SellerRegisterInput } from "@/schemas/store.schema";
import { slugify } from "@/lib/utils";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Server Action para Registro Completo do Lojista via Supabase
 * Valida os dados no lado do servidor e cria o Usuário e a Loja no banco de dados Supabase.
 */
export async function registerSellerAction(
  input: SellerRegisterInput
): Promise<ActionResponse<{ storeId: string; slug: string; email?: string }>> {
  try {
    // 1. Validação estrita dos dados via Zod
    const validationResult = sellerRegisterSchema.safeParse(input);

    if (!validationResult.success) {
      const fieldErrors = validationResult.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Dados de cadastro inválidos. Por favor, revise os campos destacados.",
        errors: fieldErrors,
      };
    }

    const data = validationResult.data;
    const supabase = getSupabaseAdmin();

    // 2. Registrar credenciais no Supabase Auth para permitir login
    let supabaseUid: string | null = null;
    let isAlreadyRegisteredInAuth = false;

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.fullName,
          role: "SELLER",
        },
      },
    });

    if (authError) {
      if (
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("already exists") ||
        authError.status === 422
      ) {
        isAlreadyRegisteredInAuth = true;
      } else {
        console.warn("Aviso no Supabase Auth SignUp:", authError.message);
      }
    }

    if (authData?.user) {
      supabaseUid = authData.user.id;
    }

    // 3. Obter ou vincular o Usuário no public.users (criado pelo trigger do Auth ou manual)
    let userId: string;

    // Buscar o usuário pelo supabase_uid ou email
    let userQuery = supabase.from("users").select("id, role, supabase_uid");
    if (supabaseUid) {
      userQuery = userQuery.or(`supabase_uid.eq.${supabaseUid},email.eq.${data.email}`);
    } else {
      userQuery = userQuery.eq("email", data.email);
    }

    const { data: existingUser } = await userQuery.maybeSingle();

    if (existingUser) {
      userId = existingUser.id;

      // Se o usuário já possui loja cadastrada e a conta já estava registrada
      const { data: userStore } = await supabase
        .from("stores")
        .select("id, slug")
        .eq("user_id", userId)
        .maybeSingle();

      if (userStore && isAlreadyRegisteredInAuth) {
        return {
          success: false,
          message: "Este e-mail já possui uma loja cadastrada. Acesse a página de login.",
          errors: {
            email: ["E-mail e loja já cadastrados. Faça login para acessar seu painel."],
          },
        };
      }

      // Atualiza os dados complementares do lojista (CPF, WhatsApp, etc)
      await supabase
        .from("users")
        .update({
          name: data.fullName,
          cpf: data.cpf,
          phone: data.whatsapp,
          role: "SELLER",
          supabase_uid: supabaseUid || existingUser.supabase_uid || undefined,
        })
        .eq("id", userId);
    } else {
      // Se não existir (caso o trigger não tenha disparado), insere manualmente
      userId = crypto.randomUUID();
      const { error: userError } = await supabase.from("users").insert({
        id: userId,
        supabase_uid: supabaseUid,
        name: data.fullName,
        email: data.email,
        cpf: data.cpf,
        phone: data.whatsapp,
        role: "SELLER",
      });

      if (userError) {
        console.error("Erro ao registrar perfil de usuário:", userError);
        throw new Error(userError.message || "Erro ao criar perfil de usuário.");
      }
    }

    // 4. Verificar se a loja já existe para esse lojista
    const { data: existingStore } = await supabase
      .from("stores")
      .select("id, slug")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingStore) {
      return {
        success: true,
        message: "Cadastro realizado com sucesso! Sua loja já está criada e pronta para login.",
        data: {
          storeId: existingStore.id,
          slug: existingStore.slug,
          email: data.email,
        },
      };
    }

    // 5. Gerar Slug único para a Loja
    const baseSlug = slugify(data.storeName);
    let finalSlug = baseSlug;
    let counter = 1;

    try {
      while (true) {
        const { data: existingSlug } = await supabase
          .from("stores")
          .select("id")
          .eq("slug", finalSlug)
          .maybeSingle();

        if (!existingSlug) break;
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    } catch {
      finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
    }

    // 6. Inserir a Loja vinculada com os dados bancários
    const storeId = crypto.randomUUID();
    const { error: storeError } = await supabase.from("stores").insert({
      id: storeId,
      user_id: userId,
      name: data.storeName,
      slug: finalSlug,
      cnpj: data.cnpj && data.cnpj !== "" ? data.cnpj : null,
      commercial_phone: data.whatsapp,
      whatsapp_number: data.whatsapp,
      description: data.description,
      physical_location: data.physicalLocation,
      status: "PENDING",
      pix_key_type: data.pixKeyType as any,
      pix_key: data.pixKey,
      bank_name: data.bankName,
      bank_agency: data.bankAgency,
      bank_account: data.bankAccount,
      bank_account_digit: data.bankAccountDigit,
      bank_account_type: data.bankAccountType as any,
      account_holder_document: data.accountHolderDocument,
    });

    if (storeError) {
      console.error("Erro ao criar loja:", storeError);
      throw new Error(storeError.message || "Erro ao criar loja do lojista.");
    }

    return {
      success: true,
      message: "Cadastro realizado com sucesso! Sua loja está criada e pronta para login.",
      data: {
        storeId,
        slug: finalSlug,
        email: data.email,
      },
    };
  } catch (error: any) {
    console.error("Erro no cadastro de lojista via Supabase:", error);
    return {
      success: false,
      message: error?.message || "Ocorreu uma falha no servidor ao processar o cadastro. Tente novamente mais tarde.",
    };
  }
}

/**
 * Retorna os dados da loja real do lojista logado
 */
export async function getVendorStoreAction() {
  try {
    const admin = getSupabaseAdmin();
    const cookieStore = await cookies();
    const token = cookieStore.get("sb-access-token")?.value;

    let targetStore: any = null;

    if (token) {
      const { data: authData } = await supabase.auth.getUser(token);
      if (authData?.user) {
        const { data: dbUser } = await admin
          .from("users")
          .select("id, name, phone")
          .or(`supabase_uid.eq.${authData.user.id},email.eq.${authData.user.email}`)
          .maybeSingle();

        if (dbUser) {
          const { data: store } = await admin
            .from("stores")
            .select("*")
            .eq("user_id", dbUser.id)
            .maybeSingle();

          if (store) {
            targetStore = { ...store, userName: dbUser.name, userPhone: dbUser.phone };
          }
        }
      }
    }

    if (!targetStore) {
      const { data: latestStore } = await admin
        .from("stores")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      targetStore = latestStore;
    }

    return targetStore;
  } catch (e) {
    console.error("Erro ao buscar dados da loja:", e);
    return null;
  }
}

/**
 * Atualiza os dados da loja no Supabase
 */
export async function updateVendorStoreAction(storeId: string, data: {
  name: string;
  location: string;
  whatsapp: string;
  description: string;
  bannerUrl?: string;
  bankName?: string;
  pixKeyType?: string;
  pixKey?: string;
}) {
  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("stores")
      .update({
        name: data.name,
        physical_location: data.location,
        whatsapp_number: data.whatsapp,
        commercial_phone: data.whatsapp,
        description: data.description,
        banner_url: data.bannerUrl,
        bank_name: data.bankName,
        pix_key_type: data.pixKeyType as any,
        pix_key: data.pixKey,
      })
      .eq("id", storeId);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/painel-vendedor/loja");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e?.message || "Erro ao salvar alterações" };
  }
}

