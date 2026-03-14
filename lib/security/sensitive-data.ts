const SENSITIVE_KEY_PATTERNS = [
  'password',
  'senha',
  'token',
  'secret',
  'authorization',
  'cookie',
  'cpf',
  'cnpj',
  'document',
  'documento',
  'rg',
  'phone',
  'telefone',
  'mobile',
  'email',
  'address',
  'endereco',
  'endereço',
  'birth',
  'nascimento',
  'useragent',
  'user_agent',
  'ip',
] as const;

function looksSensitiveKey(key: string): boolean {
  const normalized = key.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  return SENSITIVE_KEY_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function maskEmail(email: string | null | undefined): string {
  if (!email) return '';

  const normalized = email.trim().toLowerCase();
  const [local, domain = ''] = normalized.split('@');
  if (!local || !domain) return '[REDACTED_EMAIL]';

  const localMasked = local.length <= 2
    ? `${local[0] ?? '*'}*`
    : `${local[0]}***${local[local.length - 1]}`;

  const domainParts = domain.split('.');
  const root = domainParts.shift() || '';
  const tld = domainParts.join('.');
  const rootMasked = root.length <= 2
    ? `${root[0] ?? '*'}*`
    : `${root[0]}***${root[root.length - 1]}`;

  return `${localMasked}@${rootMasked}${tld ? `.${tld}` : ''}`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '[REDACTED_PHONE]';
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskDocument(value: string | null | undefined): string {
  if (!value) return '';
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return '[REDACTED_DOCUMENT]';
  return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskIpAddress(value: string | null | undefined): string {
  if (!value) return '';

  if (value.includes(':')) {
    const parts = value.split(':').filter(Boolean);
    if (parts.length <= 2) return '[REDACTED_IP]';
    return `${parts.slice(0, 2).join(':')}:****:****`;
  }

  const parts = value.split('.');
  if (parts.length !== 4) return '[REDACTED_IP]';
  return `${parts[0]}.${parts[1]}.*.*`;
}

export function sanitizeErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: '[REDACTED_ERROR_MESSAGE]',
      ...(typeof (error as Error & { code?: unknown }).code === 'string'
        ? { code: (error as Error & { code: string }).code }
        : {}),
    };
  }

  if (typeof error === 'string') {
    return { message: '[REDACTED_ERROR_MESSAGE]' };
  }

  return { message: 'Unknown error' };
}

export function redactSensitiveData<T>(value: T, depth = 0): T {
  if (value == null) return value;
  if (depth > 5) return '[TRUNCATED]' as T;

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveData(item, depth + 1)) as T;
  }

  if (isPlainObject(value)) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, entryValue] of Object.entries(value)) {
      if (looksSensitiveKey(key)) {
        if (key.toLowerCase().includes('email') && typeof entryValue === 'string') {
          sanitized[key] = maskEmail(entryValue);
          continue;
        }
        if ((key.toLowerCase().includes('phone') || key.toLowerCase().includes('telefone')) && typeof entryValue === 'string') {
          sanitized[key] = maskPhone(entryValue);
          continue;
        }
        if (
          ['cpf', 'cnpj', 'rg', 'documento', 'document'].some((token) => key.toLowerCase().includes(token)) &&
          typeof entryValue === 'string'
        ) {
          sanitized[key] = maskDocument(entryValue);
          continue;
        }
        if (key.toLowerCase().includes('ip') && typeof entryValue === 'string') {
          sanitized[key] = maskIpAddress(entryValue);
          continue;
        }
        sanitized[key] = '[REDACTED]';
        continue;
      }

      sanitized[key] = redactSensitiveData(entryValue, depth + 1);
    }
    return sanitized as T;
  }

  return value;
}
