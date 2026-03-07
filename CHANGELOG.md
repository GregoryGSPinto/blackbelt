# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Sprint 1: Preparação para Produção

### Added

#### Seed e Dados Demo
- Seed SQL completo (`supabase/seed.sql`) com:
  - Academy demo com configurações completas
  - Sistemas de faixa (BJJ, Judo, Muay Thai, Karate)
  - Conquistas (attendance, streak, belt, social)
  - Planos (Starter, Professional, Enterprise)
  - Categorias e produtos da loja
  - Áreas de conhecimento para Teen
  - Séries e vídeos de conteúdo
  - Eventos e CRM/leads
- Scripts de seed para ambiente demo:
  - `scripts/seed-demo-users.ts`: 9 usuários demo com perfis completos
  - `scripts/seed-demo-classes.ts`: 15+ horários de aula
  - `scripts/seed-all-demo.ts`: Script mestre
- Documentação completa de seed no SETUP.md

#### Screenshots para Lojas
- Script `scripts/generate-screenshots.js` para gerar imagens automaticamente
- 48 screenshots em 6 resoluções diferentes:
  - App Store: iPhone 6.7", 6.5", iPad 12.9"
  - Google Play: Phone, 7" tablet, 10" tablet
- 8 telas principais: Login, Dashboard, Check-in, Kids, Teen, Shop, Admin, Professor

#### Configuração de Produção
- Atualização do `.env.example` com todas as variáveis de produção:
  - Stripe (Publishable Key, Secret Key, Webhook Secret)
  - PIX para Brasil (`STRIPE_PIX_ENABLED`)
  - Sentry (DSN, Auth Token)
  - Google Analytics 4 (`NEXT_PUBLIC_GA_ID`)
  - Resend (API Key, From Email)
- Guia completo de configuração do Stripe (`docs/STRIPE_SETUP.md`)

### Changed

- SETUP.md atualizado com:
  - Seção "Seeding Demo Data" completa
  - Seção "Production Configuration" com Stripe, Sentry, GA4, Resend
  - Lista de todos os usuários demo com credenciais

### Security

- Segurança: httpOnly cookies implementados
- RLS policies no Supabase
- Rate limiting em APIs públicas
- CSRF protection
- Zod validation em POST routes

## [1.0.0] - 2026-03-07

### Features
- ✅ Plataforma completa para gestão de academias de artes marciais
- ✅ Multi-perfil: Admin, Professor, Aluno Adulto, Teen, Kids, Responsável
- ✅ Sistema de check-in com QR Code e geofencing
- ✅ Gestão de turmas e graduações
- ✅ Controle financeiro integrado
- ✅ Gamificação com conquistas e streaks
- ✅ Loja integrada
- ✅ Videos e conteúdo educativo
- ✅ App mobile (iOS/Android) com Capacitor
- ✅ PWA com Service Worker

---

## Template de Commits

- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (sem alteração de código)
- `refactor`: Refatoração de código
- `test`: Testes
- `chore`: Tarefas de build/config
