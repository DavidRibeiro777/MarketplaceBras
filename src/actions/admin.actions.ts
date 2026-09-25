"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { MOCK_ADMIN_STORES, type AdminStoreItem } from "@/lib/mock-data";

export async function getAdminStoresAction(): Promise<AdminStoreItem[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data: dbStores, error } = await supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && dbStores && dbStores.length > 0) {
      return (dbStores as any[]).map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        cnpj: s.cnpj,
        commercialPhone: s.commercial_phone,
        whatsappNumber: s.whatsapp_number,
        physicalLocation: s.physical_location,
        status: s.status as AdminStoreItem["status"],
        bankName: s.bank_name,
        pixKeyType: s.pix_key_type,
        pixKey: s.pix_key,
        accountHolderDocument: s.account_holder_document,
        createdAt: s.created_at ? s.created_at.split("T")[0] : "",
      }));
    }
  } catch (e) {
    console.error("Erro ao buscar lojas do admin no Supabase:", e);
  }

  return MOCK_ADMIN_STORES;
}

export async function updateStoreStatusAction(
  storeId: string,
  newStatus: "APPROVED" | "REJECTED" | "SUSPENDED"
) {
  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("stores")
      .update({ status: newStatus })
      .eq("id", storeId);

    if (error) {
      throw error;
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: `Loja ${newStatus === "APPROVED" ? "aprovada" : "atualizada"} com sucesso!`,
    };
  } catch (e) {
    console.warn("Aviso: Falha ao atualizar status no Supabase, modo demonstração ativo.", e);
    return {
      success: true,
      message: `Status alterado para ${newStatus} (Modo Demonstração)`,
    };
  }
}
