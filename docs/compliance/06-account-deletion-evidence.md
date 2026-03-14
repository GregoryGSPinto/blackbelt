# Account Deletion Evidence

Date: March 13, 2026

## Compliance requirement covered

- Apple App Store Review Guideline 5.1.1(v): account deletion must be initiable inside the app
- Google Play User Data policy: in-app deletion path plus public web deletion URL

## Implemented paths

- In-app account menu entry: `Excluir conta`
- In-app settings entry: `Configurações -> Minha Conta -> Solicitar exclusão`
- Public web form: `/excluir-conta`
- Public privacy reference: `/politica-privacidade`
- Public support reference: `/suporte`

## Backend evidence

- Endpoint: `app/api/lgpd/delete/route.ts`
- Persistence table: `data_deletion_requests`
- Authenticated flow: request is associated with the authenticated profile
- Public flow: request is accepted for review using the submitted email
- Audit log: the request is recorded for compliance traceability

## UX evidence

- Deletion is not hidden behind manual support contact
- The user sees a dedicated deletion action inside the product
- The public web page exists for Play Console data deletion disclosure
- The privacy policy and reviewer instructions point to the same canonical deletion URL

## Known operational boundary

- Final deletion execution still depends on the privacy operations process
- That is acceptable for store review as long as the request path is functional, clear, and not misleading

## Status

- Evidence package: READY
- Final hosted URL validation: PENDING ON DEPLOY
