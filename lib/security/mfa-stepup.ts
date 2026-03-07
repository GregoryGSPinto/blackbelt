/**
 * BLACKBELT — MFA (TOTP) + Step-Up Authentication
 *
 * TOTP (RFC 6238) para ADMIN e PROFESSOR.
 * Step-up auth para ações críticas (delete, export, config).
 *
 * DEPENDÊNCIAS (backend deve instalar):
 *   npm install otpauth qrcode
 *
 * FLUXO MFA:
 *   1. Admin chama setupMFA() → recebe QR code
 *   2. Admin escaneia com Google Authenticator / Authy
 *   3. Admin chama verifyMFASetup(code) → MFA ativado
 *   4. Login subsequente: login() → 200 {mfaRequired: true} → verifyMFA(code) → JWT
 *
 * FLUXO STEP-UP:
 *   1. Ação crítica interceptada → 403 {stepUpRequired: true}
 *   2. Frontend mostra modal "Confirme sua identidade"
 *   3. User digita código MFA → POST /api/auth/step-up
 *   4. Recebe step-up token (5 min validade) → repete ação original
 */

// ── Types ──

export interface MFASetupResult {
  secret: string;       // Base32 secret (store encrypted in DB)
  uri: string;          // otpauth:// URI
  qrCodeDataURL: string; // data:image/png;base64,...
  backupCodes: string[]; // 8 single-use backup codes
}

export interface MFAVerifyResult {
  valid: boolean;
  usedBackupCode: boolean;
}

export interface StepUpToken {
  token: string;
  expiresAt: string;
  action: string;
  userId: string;
}

export type CriticalAction =
  | 'DELETE_STUDENT'
  | 'DELETE_CLASS'
  | 'EXPORT_DATA'
  | 'LGPD_ANONYMIZE'
  | 'CHANGE_ADMIN_CONFIG'
  | 'REVOKE_ALL_SESSIONS'
  | 'MODIFY_RLS_POLICY'
  | 'MANAGE_PROFESSORS'
  | 'FINANCIAL_EXPORT'
  | 'BULK_OPERATIONS';

// Roles that MUST have MFA enabled
export const MFA_REQUIRED_ROLES = ['ADMIN', 'SUPER_ADMIN', 'INSTRUTOR'] as const;

// Actions that require step-up authentication
export const STEP_UP_ACTIONS: ReadonlySet<string> = new Set<CriticalAction>([
  'DELETE_STUDENT',
  'DELETE_CLASS',
  'EXPORT_DATA',
  'LGPD_ANONYMIZE',
  'CHANGE_ADMIN_CONFIG',
  'REVOKE_ALL_SESSIONS',
  'MODIFY_RLS_POLICY',
  'MANAGE_PROFESSORS',
  'FINANCIAL_EXPORT',
  'BULK_OPERATIONS',
]);

// ── Config ──

const MFA_CONFIG = {
  issuer: 'BlackBelt',
  algorithm: 'SHA1',     // RFC 6238 default, widest compatibility
  digits: 6,
  period: 30,            // seconds
  window: 1,             // Accept ±1 period (30s tolerance)
  backupCodeCount: 8,
  backupCodeLength: 8,
  stepUpTTLSeconds: 300,  // 5 minutes
  maxVerifyAttempts: 5,   // Lock after 5 failed MFA attempts
  lockoutMinutes: 15,
} as const;

// ── In-memory stores (replace with DB in production) ──
// TODO(BE-016): Migrate to database tables

interface MFARecord {
  userId: string;
  secret: string;           // Encrypted base32
  enabled: boolean;
  backupCodes: string[];    // Hashed
  createdAt: string;
  verifyAttempts: number;
  lockedUntil: string | null;
}

interface StepUpRecord {
  token: string;
  userId: string;
  action: string;
  expiresAt: number;
  used: boolean;
}

const mfaStore = new Map<string, MFARecord>();
const stepUpStore = new Map<string, StepUpRecord>();
const _verifyAttemptTracker = new Map<string, { count: number; resetAt: number }>(); // TODO: implement rate limiting

// ── MFA SETUP ──

/**
 * Gera secret TOTP + QR code para o usuário.
 * Chamar ANTES de ativar MFA (requer confirmação com verifyMFASetup).
 */
