import type { LeadPipelineStatus } from '@/lib/leads/types';

export const LEAD_STAGE_TRANSITIONS: Record<LeadPipelineStatus, LeadPipelineStatus[]> = {
  NEW: ['ENRICHING', 'QUALIFIED', 'LOST'],
  ENRICHING: ['QUALIFIED', 'OUTREACH_STARTED', 'LOST'],
  QUALIFIED: ['OUTREACH_STARTED', 'MEETING_SCHEDULED', 'LOST'],
  OUTREACH_STARTED: ['MEETING_SCHEDULED', 'PROPOSAL_SENT', 'LOST'],
  MEETING_SCHEDULED: ['PROPOSAL_SENT', 'NEGOTIATING', 'LOST'],
  PROPOSAL_SENT: ['NEGOTIATING', 'WON', 'LOST'],
  NEGOTIATING: ['PROPOSAL_SENT', 'WON', 'LOST'],
  WON: [],
  LOST: [],
};

export function canTransitionLeadStage(from: LeadPipelineStatus, to: LeadPipelineStatus) {
  if (from === to) return true;
  return LEAD_STAGE_TRANSITIONS[from].includes(to);
}
