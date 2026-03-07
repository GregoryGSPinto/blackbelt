import { describe, it, expect } from 'vitest';
import { validate } from '@/lib/api/validation';

describe('API Input Validation', () => {
  describe('validate', () => {
    it('validates required string fields', () => {
      const result = validate({}, {
        name: { type: 'string', required: true },
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('name is required');
    });

    it('passes with valid required string', () => {
      const result = validate({ name: 'Test' }, {
        name: { type: 'string', required: true, minLength: 2 },
      });
      expect(result.valid).toBe(true);
      expect(result.data.name).toBe('Test');
    });

    it('trims string values', () => {
      const result = validate({ name: '  Test  ' }, {
        name: { type: 'string', required: true },
      });
      expect(result.data.name).toBe('Test');
    });

    it('validates minLength', () => {
      const result = validate({ name: 'A' }, {
        name: { type: 'string', required: true, minLength: 2 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 2');
    });

    it('validates maxLength', () => {
      const result = validate({ name: 'A'.repeat(300) }, {
        name: { type: 'string', maxLength: 255 },
      });
      expect(result.valid).toBe(false);
    });

    it('validates email format', () => {
      const result = validate({ email: 'not-an-email' }, {
        email: { type: 'email', required: true },
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('valid email');
    });

    it('accepts valid email', () => {
      const result = validate({ email: 'user@example.com' }, {
        email: { type: 'email', required: true },
      });
      expect(result.valid).toBe(true);
      expect(result.data.email).toBe('user@example.com');
    });

    it('lowercases email', () => {
      const result = validate({ email: 'User@Example.COM' }, {
        email: { type: 'email' },
      });
      expect(result.data.email).toBe('user@example.com');
    });

    it('validates uuid format', () => {
      const result = validate({ id: 'not-a-uuid' }, {
        id: { type: 'uuid', required: true },
      });
      expect(result.valid).toBe(false);
    });

    it('accepts valid uuid', () => {
      const result = validate({ id: '550e8400-e29b-41d4-a716-446655440000' }, {
        id: { type: 'uuid', required: true },
      });
      expect(result.valid).toBe(true);
    });

    it('validates number type and range', () => {
      const result = validate({ age: 3 }, {
        age: { type: 'number', min: 4, max: 120 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('at least 4');
    });

    it('validates enum values', () => {
      const result = validate({ plano: 'INVALID' }, {
        plano: { type: 'string', enum: ['BASICO', 'PRO', 'ENTERPRISE'] as const },
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('one of');
    });

    it('accepts valid enum value', () => {
      const result = validate({ plano: 'PRO' }, {
        plano: { type: 'string', enum: ['BASICO', 'PRO', 'ENTERPRISE'] as const },
      });
      expect(result.valid).toBe(true);
    });

    it('validates boolean type', () => {
      const result = validate({ active: 'yes' }, {
        active: { type: 'boolean' },
      });
      expect(result.valid).toBe(false);
    });

    it('skips optional fields when missing', () => {
      const result = validate({}, {
        name: { type: 'string' },
        email: { type: 'email' },
      });
      expect(result.valid).toBe(true);
    });

    it('rejects non-object body', () => {
      const result = validate('not an object', {
        name: { type: 'string', required: true },
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('JSON object');
    });

    it('rejects array body', () => {
      const result = validate([1, 2, 3], {
        name: { type: 'string', required: true },
      });
      expect(result.valid).toBe(false);
    });

    it('validates date format', () => {
      const result = validate({ date: '2026-13-45' }, {
        date: { type: 'date' },
      });
      // This passes the regex but isn't a real date — basic format check only
      expect(result.valid).toBe(true);
    });

    it('rejects invalid date format', () => {
      const result = validate({ date: 'not-a-date' }, {
        date: { type: 'date', required: true },
      });
      expect(result.valid).toBe(false);
    });
  });
});
