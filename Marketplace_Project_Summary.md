# Marketplace Brás & Feira da Madrugada – Resumo Completo

## Visão Geral
Projeto de marketplace **multi‑vendor** (similar ao Mercado Livre / Shopee) focado em lojistas e fabricantes do Brás e da Feira da Madrugada. O objetivo é oferecer uma experiência mobile‑first, alta performance e foco em conversão, com áreas distintas para **Comprador**, **Vendedor (Loja)** e **Administrador**.

---
## Funcionalidades já implementadas

### Front‑end (Next.js 15 – App Router)
- **Layout global** (`src/app/layout.tsx`) com header e drawer de carrinho.
- **Header** (`src/components/layout/header.tsx`) – logo, navegação, botão de carrinho com contador.
- **Cart Drawer** (`src/components/marketplace/cart-drawer.tsx`) – visualização agrupada por loja, cálculo de preço atacado, botão de checkout.
- **Home / Hero** (`src/app/page.tsx`).
- **Catálogo** (`src/app/(marketplace)/catalogo/page.tsx`).
- **Página de detalhe do produto (PDP)** (`src/app/(marketplace)/produto/[slug]/page.tsx`) com componente `ProductView` que exibe galeria, variações de cor/tamanho e botão “Adicionar ao carrinho”.
- **Cards de produto** (`src/components/marketplace/product-card.tsx`).
- **Storefront (loja do vendedor)** (`src/app/(marketplace)/loja/[slug]/page.tsx`) com header de loja (`StorefrontHeader`).
- **Checkout** (`src/app/(marketplace)/checkout/page.tsx`) – formulário do comprador, escolha de frete, resumo do pedido, geração de código PIX “Copia‑e‑cola”, cálculo de split de comissão (8,5 %).
- **Componentes reutilizáveis**: Header, CartDrawer, ProductView, ProductCard, StorefrontHeader.

### Estado & Lógica de Negócio
- **Zustand cart store** (`src/store/cart-store.ts`) – carrinho multi‑vendor, cálculo de ativação de preço atacado, persistência em `localStorage`.
- **Zod schemas** (`src/schemas/product.schema.ts`, `src/schemas/checkout.schema.ts`) – validação de dados de produto e checkout.

### Server Actions (APIs internas) – atualmente usando **mock data**
- `src/actions/product.actions.ts` – CRUD de produtos (create, list, toggle status).
- `src/actions/order.actions.ts` – CRUD de pedidos, atualização de status.
- `src/actions/checkout.actions.ts` – validação, cálculo de split, persistência mock, geração de PIX.
- `src/actions/admin.actions.ts` – listagem e mudança de status de lojas (Aprovar/Reject).
- `src/actions/store.actions.ts` – esqueleto para futuro gerenciamento de configurações da loja.

### Dashboard do Vendedor (Painel)
- **Produtos** (`src/app/painel-vendedor/produtos/page.tsx`) com tabela `VendorProductsTable` mostrando SKU, estoque, preço, status.
- **Pedidos** (`src/app/painel-vendedor/pedidos/page.tsx`) com tabela `VendorOrdersTable` e botões de atualização de status (Separar → Despachar → Entregue).
- **Configurações da Loja** (`src/app/painel-vendedor/loja/page.tsx`) – formulário para editar banner, nome da loja, WhatsApp, chave PIX e endereço.

### Painel de Administração
- **Dashboard** (`src/app/admin/page.tsx`) – KPIs (número de lojas, pedidos, receita).
- **Tabela de moderação de lojas** (`src/components/admin/admin-stores-table.tsx`) – aprovar, rejeitar, suspender lojas.

### Dados Mock Centralizados
- `src/lib/mock-data.ts` – exporta `MOCK_PRODUCTS`, `MOCK_ADMIN_STORES`, `MOCK_ORDERS` e tipos auxiliares. Utilizado por todas as server actions enquanto o banco de dados real ainda não está configurado.

### Correções de erros críticos já realizadas
- Resolução do erro **“use server can only export async functions”** – movidos objetos não‑funcionais para `mock-data.ts`.
- Remoção de **event‑handler props** em componentes server, evitando *“Event handlers cannot be passed to Client Component props”*.

---
## Funcionalidades ainda **faltantes** (para alcançar paridade com Mercado Livre)

### 1️⃣ Autenticação & Autorização
- Implementar login/registro (Supabase Auth ou outro provedor).
- Proteger rotas `/painel‑vendedor/**` e `/admin/**`.
- Controle de papéis (buyer, vendor, admin) com claims no JWT.

