# Public Store Submission Sequence

Date: March 12, 2026

## Exact minimum sequence

| Ordem | Passo | Evidencia de conclusao | Blocker se falhar | Responsavel | Go / no-go |
| --- | --- | --- | --- | --- | --- |
| 1 | Confirmar dominio final e DNS | Screenshot / DNS check / browser load | Host not reachable | Infra | No-go |
| 2 | Confirmar HTTPS valido | Certificado valido | Insecure host | Infra | No-go |
| 3 | Validar `/api/mobile/runtime` e `/api/health` externamente | JSON `200` | Shell boot risk | Infra / ops | No-go |
| 4 | Validar `/review-access`, `/politica-privacidade`, `/termos-de-uso`, `/excluir-conta` | Screenshots | Review/compliance failure | Ops / legal | No-go |
| 5 | Validar reviewer login, sessao e logout no host final | Screenshots/video | Reviewer/auth failure | QA / ops | No-go |
| 6 | Preencher identidade empresarial final | Master checklist completo | Legal/business missing | Founder / legal | No-go |
| 7 | Preencher Apple privacy / reviewer / support fields | Console fields filled | Apple submission blocked | Founder / ops / legal | No-go |
| 8 | Preencher Google privacy / Data Safety / support fields | Console fields filled | Google submission blocked | Founder / ops / legal | No-go |
| 9 | Gerar builds assinados finais | Signed archive / AAB | Store upload blocked | Mobile release | No-go |
| 10 | Upload para as lojas | Build visible in console | Submission incomplete | Mobile release | Go only if all above pass |
