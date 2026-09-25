"use server";

import { getSupabaseAdmin } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { type VendorOrderDisplay } from "@/lib/mock-data";
import { cookies } from "next/headers";

export type { VendorOrderDisplay };

export async function getVendorOrdersAction(storeId?: string): Promise<VendorOrderDisplay[]> {
  try {
    const supabase = getSupabaseAdmin();
    let targetStoreId = storeId;

    // Se storeId não foi fornecido, descobre a partir do cookie de autenticação
    if (!targetStoreId) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("sb-access-token")?.value;
        if (token) {
          const { data: authData } = await supabase.auth.getUser(token);
          if (authData?.user) {
            const { data: dbUser } = await supabase
              .from("users")
              .select("id")
              .or(`supabase_uid.eq.${authData.user.id},email.eq.${authData.user.email}`)
              .maybeSingle();

            if (dbUser) {
              const { data: userStore } = await supabase
                .from("stores")
                .select("id")
                .eq("user_id", dbUser.id)
                .maybeSingle();

              if (userStore) targetStoreId = userStore.id;
            }
          }
        }
      } catch (cookieErr) {
        console.warn("Aviso ao ler cookie de sessão em getVendorOrdersAction:", cookieErr);
      }
    }

    // Se ainda não identificou a loja, tenta buscar a loja mais recente cadastrada
    if (!targetStoreId) {
      const { data: latestStore } = await supabase
        .from("stores")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestStore) {
        targetStoreId = latestStore.id;
      }
    }

    // Se não há loja registrada, a conta não tem pedidos
    if (!targetStoreId) {
      return [];
    }

    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        order_number,
        status,
        total_amount,
        seller_net_amount,
        shipping_carrier,
        tracking_code,
        created_at,
        users!orders_buyer_id_fkey (
          name,
          phone
        ),
        addresses (
          city,
          state
        ),
        order_items (
          id,
          product_title,
          variation_details,
          quantity
        )
      `
      )
      .eq("store_id", targetStoreId)
      .order("created_at", { ascending: false });

    if (!error && dbOrders && dbOrders.length > 0) {
      return dbOrders.map((o: any) => {
        const buyer = o.users;
        const address = o.addresses;
        const items = o.order_items || [];
        const itemsCount = items.reduce((sum: number, it: any) => sum + (it.quantity ?? 1), 0);
        const itemsSummary = items
          .slice(0, 2)
          .map((it: any) => `${it.product_title} (${it.variation_details})`)
          .join(" + ");

        return {
          id: o.id,
          orderNumber: o.order_number,
          buyerName: buyer?.name || "Comprador",
          buyerPhone: buyer?.phone || "",
          shippingType: o.shipping_carrier || "Ônibus de Excursão",
          shippingDetails: o.tracking_code ? `Rastreio: ${o.tracking_code}` : undefined,
          destinationCity: address?.city ? `${address.city} - ${address.state}` : "São Paulo - SP",
          status: o.status as VendorOrderDisplay["status"],
          totalAmount: Number(o.total_amount),
          sellerNetAmount: Number(o.seller_net_amount),
          itemsCount,
          itemsSummary: itemsSummary || "Peças de confecção",
          createdAt: o.created_at ? new Date(o.created_at).toLocaleDateString("pt-BR") : "",
        };
      });
    }

    // Retorna vazio caso não existam pedidos reais para esta loja
    return [];
  } catch (e) {
    console.error("Erro ao buscar pedidos no Supabase:", e);
    return [];
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: VendorOrderDisplay["status"]
) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    revalidatePath("/painel-vendedor/pedidos");
    return { success: true };
  } catch (e) {
    return { success: true };
  }
}
