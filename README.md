# Marketplace Brás & Feira da Madrugada

Marketplace multi-vendor de alta performance focado exclusivamente em lojistas e fabricantes do Brás, Pari e Feira da Madrugada (São Paulo - SP). Desenvolvido com foco **mobile-first** para atender a dinâmica de atacado e varejo de sacoleiras e compradores de todo o país.

---

## 🛠️ Stack Tecnológica

- **Framework:** Next.js 15 (App Router, Server Actions)
- **Frontend & UI:** React 19, Tailwind CSS v4, Radix UI / Lucide React
- **Banco de Dados & Auth:** **Supabase** (PostgreSQL Nativo, Row Level Security, Triggers e Storage)
- **SDK Supabase:** `@supabase/supabase-js` + `@supabase/ssr` (100% tipado com TypeScript)
- **Validação de Formulários:** Zod v3 + React Hook Form
- **Pagamentos & Split:** Mercado Pago API (Pix e Cartão com split de recebíveis)
- **TypeScript:** Strict Mode habilitado

---

## 📐 1. Arquitetura do Banco de Dados (Supabase Nativo)

O schema SQL completo com RLS, Triggers e Seeds está localizado em [`supabase/schema.sql`](./supabase/schema.sql) e modela:

1. **`users`**: Usuários da plataforma (`BUYER`, `SELLER`, `ADMIN`), sincronizados via trigger automático do Supabase Auth (`on_auth_user_created`).
2. **`stores`**: Lojista do Brás, contendo dados cadastrais, slug para URL amigável (`/loja-exemplo`), localização física (ex: Shopping Vautier) e **dados bancários completos para recebimento (Chave Pix, Banco, Agência, Conta)**.
3. **`categories`**: Categorias de confecção com auto-relacionamento hierárquico (ex: Moda Feminina -> Vestidos).
4. **`products`**: Catálogo com dupla precificação: **Preço de Varejo** e **Preço de Atacado** com quantidade mínima (`min_wholesale_qty`).
5. **`product_variations`**: Grade de confecção (Tamanho, Cor, Estoque individual e SKU único).
6. **`product_images`**: Fotos em alta resolução armazenadas no Supabase Storage (Bucket `products`).
7. **`addresses`**: Endereço de entrega para compradores.
8. **`orders`**: Pedidos criados **por vendedor** no checkout, garantindo split limpo entre lojista e comissão da plataforma.
9. **`order_items`**: Itens do pedido com snapshots históricos de preços, títulos e variações imutáveis.

---

## 📂 2. Estrutura de Pastas

```
projeto-marketplace/
├── supabase/
│   └── schema.sql                    # Script SQL completo (Tabelas, RLS, Triggers, Storage, Seeds)
├── public/                           # Assets estáticos
├── src/
│   ├── actions/                      # Server Actions com Supabase Client
│   │   ├── admin.actions.ts          # Gestão e aprovação de lojas
│   │   ├── checkout.actions.ts       # Criação de pedidos e cálculo de split
│   │   ├── order.actions.ts          # Atualização de status de pedidos
│   │   ├── product.actions.ts        # Cadastro e listagem de produtos
│   │   └── store.actions.ts          # Registro de lojistas
│   ├── app/                          # App Router (Next.js 15)
│   ├── components/                   # Componentes UI e Formulários
│   ├── lib/
│   │   ├── supabase.ts               # Supabase Client tipado e Admin Service Role
│   │   ├── utils.ts                  # Helpers de formatação e máscaras
│   │   └── mock-data.ts              # Catálogo demonstrativo de fallback
│   ├── types/
│   │   └── database.types.ts         # Tipagem estrita TypeScript gerada para o Supabase
│   └── store/                        # Estado global do carrinho (Zustand)
```

---

## 🚀 3. Como Rodar o Projeto

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="sua-service-role-key"
   ```

3. **Execute o script SQL no Supabase:**
   - Acesse o painel do Supabase -> **SQL Editor**.
   - Abra o arquivo `supabase/schema.sql` e execute o script.
   - Todas as tabelas, enums, triggers, políticas de RLS e o bucket de storage serão criados imediatamente.

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
