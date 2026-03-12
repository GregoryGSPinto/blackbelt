# Account Deletion Evidence

## Implementação observada

- Página pública: `/excluir-conta`
- Endpoint autenticado/público: `app/api/lgpd/delete/route.ts`
- Registro persistido: `data_deletion_requests`

## Correção aplicada

- Página pública deixou de usar serviço frontend desconectado e passou a chamar o endpoint real
- Fluxo público agora registra solicitação para revisão manual da equipe de privacidade

## Limites atuais

- Não há evidência de job automatizado para conclusão da exclusão
- Processo ainda depende de operação/manual review
