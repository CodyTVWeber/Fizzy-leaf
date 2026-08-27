export const ORIGIN = {lat: 35.7869, lng: -86.675};
export const DELIVERY_RADIUS_MI = 30;
export const EARTH_RADIUS_MI = 3958.8;
export const METERS_PER_MI = 1609.34;

export const CHECK_STATUS = {
  empty: 'empty',
  notFound: 'not-found',
  failed: 'failed',
  inRange: 'in-range',
  outOfRange: 'out-of-range',
};

const CENSUS_URL =
  'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const GEOCODE_UA = 'FizzyLeafDelivery/1.0 (fizzyleaf.com; local-delivery-check)';
const GEOCODE_MS = 8000;

export function haversineMiles(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function checkDeliveryAddress(address) {
  const trimmed = address.trim();
  if (!trimmed) return {status: CHECK_STATUS.empty};

  let hit;
  try {
    hit = await geocodeAddress(trimmed);
  } catch {
    return {status: CHECK_STATUS.failed};
  }
  if (!hit) return {status: CHECK_STATUS.notFound};

  const miles = haversineMiles(ORIGIN.lat, ORIGIN.lng, hit.lat, hit.lng);
  return {
    status:
      miles <= DELIVERY_RADIUS_MI
        ? CHECK_STATUS.inRange
        : CHECK_STATUS.outOfRange,
    hit,
    miles,
  };
}

export async function geocodeAddress(address) {
  const queries = addressQueries(address);
  for (const query of queries) {
    const hit = await geocodeWithCensus(query);
    if (hit) return hit;
  }
  for (const query of queries) {
    const hit = await geocodeWithNominatim(query);
    if (hit) return hit;
  }
  return null;
}

function addressQueries(address) {
  const trimmed = address.trim();
  const expanded = trimmed
    .replace(/\bhwy\b/gi, 'Highway')
    .replace(/\bpkwy\b/gi, 'Parkway')
    .replace(/\brt\b/gi, 'Route');
  return uniqueNonEmpty([trimmed, expanded]);
}

async function geocodeWithCensus(query) {
  const url =
    `${CENSUS_URL}?benchmark=Public_AR_Current&format=json&address=` +
    encodeURIComponent(query);
  const data = await fetchJson(url, {});
  const match = data?.result?.addressMatches?.[0];
  if (!match?.coordinates) return null;
  const lat = Number(match.coordinates.y);
  const lng = Number(match.coordinates.x);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    displayName: match.matchedAddress || query,
  };
}

async function geocodeWithNominatim(query) {
  const url =
    `${NOMINATIM_URL}?format=json&limit=1&countrycodes=us&q=` +
    encodeURIComponent(query);
  const data = await fetchJson(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'en',
      'User-Agent': GEOCODE_UA,
    },
  });
  const hit = Array.isArray(data) ? data[0] : null;
  if (!hit || hit.lat == null || hit.lon == null) return null;
  const lat = Number(hit.lat);
  const lng = Number(hit.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    lat,
    lng,
    displayName: hit.display_name || query,
  };
}

async function fetchJson(url, init) {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(GEOCODE_MS),
  });
  if (!response.ok) throw new Error('Geocode request failed');
  return response.json();
}

function uniqueNonEmpty(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    const key = value.trim();
    if (!key || seen.has(key.toLowerCase())) continue;
    seen.add(key.toLowerCase());
    out.push(key);
  }
  return out;
}
