# Security Remediation Plan

## Wave 1

- Rotacionar segredos expostos localmente
- Remover documentação histórica com credenciais explícitas
- Consolidar logging seguro

## Wave 2

- Inventariar todos os usos de admin/service role
- Cobrir endpoints críticos com testes de autorização multi-tenant
- Fechar reviewer/demo strategy controlada por ambiente

## Wave 3

- CI com secret scanning e SAST básico
- Política de retenção/logging operacional
- Hardening adicional de mobile storage

## Status

- Correções aplicadas nesta rodada: `Implementado` em parte crítica, `Planejado` em parte estrutural longa
- Produto enterprise pilot ready: `Estável em piloto`
- Operação comercial ampla: `Depende de configuração externa` + novas rodadas de hardening fora do core
