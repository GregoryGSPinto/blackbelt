'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, Download, ArrowRight,
  Mail, Phone, MapPin,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// Mock data - substituir por API real
const mockLeads = [
  { id: '1', name: 'Academia Fight Club', responsible: 'Carlos Silva', email: 'contato@fightclub.com', phone: '(11) 99999-1111', city: 'São Paulo', state: 'SP', modalities: ['BJJ', 'Muay Thai'], students: 120, revenue: 35000, score: 85, status: 'new', date: '2024-01-15', source: 'Website' },
  { id: '2', name: 'Gracie Barra Central', responsible: 'Ana Oliveira', email: 'ana@graciecentral.com', phone: '(21) 99999-2222', city: 'Rio de Janeiro', state: 'RJ', modalities: ['BJJ'], students: 200, revenue: 60000, score: 92, status: 'qualified', date: '2024-01-14', source: 'Indicação' },
  { id: '3', name: 'Checkmat BH', responsible: 'Pedro Costa', email: 'pedro@checkmatbh.com', phone: '(31) 99999-3333', city: 'Belo Horizonte', state: 'MG', modalities: ['BJJ', 'MMA'], students: 80, revenue: 24000, score: 78, status: 'contacted', date: '2024-01-14', source: 'Instagram' },
  { id: '4', name: 'Academia Trovão', responsible: 'Marina Santos', email: 'marina@trovao.com', phone: '(41) 99999-4444', city: 'Curitiba', state: 'PR', modalities: ['Boxe'], students: 45, revenue: 15000, score: 65, status: 'new', date: '2024-01-13', source: 'Website' },
  { id: '5', name: 'Alliance Jiu-Jitsu', responsible: 'Roberto Lima', email: 'roberto@alliance.com', phone: '(71) 99999-5555', city: 'Salvador', state: 'BA', modalities: ['BJJ'], students: 180, revenue: 54000, score: 88, status: 'approved', date: '2024-01-12', source: 'Evento' },
  { id: '6', name: 'Muay Thai Center', responsible: 'Julia Mendes', email: 'julia@muaythaicenter.com', phone: '(11) 99999-6666', city: 'São Paulo', state: 'SP', modalities: ['Muay Thai'], students: 95, revenue: 28500, score: 72, status: 'rejected', date: '2024-01-11', source: 'Facebook' },
  { id: '7', name: 'CT Carlson Gracie', responsible: 'Fernando Souza', email: 'fernando@ctcarlson.com', phone: '(19) 99999-7777', city: 'Campinas', state: 'SP', modalities: ['BJJ', 'MMA'], students: 250, revenue: 75000, score: 95, status: 'converted', date: '2024-01-10', source: 'Indicação' },
  { id: '8', name: 'Academia Dragão', responsible: 'Lucas Pereira', email: 'lucas@dragao.com', phone: '(51) 99999-8888', city: 'Porto Alegre', state: 'RS', modalities: ['Karatê', 'Judo'], students: 60, revenue: 18000, score: 58, status: 'new', date: '2024-01-09', source: 'Website' },
];

const statusOptions = [
  { value: 'all', label: 'Todos', color: '#6366f1' },
  { value: 'new', label: 'Novo', color: '#3b82f6' },
  { value: 'qualified', label: 'Qualificado', color: '#22c55e' },
  { value: 'contacted', label: 'Contactado', color: '#f59e0b' },
  { value: 'approved', label: 'Aprovado', color: '#10b981' },
  { value: 'rejected', label: 'Rejeitado', color: '#ef4444' },
  { value: 'converted', label: 'Convertido', color: '#8b5cf6' },
];

const modalityOptions = ['Todas', 'BJJ', 'Muay Thai', 'Boxe', 'MMA', 'Karatê', 'Judo'];

export default function LeadsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalityFilter, setModalityFilter] = useState('Todas');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter leads
  const filteredLeads = mockLeads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesModality = modalityFilter === 'Todas' || lead.modalities.includes(modalityFilter);
    return matchesSearch && matchesStatus && matchesModality;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusColors: Record<string, string> = {
    new: '#3b82f6',
    qualified: '#22c55e',
    contacted: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    converted: '#8b5cf6',
  };

  const statusLabels: Record<string, string> = {
    new: 'Novo',
    qualified: 'Qualificado',
    contacted: 'Contactado',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    converted: 'Convertido',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
              Leads
            </h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              {filteredLeads.length} leads encontrados
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition bg-white/10 text-[var(--text-primary)] hover:bg-white/20"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </button>
            <Link
              href="/super-admin/captacao"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition bg-amber-500 text-white hover:bg-amber-600"
            >
              <ArrowRight className="h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 premium-card rounded-xl p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-amber-500/50 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* Modality Filter */}
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value)}
              className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm outline-none bg-[var(--bg-secondary)] text-[var(--text-primary)]"
            >
              {modalityOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Leads Table */}
        <div className="premium-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-500/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Academia</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Localização</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Modalidades</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Alunos</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedLeads.map((lead, index) => (
                  <motion.tr 
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{lead.name}</p>
                        <p className="text-sm text-[var(--text-secondary)]">{lead.responsible}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-[var(--text-secondary)]">
                        <MapPin className="h-4 w-4" />
                        {lead.city}, {lead.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {lead.modalities.map(mod => (
                          <span 
                            key={mod}
                            className="rounded-full px-2 py-0.5 text-xs bg-amber-500/10 text-amber-500"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[var(--text-primary)]">
                        <p className="font-medium">{lead.students} alunos</p>
                        <p className="text-sm text-[var(--text-secondary)]">
                          R$ {lead.revenue.toLocaleString()}/mês
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-12 rounded-full bg-amber-500/20">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${lead.score}%`,
                              background: getScoreColor(lead.score)
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: getScoreColor(lead.score) }}>
                          {lead.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{ 
                          background: `${statusColors[lead.status]}20`,
                          color: statusColors[lead.status]
                        }}
                      >
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <a 
                          href={`mailto:${lead.email}`}
                          className="rounded-lg p-2 transition hover:opacity-80 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <a 
                          href={`tel:${lead.phone}`}
                          className="rounded-lg p-2 transition hover:opacity-80 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <Link
                          href={`/super-admin/captacao/${lead.id}`}
                          className="rounded-lg p-2 transition hover:opacity-80 bg-amber-500 text-white"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Mostrando {paginatedLeads.length} de {filteredLeads.length} leads
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-lg p-2 transition disabled:opacity-50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm text-[var(--text-primary)]">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg p-2 transition disabled:opacity-50 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
