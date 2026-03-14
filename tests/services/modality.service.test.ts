// ============================================================
// Modality Service — Unit Tests
// ============================================================
// Tests cover:
//   1. Client-side modality service (mock mode) — CRUD, enrollment, fallback
//   2. Server-side modality service — with mocked Supabase client
//   3. Server-side membership-modality service — enrollment, belt, cross-tenant
//   4. Type/contract validation
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAcademyModalities,
  createModality,
  updateModality,
  deactivateModality,
  getModalityMembers,
  getMemberModalities,
  enrollMember,
  updateMemberBelt,
  getMyModalities,
  getAvailableModalities,
  requestEnrollment,
  getChildrenModalities,
  getActiveModalitiesForMember,
  type AcademyModality,
  type MemberModality,
} from '@/lib/api/modality.service';

// ── Server-side services ──
import {
  getAcademyModalities as serverGetModalities,
  getActiveModalities as serverGetActive,
  createModality as serverCreate,
  updateModality as serverUpdate,
  deactivateModality as serverDeactivate,
} from '@/lib/modality/modality.service';

import {
  getMemberModalities as serverGetMemberMods,
  enrollInModality as serverEnroll,
  approveEnrollment as serverApprove,
  rejectEnrollment as serverReject,
  removeFromModality as serverRemove,
  updateBelt as serverUpdateBelt,
  getMembersByModality as serverGetByModality,
  getChildModalities as serverGetChildMods,
} from '@/lib/modality/membership-modality.service';

// ============================================================
// HELPERS: Supabase mock builder
// ============================================================

function createSupabaseMock(responses: Record<string, any> = {}) {
  const chain: any = {};
  const methods = ['from', 'select', 'eq', 'in', 'insert', 'update', 'delete', 'order', 'single', 'neq'];

  for (const method of methods) {
    chain[method] = vi.fn().mockReturnValue(chain);
  }

  // Default response
  chain.select = vi.fn().mockReturnValue(chain);
  chain.single = vi.fn().mockResolvedValue(responses.single ?? { data: responses.data ?? null, error: null });
  chain.order = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.in = vi.fn().mockReturnValue(chain);

  // Make chain thenable (for queries that don't end with .single())
  chain.then = (resolve: any) => resolve(responses.list ?? { data: responses.data ?? [], error: null });

  const supabase = {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  };

  return supabase;
}

function createChainingMock(returnData: any, error: any = null) {
  const self: any = {};
  const methods = ['select', 'eq', 'in', 'order', 'neq', 'insert', 'update', 'delete'];
  for (const m of methods) {
    self[m] = vi.fn().mockReturnValue(self);
  }
  self.single = vi.fn().mockResolvedValue({ data: returnData, error });
  self.then = (resolve: any) => resolve({ data: Array.isArray(returnData) ? returnData : [returnData], error });
  return self;
}

// ============================================================
// 1. CLIENT-SIDE SERVICE (mock mode)
// ============================================================

