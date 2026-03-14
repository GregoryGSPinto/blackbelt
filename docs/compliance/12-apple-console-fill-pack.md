# Apple Console Fill Pack

Date: March 13, 2026

| Campo | Valor atual | Valor final necessario | Onde preencher | Obrigatoriedade | Bloqueia loja? | Responsavel | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Seller / legal entity | Ausente | Nome juridico final | App Store Connect account / legal | Obrigatorio | Sim | Founder | Pendente |
| Business address | Ausente | Endereco final | App Store Connect | Obrigatorio | Sim | Founder / ops | Pendente |
| Support email | Estrutura pronta | `suporte@<official-domain>` monitorado | App Store Connect / reviewer notes | Obrigatorio | Sim | Ops | Pendente |
| Privacy contact / DPO | Estrutura pronta | `privacidade@<official-domain>` ou DPO final | Privacy questionnaire / policy | Obrigatorio | Sim | Legal | Pendente |
| Privacy policy URL | Estrutura pronta | `https://<official-domain>/politica-privacidade` | App Information | Obrigatorio | Sim | Ops | Pendente |
| Terms URL | Estrutura pronta | `https://<official-domain>/termos-de-uso` | Reviewer notes / support references | Recomendado | Nao isoladamente | Ops | Pendente |
| Support URL | Estrutura pronta | `https://<official-domain>/suporte` | Support URL / reviewer notes | Obrigatorio pratico | Sim | Ops | Pendente |
| Account deletion URL | Estrutura pronta | `https://<official-domain>/excluir-conta` | Reviewer notes / compliance evidence | Obrigatorio pratico | Sim | Ops | Pendente |
| Reviewer help URL | Estrutura pronta | `https://<official-domain>/review-access` | Reviewer notes | Obrigatorio pratico | Sim | Ops | Pendente |
| Reviewer credentials | Prontos | Confirmar habilitados no host final | Reviewer notes | Obrigatorio pratico | Sim | Ops / QA | Pendente |

## Reviewer notes text

```text
BlackBelt uses the standard login screen at https://<official-domain>/login.

Account deletion can be initiated inside the app from:
- Account menu -> Excluir conta
- Settings -> Minha Conta -> Solicitar exclusão

Public review URLs:
- Support: https://<official-domain>/suporte
- Privacy policy: https://<official-domain>/politica-privacidade
- Terms of use: https://<official-domain>/termos-de-uso
- Account deletion: https://<official-domain>/excluir-conta
- Reviewer instructions: https://<official-domain>/review-access

Reviewer credentials:
Email: <reviewer-email>
Password: <reviewer-password>
```

## Apple blockers

- seller/legal entity missing
- business address missing
- support and privacy contacts still require final monitored inboxes
- final public URLs must be validated on the production host
- production Apple Sign In configuration must match the final hosted redirect origin
