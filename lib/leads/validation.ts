import { z } from 'zod';
import {
  LEAD_INTERACTION_TYPES,
  LEAD_LOSS_REASONS,
  LEAD_PIPELINE_STATUSES,
  LEAD_PROPOSAL_STATUSES,
  LEAD_TASK_STATUSES,
} from '@/lib/leads/types';

export const leadBaseSchema = z.object({
  academy_name: z.string().min(2),
  responsible_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  city: z.string().min(2),
  state: z.string().min(2).max(2),
  address: z.string().optional().nullable(),
  modalities: z.array(z.string()).default([]),
  current_students: z.coerce.number().int().nonnegative().default(0),
  monthly_revenue: z.coerce.number().nonnegative().default(0),
  lead_source: z.string().min(2).default('manual'),
  website: z.string().url().optional().or(z.literal('')).nullable(),
  instagram: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  suggested_price: z.coerce.number().nonnegative().optional().nullable(),
  proposed_price: z.coerce.number().nonnegative().optional().nullable(),
  closed_price: z.coerce.number().nonnegative().optional().nullable(),
  notes: z.string().optional().nullable(),
  next_action_at: z.string().datetime().optional().nullable(),
});

export const createLeadSchema = leadBaseSchema.extend({
  status: z.enum(LEAD_PIPELINE_STATUSES).default('NEW'),
});

export const updateLeadSchema = leadBaseSchema.partial().extend({
  status: z.enum(LEAD_PIPELINE_STATUSES).optional(),
  loss_reason: z.enum(LEAD_LOSS_REASONS).optional().nullable(),
  converted_academy_id: z.string().uuid().optional().nullable(),
  converted_at: z.string().datetime().optional().nullable(),
});

export const interactionSchema = z.object({
  lead_id: z.string().uuid(),
  type: z.enum(LEAD_INTERACTION_TYPES),
  content: z.string().min(1),
});

export const taskSchema = z.object({
  lead_id: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  due_at: z.string().datetime().optional().nullable(),
  status: z.enum(LEAD_TASK_STATUSES).default('OPEN'),
  assigned_to: z.string().uuid().optional().nullable(),
  task_id: z.string().uuid().optional(),
});

export const proposalSchema = z.object({
  lead_id: z.string().uuid(),
  proposal_value: z.coerce.number().positive(),
  currency: z.string().default('BRL'),
  status: z.enum(LEAD_PROPOSAL_STATUSES).default('DRAFT'),
  notes: z.string().optional().nullable(),
  proposal_id: z.string().uuid().optional(),
  action: z.enum(['create', 'send', 'accept', 'reject']).default('create'),
});

export const scorePreviewSchema = z.object({
  lead_id: z.string().uuid().optional(),
  current_students: z.coerce.number().int().nonnegative().optional(),
  monthly_revenue: z.coerce.number().nonnegative().optional(),
  modalities: z.array(z.string()).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  instagram: z.string().optional(),
  address: z.string().optional(),
  responsible_name: z.string().optional(),
});
