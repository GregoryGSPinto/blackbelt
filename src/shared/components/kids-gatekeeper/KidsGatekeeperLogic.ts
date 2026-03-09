export type GatekeeperMode = 'pin' | 'biometric' | 'forgot';
export type ForgotStep = 'confirm' | 'code' | 'newPin' | 'confirmPin' | 'done';

const PIN_STORAGE_KEY = 'blackbelt-kids-pin';
const PIN_DEFAULT = '1234';
const CREDENTIAL_KEY = 'blackbelt-kids-bio-cred';

export const PARENT_EMAIL = 'responsavel@email.com';
export const MOCK_VERIFY_CODE = '123456';
export const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const;

export function getStoredPin(): string {
  try {
    return localStorage.getItem(PIN_STORAGE_KEY) || PIN_DEFAULT;
  } catch {
    return PIN_DEFAULT;
  }
}

export function savePin(pin: string): void {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, pin);
  } catch {}
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***@***.com';
  const visible = user.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(3, user.length - 2))}@${domain}`;
}

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...Array.from(new Uint8Array(buffer))));
}

function fromBase64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) arr[i] = bin.charCodeAt(i);
  return arr.buffer;
}

export async function checkBiometricSupport(): Promise<boolean> {
  try {
    if (typeof window === 'undefined') return false;
    if (!window.PublicKeyCredential) return false;
    if (!window.isSecureContext) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function getSavedCredential(): string | null {
  try {
    return localStorage.getItem(CREDENTIAL_KEY);
  } catch {
    return null;
  }
}

function saveCredential(id: string): void {
  try {
    localStorage.setItem(CREDENTIAL_KEY, id);
  } catch {}
}

export function clearCredential(): void {
  try {
    localStorage.removeItem(CREDENTIAL_KEY);
  } catch {}
}

export async function webauthnRegister(): Promise<{ ok: boolean; credentialId?: string; error?: string }> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));
    const hostname = window.location.hostname;

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'BlackBelt', id: hostname },
        user: { id: userId, name: 'responsavel@blackbelt', displayName: 'Responsavel' },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'discouraged',
        },
        timeout: 120000,
        attestation: 'none',
      },
    });

    if (!credential) return { ok: false, error: 'No credential created.' };
    const cred = credential as PublicKeyCredential;
    const credId = toBase64(cred.rawId);
    saveCredential(credId);
    return { ok: true, credentialId: credId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('NotAllowed') || message.includes('cancelled') || message.includes('abort')) {
      return { ok: false, error: 'cancel' };
    }
    return { ok: false, error: message };
  }
}

export async function webauthnAuthenticate(credentialIdB64: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const hostname = window.location.hostname;

    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: hostname,
        allowCredentials: [{
          id: fromBase64(credentialIdB64),
          type: 'public-key',
          transports: ['internal'],
        }],
        userVerification: 'required',
        timeout: 120000,
      },
    });

    return { ok: !!assertion };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('NotAllowed') || message.includes('cancelled') || message.includes('abort')) {
      return { ok: false, error: 'cancel' };
    }
    return { ok: false, error: message };
  }
}
