/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ARCHITECTURE GUARDRAILS — Import Boundary Rules               ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║                                                                 ║
 * ║  These rules prevent the domain from being corrupted by the    ║
 * ║  legacy layer or directly coupled to the UI.                   ║
 * ║                                                                 ║
 * ║  ┌─────────────┐                                               ║
 * ║  │    app/     │  ← can import: lib/hooks                      ║
 * ║  │  components/│  ← CANNOT import: lib/domain, lib/acl,       ║
 * ║  │             │                   lib/application              ║
 * ║  └──────┬──────┘                                               ║
 * ║         │                                                       ║
 * ║  ┌──────▼──────┐                                               ║
 * ║  │  lib/hooks  │  ← can import: lib/application                ║
 * ║  │             │  ← CANNOT import: lib/domain, lib/api         ║
 * ║  └──────┬──────┘                                               ║
 * ║         │                                                       ║
 * ║  ┌──────▼──────────┐                                           ║
 * ║  │ lib/application │  ← can import: lib/acl                    ║
 * ║  │                 │  ← CANNOT import: lib/domain directly     ║
 * ║  └──────┬──────────┘                                           ║
 * ║         │                                                       ║
 * ║  ┌──────▼──────┐                                               ║
 * ║  │   lib/acl   │  ← can import: lib/domain, lib/api           ║
 * ║  │             │  ← ONLY layer with dual access                ║
 * ║  └──────┬──────┘                                               ║
 * ║         │                                                       ║
 * ║  ┌──────▼──────┐    ┌────────────┐                             ║
 * ║  │ lib/domain  │    │  lib/api   │                              ║
 * ║  │             │    │ (legacy)   │                              ║
 * ║  │ CANNOT import    │            │                              ║
 * ║  │ anything outside │ CANNOT import                             ║
 * ║  │ shared kernel    │ lib/domain │                              ║
 * ║  └─────────────┘    └────────────┘                             ║
 * ║                                                                 ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * ESLint enforcement (add to .eslintrc.js):
 *
 * rules: {
 *   'no-restricted-imports': ['error', {
 *     patterns: [
 *       // UI cannot import domain, acl, or application
 *       { group: ['@/lib/domain', '@/lib/domain/*'], message: 'UI must use lib/hooks, not domain directly.' },
 *       { group: ['@/lib/acl', '@/lib/acl/*'], message: 'UI must use lib/hooks, not ACL directly.' },
 *       { group: ['@/lib/application', '@/lib/application/*'], message: 'UI must use lib/hooks, not application directly.' },
 *     ]
 *   }]
 * },
 * overrides: [
 *   // hooks CAN import application (but not domain/api)
 *   { files: ['lib/hooks/**'], rules: {
 *     'no-restricted-imports': ['error', { patterns: [
 *       { group: ['@/lib/domain', '@/lib/domain/*'], message: 'Hooks must use application layer.' },
 *       { group: ['@/lib/api', '@/lib/api/*'], message: 'Hooks must use application layer.' },
 *     ]}]
 *   }},
 *   // application CAN import acl (but not domain directly)
 *   { files: ['lib/application/**'], rules: {
 *     'no-restricted-imports': ['error', { patterns: [
 *       { group: ['@/lib/domain', '@/lib/domain/*'], message: 'Application must use ACL. Only import types.' },
 *     ]}]
 *   }},
 *   // acl CAN import both (the bridge)
 *   { files: ['lib/acl/**'], rules: { 'no-restricted-imports': 'off' }},
 *   // domain CANNOT import anything external
 *   { files: ['lib/domain/**'], rules: {
 *     'no-restricted-imports': ['error', { patterns: [
 *       { group: ['@/lib/api', '@/lib/api/*'], message: 'Domain must be pure. No API imports.' },
 *       { group: ['@/lib/acl', '@/lib/acl/*'], message: 'Domain must be pure. No ACL imports.' },
 *       { group: ['@/lib/hooks', '@/lib/hooks/*'], message: 'Domain must be pure. No hook imports.' },
 *       { group: ['react', 'next', 'next/*'], message: 'Domain must be pure. No framework imports.' },
 *     ]}]
 *   }},
 * ]
 */

export {};
