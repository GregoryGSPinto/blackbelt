/**
 * Zod Validation Schemas — Input validation for API routes
 */

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Senha deve ter no minimo 6 caracteres'),
});

export const AcademySchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no minimo 2 caracteres'),
  email: z.string().email('Email invalido').optional(),
  plano: z.enum(['BASICO', 'PRO', 'ENTERPRISE']).optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  telefone: z.string().optional(),
});

export const LeadSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no minimo 2 caracteres'),
  email: z.string().email('Email invalido').optional(),
  phone: z.string().min(8, 'Telefone deve ter no minimo 8 caracteres').optional(),
});

export const FeedbackSchema = z.object({
  score: z.number().min(0, 'Score minimo e 0').max(10, 'Score maximo e 10'),
  comment: z.string().optional(),
  userId: z.string().optional(),
});

/** Helper to validate and return parsed data or error response */
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
