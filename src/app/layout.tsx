import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartDrawer } from "@/components/marketplace/cart-drawer";

export const metadata: Metadata = {
  title: "Marketplace do Brás & Feira da Madrugada | Atacado e Varejo Direto da Fábrica",
  description:
    "A maior plataforma de moda atacadista e varejo conectando fabricantes e lojistas do Brás, Feira da Madrugada, Vautier e Pari aos compradores de todo o Brasil.",
  keywords: [
    "Brás",
    "Feira da Madrugada",
    "Atacado Moda",
    "Vautier",
    "Roupas no atacado",
    "Sacoleiras",
    "Confecção Brás",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
        {/* Gaveta de Sacola de Compras Global */}
        <CartDrawer />
      </body>
    </html>
  );
}
