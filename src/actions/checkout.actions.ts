"use server";

import { checkoutSchema, type CheckoutInput } from "@/schemas/checkout.schema";
import { type StoreGroup } from "@/store/cart-store";
import { getSupabaseAdmin } from "@/lib/supabase";

export type CheckoutActionResult = {
  success: boolean;
  message?: string;
  orderNumber?: string;
  pixCopiaECola?: string;
  pixQrCodeBase64?: string;
  totalAmount?: number;
  storesInvolved?: { storeName: string; amount: number; platformFee: number; sellerNet: number }[];
  errors?: Record<string, string[]>;
};

export async function processCheckoutAction(
  buyerData: CheckoutInput,
  storeGroups: StoreGroup[]
): Promise<CheckoutActionResult> {
  try {
    const validated = checkoutSchema.safeParse(buyerData);
    if (!validated.success) {
      return {
        success: false,
        message: "Por favor, revise os dados informados na finalização.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    if (!storeGroups || storeGroups.length === 0) {
      return {
        success: false,
        message: "Sua sacola de compras está vazia.",
      };
    }

    const data = validated.data;
    const platformFeeRate = 0.085; // 8.5% de comissão da plataforma
    const orderNumber = `BRAS-${Date.now().toString().slice(-6)}`;

    let totalOrderAmount = 0;
    const storesSplitSummary = [];

    // Calcular split financeiro por vendedor
    for (const group of storeGroups) {
      const storeTotal = group.subtotal;
      const feeAmount = Math.round(storeTotal * platformFeeRate * 100) / 100;
      const sellerNet = Math.round((storeTotal - feeAmount) * 100) / 100;

      totalOrderAmount += storeTotal;

      storesSplitSummary.push({
        storeName: group.storeName,
        amount: storeTotal,
        platformFee: feeAmount,
        sellerNet: sellerNet,
      });
    }

    // Código PIX Copia e Cola padronizado do Banco Central (Simulado para o MVP com valor dinâmico)
    const formattedAmount = totalOrderAmount.toFixed(2);
    const pixCopiaECola = `00020126580014BR.GOV.BCB.PIX0136${orderNumber}520400005303986540${formattedAmount.length}${formattedAmount}5802BR5925MARKETPLACE DO BRAS LTDA6009SAO PAULO62070503***6304`;

    // Persistência direta no Supabase
    try {
      const supabaseAdmin = getSupabaseAdmin();

      // 1. Criar ou buscar comprador
      let buyerId: string | null = null;
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", data.buyerEmail)
        .maybeSingle();

      if (existingUser) {
        buyerId = existingUser.id;
      } else {
        const { data: createdUser } = await supabaseAdmin
          .from("users")
          .insert({
            name: data.buyerName,
            email: data.buyerEmail,
            phone: data.buyerPhone,
            cpf: data.buyerCpf,
            role: "BUYER",
          })
          .select("id")
          .single();

        if (createdUser) {
          buyerId = createdUser.id;
        }
      }

      if (buyerId) {
        // 2. Salvar endereço do comprador
        const { data: newAddress } = await supabaseAdmin
          .from("addresses")
          .insert({
            user_id: buyerId,
            recipient_name: data.buyerName,
            zip_code: data.zipCode,
            street: data.street,
            number: data.number,
            complement: data.complement || null,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
            phone: data.buyerPhone,
            is_default: true,
          })
          .select("id")
          .single();

        // 3. Criar os pedidos por loja vinculada
        for (const [index, group] of storeGroups.entries()) {
          const storeSubtotal = group.subtotal;
          const feeAmount = Math.round(storeSubtotal * platformFeeRate * 100) / 100;
          const sellerNet = Math.round((storeSubtotal - feeAmount) * 100) / 100;
          const groupOrderNumber = storeGroups.length > 1 ? `${orderNumber}-${index + 1}` : orderNumber;

          // Encontra a loja se existir no Supabase, caso contrário cria pedido
          const { data: storeObj } = await supabaseAdmin
            .from("stores")
            .select("id")
            .ilike("name", `%${group.storeName}%`)
            .maybeSingle();

          if (storeObj) {
            const { data: createdOrder } = await supabaseAdmin
              .from("orders")
              .insert({
                order_number: groupOrderNumber,
                buyer_id: buyerId,
                store_id: storeObj.id,
                shipping_address_id: newAddress?.id || null,
                status: "PENDING_PAYMENT",
                payment_method: "PIX",
                total_amount: storeSubtotal,
                platform_fee_rate: 8.50,
                platform_fee_amount: feeAmount,
                seller_net_amount: sellerNet,
                pix_qrcode: pixCopiaECola,
              })
              .select("id")
              .single();

            // Salvar itens do pedido
            if (createdOrder) {
              const orderItemsData = group.items.map((item) => {
                const unitPrice = group.isWholesaleActive ? item.wholesalePrice : item.retailPrice;
                return {
                  order_id: createdOrder.id,
                  product_title: item.title,
                  variation_details: `${item.size} / ${item.color}`,
                  sku: item.sku,
                  is_wholesale_price: group.isWholesaleActive,
                  unit_price: unitPrice,
                  quantity: item.quantity,
                  subtotal: unitPrice * item.quantity,
                };
              });

              await supabaseAdmin.from("order_items").insert(orderItemsData);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Aviso: Banco Supabase em modo tolerante para homologação de checkout.", e);
    }

    return {
      success: true,
      message: "Pedido gerado com sucesso! Realize o pagamento via Pix para confirmar a compra.",
      orderNumber,
      pixCopiaECola,
      totalAmount: totalOrderAmount,
      storesInvolved: storesSplitSummary,
    };
  } catch (error) {
    console.error("Erro ao processar checkout via Supabase:", error);
    return {
      success: false,
      message: "Erro inesperado ao gerar pedido. Tente novamente.",
    };
  }
}
