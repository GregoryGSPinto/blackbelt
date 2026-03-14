-- Harden memberships write access to academy admins only.
-- The original foundation policies allowed any academy member to insert/update
-- rows inside their academy, which is a privilege escalation vector via direct
-- Supabase access with the public anon key.

DROP POLICY IF EXISTS memberships_insert ON memberships;
DROP POLICY IF EXISTS memberships_update ON memberships;

CREATE POLICY memberships_insert ON memberships FOR INSERT WITH CHECK (
  is_academy_admin(academy_id)
);

CREATE POLICY memberships_update ON memberships FOR UPDATE USING (
  is_academy_admin(academy_id)
) WITH CHECK (
  is_academy_admin(academy_id)
);
