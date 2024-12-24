import type { LngLat } from 'maplibre-gl';
import type maplibregl from 'maplibre-gl';
import { feature } from 'topojson-client';
import { readable, writable } from 'svelte/store';

import { layers } from './assets/boundaries';
import officials from './officials.json';

const params = new URLSearchParams(window.location.search);

function getLngLatObjectFromUrl(
  lng: string | null,
  lat: string | null
): LngLat | null {
  if (!lng || !lat) {
    return null;
  }
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng)
  } as LngLat;
}

export const selectedBoundaryMap = writable<string | null>(params.get('map'));
export const selectedDistrict = writable<string | null>(params.get('dist'));
export const hoveredDistrictId = writable<string | number | undefined>();
export const addressMarker = writable<maplibregl.Marker>();
export const selectedCoordinates = writable<LngLat | null>(
  getLngLatObjectFromUrl(params.get('lng'), params.get('lat'))
);
export const coordinatesMarker = writable<maplibregl.Marker>();
export const mapStore = writable<maplibregl.Map>();

export const boundaries = readable(null, set => {
  fetch(`./boundaries.json`)
    .then(response => response.json())
    .then(topojson => feature(topojson, topojson.objects.boundaries))
    .then(geojson => set(geojson))
    .catch(error => {
      console.error('Error fetching boundaries:', error);
      set(null);
    });

  return () => {};
});

export const isMapReady = writable<boolean>(false);

export function getOfficialDetails(
  boundaryId: string | null,
  districtId: string | null
) {
  if (!boundaryId || !districtId) return null;

  return officials.find(
    official =>
      official.Department.toLowerCase() === boundaryId.toLowerCase() &&
      official.Area.toLowerCase() ===
        layers[boundaryId].formatContent(districtId).toLowerCase()
  );
}
