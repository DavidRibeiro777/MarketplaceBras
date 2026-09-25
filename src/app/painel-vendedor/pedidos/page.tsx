import { VendorOrdersTable } from "@/components/vendor/vendor-orders-table";
import { getVendorOrdersAction } from "@/actions/order.actions";

export const metadata = {
  title: "Pedidos & Despacho | Painel do Lojista Brás",
  description: "Gerencie os pedidos recebidos de sacoleiras e acompanhe o despacho nos ônibus do Brás.",
};

export default async function VendorOrdersPage() {
  const orders = await getVendorOrdersAction();

  return (
    <div className="space-y-6">
      <VendorOrdersTable initialOrders={orders} />
    </div>
  );
}
