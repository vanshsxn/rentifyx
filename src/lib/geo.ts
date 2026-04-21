// Haversine distance in km
export const haversine = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// "BFS-style" nearest sort: starts from user, expands outward by distance
export const sortByProximity = <T extends { latitude: number | null; longitude: number | null }>(
  items: T[],
  origin: { lat: number; lng: number }
): (T & { _distance: number })[] => {
  return items
    .filter(p => p.latitude != null && p.longitude != null)
    .map(p => ({
      ...p,
      _distance: haversine(origin.lat, origin.lng, p.latitude!, p.longitude!),
    }))
    .sort((a, b) => a._distance - b._distance);
};

export const getUserLocation = (): Promise<{ lat: number; lng: number }> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
