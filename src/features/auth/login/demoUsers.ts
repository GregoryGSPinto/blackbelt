export const DEMO_USERS = [
  { label: 'Super Admin', email: 'superadmin@blackbelt.com', senha: 'blackbelt123', icon: '👑', gradient: 'from-yellow-600 to-yellow-800' },
  { label: 'Admin', email: 'admin@blackbelt.com', senha: 'blackbelt123', icon: '🛠️', gradient: 'from-orange-600 to-orange-800' },
  { label: 'Professor', email: 'professor@blackbelt.com', senha: 'blackbelt123', icon: '👨‍🏫', gradient: 'from-indigo-600 to-indigo-800' },
  { label: 'Adulto', email: 'adulto@blackbelt.com', senha: 'blackbelt123', icon: '👤', gradient: 'from-blue-600 to-blue-800' },
  { label: 'Teen', email: 'miguel@blackbelt.com', senha: 'blackbelt123', icon: '🧑', gradient: 'from-purple-600 to-purple-800' },
  { label: 'Kids', email: 'kid@blackbelt.com', senha: 'blackbelt123', icon: '👶', gradient: 'from-pink-600 to-pink-800' },
  { label: 'Responsável', email: 'paiteen@blackbelt.com', senha: 'blackbelt123', icon: '👨‍👩‍👧', gradient: 'from-green-600 to-green-800' },
  { label: 'Support', email: 'support@blackbelt.com', senha: 'blackbelt123', icon: '🎧', gradient: 'from-teal-600 to-teal-800' },
  { label: 'Unit Owner', email: 'owner@blackbelt.com', senha: 'blackbelt123', icon: '🏢', gradient: 'from-slate-600 to-slate-800' },
] as const;

export const SHOW_DEMO_USERS =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_MOCK === 'true';

const DEMO_EMAIL_SET = new Set(DEMO_USERS.map((user) => user.email.toLowerCase()));

export function isDemoUserEmail(email: string): boolean {
  return DEMO_EMAIL_SET.has(email.trim().toLowerCase());
}
