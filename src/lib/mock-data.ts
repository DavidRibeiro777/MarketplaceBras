/**
 * Catálogo inicial de demonstração com confecções reais do Brás
 */
export const MOCK_PRODUCTS = [
  {
    id: "mock-prod-1",
    title: "Vestido Midi Canelado Manga Curta Fenda Lateral",
    slug: "vestido-midi-canelado-manga-curta",
    storeName: "Bella Flor Confecções",
    storeSlug: "bella-flor-confeccoes",
    storeLocation: "Shopping Vautier - Corredor B, Box 14",
    retailPrice: 59.90,
    wholesalePrice: 28.00,
    minWholesaleQty: 6,
    categoryName: "Moda Feminina",
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
        isMain: true,
      },
    ],
    variations: [
      { id: "v1", size: "P", color: "Preto", stock: 24, sku: "BF-VMD-P-BLK" },
      { id: "v2", size: "M", color: "Preto", stock: 35, sku: "BF-VMD-M-BLK" },
      { id: "v3", size: "G", color: "Preto", stock: 18, sku: "BF-VMD-G-BLK" },
      { id: "v4", size: "M", color: "Terracota", stock: 40, sku: "BF-VMD-M-TER" },
      { id: "v5", size: "G", color: "Terracota", stock: 22, sku: "BF-VMD-G-TER" },
    ],
  },
  {
    id: "mock-prod-2",
    title: "Calça Jeans Feminina Wide Leg Cintura Alta 100% Algodão",
    slug: "calca-jeans-wide-leg-cintura-alta",
    storeName: "Paulista Jeans Brás",
    storeSlug: "paulista-jeans-bras",
    storeLocation: "Galeria Pagé Brás - Piso Térreo",
    retailPrice: 119.90,
    wholesalePrice: 52.00,
    minWholesaleQty: 10,
    categoryName: "Jeans & Sarja",
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
        isMain: true,
      },
    ],
    variations: [
      { id: "v6", size: "36", color: "Jeans Claro", stock: 15, sku: "PJ-WDL-36" },
      { id: "v7", size: "38", color: "Jeans Claro", stock: 30, sku: "PJ-WDL-38" },
      { id: "v8", size: "40", color: "Jeans Claro", stock: 32, sku: "PJ-WDL-40" },
      { id: "v9", size: "42", color: "Jeans Claro", stock: 20, sku: "PJ-WDL-42" },
      { id: "v10", size: "44", color: "Jeans Claro", stock: 12, sku: "PJ-WDL-44" },
    ],
  },
  {
    id: "mock-prod-3",
    title: "Conjunto Alfaiataria Colete + Short Saia em Linho",
    slug: "conjunto-alfaiataria-colete-short-saia",
    storeName: "Atacadão da Moda Pari",
    storeSlug: "atacadao-da-moda-pari",
    storeLocation: "Rua Miller, 450",
    retailPrice: 98.00,
    wholesalePrice: 45.00,
    minWholesaleQty: 6,
    categoryName: "Moda Feminina",
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800",
        isMain: true,
      },
    ],
    variations: [
      { id: "v11", size: "P", color: "Areia / Cru", stock: 18, sku: "AMP-ALF-P" },
      { id: "v12", size: "M", color: "Areia / Cru", stock: 26, sku: "AMP-ALF-M" },
      { id: "v13", size: "G", color: "Areia / Cru", stock: 14, sku: "AMP-ALF-G" },
      { id: "v14", size: "M", color: "Verde Oliva", stock: 20, sku: "AMP-ALF-M-VD" },
    ],
  },
  {
    id: "mock-prod-4",
    title: "Camisa Masculina Manga Longa Linho Puro Slim Fit",
    slug: "camisa-masculina-manga-longa-linho-slim",
    storeName: "Confecções Miller Brás",
    storeSlug: "confeccoes-miller-bras",
    storeLocation: "Feira da Madrugada - Setor Verde",
    retailPrice: 89.90,
    wholesalePrice: 39.00,
    minWholesaleQty: 6,
    categoryName: "Moda Masculina",
    isFeatured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800",
        isMain: true,
      },
    ],
    variations: [
      { id: "v15", size: "1 (P)", color: "Branco", stock: 25, sku: "CML-BR-P" },
      { id: "v16", size: "2 (M)", color: "Branco", stock: 40, sku: "CML-BR-M" },
      { id: "v17", size: "3 (G)", color: "Branco", stock: 30, sku: "CML-BR-G" },
      { id: "v18", size: "4 (GG)", color: "Branco", stock: 18, sku: "CML-BR-GG" },
      { id: "v19", size: "2 (M)", color: "Azul Bebê", stock: 22, sku: "CML-AZ-M" },
    ],
  },
  {
    id: "mock-prod-5",
    title: "Vestido Curto Babado Três Marias Viscolinho",
    slug: "vestido-curto-babado-viscolinho",
    storeName: "Bella Flor Confecções",
    storeSlug: "bella-flor-confeccoes",
    storeLocation: "Shopping Vautier - Corredor B, Box 14",
    retailPrice: 75.00,
    wholesalePrice: 32.50,
    minWholesaleQty: 6,
    categoryName: "Moda Feminina",
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800",
        isMain: true,
      },
    ],
    variations: [
      { id: "v20", size: "Único (38 ao 44)", color: "Estampado Floral", stock: 50, sku: "BF-V3M-UN" },
      { id: "v21", size: "Único (38 ao 44)", color: "Fúcsia", stock: 35, sku: "BF-V3M-FUC" },
    ],
  },
  {
    id: "mock-prod-6",
    title: "Cropped Canelado Gola Alta Sem Bojo (Fardo com 10 unid)",
    slug: "cropped-canelado-gola-alta-atacado",
    storeName: "Malharia do Brás Direto da Fábrica",
    storeSlug: "malharia-do-bras",
    storeLocation: "Rua Oriente, 120",
    retailPrice: 25.00,
    wholesalePrice: 11.90,
    minWholesaleQty: 10,
    categoryName: "Moda Feminina",
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800",
        isMain: true,
      },
    ],
    variations: [
      { id: "v22", size: "Único", color: "Cores Sortidas (Grade Fechada)", stock: 120, sku: "MLB-CRP-GRD" },
    ],
  },
];

