'use client';

import { useState } from 'react';
import { Building2, Phone, Globe, Instagram, Facebook, Youtube, Clock, MapPin, Save } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getDesignTokens } from '@/lib/design-tokens';
import { useToast } from '@/contexts/ToastContext';
import { mockAcademyData } from '@/lib/__mocks__/academy-management.mock';
import type { AcademyData } from '@/lib/__mocks__/academy-management.mock';

export default function AcademiaPage() {
  const { isDark } = useTheme();
  const tokens = getDesignTokens(isDark);
  const toast = useToast();
  const [data, setData] = useState<AcademyData>(mockAcademyData);
  const [saving, setSaving] = useState(false);

  const card = { background: 'var(--card-bg)', border: '1px solid black', borderRadius: 12 } as const;
  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: '1px solid black', color: 'var(--text-primary)', borderRadius: 12 } as const;

  const update = (field: string, value: string | number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateEndereco = (field: string, value: string) => {
    setData(prev => ({ ...prev, endereco: { ...prev.endereco, [field]: value } }));
  };

  const updateRedes = (field: string, value: string) => {
    setData(prev => ({ ...prev, redesSociais: { ...prev.redesSociais, [field]: value } }));
  };

  const toggleDia = (idx: number) => {
    setData(prev => {
      const h = [...prev.horarioFuncionamento];
      h[idx] = { ...h[idx], aberto: !h[idx].aberto };
      return { ...prev, horarioFuncionamento: h };
    });
  };

  const updateHorario = (idx: number, field: 'inicio' | 'fim', val: string) => {
    setData(prev => {
      const h = [...prev.horarioFuncionamento];
      h[idx] = { ...h[idx], [field]: val };
      return { ...prev, horarioFuncionamento: h };
    });
  };

  const buscarCep = async () => {
    const cep = data.endereco.cep.replace(/\D/g, '');
    if (cep.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const json = await res.json();
      if (!json.erro) {
        setData(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            logradouro: json.logradouro || prev.endereco.logradouro,
            bairro: json.bairro || prev.endereco.bairro,
            cidade: json.localidade || prev.endereco.cidade,
            estado: json.uf || prev.endereco.estado,
          },
        }));
        toast.success('Endereco atualizado pelo CEP');
      }
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast.success('Dados salvos com sucesso');
  };

  const maskCnpj = (v: string) => {
    return v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 18);
  };

  const Field = ({ label, value, onChange, placeholder, type = 'text', colSpan = false }: { label: string; value: string | number; onChange: (v: string) => void; placeholder?: string; type?: string; colSpan?: boolean }) => (
    <div className={colSpan ? 'md:col-span-2' : ''}>
      <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 md:px-0 pt-6 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Dados da Academia</h1>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-40" style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}>
          <Save size={16} /> {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {/* Dados Basicos */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Building2 size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Dados Basicos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Razao Social" value={data.razaoSocial} onChange={(v) => update('razaoSocial', v)} colSpan />
          <Field label="CNPJ" value={data.cnpj} onChange={(v) => update('cnpj', maskCnpj(v))} placeholder="99.999.999/9999-99" />
          <Field label="Inscricao Estadual" value={data.inscricaoEstadual} onChange={(v) => update('inscricaoEstadual', v)} />
          <Field label="Inscricao Municipal" value={data.inscricaoMunicipal} onChange={(v) => update('inscricaoMunicipal', v)} />
          <Field label="Data de Fundacao" value={data.dataFundacao} onChange={(v) => update('dataFundacao', v)} type="date" />
          <Field label="Capacidade (m2)" value={data.capacidadeM2} onChange={(v) => update('capacidadeM2', Number(v))} type="number" />
          <Field label="Capacidade (alunos simultaneos)" value={data.capacidadeAlunos} onChange={(v) => update('capacidadeAlunos', Number(v))} type="number" />
        </div>
      </div>

      {/* Endereco */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <MapPin size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Endereco
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>CEP</label>
            <div className="flex gap-2">
              <input value={data.endereco.cep} onChange={(e) => updateEndereco('cep', e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="30130-000" />
              <button onClick={buscarCep} className="px-4 py-3 rounded-xl text-sm" style={{ background: 'var(--card-bg)', border: '1px solid black', color: 'var(--text-primary)' }}>Buscar</button>
            </div>
          </div>
          <Field label="Logradouro" value={data.endereco.logradouro} onChange={(v) => updateEndereco('logradouro', v)} />
          <Field label="Numero" value={data.endereco.numero} onChange={(v) => updateEndereco('numero', v)} />
          <Field label="Complemento" value={data.endereco.complemento} onChange={(v) => updateEndereco('complemento', v)} />
          <Field label="Bairro" value={data.endereco.bairro} onChange={(v) => updateEndereco('bairro', v)} />
          <Field label="Cidade" value={data.endereco.cidade} onChange={(v) => updateEndereco('cidade', v)} />
          <Field label="Estado" value={data.endereco.estado} onChange={(v) => updateEndereco('estado', v)} />
        </div>
      </div>

      {/* Contato */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Phone size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Contato
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Telefone" value={data.telefone} onChange={(v) => update('telefone', v)} />
          <Field label="WhatsApp" value={data.whatsapp} onChange={(v) => update('whatsapp', v)} />
          <Field label="Email Institucional" value={data.emailInstitucional} onChange={(v) => update('emailInstitucional', v)} />
          <Field label="Website" value={data.website} onChange={(v) => update('website', v)} />
        </div>
      </div>

      {/* Redes Sociais */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Globe size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Redes Sociais
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Instagram size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input value={data.redesSociais.instagram} onChange={(e) => updateRedes('instagram', e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="URL do Instagram" />
          </div>
          <div className="flex items-center gap-2">
            <Facebook size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input value={data.redesSociais.facebook} onChange={(e) => updateRedes('facebook', e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="URL do Facebook" />
          </div>
          <div className="flex items-center gap-2">
            <Youtube size={16} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
            <input value={data.redesSociais.youtube} onChange={(e) => updateRedes('youtube', e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} placeholder="URL do YouTube" />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <Field label="URL do Banner/Capa" value={data.bannerUrl} onChange={(v) => update('bannerUrl', v)} colSpan />
      </div>

      {/* Horario de Funcionamento */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          <Clock size={18} className="inline mr-2" style={{ color: 'var(--text-secondary)' }} />
          Horario de Funcionamento
        </h3>
        <div className="space-y-3">
          {data.horarioFuncionamento.map((h, i) => (
            <div key={h.dia} className="flex items-center gap-4 px-3 py-3 rounded-xl" style={{ border: '1px solid black' }}>
              <label className="flex items-center gap-2 w-28 cursor-pointer">
                <input type="checkbox" checked={h.aberto} onChange={() => toggleDia(i)} className="w-4 h-4" style={{ accentColor: isDark ? '#fff' : '#111' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{h.dia}</span>
              </label>
              {h.aberto ? (
                <div className="flex items-center gap-2">
                  <input type="time" value={h.inicio} onChange={(e) => updateHorario(i, 'inicio', e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>ate</span>
                  <input type="time" value={h.fim} onChange={(e) => updateHorario(i, 'fim', e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
                </div>
              ) : (
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Descricao e Regulamento */}
      <div style={{ ...card, padding: '1.5rem' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Descricao e Regulamento</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Descricao da Academia</label>
            <textarea value={data.descricao} onChange={(e) => update('descricao', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Regulamento Interno</label>
            <textarea value={data.regulamento} onChange={(e) => update('regulamento', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
          </div>
          <div>
            <label className="block text-sm font-normal mb-2" style={{ color: 'var(--text-secondary)' }}>Politica de Cancelamento</label>
            <textarea value={data.politicaCancelamento} onChange={(e) => update('politicaCancelamento', e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}
