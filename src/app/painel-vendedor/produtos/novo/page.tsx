import { ProductForm } from "@/components/forms/product-form";
import { Badge } from "@/components/ui/badge";
import { PackagePlus } from "lucide-react";
import { cookies } from "next/headers";
import { getSupabaseAdmin, supabase } from "@/lib/supabase";

export const metadata = {
  title: "Cadastrar Novo Produto | Painel do Lojista Brás",
  description: "Cadastre produtos com grade de tamanhos, cores e preços diferenciados para atacado e varejo.",
};

export default async function NovoProdutoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  const dbAdmin = getSupabaseAdmin();

  let storeId: string | undefined;

  if (token) {
    try {
      const { data: authData } = await supabase.auth.getUser(token);
      if (authData?.user) {
        const { data: dbUser } = await dbAdmin
          .from("users")
          .select("id")
          .or(`supabase_uid.eq.${authData.user.id},email.eq.${authData.user.email}`)
          .maybeSingle();

        if (dbUser) {
          const { data: store } = await dbAdmin
            .from("stores")
            .select("id")
            .eq("user_id", dbUser.id)
            .maybeSingle();

          if (store) storeId = store.id;
        }
      }
    } catch (err) {
      console.warn("Aviso ao buscar loja no servidor:", err);
    }
  }

  // Fallback: busca a loja mais recente cadastrada
  if (!storeId) {
    const { data: latestStore } = await dbAdmin
      .from("stores")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestStore) storeId = latestStore.id;
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="bras">Cadastro Rápido</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
          <PackagePlus className="w-7 h-7 text-emerald-600" />
          Cadastrar Nova Peça no Catálogo
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure as fotos, preços de varejo e atacado para sacoleiras, e gere a grade de tamanhos e cores.
        </p>
      </div>

      <ProductForm storeId={storeId} />
    </div>
  );
}
