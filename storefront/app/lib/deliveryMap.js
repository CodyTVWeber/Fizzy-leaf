import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  DELIVERY_RADIUS_MI,
  METERS_PER_MI,
  ORIGIN,
} from '~/lib/deliveryGeo';

const MARKER_ICON_URL = assetUrl(markerIcon);
const MARKER_ICON_2X_URL = assetUrl(markerIcon2x);
const MARKER_SHADOW_URL = assetUrl(markerShadow);

export async function loadLeaflet() {
  const L = (await import('leaflet')).default;
  await import('leaflet/dist/leaflet.css');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: MARKER_ICON_2X_URL,
    iconUrl: MARKER_ICON_URL,
    shadowUrl: MARKER_SHADOW_URL,
  });
  return L;
}

export function buildDeliveryMap(L, container) {
  const map = L.map(container, {scrollWheelZoom: false}).setView(
    [ORIGIN.lat, ORIGIN.lng],
    9,
  );
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
  }).addTo(map);

  const circle = L.circle([ORIGIN.lat, ORIGIN.lng], {
    radius: DELIVERY_RADIUS_MI * METERS_PER_MI,
    color: '#9c6f1f',
    weight: 2,
    fillColor: '#c9a86b',
    fillOpacity: 0.18,
  }).addTo(map);

  const originMarker = L.marker([ORIGIN.lat, ORIGIN.lng], {
    icon: defaultMarkerIcon(L),
  })
    .addTo(map)
    .bindPopup('College Grove — delivery start');

  map.fitBounds(circle.getBounds(), {padding: [16, 16]});

  return {map, circle, originMarker, visitorMarker: null};
}

export function placeVisitorMarker(L, state, lat, lng, inRange) {
  const {map, circle} = state;
  if (state.visitorMarker) map.removeLayer(state.visitorMarker);

  const visitorMarker = L.marker([lat, lng], {icon: defaultMarkerIcon(L)})
    .addTo(map)
    .bindPopup(inRange ? "You're in range" : 'Outside the delivery area');
  if (inRange) visitorMarker.openPopup();

  const group = L.featureGroup([circle, visitorMarker]);
  map.fitBounds(group.getBounds(), {
    padding: inRange ? [28, 28] : [36, 36],
    maxZoom: inRange ? 11 : 8,
  });
  map.invalidateSize();

  return {...state, visitorMarker};
}

function defaultMarkerIcon(L) {
  return L.icon({
    iconRetinaUrl: MARKER_ICON_2X_URL,
    iconUrl: MARKER_ICON_URL,
    shadowUrl: MARKER_SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

function assetUrl(asset) {
  if (typeof asset === 'string') return asset;
  if (asset && typeof asset.src === 'string') return asset.src;
  return String(asset);
}