export async function setupMFA(userId: string, userEmail: string): Promise<MFASetupResult> {
  // Generate random secret (20 bytes = 160 bits, RFC 4226 minimum)
  const secretBytes = generateSecureRandom(20);
  const secret = base32Encode(secretBytes);

  // Build otpauth:// URI
  const uri = buildTOTPUri(secret, userEmail, MFA_CONFIG.issuer);

  // Generate QR code as data URL
  // In production: const qrCodeDataURL = await QRCode.toDataURL(uri);
  const qrCodeDataURL = `data:image/svg+xml;base64,${Buffer.from(
    generateQRPlaceholderSVG(uri)
  ).toString('base64')}`;

  // Generate backup codes
  const backupCodes = generateBackupCodes(MFA_CONFIG.backupCodeCount, MFA_CONFIG.backupCodeLength);

  // Store pending setup (not yet enabled)
  mfaStore.set(userId, {
    userId,
    secret,    // TODO(BE-019): Encrypt with AES-256 before storing
    enabled: false,
    backupCodes: backupCodes.map(c => hashBackupCode(c)),
    createdAt: new Date().toISOString(),
    verifyAttempts: 0,
    lockedUntil: null,
  });

  return { secret, uri, qrCodeDataURL, backupCodes };
}

/**
 * Confirma setup do MFA verificando primeiro código.
 * Após sucesso, MFA fica obrigatório nos próximos logins.
 */
export function verifyMFASetup(userId: string, code: string): boolean {
  const record = mfaStore.get(userId);
  if (!record) throw new MFAError('MFA setup not found', 'SETUP_NOT_FOUND');
  if (record.enabled) throw new MFAError('MFA already enabled', 'ALREADY_ENABLED');

  const valid = verifyTOTP(record.secret, code);
  if (!valid) return false;

  // Enable MFA
  record.enabled = true;
  mfaStore.set(userId, record);
  return true;
}

// ── MFA VERIFY (Login) ──

/**
 * Verifica código MFA durante login.
 * Aceita: TOTP code (6 dígitos) ou backup code (8 chars).
 */
export function verifyMFA(userId: string, code: string): MFAVerifyResult {
  const record = mfaStore.get(userId);
  if (!record || !record.enabled) {
    throw new MFAError('MFA not configured for this user', 'NOT_CONFIGURED');
  }

  // Check lockout
  if (record.lockedUntil) {
    const lockExpiry = new Date(record.lockedUntil).getTime();
    if (Date.now() < lockExpiry) {
      const remainingMin = Math.ceil((lockExpiry - Date.now()) / 60_000);
      throw new MFAError(
        `Account locked. Try again in ${remainingMin} minutes.`,
        'LOCKED_OUT',
      );
    }
    // Lockout expired — reset
    record.lockedUntil = null;
    record.verifyAttempts = 0;
  }

  // Track attempts
  record.verifyAttempts++;

  // Try TOTP first (6-digit code)
  if (/^\d{6}$/.test(code)) {
    const valid = verifyTOTP(record.secret, code);
    if (valid) {
      record.verifyAttempts = 0;
      mfaStore.set(userId, record);
      return { valid: true, usedBackupCode: false };
    }
  }

  // Try backup code (alphanumeric)
  if (/^[A-Z0-9]{8}$/i.test(code)) {
    const codeHash = hashBackupCode(code.toUpperCase());
    const idx = record.backupCodes.indexOf(codeHash);
    if (idx !== -1) {
      // Consume backup code (single use)
      record.backupCodes.splice(idx, 1);
      record.verifyAttempts = 0;
      mfaStore.set(userId, record);
      return { valid: true, usedBackupCode: true };
    }
  }

  // Failed — check lockout threshold
  if (record.verifyAttempts >= MFA_CONFIG.maxVerifyAttempts) {
    record.lockedUntil = new Date(
      Date.now() + MFA_CONFIG.lockoutMinutes * 60_000
    ).toISOString();
  }
  mfaStore.set(userId, record);

  return { valid: false, usedBackupCode: false };
}

/**
 * Verifica se MFA está habilitado para o usuário.
 */
export function isMFAEnabled(userId: string): boolean {
  const record = mfaStore.get(userId);
  return record?.enabled === true;
}

/**
 * Verifica se o role requer MFA.
 */
export function requiresMFA(role: string): boolean {
  return (MFA_REQUIRED_ROLES as readonly string[]).includes(role);
}

/**
 * Desativa MFA (requer step-up auth).
 */
export function disableMFA(userId: string): void {
  mfaStore.delete(userId);
}

