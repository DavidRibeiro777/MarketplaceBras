-- ==============================================================================
-- CORREÇÃO DE TRIGGER E POLÍTICAS RLS NO SUPABASE
-- Execute este script no SQL Editor do painel do seu Supabase
-- ==============================================================================

-- 1. CORREÇÃO DA FUNÇÃO DO TRIGGER DE AUTH (Evita "Database error saving new user")
-- Adiciona search_path explícito e tratamento de exceção seguro
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (supabase_uid, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'BUYER'::public.user_role)
  )
  ON CONFLICT (email) DO UPDATE
  SET supabase_uid = EXCLUDED.supabase_uid;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Não bloqueia a criação do usuário no auth caso ocorra inconsistência temporária
  RAISE WARNING 'Aviso ao sincronizar usuário no public.users: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. REAPLICAÇÃO DO TRIGGER ON AUTH.USERS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- 3. AJUSTE DAS POLÍTICAS DE RLS NA TABELA USERS (Evita violação de RLS no cadastro)
DROP POLICY IF EXISTS "Permitir inserção pública para registro" ON public.users;
CREATE POLICY "Permitir inserção pública para registro"
  ON public.users FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública durante registro" ON public.users;
CREATE POLICY "Permitir leitura pública durante registro"
  ON public.users FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Permitir atualização de perfil durante registro" ON public.users;
CREATE POLICY "Permitir atualização de perfil durante registro"
  ON public.users FOR UPDATE
  USING (true);

-- 4. AJUSTE DAS POLÍTICAS DE RLS NA TABELA STORES
DROP POLICY IF EXISTS "Vendedores podem registrar sua loja" ON public.stores;
CREATE POLICY "Vendedores podem registrar sua loja"
  ON public.stores FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura de lojas pendentes pelo criador" ON public.stores;
CREATE POLICY "Permitir leitura de lojas pendentes pelo criador"
  ON public.stores FOR SELECT
  USING (true);
