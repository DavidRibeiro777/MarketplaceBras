import { notFound } from "next/navigation";
import { MOCK_PRODUCTS } from "@/lib/mock-data";
import { ProductView } from "@/components/marketplace/product-view";
import { ProductCard } from "@/components/marketplace/product-card";
import { Store, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    return { title: "Produto não encontrado | Brás Marketplace" };
  }

  return {
    title: `${product.title} | Atacado Brás`,
    description: `Compre ${product.title} direto do fabricante ${product.storeName} no Brás com preço de atacado para revenda.`,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Busca o produto correspondente
  let product: any = MOCK_PRODUCTS.find((p) => p.slug === slug);

  if (!product) {
    try {
      const { data: dbProduct } = await supabase
        .from("products")
        .select(`
          id,
          title,
          slug,
          description,
          retail_price,
          wholesale_price,
          min_wholesale_qty,
          is_featured,
          stores (
            name,
            slug,
            physical_location
          ),
          categories (
            name
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
        `)
        .eq("slug", slug)
        .maybeSingle();

      if (dbProduct) {
        const store = dbProduct.stores as any;
        const category = dbProduct.categories as any;
        const images = ((dbProduct.product_images as any[]) || []).sort(
          (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
        );
        const variations = ((dbProduct.product_variations as any[]) || []).filter((v) => v.is_active);

        product = {
          id: dbProduct.id,
          title: dbProduct.title,
          slug: dbProduct.slug,
          description: dbProduct.description || "",
          storeName: store?.name || "Loja do Brás",
          storeSlug: store?.slug || "",
          storeLocation: store?.physical_location || "Polo Brás",
          retailPrice: Number(dbProduct.retail_price),
          wholesalePrice: Number(dbProduct.wholesale_price),
          minWholesaleQty: dbProduct.min_wholesale_qty,
          categoryName: category?.name || "Moda Geral",
          isFeatured: dbProduct.is_featured,
          images: images.map((img) => ({ url: img.url, isMain: img.is_main })),
          variations: variations.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock,
            sku: v.sku,
          })),
        };
      }
    } catch (e) {
      // continua com fallback
    }
  }

  if (!product) {
    notFound();
  }

  // Produtos relacionados da mesma categoria ou loja
  const relatedProducts = MOCK_PRODUCTS.filter(
    (p) => p.id !== product!.id && (p.categoryName === product!.categoryName || p.storeSlug === product!.storeSlug)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header com Navegação */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/catalogo"
              className="text-slate-500 hover:text-slate-900 transition-colors p-1 rounded-lg"
              title="Voltar ao catálogo"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2 text-emerald-700 font-black text-xl">
              <Store className="w-6 h-6 text-emerald-600" />
              <span>BRÁS<span className="text-slate-900">MARKET</span></span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/catalogo"
              className="text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo da PDP */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <ProductView product={product} />

        {/* Peças Relacionadas */}
        {relatedProducts.length > 0 && (
          <div className="border-t pt-10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Mais peças recomendadas no Brás
              </h2>
              <Link
                href="/catalogo"
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                Ver todas ↗
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} isWholesaleMode={true} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