/**
 * Gera novos backup codes (consome os antigos).
 */
export function regenerateBackupCodes(userId: string): string[] {
  const record = mfaStore.get(userId);
  if (!record?.enabled) throw new MFAError('MFA not enabled', 'NOT_CONFIGURED');

  const codes = generateBackupCodes(MFA_CONFIG.backupCodeCount, MFA_CONFIG.backupCodeLength);
  record.backupCodes = codes.map(c => hashBackupCode(c));
  mfaStore.set(userId, record);
  return codes;
}

// ── STEP-UP AUTHENTICATION ──

/**
 * Verifica se uma ação requer step-up auth.
 */
export function requiresStepUp(action: string): boolean {
  return STEP_UP_ACTIONS.has(action);
}

/**
 * Emite step-up token após verificação MFA.
 * Token válido por 5 minutos, single-use, vinculado à ação.
 */
export function issueStepUpToken(
  userId: string,
  action: string,
  mfaCode: string,
): StepUpToken {
  // Verify MFA first
  const mfaResult = verifyMFA(userId, mfaCode);
  if (!mfaResult.valid) {
    throw new MFAError('Invalid MFA code for step-up', 'INVALID_MFA');
  }

  // Generate short-lived token
  const token = generateSecureToken(32);
  const expiresAt = Date.now() + MFA_CONFIG.stepUpTTLSeconds * 1000;

  stepUpStore.set(token, {
    token,
    userId,
    action,
    expiresAt,
    used: false,
  });

  // Cleanup expired tokens
  cleanupStepUpTokens();

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
    action,
    userId,
  };
}

/**
 * Valida step-up token. Single-use: consumido após validação.
 */
export function validateStepUp(
  token: string,
  expectedUserId: string,
  expectedAction: string,
): boolean {
  const record = stepUpStore.get(token);
  if (!record) return false;
  if (record.used) return false;
  if (record.userId !== expectedUserId) return false;
  if (record.action !== expectedAction) return false;
  if (Date.now() > record.expiresAt) {
    stepUpStore.delete(token);
    return false;
  }

  // Consume token
  record.used = true;
  stepUpStore.set(token, record);

  // Schedule cleanup
  setTimeout(() => stepUpStore.delete(token), 60_000);

  return true;
}

// ── MIDDLEWARE HELPER ──

/**
 * Express/Next.js middleware para exigir MFA em login.
 *
 * Intercepta POST /api/auth/login:
 *   - Se user tem MFA: retorna 200 { mfaRequired: true, mfaToken: ... }
 *   - Frontend chama POST /api/auth/mfa/verify com code
 *   - Retorna JWT final
 */
export function mfaLoginInterceptor(
  userId: string,
  role: string,
): { mfaRequired: boolean; message?: string } {
  if (!requiresMFA(role)) {
    return { mfaRequired: false };
  }

  if (!isMFAEnabled(userId)) {
    return {
      mfaRequired: true,
      message: 'MFA setup required. Call POST /api/auth/mfa/setup first.',
    };
  }

  return {
    mfaRequired: true,
    message: 'MFA verification required. Send code to POST /api/auth/mfa/verify.',
  };
}

/**
 * Express/Next.js middleware para exigir step-up em ações críticas.
 *
 * @example
 * app.delete('/api/students/:id', (req, res) => {
 *   const stepUpResult = requireStepUpForAction(
 *     req.user.id, 'DELETE_STUDENT', req.headers['x-step-up-token']
 *   );
 *   if (!stepUpResult.allowed) {
 *     return res.status(403).json(stepUpResult);
 *   }
 *   // Proceed with deletion
 * });
 */
export function requireStepUpForAction(
  userId: string,
  action: string,
  stepUpToken?: string,
): { allowed: boolean; stepUpRequired?: boolean; action?: string } {
  if (!requiresStepUp(action)) {
    return { allowed: true };
  }

  if (!stepUpToken) {
    return {
      allowed: false,
      stepUpRequired: true,
      action,
    };
  }

  const valid = validateStepUp(stepUpToken, userId, action);
  if (!valid) {
    return {
      allowed: false,
      stepUpRequired: true,
      action,
    };
  }

  return { allowed: true };
}

// ── CRYPTO HELPERS ──

