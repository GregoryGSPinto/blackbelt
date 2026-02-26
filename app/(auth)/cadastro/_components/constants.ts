import type { Perfil } from './types';

export const AVATARES: Record<Perfil, string[]> = {
  kids: ['🦁','🐯','🐼','🐨','🦊','🐻','🐸','🦋','🐹','🐰','🐶','🐱'],
  adolescente: ['🥋','⚡','🔥','💪','🎯','🏆','⭐','🌟','💎','🚀','⚔️','🏅'],
  adulto: ['🥋','⚡','🔥','💪','🎯','🏆','⭐','🌟','💎','🚀','⚔️','🏅'],
};

export const STEP_TITLES: Record<string, { title: string; subtitle: string }> = {
  email:   { title: 'Criar Conta',         subtitle: 'Digite seu email para começar' },
  senha:   { title: 'Criar Senha',         subtitle: 'Crie uma senha segura' },
  dados:          { title: 'Seus Dados',              subtitle: 'Complete seu perfil' },
  consentimento:  { title: 'Autorização',              subtitle: 'Consentimento do responsável' },
  avatar:         { title: 'Escolha seu Avatar',       subtitle: 'Personalize sua conta' },
  kids:    { title: 'Adicionar Filhos',     subtitle: 'Perfis Kids (opcional)' },
  revisao: { title: 'Revisão',             subtitle: 'Revise e finalize' },
};
