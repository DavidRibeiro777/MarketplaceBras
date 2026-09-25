import { VendorProductsTable, type VendorProductItem } from "@/components/vendor/vendor-products-table";
import { getVendorProductsAction } from "@/actions/product.actions";

export const metadata = {
  title: "Meus Produtos & Estoque | Painel do Lojista Brás",
  description: "Gerencie o estoque das suas peças de confecção, preços de atacado e variações de grade.",
};

export default async function VendorProductsPage() {
  // Busca exclusivamente os produtos reais cadastrados por este lojista no Supabase
  const dbProducts = await getVendorProductsAction();

  return (
    <div className="space-y-6">
      <VendorProductsTable initialProducts={(dbProducts || []) as VendorProductItem[]} />
    </div>
  );
}
