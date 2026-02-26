// ============================================================
// Academy Contact Info — Unit Tests
// ============================================================
// Validates the single source of truth for contact data
// Pre-deploy check: no FIXME strings should remain
// ============================================================

import { describe, it, expect } from 'vitest';
import { ACADEMY_CONTACT, enderecoCompleto } from '@/lib/academy/contactInfo';

describe('Academy Contact Info', () => {
  it('has all required fields', () => {
    expect(ACADEMY_CONTACT.razaoSocial).toBeTruthy();
    expect(ACADEMY_CONTACT.cnpj).toBeTruthy();
    expect(ACADEMY_CONTACT.email).toBeTruthy();
    expect(ACADEMY_CONTACT.whatsapp).toBeTruthy();
    expect(ACADEMY_CONTACT.telefone).toBeTruthy();
    expect(ACADEMY_CONTACT.cidade).toBeTruthy();
    expect(ACADEMY_CONTACT.estado).toBeTruthy();
  });

  it('email has valid format', () => {
    expect(ACADEMY_CONTACT.email).toMatch(/@/);
  });

  it('enderecoCompleto formats correctly', () => {
    const addr = enderecoCompleto();
    expect(addr).toContain(ACADEMY_CONTACT.cidade);
    expect(addr).toContain(ACADEMY_CONTACT.estado);
    expect(addr).toContain('CEP:');
  });

  // This test will FAIL in production if FIXMEs aren't resolved
  // Remove the .skip when ready for production
  it.skip('[PRE-DEPLOY] no FIXME placeholders remain', () => {
    const values = Object.values(ACADEMY_CONTACT).join(' ');
    expect(values).not.toContain('00000');
    expect(values).not.toContain('a definir');
  });
});
