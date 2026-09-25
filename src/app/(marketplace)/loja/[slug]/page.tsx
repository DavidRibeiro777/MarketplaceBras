import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ProductCard } from "@/components/marketplace/product-card";
import { Badge } from "@/components/ui/badge";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { StorefrontHeader } from "@/components/marketplace/storefront-header";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const storeProducts = MOCK_PRODUCTS.filter((p) => p.storeSlug === slug);

  if (storeProducts.length === 0) {
    return { title: "Loja não encontrada | Brás Marketplace" };
  }

  const storeName = storeProducts[0].storeName;
  return {
    title: `${storeName} | Catálogo Oficial no Brás`,
    description: `Confira o catálogo exclusivo de atacado e varejo da loja ${storeName} no polo de confecções do Brás.`,
  };
}

export default async function StorefrontPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Busca os produtos pertencentes a esta loja (Mock inicial)
  let products = MOCK_PRODUCTS.filter((p) => p.storeSlug === slug);
  let storeInfo = {
    name: products[0]?.storeName || "Loja do Brás",
    slug,
    location: products[0]?.storeLocation || "Shopping Vautier Premium, Brás - SP",
    description:
      "Fabricação própria de moda feminina e confecções. Atendemos sacoleiras, revendedoras e lojistas de todo o Brasil com preço de fábrica e envio por excursão ou Correios.",
    phone: "(11) 98765-4321",
    whatsapp: "5511987654321",
    rating: 4.9,
    ordersCompleted: 1420,
    bannerUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1600",
  };

  if (products.length === 0) {
    try {
      const { data: dbStore } = await supabase
        .from("stores")
        .select(`
          id,
          name,
          slug,
          description,
          banner_url,
          commercial_phone,
          whatsapp_number,
          physical_location,
          products (
            id,
            title,
            slug,
            retail_price,
            wholesale_price,
            min_wholesale_qty,
            is_featured,
            status,
            categories (name),
            product_images (url, is_main, display_order),
            product_variations (id, size, color, stock, sku, is_active)
          )
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (dbStore) {
        storeInfo = {
          name: dbStore.name,
          slug: dbStore.slug,
          location: dbStore.physical_location || "Polo Brás - SP",
          description: dbStore.description || storeInfo.description,
          phone: dbStore.commercial_phone,
          whatsapp: dbStore.whatsapp_number.replace(/\D/g, ""),
          rating: 5.0,
          ordersCompleted: 10,
          bannerUrl: dbStore.banner_url || storeInfo.bannerUrl,
        };

        const activeProducts = (dbStore.products || []).filter(
          (p: any) => p.status === "ACTIVE"
        );

        products = activeProducts.map((p: any) => {
          const images = (p.product_images || []).sort(
            (a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0)
          );
          const variations = (p.product_variations || []).filter((v: any) => v.is_active);

          return {
            id: p.id,
            title: p.title,
            slug: p.slug,
            storeName: dbStore.name,
            storeSlug: dbStore.slug,
            storeLocation: dbStore.physical_location || "Polo Brás",
            retailPrice: Number(p.retail_price),
            wholesalePrice: Number(p.wholesale_price),
            minWholesaleQty: p.min_wholesale_qty,
            categoryName: (p.categories as any)?.name || "Moda Geral",
            isFeatured: p.is_featured,
            images: images.map((img: any) => ({ url: img.url, isMain: img.is_main })),
            variations: variations.map((v: any) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku,
            })),
          };
        });
      }
    } catch (e) {
      // continua com fallback
    }
  }

  if (products.length === 0 && !storeInfo.name) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* CABEÇALHO DO STOREFRONT */}
      <StorefrontHeader storeInfo={storeInfo} />

      {/* CATÁLOGO EXCLUSIVO DA LOJA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Catálogo Exclusivo da Loja
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Peças disponíveis para pronta entrega ou pedido de confecção
            </p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {products.length} peças disponíveis
          </Badge>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-slate-500 text-sm">
            Nenhum produto cadastrado por esta loja no momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isWholesaleMode={true} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