export type AdminStoreItem = {
  id: string;
  name: string;
  slug: string;
  cnpj: string | null;
  commercialPhone: string;
  whatsappNumber: string;
  physicalLocation: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  bankName: string | null;
  pixKeyType: string | null;
  pixKey: string | null;
  accountHolderDocument: string | null;
  createdAt: string;
};

// Lojas demonstrativas para o painel de moderação admin
export const MOCK_ADMIN_STORES: AdminStoreItem[] = [
  {
    id: "store-adm-1",
    name: "Bella Flor Confecções",
    slug: "bella-flor-confeccoes",
    cnpj: "34.123.456/0001-78",
    commercialPhone: "(11) 98765-4321",
    whatsappNumber: "(11) 98765-4321",
    physicalLocation: "Shopping Vautier Premium - Corredor B, Box 14",
    status: "APPROVED",
    bankName: "Itaú Unibanco",
    pixKeyType: "CNPJ",
    pixKey: "34123456000178",
    accountHolderDocument: "34.123.456/0001-78",
    createdAt: "2026-09-20",
  },
  {
    id: "store-adm-2",
    name: "Paulista Jeans Brás",
    slug: "paulista-jeans-bras",
    cnpj: "45.987.654/0001-12",
    commercialPhone: "(11) 97777-8888",
    whatsappNumber: "(11) 97777-8888",
    physicalLocation: "Galeria Pagé Brás - Piso Térreo, Loja 102",
    status: "APPROVED",
    bankName: "Banco do Brasil",
    pixKeyType: "CNPJ",
    pixKey: "45987654000112",
    accountHolderDocument: "45.987.654/0001-12",
    createdAt: "2026-09-21",
  },
  {
    id: "store-adm-3",
    name: "Confecções Madrugada Pari",
    slug: "confeccoes-madrugada-pari",
    cnpj: "52.333.444/0001-90",
    commercialPhone: "(11) 96666-5555",
    whatsappNumber: "(11) 96666-5555",
    physicalLocation: "Feira da Madrugada - Setor Laranja, Box 33",
    status: "PENDING",
    bankName: "Nubank",
    pixKeyType: "CPF",
    pixKey: "234.567.890-12",
    accountHolderDocument: "234.567.890-12",
    createdAt: "2026-09-22",
  },
];

export type VendorOrderDisplay = {
  id: string;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  shippingType: string;
  shippingDetails?: string;
  destinationCity: string;
  status: "PENDING_PAYMENT" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  totalAmount: number;
  sellerNetAmount: number;
  itemsCount: number;
  itemsSummary: string;
  createdAt: string;
};

export const MOCK_VENDOR_ORDERS: VendorOrderDisplay[] = [
  {
    id: "ord-v-1",
    orderNumber: "PED-2026-9042",
    buyerName: "Mariana Souza (Sacoleira)",
    buyerPhone: "(31) 98888-1234",
    shippingType: "Ônibus de Excursão",
    shippingDetails: "Caravana das Gerais - Pátio Vautier, Vaga 18",
    destinationCity: "Belo Horizonte - MG",
    status: "PAID",
    totalAmount: 336.0,
    sellerNetAmount: 307.44,
    itemsCount: 12,
    itemsSummary: "Vestido Midi Canelado (6 pçs P, M) + Cropped Gola Alta (6 pçs)",
    createdAt: "Hoje, às 14:32",
  },
  {
    id: "ord-v-2",
    orderNumber: "PED-2026-8911",
    buyerName: "Lojas Moda & Estilo ME",
    buyerPhone: "(71) 99111-2222",
    shippingType: "Transportadora Jadlog",
    shippingDetails: "Frete FOB por conta do destinatário",
    destinationCity: "Salvador - BA",
    status: "PROCESSING",
    totalAmount: 520.0,
    sellerNetAmount: 475.8,
    itemsCount: 10,
    itemsSummary: "Calça Jeans Wide Leg (10 pçs: 36 ao 44)",
    createdAt: "Hoje, às 11:15",
  },
  {
    id: "ord-v-3",
    orderNumber: "PED-2026-7850",
    buyerName: "Clara Mendes",
    buyerPhone: "(11) 97654-3210",
    shippingType: "Correios (Sedex)",
    shippingDetails: "Rastreio: BR892348234SP",
    destinationCity: "Campinas - SP",
    status: "SHIPPED",
    totalAmount: 119.9,
    sellerNetAmount: 109.7,
    itemsCount: 1,
    itemsSummary: "Calça Jeans Wide Leg (1 pç: Tam 38)",
    createdAt: "Ontem",
  },
];
