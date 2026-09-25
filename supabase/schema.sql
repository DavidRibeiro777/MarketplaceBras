-- ==============================================================================
-- MARKETPLACE DO BRÁS & FEIRA DA MADRUGADA - SUPABASE DATABASE SCHEMA
-- Arquitetura 100% Nativa Supabase com PostgreSQL, RLS, Triggers e Storage
-- ==============================================================================

-- 1. HABILITAR EXTENSÕES ESSENCIAIS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TIPOS CUSTOMIZADOS (ENUMS)
-- ==============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE store_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE pix_key_type AS ENUM ('CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM_KEY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE bank_account_type AS ENUM ('CHECKING', 'SAVINGS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 3. FUNÇÃO AUXILIAR: ATUALIZAÇÃO AUTOMÁTICA DE "updated_at"
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 4. TABELAS DO SISTEMA
-- ==============================================================================

-- 4.1. USUÁRIOS / PERFIS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supabase_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  cpf VARCHAR(14) UNIQUE,
  role user_role NOT NULL DEFAULT 'BUYER',
  avatar_url TEXT,
  email_verified TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger de updated_at para users
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.2. LOJAS / FABRICANTES DO BRÁS (STORE)
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  cnpj VARCHAR(18) UNIQUE,
  commercial_phone VARCHAR(20) NOT NULL,
  whatsapp_number VARCHAR(20) NOT NULL,
  status store_status NOT NULL DEFAULT 'PENDING',
  commission_rate NUMERIC(5, 2) NOT NULL DEFAULT 8.50,
  physical_location VARCHAR(255),
  bank_code VARCHAR(10),
  bank_name VARCHAR(100),
  bank_agency VARCHAR(10),
  bank_account VARCHAR(20),
  bank_account_digit VARCHAR(5),
  bank_account_type bank_account_type DEFAULT 'CHECKING',
  account_holder_name VARCHAR(255),
  account_holder_document VARCHAR(18),
  pix_key_type pix_key_type,
  pix_key VARCHAR(150),
  mercadopago_collector_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_stores_updated_at ON public.stores;
CREATE TRIGGER set_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.3. CATEGORIAS DE PRODUTOS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.4. PRODUTOS (CATÁLOGO VAREJO / ATACADO)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  status product_status NOT NULL DEFAULT 'ACTIVE',
  retail_price NUMERIC(12, 2) NOT NULL,
  wholesale_price NUMERIC(12, 2) NOT NULL,
  min_wholesale_qty INT NOT NULL DEFAULT 6,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_product_store_slug UNIQUE (store_id, slug)
);

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.5. VARIAÇÕES DE GRADE (TAMANHO, COR, ESTOQUE, SKU)
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  size VARCHAR(20) NOT NULL,
  color VARCHAR(50) NOT NULL,
  color_hex VARCHAR(7),
  stock INT NOT NULL DEFAULT 0,
  additional_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_product_variation_sku UNIQUE (product_id, sku)
);

DROP TRIGGER IF EXISTS set_product_variations_updated_at ON public.product_variations;
CREATE TRIGGER set_product_variations_updated_at
  BEFORE UPDATE ON public.product_variations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.6. IMAGENS DO PRODUTO (SUPABASE STORAGE)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  display_order INT NOT NULL DEFAULT 0,
  is_main BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4.7. ENDEREÇOS DOS CLIENTES / ENTREGA
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipient_name VARCHAR(150) NOT NULL,
  zip_code VARCHAR(9) NOT NULL,
  street VARCHAR(255) NOT NULL,
  number VARCHAR(20) NOT NULL,
  complement VARCHAR(100),
  neighborhood VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(2) NOT NULL,
  phone VARCHAR(20),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_addresses_updated_at ON public.addresses;
