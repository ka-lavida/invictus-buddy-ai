const EARTH_RADIUS_KM = 6371

const toRadians = (deg: number) => (deg * Math.PI) / 180

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const phi1 = toRadians(lat1)
  const phi2 = toRadians(lat2)
  const deltaPhi = toRadians(lat2 - lat1)
  const deltaLambda = toRadians(lng2 - lng1)

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} м`
  return `${km.toFixed(1)} км`
}

// Returns null when coordinates are unavailable or sentinel (0,0).
export function distanceToClub(
  userLat: number | null,
  userLng: number | null,
  clubLat: number,
  clubLng: number,
): string | null {
  if (
    userLat === null || userLng === null ||
    (userLat === 0 && userLng === 0)
  ) return null

  return formatDistance(haversineKm(userLat, userLng, clubLat, clubLng))
}
