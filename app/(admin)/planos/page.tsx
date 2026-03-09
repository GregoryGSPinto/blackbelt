'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  DollarSign,
  Users,
  Clock,
  Award
} from 'lucide-react';

const initialPlans = [
  {
    id: '1',
    name: 'Básico',
    price: 199,
    period: 'monthly',
    description: '2x por semana',
    students: 45,
    features: ['Aulas 2x por semana', 'Acesso a 1 modalidade', 'Check-in via app'],
    trialDays: 7,
    active: true,
  },
  {
    id: '2',
    name: 'Ilimitado',
    price: 299,
    period: 'monthly',
    description: 'Aulas ilimitadas',
    students: 128,
    features: ['Aulas ilimitadas', 'Todas as modalidades', 'Conteúdo online', 'Sem taxa de matrícula'],
    trialDays: 7,
    active: true,
    popular: true,
  },
  {
    id: '3',
    name: 'Competidor',
    price: 399,
    period: 'monthly',
    description: 'Preparação completa',
    students: 23,
    features: ['Tudo do Ilimitado', 'Treinos de competição', 'Preparação física', 'Aulas particulares 20% off'],
    trialDays: 14,
    active: true,
  },
];

export default function PlanosPage() {
  const router = useRouter();
  const [plans, setPlans] = useState(initialPlans);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: 'monthly',
    description: '',
    trialDays: '7',
    features: [''],
  });

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newPlan = {
      id: editingPlan?.id || Date.now().toString(),
      name: formData.name,
      price: Number(formData.price),
      period: formData.period,
      description: formData.description,
      trialDays: Number(formData.trialDays),
      features: formData.features.filter(f => f.trim()),
      students: editingPlan?.students || 0,
      active: true,
    };

    if (editingPlan) {
      setPlans(prev => prev.map(p => p.id === editingPlan.id ? newPlan : p));
    } else {
      setPlans(prev => [...prev, newPlan]);
    }

    setShowModal(false);
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      period: 'monthly',
      description: '',
      trialDays: '7',
      features: [''],
    });
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      period: plan.period,
      description: plan.description,
      trialDays: plan.trialDays.toString(),
      features: plan.features,
    });
    setShowModal(true);
  };

  const handleDelete = (planId: string) => {
    if (confirm('Tem certeza que deseja desativar este plano?')) {
      setPlans(prev => prev.map(p => p.id === planId ? { ...p, active: false } : p));
    }
  };

  const openNewPlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: '',
      period: 'monthly',
      description: '',
      trialDays: '7',
      features: [''],
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Planos e Preços</h1>
            <p className="mt-2 text-slate-400">Gerencie os planos disponíveis para matrícula</p>
          </div>
          <button
            onClick={openNewPlan}
            className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            <Plus className="h-5 w-5" />
            Novo Plano
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-amber-400/20 p-3">
                <DollarSign className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Ticket Médio</p>
                <p className="text-2xl font-bold">R$ 299</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-400/20 p-3">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total de Alunos</p>
                <p className="text-2xl font-bold">196</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-sky-400/20 p-3">
                <Award className="h-6 w-6 text-sky-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Planos Ativos</p>
                <p className="text-2xl font-bold">{plans.filter(p => p.active).length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.filter(p => p.active).map((plan) => (
            <motion.div
              key={plan.id}
              layout
              className={`rounded-2xl border p-6 ${
                plan.popular
                  ? 'border-amber-400/30 bg-amber-400/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              {plan.popular && (
                <span className="mb-4 inline-block rounded-full bg-amber-400 px-3 py-1 text-xs font-medium text-slate-950">
                  Mais Popular
                </span>
              )}
              
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-slate-400">{plan.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <span className="text-4xl font-bold">R$ {plan.price}</span>
                <span className="text-slate-400">/mês</span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{plan.trialDays} dias de trial</span>
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <Users className="h-4 w-4" />
                <span>{plan.students} alunos matriculados</span>
              </div>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Nome do Plano</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Preço (R$)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">Dias de Trial</label>
                  <input
                    type="number"
                    value={formData.trialDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, trialDays: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Benefícios</label>
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                      placeholder="Ex: Aulas ilimitadas"
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-amber-400 focus:outline-none"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="rounded-xl px-3 text-slate-400 transition hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="mt-2 text-sm text-amber-400 hover:text-amber-300"
                >
                  + Adicionar benefício
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-amber-400 py-3 font-semibold text-slate-950 transition hover:bg-amber-300"
                >
                  {editingPlan ? 'Salvar' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
