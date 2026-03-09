# Changelog

All notable changes to this repository are documented here.

The format follows Keep a Changelog and the project continues to use semantic-version-style release notes when formal releases are cut.

## [Unreleased] - 2026-03-09

### Changed

- Replaced the top-level README with a current-state project overview and workflow guide.
- Added [ARCHITECTURE.md](/Users/user_pc/Projetos/BlackBelt/ARCHITECTURE.md) and [CONTRIBUTING.md](/Users/user_pc/Projetos/BlackBelt/CONTRIBUTING.md).
- Added [docs/REPOSITORY_DIAGNOSTIC.md](/Users/user_pc/Projetos/BlackBelt/docs/REPOSITORY_DIAGNOSTIC.md) to document architectural and repository risks.
- Updated `.gitignore` to stop accepting new `logs/`, `mobile-build/`, and `.claude/` artifacts.
- Removed an unused import in the mobile shell drawer to restore lint compliance.

### Validation

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

### Known Follow-Up

- Large files, duplicated module roots, and broad `any` usage remain and require staged refactors rather than a single unsafe rewrite.

## [1.0.0] - 2026-03-07

### Added

- Initial application release line for the BlackBelt platform
- Multi-role web/mobile experience
- Supabase-backed schema and migration set
- Mock-first service layer and automated test suite
