'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Target, Users, TrendingUp, DollarSign, UserPlus, 
  ArrowRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Mock data - substituir por API real
const funnelData = [
  { stage: 'Visitantes', leads: 1250, color: '#6366f1' },
  { stage: 'Leads', leads: 320, color: '#8b5cf6' },
  { stage: 'Qualificados', leads: 85, color: '#a855f7' },
  { stage: 'Propostas', leads: 42, color: '#d946ef' },
  { stage: 'Convertidos', leads: 18, color: '#22c55e' },
];

const monthlyData = [
  { month: 'Jan', leads: 45, qualified: 12, converted: 3 },
  { month: 'Fev', leads: 52, qualified: 18, converted: 5 },
  { month: 'Mar', leads: 48, qualified: 15, converted: 4 },
  { month: 'Abr', leads: 61, qualified: 22, converted: 7 },
  { month: 'Mai', leads: 55, qualified: 20, converted: 6 },
  { month: 'Jun', leads: 67, qualified: 25, converted: 8 },
];

const sourceData = [
  { name: 'Website', value: 45, color: '#6366f1' },
  { name: 'Indicação', value: 25, color: '#8b5cf6' },
  { name: 'Redes Sociais', value: 20, color: '#a855f7' },
  { name: 'Eventos', value: 10, color: '#d946ef' },
];

const recentLeads = [
  { id: '1', name: 'Academia Fight Club', city: 'São Paulo', status: 'new', score: 85, date: '2024-01-15' },
  { id: '2', name: 'Gracie Barra Central', city: 'Rio de Janeiro', status: 'qualified', score: 92, date: '2024-01-14' },
  { id: '3', name: 'Checkmat BH', city: 'Belo Horizonte', status: 'contacted', score: 78, date: '2024-01-14' },
  { id: '4', name: 'Academia Trovão', city: 'Curitiba', status: 'new', score: 65, date: '2024-01-13' },
  { id: '5', name: 'Alliance Jiu-Jitsu', city: 'Salvador', status: 'approved', score: 88, date: '2024-01-12' },
];

const metrics = [
  { title: 'Leads do Mês', value: '127', icon: Target, trend: '+12%', trendUp: true },
  { title: 'Taxa de Conversão', value: '18%', icon: TrendingUp, trend: '+3%', trendUp: true },
  { title: 'Leads Qualificados', value: '45', icon: Users, trend: '+8%', trendUp: true },
  { title: 'Receita Potencial', value: 'R$ 45K', icon: DollarSign, trend: '+15%', trendUp: true },
];

export default function CaptacaoDashboard() {
  const statusColors: Record<string, string> = {
    new: '#f59e0b',
    qualified: '#22c55e',
    contacted: '#3b82f6',
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
              Captação de Academias
            </h1>
            <p className="text-sm mt-1 text-[var(--text-secondary)]">
              Gestão de leads e conversão de academias
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/super-admin/captacao/leads"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition bg-white/10 text-[var(--text-primary)] hover:bg-white/20"
            >
              <UserPlus className="h-4 w-4" />
              Ver Leads
            </Link>
            <Link
              href="/super-admin/captacao/leads?status=new"
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition bg-amber-500 text-white hover:bg-amber-600"
            >
              <Target className="h-4 w-4" />
              Novos Leads
            </Link>
          </div>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="stat-card hover-card rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-medium text-[var(--text-primary)]">
                    {metric.value}
                  </p>
                  <p className={`text-xs flex items-center gap-1 ${metric.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                    <TrendingUp className="h-3 w-3" />
                    {metric.trend} vs mês anterior
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <metric.icon className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Funil de Conversão */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="premium-card rounded-xl p-6"
          >
            <h3 className="mb-6 text-sm font-semibold text-[var(--text-secondary)]">
              Funil de Conversão
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--text-secondary)" />
                  <YAxis dataKey="stage" type="category" width={100} stroke="var(--text-primary)" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Origem dos Leads */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="premium-card rounded-xl p-6"
          >
            <h3 className="mb-6 text-sm font-semibold text-[var(--text-secondary)]">
              Origem dos Leads
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--card-bg)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-4">
              {sourceData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div 
                    className="h-3 w-3 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-sm text-[var(--text-secondary)]">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Evolução Mensal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8 premium-card rounded-xl p-6"
        >
          <h3 className="mb-6 text-sm font-semibold text-[var(--text-secondary)]">
            Evolução Mensal
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--card-bg)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="leads" stroke="#6366f1" strokeWidth={2} name="Leads" />
                <Line type="monotone" dataKey="qualified" stroke="#22c55e" strokeWidth={2} name="Qualificados" />
                <Line type="monotone" dataKey="converted" stroke="#10b981" strokeWidth={2} name="Convertidos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Leads Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="premium-card rounded-xl p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)]">
              Leads Recentes
            </h3>
            <Link
              href="/super-admin/captacao/leads"
              className="flex items-center gap-1 text-sm transition hover:opacity-80 text-amber-500"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="pb-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Academia</th>
                  <th className="pb-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Cidade</th>
                  <th className="pb-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Status</th>
                  <th className="pb-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Score</th>
                  <th className="pb-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Data</th>
                  <th className="pb-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-[var(--bg-secondary)]/50 transition-colors"
                  >
                    <td className="py-4">
                      <span className="font-medium text-[var(--text-primary)]">{lead.name}</span>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)]">{lead.city}</td>
                    <td className="py-4">
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
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 w-16 rounded-full bg-amber-500/20"
                        >
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${lead.score}%`,
                              background: lead.score >= 80 ? '#22c55e' : lead.score >= 50 ? '#f59e0b' : '#ef4444'
                            }}
                          />
                        </div>
                        <span className="text-sm text-[var(--text-secondary)]">{lead.score}</span>
                      </div>
                    </td>
                    <td className="py-4 text-[var(--text-secondary)]">
                      {new Date(lead.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/super-admin/captacao/${lead.id}`}
                        className="rounded-lg p-2 transition hover:opacity-80 inline-flex bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
