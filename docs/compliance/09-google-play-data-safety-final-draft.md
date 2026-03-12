# Google Play Data Safety Final Draft

Date: March 12, 2026

## Draft classification

### Data collected

- Personal info: email, phone when provided
- Financial info: billing-related records when applicable
- App activity: feature usage, progress, attendance, communications
- Device or diagnostics: operational diagnostics when enabled

### Data shared

- No intentional sale of personal data is supported by the current codebase
- Processor use may still apply for hosting, email, payments, analytics, and error tracking

### Purpose

- account management
- core product functionality
- service support
- fraud/security monitoring
- diagnostics

### Encryption and deletion

- transit should be HTTPS-only
- public account deletion request flow exists

## Manual confirmation required before console submission

- exact processor list
- final analytics vendors enabled in production
- final payment model and whether digital in-app purchases will exist
- final support and privacy URLs

## Readiness

- draft content: READY
- console submission by business owner: PENDING
- legal confirmation: PENDING
