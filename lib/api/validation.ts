/**
 * Lightweight input validation for API routes.
 *
 * Validates request bodies against a schema without external dependencies.
 * For more complex validation, consider adding Zod.
 */

type FieldType = 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'date' | 'array' | 'object';

interface FieldRule {
  type: FieldType;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  enum?: readonly string[];
}

type Schema = Record<string, FieldRule>;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  data: Record<string, unknown>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}/;

export function validate(body: unknown, schema: Schema): ValidationResult {
  const errors: string[] = [];
  const data: Record<string, unknown> = {};

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { valid: false, errors: ['Request body must be a JSON object'], data };
  }

  const obj = body as Record<string, unknown>;

  for (const [field, rule] of Object.entries(schema)) {
    const value = obj[field];

    if (value === undefined || value === null || value === '') {
      if (rule.required) {
        errors.push(`${field} is required`);
      }
      continue;
    }

    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${field} must be a string`);
        } else {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`${field} must be at least ${rule.minLength} characters`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${field} must be at most ${rule.maxLength} characters`);
          }
          if (rule.enum && !rule.enum.includes(value)) {
            errors.push(`${field} must be one of: ${rule.enum.join(', ')}`);
          }
          data[field] = value.trim();
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !EMAIL_RE.test(value)) {
          errors.push(`${field} must be a valid email`);
        } else {
          data[field] = value.trim().toLowerCase();
        }
        break;

      case 'uuid':
        if (typeof value !== 'string' || !UUID_RE.test(value)) {
          errors.push(`${field} must be a valid UUID`);
        } else {
          data[field] = value;
        }
        break;

      case 'date':
        if (typeof value !== 'string' || !DATE_RE.test(value)) {
          errors.push(`${field} must be a valid date (YYYY-MM-DD)`);
        } else {
          data[field] = value;
        }
        break;

      case 'number':
        const num = typeof value === 'number' ? value : Number(value);
        if (isNaN(num)) {
          errors.push(`${field} must be a number`);
        } else {
          if (rule.min !== undefined && num < rule.min) {
            errors.push(`${field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && num > rule.max) {
            errors.push(`${field} must be at most ${rule.max}`);
          }
          data[field] = num;
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${field} must be a boolean`);
        } else {
          data[field] = value;
        }
        break;

      case 'array':
        if (!Array.isArray(value)) {
          errors.push(`${field} must be an array`);
        } else {
          data[field] = value;
        }
        break;

      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors.push(`${field} must be an object`);
        } else {
          data[field] = value;
        }
        break;
    }
  }

  return { valid: errors.length === 0, errors, data };
}

/** Helper to parse and validate request body in one step */
export async function validateBody(
  req: Request,
  schema: Schema,
): Promise<{ valid: true; data: Record<string, unknown> } | { valid: false; errors: string[] }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { valid: false, errors: ['Invalid JSON body'] };
  }
  const result = validate(body, schema);
  if (!result.valid) {
    return { valid: false, errors: result.errors };
  }
  return { valid: true, data: result.data };
}
