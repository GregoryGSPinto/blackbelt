# Reviewer Instructions

Date: March 13, 2026

## Reviewer path

1. Open `https://<official-domain>/login`
2. Sign in with the reviewer credentials provided in the release packet
3. Validate the main journey
4. Open the account menu and verify the in-app account deletion entry point
5. Open `https://<official-domain>/review-access` for legal and support references

## Notes for App Store Connect and Play Console

```text
BlackBelt uses the standard login screen for review. No hidden route or manual setup is required.

After login, account deletion can be initiated in-app from:
- Account menu -> Excluir conta
- Settings -> Minha Conta -> Solicitar exclusão

Public URLs for review:
- Support: https://<official-domain>/suporte
- Privacy policy: https://<official-domain>/politica-privacidade
- Terms of use: https://<official-domain>/termos-de-uso
- Account deletion: https://<official-domain>/excluir-conta
- Reviewer instructions: https://<official-domain>/review-access
```

## Operational requirements before submission

- Provision a stable demo tenant
- Provision reviewer credentials on the final hosted origin
- Confirm OAuth redirect URLs match the final hosted origin
- Confirm the reviewer account has enough seeded data to exercise login, profile, settings, support, and logout

## Status

- Reviewer flow documentation: READY
- Final credentials insertion: PENDING EXTERNAL INPUT
