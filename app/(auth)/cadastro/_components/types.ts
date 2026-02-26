export type Step = 'email' | 'senha' | 'dados' | 'consentimento' | 'avatar' | 'kids' | 'revisao';
export type Perfil = 'adulto' | 'adolescente' | 'kids';
export type Sexo = 'masculino' | 'feminino' | 'nao-informar';

export interface DadosUsuario {
  email: string;
  senha: string;
  confirmarSenha: string;
  nome: string;
  sexo: Sexo;
  dataNascimento: string;
  idade?: number;
  perfilAutomatico?: Perfil;
  avatar?: string;
  avatarFile?: string;
  /** Guardian fields (required for teens 13-17) */
  emailResponsavel?: string;
  nomeResponsavel?: string;
  consentimentoAceito?: boolean;
}

export interface DadosKid {
  nome: string;
  dataNascimento: string;
  sexo: Sexo;
}

/** Props base que todos os step-components recebem */
export interface StepBaseProps {
  error: string;
  setError: (msg: string) => void;
}
