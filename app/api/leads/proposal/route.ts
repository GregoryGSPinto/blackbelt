import { jsPDF } from 'jspdf';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/emails/sender';
import { leadApiError, leadApiSuccess, mapLeadError } from '@/lib/leads/http';
import { canTransitionLeadStage } from '@/lib/leads/pipeline';
import { formatCurrency, requireSuperAdmin } from '@/lib/leads/server';
import { proposalSchema } from '@/lib/leads/validation';

function buildProposalPdf(proposal: any, lead: any) {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text('BlackBelt Proposal', 20, 24);
  doc.setFontSize(12);
  doc.text(`Academia: ${lead.academy_name}`, 20, 40);
  doc.text(`Responsável: ${lead.responsible_name ?? 'N/A'}`, 20, 48);
  doc.text(`Cidade: ${[lead.city, lead.state].filter(Boolean).join(', ')}`, 20, 56);
  doc.text(`Valor proposto: ${formatCurrency(proposal.proposal_value, proposal.currency)}`, 20, 64);
  doc.text(`Status: ${proposal.status}`, 20, 72);
  doc.text(`Emitida em: ${new Date(proposal.created_at).toLocaleDateString('pt-BR')}`, 20, 80);
  doc.text('Escopo comercial', 20, 98);
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(
    'Plataforma SaaS para gestão completa de academias de artes marciais, com check-in, financeiro, CRM e inteligência operacional.',
    170,
  );
  doc.text(lines, 20, 108);
  if (proposal.notes) {
    doc.text('Observações', 20, 140);
    doc.text(doc.splitTextToSize(proposal.notes, 170), 20, 148);
  }
  return Buffer.from(doc.output('arraybuffer'));
}

export async function GET(request: Request) {
  try {
    const { supabase } = await requireSuperAdmin();
    const { searchParams } = new URL(request.url);
    const proposalId = searchParams.get('proposalId');
    if (!proposalId) {
      return leadApiError('proposalId is required', 400);
    }

    const { data: proposal, error: proposalError } = await supabase
      .from('lead_proposals')
      .select('*')
      .eq('id', proposalId)
      .single();
    if (proposalError || !proposal) {
      return leadApiError('Proposal not found', 404);
    }

    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', proposal.lead_id)
      .single();
    if (!lead) {
      return leadApiError('Lead not found', 404);
    }

    const pdfBuffer = buildProposalPdf(proposal, lead);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="proposal-${proposal.id}.pdf"`,
      },
    });
  } catch (error) {
    return mapLeadError(error);
  }
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await requireSuperAdmin();
    const rawBody = await request.json();
    const parsed = proposalSchema.safeParse(rawBody);
    if (!parsed.success) {
      return leadApiError('Validation failed', 400, parsed.error.flatten());
    }

    const body = parsed.data;
    const { data: lead } = await supabase
      .from('leads')
      .select('*')
      .eq('id', body.lead_id)
      .single();

    if (!lead) {
      return leadApiError('Lead not found', 404);
    }
    if (body.action === 'send' && !lead.email) {
      return leadApiError('Lead email is required to send a proposal', 400);
    }

    if (body.action === 'create') {
      const { count } = await supabase
        .from('lead_proposals')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', body.lead_id);

      const { data: proposal, error } = await supabase
        .from('lead_proposals')
        .insert({
          lead_id: body.lead_id,
          proposal_value: body.proposal_value,
          currency: body.currency,
          status: body.status,
          notes: body.notes ?? null,
          created_by: user.id,
          version: (count ?? 0) + 1,
        })
        .select('*')
        .single();

      if (error) return leadApiError(error.message, 500);

      const pdfUrl = `/api/leads/proposal?proposalId=${proposal.id}`;
      const { data: updatedProposal } = await supabase
        .from('lead_proposals')
        .update({ pdf_url: pdfUrl })
        .eq('id', proposal.id)
        .select('*')
        .single();

      await Promise.all([
        supabase.from('leads').update({
          proposed_price: body.proposal_value,
          status: body.status === 'SENT' ? 'PROPOSAL_SENT' : lead.status,
        }).eq('id', body.lead_id),
        supabase.from('lead_interactions').insert({
          lead_id: body.lead_id,
          type: body.status === 'SENT' ? 'proposal_sent' : 'note',
          content: `Proposta v${proposal.version} criada em ${formatCurrency(body.proposal_value, body.currency)}`,
          sent_by: user.id,
          created_by: user.id,
          metadata: { proposalId: proposal.id, pdfUrl },
        }),
      ]);

      return leadApiSuccess({ proposal: updatedProposal ?? proposal }, 201);
    }

    if (!body.proposal_id) {
      return leadApiError('proposal_id is required for this action', 400);
    }

    const { data: currentProposal, error: currentProposalError } = await supabase
      .from('lead_proposals')
      .select('*')
      .eq('id', body.proposal_id)
      .eq('lead_id', body.lead_id)
      .single();
    if (currentProposalError || !currentProposal) {
      return leadApiError('Proposal not found for this lead', 404);
    }

    const statusMap = {
      send: 'SENT',
      accept: 'ACCEPTED',
      reject: 'REJECTED',
    } as const;
    const proposalStatus = statusMap[body.action];
    const timestampField = body.action === 'send' ? 'sent_at' : body.action === 'accept' ? 'accepted_at' : 'rejected_at';
    const leadStatus = body.action === 'accept'
      ? 'WON'
      : body.action === 'send'
        ? 'PROPOSAL_SENT'
        : 'NEGOTIATING';

    if (!canTransitionLeadStage(lead.status, leadStatus)) {
      return leadApiError(`Invalid pipeline transition: ${lead.status} -> ${leadStatus}`, 409);
    }

    if (body.action === 'send') {
      const proposalUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/leads/proposal?proposalId=${body.proposal_id}`;
      const emailResult = await sendEmail(
        lead.email,
        'lead-proposal',
        {
          responsibleName: lead.responsible_name ?? 'Academia',
          academyName: lead.academy_name,
          proposalValue: formatCurrency(body.proposal_value, body.currency),
          proposalUrl,
        },
      );
      if (!emailResult.success) {
        return leadApiError(emailResult.error || 'Failed to send proposal email', 502);
      }
    }

    const { data: proposal, error } = await supabase
      .from('lead_proposals')
      .update({
        status: proposalStatus,
        [timestampField]: new Date().toISOString(),
      })
      .eq('id', body.proposal_id)
      .eq('lead_id', body.lead_id)
      .select('*')
      .single();

    if (error) return leadApiError(error.message, 500);

    await Promise.all([
      supabase.from('leads').update({
        status: leadStatus,
        proposed_price: body.proposal_value,
        closed_price: body.action === 'accept' ? body.proposal_value : lead.closed_price,
        converted_at: body.action === 'accept' ? new Date().toISOString() : lead.converted_at,
      }).eq('id', body.lead_id),
      supabase.from('lead_interactions').insert({
        lead_id: body.lead_id,
        type: 'proposal_sent',
        content: `Proposta ${proposalStatus.toLowerCase()} em ${new Date().toLocaleString('pt-BR')}`,
        sent_by: user.id,
        created_by: user.id,
        metadata: { proposalId: body.proposal_id, proposalStatus },
      }),
    ]);

    return leadApiSuccess({ proposal });
  } catch (error) {
    return mapLeadError(error);
  }
}
