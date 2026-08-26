import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import {
  DELIVERY_RADIUS_MI,
  METERS_PER_MI,
  ORIGIN,
} from '~/lib/deliveryGeo';

export async function loadLeaflet() {
  const L = (await import('leaflet')).default;
  await import('leaflet/dist/leaflet.css');
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
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

  const originMarker = L.marker([ORIGIN.lat, ORIGIN.lng])
    .addTo(map)
    .bindPopup('College Grove — delivery start');

  map.fitBounds(circle.getBounds(), {padding: [16, 16]});

  return {map, circle, originMarker, visitorMarker: null};
}

export function placeVisitorMarker(L, state, lat, lng, inRange) {
  const {map, circle} = state;
  if (state.visitorMarker) map.removeLayer(state.visitorMarker);

  const visitorMarker = L.marker([lat, lng])
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
