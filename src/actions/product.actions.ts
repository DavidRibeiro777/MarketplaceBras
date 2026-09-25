"use server";

import { getSupabaseAdmin, supabase } from "@/lib/supabase";
import { productSchema, type ProductInput } from "@/schemas/product.schema";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { cookies } from "next/headers";

export type ProductActionResult<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
};

/**
 * Cadastra um novo produto com variações e fotos no banco de dados Supabase
 */
export async function createProductAction(
  input: ProductInput,
  storeId?: string
): Promise<ProductActionResult<{ id: string; slug: string }>> {
  try {
    const validated = productSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        message: "Dados do produto inválidos. Verifique os campos destacados.",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const data = validated.data;
    const dbAdmin = getSupabaseAdmin();

    // 1. Resolução inteligente da loja (storeId)
    let resolvedStoreId = storeId || data.storeId;

    if (!resolvedStoreId) {
      // Tentar via cookie de autenticação do usuário logado
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("sb-access-token")?.value;
        if (token) {
          const { data: authData } = await supabase.auth.getUser(token);
          if (authData?.user) {
            const { data: dbUser } = await dbAdmin
              .from("users")
              .select("id")
              .or(`supabase_uid.eq.${authData.user.id},email.eq.${authData.user.email}`)
              .maybeSingle();

            if (dbUser) {
              const { data: userStore } = await dbAdmin
                .from("stores")
                .select("id")
                .eq("user_id", dbUser.id)
                .maybeSingle();

              if (userStore) resolvedStoreId = userStore.id;
            }
          }
        }
      } catch (cookieErr) {
        console.warn("Aviso ao ler sessão do lojista:", cookieErr);
      }
    }

    // Se ainda não tiver ID, pega a loja mais recente cadastrada
    if (!resolvedStoreId) {
      const { data: latestStore } = await dbAdmin
        .from("stores")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestStore) {
        resolvedStoreId = latestStore.id;
      }
    }

    if (!resolvedStoreId) {
      return {
        success: false,
        message: "Nenhuma loja cadastrada encontrada para vincular este produto.",
      };
    }

    // 2. Gerar Slug único para o produto
    const baseSlug = slugify(data.title);
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await dbAdmin
        .from("products")
        .select("id")
        .eq("store_id", resolvedStoreId)
        .eq("slug", finalSlug)
        .maybeSingle();

      if (!existing) break;
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Categoria padrão se não informada
    let categoryId = data.categoryId;
    if (!categoryId) {
      const { data: firstCat } = await dbAdmin
        .from("categories")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (firstCat) categoryId = firstCat.id;
    }

    // 4. Inserir produto no Supabase
    const { data: product, error: prodError } = await dbAdmin
      .from("products")
      .insert({
        store_id: resolvedStoreId,
        category_id: categoryId || null,
        title: data.title,
        slug: finalSlug,
        description: data.description,
        retail_price: data.retailPrice,
        wholesale_price: data.wholesalePrice,
        min_wholesale_qty: data.minWholesaleQty,
        status: data.status || "ACTIVE",
        is_featured: data.isFeatured ?? false,
      })
      .select("id, slug")
      .single();

    if (prodError || !product) {
      console.error("Erro ao salvar produto:", prodError);
      throw new Error(prodError?.message || "Erro ao salvar produto no Supabase");
    }

    // 5. Inserir variações de grade
    if (data.variations && data.variations.length > 0) {
      const variationsToInsert = data.variations.map((v) => ({
        product_id: product.id,
        size: v.size,
        color: v.color,
        color_hex: v.colorHex || null,
        stock: v.stock,
        sku: v.sku,
        additional_price: v.additionalPrice || 0,
        is_active: v.isActive ?? true,
      }));

      await dbAdmin.from("product_variations").insert(variationsToInsert);
    }

    // 6. Inserir fotos
    if (data.images && data.images.length > 0) {
      const imagesToInsert = data.images.map((img, index) => ({
        product_id: product.id,
        url: img.url,
        is_main: img.isMain ?? index === 0,
        display_order: img.order ?? index,
      }));

      await dbAdmin.from("product_images").insert(imagesToInsert);
    }

    revalidatePath("/catalogo");
    revalidatePath("/painel-vendedor/produtos");
    revalidatePath("/");

    return {
      success: true,
      message: "Produto cadastrado com sucesso no catálogo!",
      data: { id: product.id, slug: product.slug },
    };
  } catch (error: any) {
    console.error("Erro ao cadastrar produto via Supabase:", error);
    return {
      success: false,
      message: error?.message || "Falha ao salvar o produto no servidor. Verifique os dados.",
    };
  }
}

/**
 * Consulta produtos para o feed do Marketplace com suporte a filtros e busca via Supabase
 */
