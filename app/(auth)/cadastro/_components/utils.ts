import type { Perfil } from './types';

export function calcIdade(data: string): number {
  if (!data) return 0;
  const hoje = new Date();
  const nasc = new Date(data);
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

export function determinaPerfil(idade: number): Perfil {
  if (idade < 13) return 'kids';
  if (idade < 18) return 'adolescente';
  return 'adulto';
}

export function validaSenha(s: string): { ok: boolean; msg: string } {
  if (s.length < 6) return { ok: false, msg: 'Mínimo 6 caracteres' };
  return { ok: true, msg: 'Senha válida' };
}
