-- ============================================================
-- Migration 00026: QR Check-in Geofence + White-label Academy Theming
-- BLOCO 1.2 — QR Check-in + White-label Academy Theming
-- ============================================================

-- ── PART 1: Geofence columns for QR check-in ──

ALTER TABLE academies ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE academies ADD COLUMN IF NOT EXISTS geofence_radius_m INT DEFAULT 200;

COMMENT ON COLUMN academies.latitude IS 'Academy GPS latitude for geofence-based QR check-in';
COMMENT ON COLUMN academies.longitude IS 'Academy GPS longitude for geofence-based QR check-in';
COMMENT ON COLUMN academies.geofence_radius_m IS 'Geofence radius in meters (default 200m)';

-- ── PART 2: White-label Academy Theme ──

ALTER TABLE academies ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{
  "primaryColor": "#C9A227",
  "secondaryColor": "#1A1A2E",
  "logoUrl": null,
  "faviconUrl": null,
  "customCSS": null
}';

COMMENT ON COLUMN academies.theme IS 'White-label theme configuration (colors, logo, custom CSS)';

-- ── Index for geofence queries ──
CREATE INDEX IF NOT EXISTS idx_academies_geofence
  ON academies (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
