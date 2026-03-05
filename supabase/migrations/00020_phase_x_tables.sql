-- 00020_phase_x_tables.sql
-- Phase-X tables: Shop, PDV, WhatsApp Business
-- These are placeholder schemas for future features

-- ── Shop ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shop_products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  price_cents     int NOT NULL CHECK (price_cents >= 0),
  image_url       text,
  category        text,
  stock           int NOT NULL DEFAULT 0,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shop_products_updated_at
  BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS shop_orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'canceled')),
  total_cents     int NOT NULL CHECK (total_cents >= 0),
  items           jsonb NOT NULL DEFAULT '[]',
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER shop_orders_updated_at
  BEFORE UPDATE ON shop_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── PDV (Point of Sale) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS pdv_products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  name            text NOT NULL,
  sku             text,
  price_cents     int NOT NULL CHECK (price_cents >= 0),
  category        text,
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER pdv_products_updated_at
  BEFORE UPDATE ON pdv_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS pdv_sales (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  seller_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id     uuid REFERENCES profiles(id),
  total_cents     int NOT NULL CHECK (total_cents >= 0),
  payment_method  text NOT NULL,
  items           jsonb NOT NULL DEFAULT '[]',
  notes           text,
  sold_at         timestamptz NOT NULL DEFAULT now(),
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── WhatsApp Business ───────────────────────────────────

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  academy_id      uuid NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  phone           text NOT NULL,
  direction       text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type    text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'media')),
  content         text NOT NULL,
  template_name   text,
  external_id     text,
  status          text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Indexes ─────────────────────────────────────────────

CREATE INDEX idx_shop_products_academy ON shop_products(academy_id);
CREATE INDEX idx_shop_orders_academy ON shop_orders(academy_id);
CREATE INDEX idx_shop_orders_profile ON shop_orders(profile_id);

CREATE INDEX idx_pdv_products_academy ON pdv_products(academy_id);
CREATE INDEX idx_pdv_sales_academy ON pdv_sales(academy_id);
CREATE INDEX idx_pdv_sales_seller ON pdv_sales(seller_id);

CREATE INDEX idx_whatsapp_messages_academy ON whatsapp_messages(academy_id);
CREATE INDEX idx_whatsapp_messages_phone ON whatsapp_messages(phone);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

-- ── RLS ─────────────────────────────────────────────────

ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdv_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdv_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Shop products: academy members can view, admins manage
CREATE POLICY shop_products_select ON shop_products FOR SELECT USING (
  academy_id IN (SELECT get_user_academy_ids())
);

CREATE POLICY shop_products_insert ON shop_products FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY shop_products_update ON shop_products FOR UPDATE USING (
  is_academy_admin(academy_id)
);

CREATE POLICY shop_products_delete ON shop_products FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- Shop orders: user sees own, admins see all
CREATE POLICY shop_orders_select ON shop_orders FOR SELECT USING (
  profile_id = auth.uid()
  OR is_academy_admin(academy_id)
);

CREATE POLICY shop_orders_insert ON shop_orders FOR INSERT WITH CHECK (
  profile_id = auth.uid()
);

CREATE POLICY shop_orders_update ON shop_orders FOR UPDATE USING (
  is_academy_admin(academy_id)
);

-- PDV products: admins manage
CREATE POLICY pdv_products_select ON pdv_products FOR SELECT USING (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

CREATE POLICY pdv_products_insert ON pdv_products FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY pdv_products_update ON pdv_products FOR UPDATE USING (
  is_academy_admin(academy_id)
);

-- PDV sales: admins and sellers
CREATE POLICY pdv_sales_select ON pdv_sales FOR SELECT USING (
  seller_id = auth.uid()
  OR is_academy_admin(academy_id)
);

CREATE POLICY pdv_sales_insert ON pdv_sales FOR INSERT WITH CHECK (
  academy_id IN (
    SELECT academy_id FROM memberships
    WHERE profile_id = auth.uid() AND role IN ('admin', 'professor')
  )
);

-- WhatsApp messages: admins only
CREATE POLICY whatsapp_messages_select ON whatsapp_messages FOR SELECT USING (
  is_academy_admin(academy_id)
);

CREATE POLICY whatsapp_messages_insert ON whatsapp_messages FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);