### 2️⃣ Persistência Real (Banco de Dados)
- Configurar **PostgreSQL** (Supabase) com Prisma.
- Executar migrações (`prisma migrate dev`).
- Substituir mock data por consultas reais nas server actions (`product.actions.ts`, `order.actions.ts`, `store.actions.ts`).
- Criar tabelas auxiliares: `store_settings`, `order_items`, `payment_transactions`.

### 3️⃣ CRUD Completo de Produtos
- Formulário de criação/edição com **builder de variações** (tamanho, cor, estoque, SKU).
- Upload de imagens (integração CDN – ex.: Cloudinary ou Supabase Storage).
- Delete de produto e de variações.

### 4️⃣ Gestão de Pedidos
- Fluxo completo de status: **Pendente → Pago → Separando → Despachado → Entregue → Cancelado**.
- Histórico de transições e notificações por email/SMS.
- Integração com **webhook de pagamento** (Mercado Pago Pix) para marcar como `PAID`.

### 5️⃣ Webhook de Pagamento (Mercado Pago)
- Endpoint `/api/mercado-pago/webhook/route.ts` que valida assinatura, identifica o `orderId`, atualiza status e dispara `revalidatePath`.
- (Opcional) Canal realtime (Supabase) para atualizar UI imediatamente.

### 6️⃣ Calculadora de Frete
- Integração com **ViaCEP** (já usado) + API dos Correios ou cálculo customizado para “Ônibus de Excursão”.
- Exibir preço e prazo antes do checkout.

### 7️⃣ Comissão & Split Dinâmico
- Atualmente fixo **8,5 %** – permitir configuração por loja ou categoria via admin.

### 8️⃣ Busca Avançada & Filtros
- Barra de pesquisa com autocomplete.
- Filtros: categoria, preço (retail/wholesale), disponibilidade, loja, avaliação.
- Paginação e ordenação (relevância, preço, avaliações).

### 9️⃣ Avaliações & Comentários
- Sistema de reviews para produtos e lojas, cálculo de média, moderação.

### 🔟 Carrinho avançado
- Cupom de desconto / promoções.
- Cálculo automático de frete (peso/volume).
- Persistência de carrinho entre sessões (via Supabase ou base de dados).

### 1️⃣1️⃣ Perfil do Usuário
- Histórico de compras, favoritos, endereços salvos, gerenciamento de dados pessoais.

### 1️⃣2️⃣ Painel Admin – Relatórios avançados
- Gráficos de receita, volume de vendas, taxa de conversão, desempenho por loja.

### 1️⃣3️⃣ SEO & Performance
- Metatags dinâmicas, sitemap.xml, robots.txt, otimizações de imagens (lazy‑load, `next/image`), melhoria de CLS/LCP para atingir **Core Web Vitals**.

### 1️⃣4️⃣ Testes Automatizados
- **Unit tests** (Jest) para lógica do cart e schemas.
- **Integration tests** (Supertest) para server actions.
- **E2E tests** (Cypress) cobrindo fluxo completo: login → navegação → compra → webhook.

### 1️⃣5️⃣ CI/CD & Deploy
- Dockerfile & docker‑compose.
- GitHub Actions: lint, type‑check, testes, build, deploy em Vercel / Railway / outro host.
- Variáveis de ambiente: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `MP_WEBHOOK_SECRET`, etc.

### 1️⃣6️⃣ Documentação
- README com instruções de setup, variáveis, scripts.
- Swagger/OpenAPI para webhook de pagamento.
- Guia de contribuição e arquitetura.

---
## Próximas Etapas Prioritárias (sugestão de roadmap rápido)
1. **Login & Auth** – integrar Supabase Auth, criar páginas login/registro, proteger rotas.
2. **Configurar Prisma + DB** – migrar esquema, criar seed, conectar actions ao DB.
3. **Product CRUD completo** – UI de criação/edição, upload de imagens, persistência.
4. **Webhook Mercado Pago** – endpoint, validação, atualização de pedidos.
5. **Frete & Comissão configurável** – cálculo e UI.
6. **Busca avançada** – filtros e paginação.
7. **Reviews** – implementação e moderação.
8. **Testes & CI** – coverage >80 %, pipeline automatizado.
9. **Deploy** – containerizar, configurar variáveis, lançar em staging.

---
## Como usar este resumo
1. Copie o conteúdo deste arquivo e entregue à outra IA ou equipe que irá continuar o desenvolvimento.
2. Cada tópico “Faltante” pode ser tratado como *história de usuário* em um backlog.
3. Priorize o **Sprint 1** (autenticação) para habilitar o acesso ao painel do vendedor e à administração.

---
*Este documento foi gerado automaticamente pelo agente Antigravity como um artefato de projeto.*
