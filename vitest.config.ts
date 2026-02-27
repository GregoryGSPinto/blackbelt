/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.tsx'],
    include: [
      'tests/**/*.test.{ts,tsx}',
      '__tests__/**/*.test.{ts,tsx}',
    ],
    css: false,
    alias: {
      '@': resolve(__dirname, '.'),
    },
    // Coverage config — run: npm run test:coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'lcov'],
      include: [
        'lib/api/**/*.service.ts',
        'lib/security/**/*.ts',
        'lib/nav-ranking.ts',
        'lib/academy/**/*.ts',
        'contexts/AuthContext.tsx',
      ],
      exclude: [
        'lib/__mocks__/**',
        'lib/api/contracts.ts',
        'lib/api/types.ts',
        'lib/api/client.ts',
      ],
      thresholds: {
        // Target: 60% services, 80% security
        lines: 50,
        branches: 40,
        functions: 50,
        statements: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
});