CREATE TRIGGER set_addresses_updated_at
  BEFORE UPDATE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.8. PEDIDOS (SPLIT POR LOJISTA & INTEGRADO COM PIX)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE RESTRICT,
  shipping_address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_method payment_method NOT NULL DEFAULT 'PIX',
  total_amount NUMERIC(12, 2) NOT NULL,
  shipping_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  platform_fee_rate NUMERIC(5, 2) NOT NULL DEFAULT 8.50,
  platform_fee_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  seller_net_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  mercadopago_payment_id VARCHAR(100) UNIQUE,
  pix_qrcode TEXT,
  pix_qrcode_base64 TEXT,
  shipping_carrier VARCHAR(100),
  tracking_code VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4.9. ITENS DO PEDIDO (HISTÓRICO IMUTÁVEL)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_variation_id UUID REFERENCES public.product_variations(id) ON DELETE SET NULL,
  product_title VARCHAR(255) NOT NULL,
  variation_details VARCHAR(100) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  is_wholesale_price BOOLEAN NOT NULL DEFAULT false,
  unit_price NUMERIC(12, 2) NOT NULL,
  quantity INT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 5. ÍNDICES DE ALTA PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON public.users(supabase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_status ON public.stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores(user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_variations_product_id ON public.product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- ==============================================================================
-- 6. INTEGRAÇÃO AUTOMÁTICA COM SUPABASE AUTH (TRIGGER ON SIGNUP)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (supabase_uid, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'BUYER')
  )
  ON CONFLICT (email) DO UPDATE
  SET supabase_uid = EXCLUDED.supabase_uid;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==============================================================================
-- 7. POLÍTICAS DE SEGURANÇA POR LINHA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 7.1. USERS POLICIES
DROP POLICY IF EXISTS "Usuários podem ler o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem ler o próprio perfil"
  ON public.users FOR SELECT
  USING (auth.uid() = supabase_uid);

DROP POLICY IF EXISTS "Usuários podem atualizar o próprio perfil" ON public.users;
CREATE POLICY "Usuários podem atualizar o próprio perfil"
  ON public.users FOR UPDATE
  USING (auth.uid() = supabase_uid);

DROP POLICY IF EXISTS "Permitir inserção pública para registro" ON public.users;
CREATE POLICY "Permitir inserção pública para registro"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- 7.2. CATEGORIES POLICIES (Catálogo público)
DROP POLICY IF EXISTS "Categorias são públicas para visualização" ON public.categories;
CREATE POLICY "Categorias são públicas para visualização"
  ON public.categories FOR SELECT
  USING (true);

-- 7.3. STORES POLICIES
DROP POLICY IF EXISTS "Lojas ativas são visíveis para todos" ON public.stores;
CREATE POLICY "Lojas ativas são visíveis para todos"
  ON public.stores FOR SELECT
  USING (status = 'APPROVED' OR EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = stores.user_id AND u.supabase_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Vendedores podem registrar sua loja" ON public.stores;
CREATE POLICY "Vendedores podem registrar sua loja"
  ON public.stores FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Vendedores podem editar sua própria loja" ON public.stores;
CREATE POLICY "Vendedores podem editar sua própria loja"
  ON public.stores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = stores.user_id AND u.supabase_uid = auth.uid()
  ));

-- 7.4. PRODUCTS POLICIES
DROP POLICY IF EXISTS "Produtos ativos são públicos" ON public.products;
CREATE POLICY "Produtos ativos são públicos"
  ON public.products FOR SELECT
  USING (status = 'ACTIVE' OR EXISTS (
    SELECT 1 FROM public.stores s
    JOIN public.users u ON u.id = s.user_id
    WHERE s.id = products.store_id AND u.supabase_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Lojistas gerenciam seus produtos (INSERT)" ON public.products;
CREATE POLICY "Lojistas gerenciam seus produtos (INSERT)"
  ON public.products FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.stores s
    JOIN public.users u ON u.id = s.user_id
    WHERE s.id = products.store_id AND u.supabase_uid = auth.uid()
  ));

DROP POLICY IF EXISTS "Lojistas gerenciam seus produtos (UPDATE)" ON public.products;
CREATE POLICY "Lojistas gerenciam seus produtos (UPDATE)"
  ON public.products FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.stores s
    JOIN public.users u ON u.id = s.user_id
    WHERE s.id = products.store_id AND u.supabase_uid = auth.uid()
  ));

-- 7.5. VARIATIONS POLICIES
DROP POLICY IF EXISTS "Variações ativas são públicas" ON public.product_variations;
CREATE POLICY "Variações ativas são públicas"
  ON public.product_variations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lojistas gerenciam variações" ON public.product_variations;
CREATE POLICY "Lojistas gerenciam variações"
  ON public.product_variations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.stores s ON s.id = p.store_id
    JOIN public.users u ON u.id = s.user_id
    WHERE p.id = product_variations.product_id AND u.supabase_uid = auth.uid()
  ));

