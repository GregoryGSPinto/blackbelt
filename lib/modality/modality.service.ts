/**
 * Modality Service — server-side operations for academy modalities.
 * Operates on academy_modalities table.
 */

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function getAcademyModalities(supabase: any, academyId: string) {
  const { data, error } = await supabase
    .from('academy_modalities')
    .select('id, academy_id, name, slug, description, icon, belt_system_id, enrollment_mode, is_active, display_order, created_at, updated_at')
    .eq('academy_id', academyId)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveModalities(supabase: any, academyId: string) {
  const { data, error } = await supabase
    .from('academy_modalities')
    .select('id, name, slug, description, icon, belt_system_id, enrollment_mode, display_order')
    .eq('academy_id', academyId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createModality(
  supabase: any,
  academyId: string,
  data: { name: string; description?: string; icon?: string; belt_system_id?: string; enrollment_mode?: string },
) {
  const slug = slugify(data.name);

  const { data: modality, error } = await supabase
    .from('academy_modalities')
    .insert({
      academy_id: academyId,
      name: data.name,
      slug,
      description: data.description ?? null,
      icon: data.icon ?? null,
      belt_system_id: data.belt_system_id ?? null,
      enrollment_mode: data.enrollment_mode ?? 'direct',
      is_active: true,
    })
    .select('id, academy_id, name, slug, description, icon, belt_system_id, enrollment_mode, is_active, display_order, created_at')
    .single();

  if (error) throw error;
  return modality;
}

export async function updateModality(
  supabase: any,
  modalityId: string,
  academyId: string,
  data: { name?: string; description?: string; icon?: string; belt_system_id?: string; enrollment_mode?: string; is_active?: boolean; display_order?: number },
) {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) {
    payload.name = data.name;
    payload.slug = slugify(data.name);
  }
  if (data.description !== undefined) payload.description = data.description;
  if (data.icon !== undefined) payload.icon = data.icon;
  if (data.belt_system_id !== undefined) payload.belt_system_id = data.belt_system_id;
  if (data.enrollment_mode !== undefined) payload.enrollment_mode = data.enrollment_mode;
  if (data.is_active !== undefined) payload.is_active = data.is_active;
  if (data.display_order !== undefined) payload.display_order = data.display_order;

  const { data: modality, error } = await supabase
    .from('academy_modalities')
    .update(payload)
    .eq('id', modalityId)
    .eq('academy_id', academyId)
    .select('id, academy_id, name, slug, description, icon, belt_system_id, enrollment_mode, is_active, display_order, updated_at')
    .single();

  if (error) throw error;
  return modality;
}

export async function deactivateModality(supabase: any, modalityId: string, academyId: string) {
  return updateModality(supabase, modalityId, academyId, { is_active: false });
}
