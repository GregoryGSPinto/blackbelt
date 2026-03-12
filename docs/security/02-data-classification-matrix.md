# Data Classification Matrix

| Categoria | Exemplos | Sensibilidade | Onde aparece |
|---|---|---|---|
| Identificação | nome, email, telefone, data de nascimento | Alta | `profiles`, cadastro, auth |
| Financeiro | status de cobrança, assinatura, forecast | Alta | billing, subscription, financeiro |
| Menores | vínculo parent/kids/teen, progresso infantil | Alta | fluxos kids/teen/responsável |
| Operacional | memberships, academy_id, roles | Alta | autorização e tenancy |
| Conteúdo de uso | check-ins, aulas, progresso, conquistas | Média/Alta | app principal |
| Telemetria | erros, métricas, analytics | Média | observabilidade |
| Segredos | service role, Stripe secret, webhook secret | Crítica | env/server only |

## Observações

- Dados de menores exigem especial cuidado comercial e legal
- Dados financeiros não devem ser prometidos como armazenados quando processados por terceiro
- Segredos devem permanecer exclusivamente server-side