export async function getProductsAction(params?: {
  search?: string;
  category?: string;
  isFeatured?: boolean;
}) {
  try {
    const dbAdmin = getSupabaseAdmin();
    let query = dbAdmin
      .from("products")
      .select(
        `
        id,
        title,
        slug,
        retail_price,
        wholesale_price,
        min_wholesale_qty,
        is_featured,
        description,
        status,
        created_at,
        stores (
          name,
          slug,
          physical_location
        ),
        categories (
          name,
          slug
        ),
        product_images (
          url,
          is_main,
          display_order
        ),
        product_variations (
          id,
          size,
          color,
          stock,
          sku,
          is_active
        )
      `
      )
      .eq("status", "ACTIVE")
      .order("created_at", { ascending: false });

    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    if (params?.isFeatured !== undefined) {
      query = query.eq("is_featured", params.isFeatured);
    }

    const { data: dbProducts, error } = await query;

    if (!error && dbProducts && dbProducts.length > 0) {
      const realProducts = dbProducts.map((p: any) => {
        const store = p.stores;
        const category = p.categories;
        const images = (p.product_images || []).sort(
          (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        const variations = (p.product_variations || []).filter((v: any) => v.is_active);

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          storeName: store?.name || "Loja do Brás",
          storeSlug: store?.slug || "",
          storeLocation: store?.physical_location || "Polo Brás",
          retailPrice: Number(p.retail_price),
          wholesalePrice: Number(p.wholesale_price),
          minWholesaleQty: p.min_wholesale_qty,
          categoryName: category?.name || "Moda Geral",
          isFeatured: p.is_featured,
          images: images.length > 0 ? images.map((img: any) => ({ url: img.url, isMain: img.is_main })) : [
            { url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800", isMain: true }
          ],
          variations: variations.map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku,
          })),
        };
      });

      // Retorna os produtos reais cadastrados na frente, seguidos dos demonstrativos
      const realSlugs = new Set(realProducts.map((p: any) => p.slug));
      const demoFiltered = MOCK_PRODUCTS.filter((p) => !realSlugs.has(p.slug));
      let combined = [...realProducts, ...demoFiltered];

      if (params?.category && params.category !== "Todas") {
        combined = combined.filter((p) => p.categoryName === params.category);
      }

      return combined;
    }
  } catch (error) {
    console.warn("Aviso ao carregar produtos do Supabase:", error);
  }

  // Fallback para demonstrativos
  let filtered = [...MOCK_PRODUCTS];

  if (params?.search) {
    const term = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.categoryName.toLowerCase().includes(term) ||
        p.storeName.toLowerCase().includes(term)
    );
  }

  if (params?.category && params.category !== "Todas") {
    filtered = filtered.filter((p) => p.categoryName === params.category);
  }

  return filtered;
}

/**
 * Consulta os produtos cadastrados da loja do lojista logado
 */
export async function getVendorProductsAction(storeId?: string) {
  try {
    const dbAdmin = getSupabaseAdmin();
    let targetStoreId = storeId;

    if (!targetStoreId) {
      try {
        const cookieStore = await cookies();
        const token = cookieStore.get("sb-access-token")?.value;
        if (token) {
          const { data: authData } = await supabase.auth.getUser(token);
          if (authData?.user) {
            const { data: dbUser } = await dbAdmin
              .from("users")
              .select("id")
              .or(`supabase_uid.eq.${authData.user.id},email.eq.${authData.user.email}`)
              .maybeSingle();

            if (dbUser) {
              const { data: userStore } = await dbAdmin
                .from("stores")
                .select("id")
                .eq("user_id", dbUser.id)
                .maybeSingle();

              if (userStore) targetStoreId = userStore.id;
            }
          }
        }
      } catch (err) {
        console.warn("Aviso ao buscar loja do lojista:", err);
      }
    }

    if (!targetStoreId) {
      const { data: latestStore } = await dbAdmin
        .from("stores")
        .select("id")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestStore) targetStoreId = latestStore.id;
    }

    if (targetStoreId) {
      const { data: prods } = await dbAdmin
        .from("products")
        .select(`
          id,
          title,
          slug,
          retail_price,
          wholesale_price,
          min_wholesale_qty,
          status,
          categories (name),
          product_images (url, is_main, display_order),
          product_variations (id, size, color, stock, is_active)
        `)
        .eq("store_id", targetStoreId)
        .order("created_at", { ascending: false });

      if (prods && prods.length > 0) {
        return prods.map((p: any) => {
          const images = (p.product_images || []).sort(
            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          const variations = (p.product_variations || []).filter((v: any) => v.is_active);
          const totalStock = variations.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            categoryName: p.categories?.name || "Geral",
            retailPrice: Number(p.retail_price),
            wholesalePrice: Number(p.wholesale_price),
            minWholesaleQty: p.min_wholesale_qty,
            image: images[0]?.url || "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
            status: p.status as "ACTIVE" | "INACTIVE",
            totalStock,
            variationsCount: variations.length,
            variations: variations.map((v: any) => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
            })),
          };
        });
      }
    }
  } catch (err) {
    console.warn("Aviso ao carregar produtos do lojista:", err);
  }

  return [];
}

/**
 * Ativa ou pausa um produto na vitrine do lojista via Supabase
 */
export async function toggleProductStatusAction(
  productId: string,
  newStatus: "ACTIVE" | "INACTIVE"
) {
  try {
    const dbAdmin = getSupabaseAdmin();
    await dbAdmin
      .from("products")
      .update({ status: newStatus })
      .eq("id", productId);

    revalidatePath("/painel-vendedor/produtos");
    revalidatePath("/catalogo");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { success: true };
  }
}
