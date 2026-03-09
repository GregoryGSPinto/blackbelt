'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Mail, Phone, MapPin, Users, DollarSign, Calendar,
  CheckCircle2, XCircle, Send
} from 'lucide-react';

// Mock data - substituir por API real
const mockLead = {
  id: '1',
  name: 'Academia Fight Club',
  responsible: 'Carlos Silva',
  email: 'contato@fightclub.com',
  phone: '(11) 99999-1111',
  city: 'São Paulo',
  state: 'SP',
  address: 'Rua Augusta, 1500 - Consolação',
  modalities: ['BJJ', 'Muay Thai', 'Boxe'],
  students: 120,
  monthlyRevenue: 35000,
  score: 85,
  status: 'qualified',
  source: 'Website',
  date: '2024-01-15',
  notes: 'Interessado em migrar de sistema atual. Mencionou problemas com check-in manual.',
  interactions: [
    { id: '1', type: 'email', content: 'Email de boas-vindas enviado', date: '2024-01-15 10:00', sentBy: 'Sistema' },
    { id: '2', type: 'note', content: 'Ligação realizada. Carlos mostrou interesse na funcionalidade de check-in QR.', date: '2024-01-16 14:30', sentBy: 'João (Vendas)' },
    { id: '3', type: 'email', content: 'Proposta enviada com valor de R$ 299/mês', date: '2024-01-17 09:00', sentBy: 'Sistema' },
  ]
};

const statusOptions = [
  { value: 'new', label: 'Novo', color: '#3b82f6' },
  { value: 'qualified', label: 'Qualificado', color: '#22c55e' },
  { value: 'contacted', label: 'Contactado', color: '#f59e0b' },
  { value: 'approved', label: 'Aprovado', color: '#10b981' },
  { value: 'rejected', label: 'Rejeitado', color: '#ef4444' },
  { value: 'converted', label: 'Convertido', color: '#8b5cf6' },
];

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  
  const [lead, setLead] = useState(mockLead);
  const [score, setScore] = useState(mockLead.score);
  const [status, setStatus] = useState(mockLead.status);
  const [notes, setNotes] = useState(mockLead.notes);
  const [customPrice, setCustomPrice] = useState('');
  const [newNote, setNewNote] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const statusLabels: Record<string, string> = {
    new: 'Novo',
    qualified: 'Qualificado',
    contacted: 'Contactado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    converted: 'Convertido',
  };

  const statusColors: Record<string, string> = {
    new: '#3b82f6',
    qualified: '#22c55e',
    contacted: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    converted: '#8b5cf6',
  };

  const getScoreColor = (value: number) => {
    if (value >= 80) return '#22c55e';
    if (value >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const interaction = {
      id: Date.now().toString(),
      type: 'note',
      content: newNote,
      date: new Date().toLocaleString('pt-BR'),
      sentBy: 'Você'
    };
    
    setLead(prev => ({
      ...prev,
      interactions: [interaction, ...prev.interactions]
    }));
    setNewNote('');
  };

  const handleApprove = () => {
    setStatus('approved');
    // Aqui integraria com API para enviar proposta
    alert('Proposta aprovada! Email será enviado automaticamente.');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    setStatus('rejected');
    setShowRejectModal(false);
    // Aqui integraria com API
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 transition hover:opacity-80 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              {lead.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Lead desde {new Date(lead.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <span 
            className="rounded-full px-4 py-2 text-sm font-medium"
            style={{ 
              background: `${statusColors[status]}20`,
              color: statusColors[status]
            }}
          >
            {statusLabels[status]}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Info */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info Card */}
            <div className="premium-card rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Informações da Academia
              </h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-amber-500/10">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Responsável</p>
                    <p className="font-medium text-[var(--text-primary)]">{lead.responsible}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-amber-500/10">
                    <MapPin className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Localização</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      {lead.city}, {lead.state}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-amber-500/10">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Alunos</p>
                    <p className="font-medium text-[var(--text-primary)]">{lead.students}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2 bg-amber-500/10">
                    <DollarSign className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Faturamento</p>
                    <p className="font-medium text-[var(--text-primary)]">
                      R$ {lead.monthlyRevenue.toLocaleString()}/mês
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-[var(--text-secondary)]">Modalidades</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lead.modalities.map(mod => (
                    <span 
                      key={mod}
                      className="rounded-full px-3 py-1 text-sm bg-amber-500/10 text-amber-500"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <a 
                  href={`mailto:${lead.email}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition hover:opacity-80 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                >
                  <Mail className="h-4 w-4" />
                  Enviar Email
                </a>
                <a 
                  href={`tel:${lead.phone}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition hover:opacity-80 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                >
                  <Phone className="h-4 w-4" />
                  Ligar
                </a>
              </div>
            </div>

            {/* Interactions Timeline */}
            <div className="premium-card rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Histórico de Interações
              </h3>

              <div className="space-y-4">
                {lead.interactions.map((interaction) => (
                  <div key={interaction.id} className="flex gap-4">
                    <div className="h-2 w-2 rounded-full mt-2 bg-amber-500" />
                    <div className="flex-1">
                      <p className="text-[var(--text-primary)]">{interaction.content}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <span>{interaction.date}</span>
                        <span>•</span>
                        <span>{interaction.sentBy}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Note */}
              <div className="mt-6 pt-6 border-t border-[var(--border)]">
                <p className="mb-2 text-sm font-medium text-[var(--text-primary)]">Adicionar nota</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite uma observação..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:ring-2 focus:ring-amber-500/50"
                  />
                  <button
                    onClick={handleAddNote}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-80 bg-amber-500 text-white"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Score Card */}
            <div className="premium-card rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Score de Qualificação
              </h3>
              
              <div className="text-center">
                <div 
                  className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold"
                  style={{ 
                    background: `${getScoreColor(score)}20`,
                    color: getScoreColor(score)
                  }}
                >
                  {score}
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-[var(--text-secondary)]">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>

              <div className="mt-6">
                <p className="mb-2 text-sm text-[var(--text-secondary)]">Status</p>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="premium-card rounded-xl p-6">
              <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
                Proposta Personalizada
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-[var(--text-secondary)]">Preço mensal (R$)</p>
                  <input
                    type="number"
                    placeholder="299"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm text-[var(--text-secondary)]">Notas internas</p>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition hover:opacity-90 bg-emerald-500 text-white"
              >
                <CheckCircle2 className="h-5 w-5" />
                Aprovar e Enviar Proposta
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-red-500 py-3 font-medium text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
                Rejeitar Lead
              </button>

              <button
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition hover:opacity-80 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              >
                <Calendar className="h-5 w-5" />
                Agendar Ligação
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-2xl border border-[var(--border)] p-6 bg-[var(--card-bg)]"
          >
            <h3 className="mb-4 text-xl font-bold text-[var(--text-primary)]">
              Rejeitar Lead
            </h3>
            <p className="mb-4 text-[var(--text-secondary)]">
              Informe o motivo da rejeição:
            </p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Não atende critérios mínimos, localização inadequada..."
              className="mb-4 w-full rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 rounded-xl border border-[var(--border)] py-3 font-medium transition hover:opacity-80 text-[var(--text-primary)]"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 rounded-xl bg-red-500 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
              >
                Confirmar Rejeição
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
