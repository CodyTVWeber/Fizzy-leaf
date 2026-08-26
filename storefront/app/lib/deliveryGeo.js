export const ORIGIN = {lat: 35.7869, lng: -86.675};
export const DELIVERY_RADIUS_MI = 30;
export const EARTH_RADIUS_MI = 3958.8;
export const METERS_PER_MI = 1609.34;

const NOMINATIM_URL =
  'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=';

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function geocodeAddress(address) {
  const query = encodeURIComponent(address.trim());
  const response = await fetch(`${NOMINATIM_URL}${query}`, {
    headers: {'Accept-Language': 'en'},
  });
  if (!response.ok) throw new Error('Geocode failed');
  const results = await response.json();
  if (!Array.isArray(results) || results.length === 0) return null;
  const hit = results[0];
  return {
    lat: Number(hit.lat),
    lng: Number(hit.lon),
    displayName: hit.display_name,
  };
}