function generateSecureRandom(bytes: number): Uint8Array {
  // In Node.js: crypto.randomBytes(bytes)
  // Browser fallback:
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(bytes);
    crypto.getRandomValues(buf);
    return buf;
  }
  // Fallback (not cryptographically secure — replace in production)
  const buf = new Uint8Array(bytes);
  for (let i = 0; i < bytes; i++) buf[i] = Math.floor(Math.random() * 256);
  return buf;
}

function generateSecureToken(bytes: number): string {
  const raw = generateSecureRandom(bytes);
  return Array.from(raw).map(b => b.toString(16).padStart(2, '0')).join('');
}

function base32Encode(data: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0, value = 0, output = '';
  for (const byte of Array.from(data)) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  return output;
}

function buildTOTPUri(secret: string, account: string, issuer: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=${MFA_CONFIG.algorithm}&digits=${MFA_CONFIG.digits}&period=${MFA_CONFIG.period}`;
}

function verifyTOTP(secret: string, code: string): boolean {
  const now = Math.floor(Date.now() / 1000);
  const period = MFA_CONFIG.period;
  const window = MFA_CONFIG.window;

  for (let i = -window; i <= window; i++) {
    const counter = Math.floor((now + i * period) / period);
    const expected = generateHOTP(secret, counter);
    if (expected === code) return true;
  }
  return false;
}

function generateHOTP(secret: string, counter: number): string {
  // HMAC-SHA1 based HOTP (RFC 4226)
  // In production: use crypto.createHmac('sha1', Buffer.from(secret, 'base32'))
  //
  // Simplified implementation for structure — replace with:
  //   import { TOTP } from 'otpauth';
  //   const totp = new TOTP({ secret, algorithm: 'SHA1', digits: 6, period: 30 });
  //   return totp.generate();
  //
  // TODO(BE-016): Use `otpauth` library for production TOTP

  // Counter to 8-byte buffer (big-endian)
  const counterBuf = new Uint8Array(8);
  let c = counter;
  for (let i = 7; i >= 0; i--) {
    counterBuf[i] = c & 0xff;
    c = Math.floor(c / 256);
  }

  // For now, return a deterministic placeholder
  // PRODUCTION: Replace entire function with otpauth library
  const hash = simpleHash(secret + counter.toString());
  const offset = hash & 0xf;
  const truncated = ((hash >> (offset % 24)) & 0x7fffffff) % 1_000_000;
  return truncated.toString().padStart(6, '0');
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function generateBackupCodes(count: number, length: number): string[] {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No O/0/1/I (ambiguity)
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const bytes = generateSecureRandom(length);
    let code = '';
    for (let j = 0; j < length; j++) {
      code += charset[bytes[j] % charset.length];
    }
    codes.push(code);
  }
  return codes;
}

function hashBackupCode(code: string): string {
  // In production: bcrypt or argon2
  // Simplified hash for structure
  let hash = 0x811c9dc5;
  for (let i = 0; i < code.length; i++) {
    hash ^= code.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return 'bc_' + (hash >>> 0).toString(16).padStart(8, '0');
}

function generateQRPlaceholderSVG(uri: string): string {
  // Placeholder — in production use `qrcode` npm package
  return `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
    <rect width="200" height="200" fill="white"/>
    <text x="100" y="90" text-anchor="middle" font-size="12" fill="black">QR Code</text>
    <text x="100" y="110" text-anchor="middle" font-size="10" fill="gray">Use: npm install qrcode</text>
    <text x="100" y="130" text-anchor="middle" font-size="8" fill="gray">${uri.substring(0, 40)}...</text>
  </svg>`;
}

function cleanupStepUpTokens(): void {
  const now = Date.now();
  for (const [key, record] of Array.from(stepUpStore.entries())) {
    if (now > record.expiresAt + 60_000) {
      stepUpStore.delete(key);
    }
  }
}

// ── Custom Error ──

export class MFAError extends Error {
  public readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'MFAError';
    this.code = code;
  }
}

// ── Stats (for dashboard) ──

export function getMFAStats(): {
  totalUsers: number;
  enabledUsers: number;
  lockedUsers: number;
  pendingStepUps: number;
} {
  const now = Date.now();
  return {
    totalUsers: mfaStore.size,
    enabledUsers: Array.from(mfaStore.values()).filter(r => r.enabled).length,
    lockedUsers: Array.from(mfaStore.values()).filter(r =>
      r.lockedUntil && new Date(r.lockedUntil).getTime() > now
    ).length,
    pendingStepUps: Array.from(stepUpStore.values()).filter(r =>
      !r.used && r.expiresAt > now
    ).length,
  };
}
