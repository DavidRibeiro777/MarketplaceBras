import { getAdminStoresAction } from "@/actions/admin.actions";
import { AdminStoresTable } from "@/components/admin/admin-stores-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, DollarSign, TrendingUp, Users, ShoppingBag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata = {
  title: "Painel Administrativo | Moderação e Métricas Brás Marketplace",
  description: "Gerenciamento de lojistas, aprovação de contas e acompanhamento financeiro de split.",
};

export default async function AdminDashboardPage() {
  const stores = await getAdminStoresAction();

  const totalStores = stores.length;
  const approvedStores = stores.filter((s) => s.status === "APPROVED").length;
  const pendingStores = stores.filter((s) => s.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Visão Geral da Plataforma</h1>
        <p className="text-xs text-slate-500 mt-1">
          Acompanhe o volume de vendas, comissões retidas e modere os novos cadastros de lojistas do Brás
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Lojas Ativas */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">
              Lojas Homologadas
            </CardTitle>
            <Store className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">{approvedStores}</div>
            <p className="text-[11px] text-slate-500 mt-1">
              {pendingStores > 0 ? (
                <span className="text-amber-600 font-bold">
                  {pendingStores} {pendingStores === 1 ? "loja pendente" : "lojas pendentes"} de aprovação
                </span>
              ) : (
                "Todas as lojas revisadas"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Volume de Vendas */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">
              Volume Transacionado
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">
              {formatCurrency(148500.0)}
            </div>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              +18.4% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        {/* Comissão da Plataforma (8.5%) */}
        <Card className="shadow-xs border-slate-200 bg-emerald-50/40 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-emerald-800 uppercase">
              Comissão Retida (8.5%)
            </CardTitle>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-emerald-700">
              {formatCurrency(12622.5)}
            </div>
            <p className="text-[11px] text-emerald-800 font-medium mt-1">
              Split automático via Mercado Pago
            </p>
          </CardContent>
        </Card>

        {/* Pedidos Atacadistas */}
        <Card className="shadow-xs border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase">
              Pedidos de Sacoleiras
            </CardTitle>
            <ShoppingBag className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900">894</div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ticket médio de atacado: R$ 860,00
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABELA DE LOJISTAS E APROVAÇÃO */}
      <AdminStoresTable initialStores={stores} />
    </div>
  );
}