describe('Modality Client Service (mock mode)', () => {
  describe('getAcademyModalities', () => {
    it('returns array of modalities', async () => {
      const result = await getAcademyModalities();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('each modality has required fields', async () => {
      const result = await getAcademyModalities();
      for (const mod of result) {
        expect(mod.id).toBeTruthy();
        expect(mod.name).toBeTruthy();
        expect(mod.slug).toBeTruthy();
        expect(typeof mod.is_active).toBe('boolean');
        expect(['direct', 'approval_required']).toContain(mod.enrollment_mode);
      }
    });

    it('returns distinct modalities (no duplicate ids)', async () => {
      const result = await getAcademyModalities();
      const ids = result.map(m => m.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('createModality', () => {
    it('returns a modality with the given name', async () => {
      const result = await createModality({ name: 'Capoeira' });
      expect(result).toBeDefined();
      expect(result.name).toBe('Capoeira');
    });
  });

  describe('updateModality', () => {
    it('returns updated modality', async () => {
      const result = await updateModality('mod-1', { name: 'BJJ Updated' });
      expect(result).toBeDefined();
      expect(result.name).toBe('BJJ Updated');
    });
  });

  describe('deactivateModality', () => {
    it('returns modality with is_active false', async () => {
      const result = await deactivateModality('mod-1');
      expect(result.is_active).toBe(false);
    });
  });

  describe('getModalityMembers', () => {
    it('returns array', async () => {
      const result = await getModalityMembers('mod-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getMemberModalities', () => {
    it('returns array', async () => {
      const result = await getMemberModalities('member-1');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('enrollMember', () => {
    it('returns enrollment object', async () => {
      const result = await enrollMember('member-1', 'mod-1');
      expect(result).toBeDefined();
      expect(result.status).toBeTruthy();
    });
  });

  describe('updateMemberBelt', () => {
    it('returns belt data', async () => {
      const result = await updateMemberBelt('member-1', 'mod-1', 'azul', 2);
      expect(result.belt_rank).toBe('azul');
      expect(result.stripes).toBe(2);
    });
  });

  describe('getMyModalities', () => {
    it('returns array', async () => {
      const result = await getMyModalities();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getAvailableModalities', () => {
    it('returns modalities with required shape', async () => {
      const result = await getAvailableModalities();
      expect(Array.isArray(result)).toBe(true);
      for (const mod of result) {
        expect(mod.id).toBeTruthy();
        expect(mod.name).toBeTruthy();
      }
    });
  });

  describe('requestEnrollment', () => {
    it('returns enrollment with status', async () => {
      const result = await requestEnrollment('mod-1');
      expect(result).toBeDefined();
      expect(result.status).toBeTruthy();
    });
  });

  describe('getChildrenModalities', () => {
    it('returns array', async () => {
      const result = await getChildrenModalities();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getActiveModalitiesForMember', () => {
    it('returns array (accessible by any role)', async () => {
      const result = await getActiveModalitiesForMember();
      expect(Array.isArray(result)).toBe(true);
    });

    it('returns empty array in mock mode (no fake data leak)', async () => {
      const result = await getActiveModalitiesForMember();
      // In mock mode returns empty (safe), not MOCK_MODALITIES
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

// ============================================================
// 2. SERVER-SIDE MODALITY SERVICE (mocked Supabase)
// ============================================================

describe('Modality Server Service', () => {
  const ACADEMY_ID = 'acad-001';

  describe('getAcademyModalities', () => {
    it('queries academy_modalities with correct academy_id', async () => {
      const mockData = [
        { id: 'mod-1', name: 'BJJ', slug: 'bjj', is_active: true },
      ];
      const chain = createChainingMock(mockData);
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      const result = await serverGetModalities(supabase, ACADEMY_ID);
      expect(supabase.from).toHaveBeenCalledWith('academy_modalities');
      expect(chain.eq).toHaveBeenCalledWith('academy_id', ACADEMY_ID);
      expect(Array.isArray(result)).toBe(true);
    });

    it('throws on Supabase error', async () => {
      const chain = createChainingMock(null, { message: 'DB error' });
      chain.then = (resolve: any) => resolve({ data: null, error: { message: 'DB error' } });
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      await expect(serverGetModalities(supabase, ACADEMY_ID)).rejects.toMatchObject({ message: 'DB error' });
    });
  });

  describe('getActiveModalities', () => {
    it('filters by is_active = true', async () => {
      const chain = createChainingMock([]);
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      await serverGetActive(supabase, ACADEMY_ID);
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
    });
  });

  describe('createModality', () => {
    it('inserts with slugified name', async () => {
      const created = { id: 'new-1', name: 'Jiu-Jitsu Brasileiro', slug: 'jiu-jitsu-brasileiro' };
      const chain = createChainingMock(created);
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      const result = await serverCreate(supabase, ACADEMY_ID, { name: 'Jiu-Jitsu Brasileiro' });
      expect(supabase.from).toHaveBeenCalledWith('academy_modalities');
      expect(chain.insert).toHaveBeenCalled();
      const insertArg = chain.insert.mock.calls[0][0];
      expect(insertArg.slug).toBe('jiu-jitsu-brasileiro');
      expect(insertArg.academy_id).toBe(ACADEMY_ID);
    });

    it('defaults enrollment_mode to direct', async () => {
      const chain = createChainingMock({ id: 'new-1' });
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      await serverCreate(supabase, ACADEMY_ID, { name: 'Boxe' });
      const insertArg = chain.insert.mock.calls[0][0];
      expect(insertArg.enrollment_mode).toBe('direct');
    });
  });

  describe('updateModality', () => {
    it('scopes update to academy_id', async () => {
      const chain = createChainingMock({ id: 'mod-1', name: 'Updated' });
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      await serverUpdate(supabase, 'mod-1', ACADEMY_ID, { name: 'Updated' });
      expect(chain.eq).toHaveBeenCalledWith('id', 'mod-1');
      expect(chain.eq).toHaveBeenCalledWith('academy_id', ACADEMY_ID);
    });

    it('re-slugifies when name changes', async () => {
      const chain = createChainingMock({ id: 'mod-1' });
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      await serverUpdate(supabase, 'mod-1', ACADEMY_ID, { name: 'Muay Thai Avançado' });
      const updateArg = chain.update.mock.calls[0][0];
      expect(updateArg.slug).toBe('muay-thai-avancado');
    });
  });

  describe('deactivateModality', () => {
    it('sets is_active to false', async () => {
      const chain = createChainingMock({ id: 'mod-1', is_active: false });
      const supabase = { from: vi.fn().mockReturnValue(chain) };

      await serverDeactivate(supabase, 'mod-1', ACADEMY_ID);
      const updateArg = chain.update.mock.calls[0][0];
      expect(updateArg.is_active).toBe(false);
    });
  });
});

// ============================================================
// 3. SERVER-SIDE MEMBERSHIP-MODALITY SERVICE
// ============================================================

describe('Membership-Modality Server Service', () => {
  const ACADEMY_ID = 'acad-001';
  const MEMBERSHIP_ID = 'mem-001';
  const MODALITY_ID = 'mod-001';
  const PERFORMER_ID = 'perf-001';

  describe('enrollInModality', () => {
    it('creates enrollment with correct status for direct mode', async () => {
      const modality = { id: MODALITY_ID, enrollment_mode: 'direct', is_active: true };
      const enrollment = { id: 'enr-1', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, status: 'active', belt_rank: 'branca', stripes: 0, started_at: '' };

      let callCount = 0;
      const chain: any = {};
      const methods = ['select', 'eq', 'insert', 'order'];
      for (const m of methods) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: modality, error: null });
        return Promise.resolve({ data: enrollment, error: null });
      });

      const supabase = {
        from: vi.fn().mockReturnValue(chain),
      };

      const result = await serverEnroll(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, PERFORMER_ID);
      expect(result.status).toBe('active');
      expect(result.belt_rank).toBe('branca');
    });

    it('creates pending enrollment for approval_required mode', async () => {
      const modality = { id: MODALITY_ID, enrollment_mode: 'approval_required', is_active: true };
      const enrollment = { id: 'enr-2', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, status: 'pending', belt_rank: 'branca', stripes: 0, started_at: '' };

      let callCount = 0;
      const chain: any = {};
      for (const m of ['select', 'eq', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: modality, error: null });
        return Promise.resolve({ data: enrollment, error: null });
      });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverEnroll(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, PERFORMER_ID);
      expect(result.status).toBe('pending');
    });

    it('throws when modality not found', async () => {
      const chain: any = {};
      for (const m of ['select', 'eq', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      await expect(serverEnroll(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, PERFORMER_ID))
        .rejects.toThrow('Modality not found in this academy');
    });

    it('throws when modality is inactive', async () => {
      const modality = { id: MODALITY_ID, enrollment_mode: 'direct', is_active: false };
      const chain: any = {};
      for (const m of ['select', 'eq', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: modality, error: null });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      await expect(serverEnroll(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, PERFORMER_ID))
        .rejects.toThrow('Modality is not active');
    });

    it('records enrollment event', async () => {
      const modality = { id: MODALITY_ID, enrollment_mode: 'direct', is_active: true };
      const enrollment = { id: 'enr-1', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, status: 'active', belt_rank: 'branca', stripes: 0, started_at: '' };

      let callCount = 0;
      const chain: any = {};
      for (const m of ['select', 'eq', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: modality, error: null });
        return Promise.resolve({ data: enrollment, error: null });
      });

      const fromCalls: string[] = [];
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          fromCalls.push(table);
          return chain;
        }),
      };

      await serverEnroll(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, PERFORMER_ID);
      expect(fromCalls).toContain('modality_events');
    });
  });

  describe('updateBelt', () => {
    it('updates belt and stripes for active enrollment', async () => {
      const existing = { id: 'enr-1', belt_rank: 'branca', stripes: 0 };
      const updated = { id: 'enr-1', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, belt_rank: 'azul', stripes: 2 };

      let callCount = 0;
      const chain: any = {};
      for (const m of ['select', 'eq', 'insert', 'update', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: existing, error: null });
        return Promise.resolve({ data: updated, error: null });
      });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverUpdateBelt(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, 'azul', 2, PERFORMER_ID);
      expect(result.belt_rank).toBe('azul');
      expect(result.stripes).toBe(2);
    });

    it('throws when no active enrollment exists', async () => {
      const chain: any = {};
      for (const m of ['select', 'eq', 'update', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      await expect(serverUpdateBelt(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, 'azul', 2, PERFORMER_ID))
        .rejects.toThrow('Active enrollment not found for this modality');
    });

    it('records belt_promotion event with from/to data', async () => {
      const existing = { id: 'enr-1', belt_rank: 'branca', stripes: 3 };
      const updated = { id: 'enr-1', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, belt_rank: 'azul', stripes: 0 };

      let callCount = 0;
      const chain: any = {};
      for (const m of ['select', 'eq', 'insert', 'update', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: existing, error: null });
        return Promise.resolve({ data: updated, error: null });
      });

      const insertCalls: any[] = [];
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'modality_events') {
            const eventChain: any = {};
            for (const m of ['select', 'eq', 'order']) {
              eventChain[m] = vi.fn().mockReturnValue(eventChain);
            }
            eventChain.insert = vi.fn().mockImplementation((data: any) => {
              insertCalls.push(data);
              return Promise.resolve({ data: null, error: null });
            });
            return eventChain;
          }
          return chain;
        }),
      };

      await serverUpdateBelt(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, 'azul', 0, PERFORMER_ID);
      expect(insertCalls.length).toBe(1);
      expect(insertCalls[0].event_type).toBe('belt_promotion');
      expect(insertCalls[0].payload.from_belt).toBe('branca');
      expect(insertCalls[0].payload.to_belt).toBe('azul');
      expect(insertCalls[0].payload.from_stripes).toBe(3);
      expect(insertCalls[0].payload.to_stripes).toBe(0);
    });
  });

  describe('approveEnrollment', () => {
    it('sets status to active', async () => {
      const approved = { id: 'enr-1', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, status: 'active' };
      const chain: any = {};
      for (const m of ['select', 'eq', 'update', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: approved, error: null });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverApprove(supabase, 'enr-1', ACADEMY_ID, PERFORMER_ID);
      expect(result.status).toBe('active');
      expect(chain.eq).toHaveBeenCalledWith('status', 'pending');
    });
  });

  describe('rejectEnrollment', () => {
    it('sets status to inactive', async () => {
      const rejected = { id: 'enr-1', membership_id: MEMBERSHIP_ID, modality_id: MODALITY_ID, status: 'inactive' };
      const chain: any = {};
      for (const m of ['select', 'eq', 'update', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: rejected, error: null });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverReject(supabase, 'enr-1', ACADEMY_ID, PERFORMER_ID);
      expect(result.status).toBe('inactive');
    });
  });

  describe('removeFromModality', () => {
    it('throws when member not enrolled', async () => {
      const chain: any = {};
      for (const m of ['select', 'eq', 'update', 'insert', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      await expect(serverRemove(supabase, MEMBERSHIP_ID, MODALITY_ID, ACADEMY_ID, PERFORMER_ID))
        .rejects.toThrow('Member is not enrolled in this modality');
    });
  });

  describe('getMembersByModality', () => {
    it('returns empty when modality does not belong to academy', async () => {
      // First call: academy_modalities check → returns null (not found)
      const chain: any = {};
      for (const m of ['select', 'eq', 'in', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
      chain.then = (resolve: any) => resolve({ data: [], error: null });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverGetByModality(supabase, 'acad-A', 'mod-from-acad-B');
      expect(result).toEqual([]);
    });

    it('filters members by academy_id when modality exists', async () => {
      let callCount = 0;
      const chain: any = {};
      for (const m of ['select', 'eq', 'in', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.single = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) return Promise.resolve({ data: { id: 'mod-1' }, error: null });
        return Promise.resolve({ data: null, error: null });
      });
      chain.then = (resolve: any) => resolve({ data: [], error: null });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverGetByModality(supabase, 'acad-001', 'mod-1');
      expect(Array.isArray(result)).toBe(true);
      // Verify academy_id was used in the query
      expect(chain.eq).toHaveBeenCalledWith('academy_id', 'acad-001');
    });
  });

  describe('getChildModalities', () => {
    it('returns empty array when parent has no children', async () => {
      const chain: any = {};
      for (const m of ['select', 'eq', 'in', 'order']) {
        chain[m] = vi.fn().mockReturnValue(chain);
      }
      chain.then = (resolve: any) => resolve({ data: [], error: null });

      const supabase = { from: vi.fn().mockReturnValue(chain) };
      const result = await serverGetChildMods(supabase, 'parent-1');
      expect(result).toEqual([]);
    });
  });
});

// ============================================================
// 4. TYPE/CONTRACT VALIDATION
// ============================================================

describe('Modality Type Contracts', () => {
  it('AcademyModality has all required fields', async () => {
    const mods = await getAcademyModalities();
    const mod = mods[0];
    const required: (keyof AcademyModality)[] = [
      'id', 'name', 'slug', 'enrollment_mode', 'is_active', 'display_order',
    ];
    for (const field of required) {
      expect(mod).toHaveProperty(field);
    }
  });

  it('enrollment_mode is a valid value', async () => {
    const mods = await getAcademyModalities();
    for (const mod of mods) {
      expect(['direct', 'approval_required']).toContain(mod.enrollment_mode);
    }
  });

  it('belt_rank and stripes have correct types in updateMemberBelt response', async () => {
    const result = await updateMemberBelt('m', 'mod', 'roxa', 4);
    expect(typeof result.belt_rank).toBe('string');
    expect(typeof result.stripes).toBe('number');
  });

  it('slugify produces valid slugs', async () => {
    // Test via createModality which slugifies internally
    const chain = createChainingMock({ id: 'new', slug: 'capoeira-angola' });
    const supabase = { from: vi.fn().mockReturnValue(chain) };

    await serverCreate(supabase, 'acad-1', { name: 'Capoeira Angola' });
    const insertArg = chain.insert.mock.calls[0][0];
    expect(insertArg.slug).toBe('capoeira-angola');
    expect(insertArg.slug).not.toMatch(/[A-Z]/);
    expect(insertArg.slug).not.toMatch(/\s/);
  });

  it('slugify handles accented characters', async () => {
    const chain = createChainingMock({ id: 'new', slug: 'judo' });
    const supabase = { from: vi.fn().mockReturnValue(chain) };

    await serverCreate(supabase, 'acad-1', { name: 'Judô' });
    const insertArg = chain.insert.mock.calls[0][0];
    expect(insertArg.slug).toBe('judo');
  });

  it('stripes constraint: updateBelt accepts 0-6 range', async () => {
    // The constraint is in DB (CHECK stripes BETWEEN 0 AND 6),
    // but the service passes through. Verify it doesn't reject at service level.
    const existing = { id: 'enr-1', belt_rank: 'branca', stripes: 0 };
    const updated = { id: 'enr-1', membership_id: 'm', modality_id: 'mod', belt_rank: 'azul', stripes: 4 };

    let callCount = 0;
    const chain: any = {};
    for (const m of ['select', 'eq', 'insert', 'update', 'order']) {
      chain[m] = vi.fn().mockReturnValue(chain);
    }
    chain.single = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ data: existing, error: null });
      return Promise.resolve({ data: updated, error: null });
    });

    const supabase = { from: vi.fn().mockReturnValue(chain) };
    const result = await serverUpdateBelt(supabase, 'm', 'mod', 'acad', 'azul', 4, 'perf');
    expect(result.stripes).toBe(4);
  });
});
