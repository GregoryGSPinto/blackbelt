# Google Play Data Safety Final Draft

Date: March 13, 2026

## Draft classification

### Data collected

- Personal info: name, email, phone when provided
- Financial info: billing and subscription records when applicable
- App activity: training progress, attendance, communications, feature usage
- Device or diagnostics: operational diagnostics when enabled

### Data shared

- No intentional sale of personal data is supported by the current codebase
- Processor use may still apply for hosting, email, payments, analytics, and error tracking

### Purpose

- account management
- core product functionality
- subscription and billing operations
- service support
- fraud and security monitoring
- diagnostics

### Encryption and deletion

- production transport must be HTTPS-only
- users can request account deletion in-app and via the public web form
- Play Console data deletion URL should be `https://<official-domain>/excluir-conta`

## Suggested Play Console narrative

```text
Users can request deletion of their BlackBelt account and associated personal data directly inside the app from the account menu or Settings > Minha Conta. Google Play's required public data deletion URL is https://<official-domain>/excluir-conta, where users can submit the same request without signing in.
```

## Manual confirmation required before console submission

- exact processor list enabled in production
- final analytics vendors enabled in production
- final payment model and whether digital in-app purchases will exist
- final support, privacy, terms, and deletion URLs on the production domain

## Readiness

- draft content: READY
- public deletion URL narrative: READY
- console submission by business owner: PENDING
- legal confirmation: PENDING
