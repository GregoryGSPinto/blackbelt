export const LEAD_PIPELINE_STATUSES = [
  'NEW',
  'ENRICHING',
  'QUALIFIED',
  'OUTREACH_STARTED',
  'MEETING_SCHEDULED',
  'PROPOSAL_SENT',
  'NEGOTIATING',
  'WON',
  'LOST',
] as const;

export type LeadPipelineStatus = typeof LEAD_PIPELINE_STATUSES[number];

export const LEAD_INTERACTION_TYPES = [
  'email',
  'call',
  'whatsapp',
  'note',
  'meeting',
  'proposal_sent',
  'status_change',
] as const;

export type LeadInteractionType = typeof LEAD_INTERACTION_TYPES[number];

export const LEAD_SCORE_CATEGORIES = ['HOT', 'WARM', 'COLD'] as const;
export type LeadScoreCategory = typeof LEAD_SCORE_CATEGORIES[number];

export const LEAD_LOSS_REASONS = [
  'PRICE_TOO_HIGH',
  'NO_RESPONSE',
  'SMALL_ACADEMY',
  'USING_COMPETITOR',
  'NOT_INTERESTED',
  'DELAYED',
] as const;

export type LeadLossReason = typeof LEAD_LOSS_REASONS[number];

export const LEAD_TASK_STATUSES = ['OPEN', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const;
export type LeadTaskStatus = typeof LEAD_TASK_STATUSES[number];

export const LEAD_PROPOSAL_STATUSES = [
  'DRAFT',
  'SENT',
  'VIEWED',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
] as const;

export type LeadProposalStatus = typeof LEAD_PROPOSAL_STATUSES[number];

export interface LeadRecord {
  id: string;
  academy_name: string;
  responsible_name: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  address: string | null;
  modalities: string[] | null;
  current_students: number | null;
  monthly_revenue: number | null;
  score: number | null;
  lead_source: string | null;
  website: string | null;
  instagram: string | null;
  status: LeadPipelineStatus;
  suggested_price: number | null;
  proposed_price: number | null;
  closed_price: number | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  converted_at: string | null;
  converted_academy_id: string | null;
  loss_reason: LeadLossReason | null;
  notes?: string | null;
  last_contact_at?: string | null;
  next_action_at?: string | null;
}

export interface LeadListResponse {
  leads: LeadRecord[];
  count: number;
  limit: number;
  offset: number;
  summary: {
    hot: number;
    warm: number;
    cold: number;
    won: number;
    revenuePotential: number;
  };
}

export interface LeadTaskRecord {
  id: string;
  lead_id: string;
  title: string;
  description: string | null;
  due_at: string | null;
  status: LeadTaskStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at?: string;
  completed_at?: string | null;
}

export interface LeadProposalRecord {
  id: string;
  lead_id: string;
  proposal_value: number;
  currency: string;
  status: LeadProposalStatus;
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  pdf_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at?: string;
}

export interface LeadInteractionRecord {
  id: string;
  lead_id: string;
  type: LeadInteractionType;
  content: string;
  sent_by: string | null;
  created_at: string;
  interaction_at?: string;
  metadata?: Record<string, unknown>;
}

export interface LeadStatusHistoryRecord {
  id: string;
  lead_id: string;
  from_status: LeadPipelineStatus | null;
  to_status: LeadPipelineStatus;
  changed_by: string | null;
  changed_at: string;
  reason: string | null;
  metadata?: Record<string, unknown>;
}

export interface LeadScoreHistoryRecord {
  id: string;
  lead_id: string;
  score: number;
  category: LeadScoreCategory;
  reason: string | null;
  changed_by: string | null;
  changed_at: string;
  payload?: Record<string, unknown>;
}