-- 7.6. IMAGES POLICIES
DROP POLICY IF EXISTS "Imagens de produtos são públicas" ON public.product_images;
CREATE POLICY "Imagens de produtos são públicas"
  ON public.product_images FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Lojistas gerenciam fotos de produtos" ON public.product_images;
CREATE POLICY "Lojistas gerenciam fotos de produtos"
  ON public.product_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.products p
    JOIN public.stores s ON s.id = p.store_id
    JOIN public.users u ON u.id = s.user_id
    WHERE p.id = product_images.product_id AND u.supabase_uid = auth.uid()
  ));

-- 7.7. ORDERS POLICIES
DROP POLICY IF EXISTS "Compradores e Lojistas podem visualizar pedidos" ON public.orders;
CREATE POLICY "Compradores e Lojistas podem visualizar pedidos"
  ON public.orders FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = orders.buyer_id AND u.supabase_uid = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.stores s JOIN public.users u ON u.id = s.user_id WHERE s.id = orders.store_id AND u.supabase_uid = auth.uid())
  );

DROP POLICY IF EXISTS "Permitir criação de novos pedidos" ON public.orders;
CREATE POLICY "Permitir criação de novos pedidos"
  ON public.orders FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Lojistas e Compradores podem atualizar pedidos" ON public.orders;
CREATE POLICY "Lojistas e Compradores podem atualizar pedidos"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.stores s JOIN public.users u ON u.id = s.user_id WHERE s.id = orders.store_id AND u.supabase_uid = auth.uid())
  );

-- 7.8. ORDER ITEMS POLICIES
DROP POLICY IF EXISTS "Visualização de itens do pedido" ON public.order_items;
CREATE POLICY "Visualização de itens do pedido"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND (
      EXISTS (SELECT 1 FROM public.users u WHERE u.id = o.buyer_id AND u.supabase_uid = auth.uid()) OR
      EXISTS (SELECT 1 FROM public.stores s JOIN public.users u ON u.id = s.user_id WHERE s.id = o.store_id AND u.supabase_uid = auth.uid())
    )
  ));

DROP POLICY IF EXISTS "Permitir inserção de itens de pedido" ON public.order_items;
CREATE POLICY "Permitir inserção de itens de pedido"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- 7.9. ADDRESSES POLICIES
DROP POLICY IF EXISTS "Usuários gerenciam seus próprios endereços" ON public.addresses;
CREATE POLICY "Usuários gerenciam seus próprios endereços"
  ON public.addresses FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = addresses.user_id AND u.supabase_uid = auth.uid()
  ));

-- ==============================================================================
-- 8. STORAGE BUCKET: PRODUTOS (FOTOS)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso ao Storage do Supabase
DROP POLICY IF EXISTS "Fotos de produtos são públicas para leitura" ON storage.objects;
CREATE POLICY "Fotos de produtos são públicas para leitura"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de fotos" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products');

-- ==============================================================================
-- 9. DADOS INICIAIS (SEEDS / CATEGORIAS DO BRÁS)
-- ==============================================================================
INSERT INTO public.categories (name, slug, description, icon)
VALUES
  ('Moda Feminina', 'moda-feminina', 'Vestidos, croppeds, conjuntos, blusas e macacões direto dos fabricantes.', 'Shirt'),
  ('Jeans & Denim', 'jeans-denim', 'Calças wide leg, shorts, jaquetas e saias jeans com lavagens exclusivas do Brás.', 'Scissors'),
  ('Moda Masculina', 'moda-masculina', 'Camisetas streetwear, bermudas, polos e camisas sociais no atacado.', 'User'),
  ('Moda Infantil & Bebê', 'infantil-bebe', 'Conjuntinhos infantis, bodies, vestidos e roupas juvenis de alta saída.', 'Smile'),
  ('Plus Size Feminino', 'plus-size', 'Modelagens amplas e confortáveis do tamanho 44 ao 56 direto de confecções especializadas.', 'Sparkles'),
  ('Calçados & Rasteiras', 'calcados', 'Tênis casuais, rasteirinhas, sandálias e botas para revenda com alta margem.', 'Footprints'),
  ('Acessórios & Bolsas', 'acessorios', 'Bolsas transversais, cintos, bijuterias finas e carteiras.', 'ShoppingBag')
ON CONFLICT (slug) DO NOTHING;
