-- Migration: Add preferred_locale to profiles
-- Part of Block A3: Language Switcher + Persistence

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_locale TEXT DEFAULT 'pt-BR';

COMMENT ON COLUMN profiles.preferred_locale IS 'User preferred locale for i18n (pt-BR or en-US)';
