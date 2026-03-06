/**
 * Geofence — Haversine-based proximity check for QR Check-in
 *
 * Uses the Haversine formula (no external lib) to determine
 * if a user is within the academy's geofence radius.
 *
 * Default radius: 200 meters.
 */

import { useMock, mockDelay } from '@/lib/env';

export interface GeofenceResult {
  withinRange: boolean;
  distanceMeters: number;
  radiusMeters: number;
}

export interface AcademyLocation {
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
}

const EARTH_RADIUS_M = 6_371_000; // meters

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula: calculates distance in meters between two GPS coordinates.
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
}

/**
 * Check if user coordinates are within the academy's geofence.
 */
export async function isWithinGeofence(
  _userLat: number,
  _userLng: number,
  _academyId: string
): Promise<GeofenceResult> {
  if (useMock()) {
    await mockDelay(50);
    // Mock: always within range, simulated distance
    return {
      withinRange: true,
      distanceMeters: 45,
      radiusMeters: 200,
    };
  }

  // TODO(BE-071): Fetch academy location from Supabase
  // const { data: academy } = await supabase
  //   .from('academies')
  //   .select('latitude, longitude, geofence_radius_m')
  //   .eq('id', academyId)
  //   .single();
  //
  // if (!academy?.latitude || !academy?.longitude) {
  //   // No geofence configured — allow check-in
  //   return { withinRange: true, distanceMeters: 0, radiusMeters: 0 };
  // }
  //
  // const distance = haversineDistance(userLat, userLng, academy.latitude, academy.longitude);
  // return {
  //   withinRange: distance <= academy.geofence_radius_m,
  //   distanceMeters: Math.round(distance),
  //   radiusMeters: academy.geofence_radius_m,
  // };

  // Fallback until Supabase integration
  return { withinRange: true, distanceMeters: 0, radiusMeters: 200 };
}
