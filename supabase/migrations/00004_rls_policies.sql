-- 00004_rls_policies.sql
-- Advanced RLS helper functions and refined policies

-- ── Helper: check if user is admin/owner for an academy ──

CREATE OR REPLACE FUNCTION is_academy_admin(_academy_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE profile_id = auth.uid()
      AND academy_id = _academy_id
      AND role IN ('admin', 'owner')
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: check if user is professor for an academy ────

CREATE OR REPLACE FUNCTION is_academy_professor(_academy_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE profile_id = auth.uid()
      AND academy_id = _academy_id
      AND role = 'professor'
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: check if user is parent of a profile ─────────

CREATE OR REPLACE FUNCTION is_parent_of(_child_profile_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM parent_child_links
    WHERE parent_id = auth.uid()
      AND child_id = _child_profile_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Profiles: parents can view their children's profiles ─

CREATE POLICY profiles_select_children ON profiles FOR SELECT USING (
  is_parent_of(id)
);

-- Profiles: academy admins can view member profiles
CREATE POLICY profiles_select_academy_admin ON profiles FOR SELECT USING (
  id IN (
    SELECT m.profile_id FROM memberships m
    WHERE m.academy_id IN (
      SELECT ma.academy_id FROM memberships ma
      WHERE ma.profile_id = auth.uid()
        AND ma.role IN ('admin', 'owner')
        AND ma.status = 'active'
    )
  )
);

-- Profiles: professors can view profiles of students in their classes
CREATE POLICY profiles_select_professor ON profiles FOR SELECT USING (
  id IN (
    SELECT m.profile_id FROM memberships m
    WHERE m.academy_id IN (
      SELECT ma.academy_id FROM memberships ma
      WHERE ma.profile_id = auth.uid()
        AND ma.role = 'professor'
        AND ma.status = 'active'
    )
  )
);

-- ── Memberships: admin-only write policies ───────────────

CREATE POLICY memberships_admin_delete ON memberships FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- ── Class schedules: admin/professor manage ──────────────

CREATE POLICY class_schedules_delete ON class_schedules FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- ── Class sessions: professor/admin manage ───────────────

CREATE POLICY class_sessions_delete ON class_sessions FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- ── Enrollments: students can manage own enrollment ──────

CREATE POLICY class_enrollments_update ON class_enrollments FOR UPDATE USING (
  membership_id IN (
    SELECT id FROM memberships WHERE profile_id = auth.uid()
  )
  OR
  schedule_id IN (
    SELECT id FROM class_schedules WHERE academy_id IN (
      SELECT academy_id FROM memberships
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner', 'professor')
    )
  )
);

CREATE POLICY class_enrollments_delete ON class_enrollments FOR DELETE USING (
  membership_id IN (
    SELECT id FROM memberships WHERE profile_id = auth.uid()
  )
  OR
  schedule_id IN (
    SELECT id FROM class_schedules WHERE academy_id IN (
      SELECT academy_id FROM memberships
      WHERE profile_id = auth.uid() AND role IN ('admin', 'owner')
    )
  )
);

-- ── Attendances: parent can view child's attendance ──────

CREATE POLICY attendances_select_parent ON attendances FOR SELECT USING (
  membership_id IN (
    SELECT m.id FROM memberships m
    JOIN parent_child_links pcl ON pcl.child_id = m.profile_id
    WHERE pcl.parent_id = auth.uid()
  )
);

-- ── Promotions: admin/professor can manage ───────────────

CREATE POLICY promotions_delete ON promotions FOR DELETE USING (
  is_academy_admin(academy_id)
);

-- ── Milestones: admin can delete ─────────────────────────

CREATE POLICY milestones_delete ON milestones FOR DELETE USING (
  is_academy_admin(academy_id)
);
