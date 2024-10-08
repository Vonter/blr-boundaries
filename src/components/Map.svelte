<script lang="ts">
  import {
    selectedBoundaryMap,
    selectedDistrict,
    mapStore,
    hoveredDistrictId
  } from '../stores';
  import type { Feature } from 'geojson';
  import * as topojson from 'topojson-client';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';
  import { layers } from '../assets/boundaries';
  import * as turf from '@turf/turf';
  import {
    defaultZoom,
    findPolylabel,
    getDistrictFromSource,
    zoomToBound
  } from '../helpers/helpers';

  let map: maplibregl.Map;
  let isSourceLoaded = false;
  let prevLayerId: string | null = null;
  let prevDistrictId: string | null = null;

  function initMap(container: any) {
    map = new maplibregl.Map({
      container,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      minZoom: 9,
      maxZoom: 16,
      maxBounds: [
        [77, 12.5], // Southwestern NYC bounds + buffer
        [78.25, 13.5] // Northeastern NYC bounds + buffer
      ],
      ...defaultZoom
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'bottom-right'
    );

    // Override default browser zoom hotkeys
    window.addEventListener(
      'keydown',
      e => {
        if (e.metaKey && (e.key === '=' || e.key === '-')) {
          e.preventDefault();
          e.key === '=' && map.zoomIn();
          e.key === '-' && map.zoomOut();
        }
      },
      true
    );

    map.on('click', () => onDistrictChange(null));

    map.on('style.load', () => {
      $mapStore = map;
      $mapStore.resize();
    });

    return {
      destroy: () => {
        map.remove();
        $mapStore = map;
      }
    };
  }

  function clearMap() {
    if ($mapStore && prevLayerId) {
      // Remove previous layers
      $mapStore.getLayer(`${prevLayerId}-layer`) &&
        $mapStore.removeLayer(`${prevLayerId}-layer`);

      $mapStore.getLayer(`${prevLayerId}-stroke-layer`) &&
        $mapStore.removeLayer(`${prevLayerId}-stroke-layer`);

      $mapStore.getLayer(`${prevLayerId}-label-layer`) &&
        $mapStore.removeLayer(`${prevLayerId}-label-layer`);
    }
  }

  async function showMap(boundaryId: string) {
    clearMap();

    // Load source if not already loaded
    if ($mapStore && !$mapStore.getSource(boundaryId)) {
      const url = `./boundaries/${boundaryId}.topojson`;
      const data = await fetch(url)
        .then(res => res.json())
        .then(json => topojson.feature(json, json.objects[boundaryId]));

      $mapStore
        .addSource(boundaryId, {
          type: 'geojson',
          promoteId: 'namecol',
          data
        })
        .addSource(`${boundaryId}-centerpoints`, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: data.features.map((feature: Feature) => {
              feature.geometry = {
                type: 'Point',
                coordinates: findPolylabel(feature)
              };
              return feature;
            })
          }
        });

      $mapStore.on('sourcedata', source => {
        if (source.sourceId === boundaryId && source.isSourceLoaded) {
          const features = map?.querySourceFeatures(boundaryId);
          isSourceLoaded = !!features?.length;
        }
      });
    }

    if ($mapStore) {
      $mapStore
        .addLayer({
          id: `${boundaryId}-layer`,
          type: 'fill',
          source: boundaryId,
          paint: {
            'fill-color': '#2463eb',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              0.2,
              0.05
            ]
          }
        })
        .addLayer({
          id: `${boundaryId}-stroke-layer`,
          type: 'line',
          source: boundaryId,
          paint: {
            'line-color': '#2463eb',
            'line-width': [
              'case',
              [
                'any',
                ['boolean', ['feature-state', 'hover'], false],
                ['boolean', ['feature-state', 'selected'], false]
              ],
              2,
              1
            ]
          }
        })
        .addLayer({
          id: `${boundaryId}-label-layer`,
          type: 'symbol',
          source: `${boundaryId}-centerpoints`,
          paint: {
            'text-color': '#2463eb',
            'text-halo-color': 'rgba(255,255,255,0.9)',
            'text-halo-width': 2
          },
          layout: {
            'text-field': ['get', 'namecol'],
            'text-size': ['interpolate', ['linear'], ['zoom'], 11, 12.5, 32, 60]
          }
        });

      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false
      });

      $mapStore.on('mousemove', `${boundaryId}-layer`, e => {
        $mapStore.getCanvas().style.cursor = 'pointer';

        if (e.features) {
          if (e.features.length > 0) {
            if ($hoveredDistrictId !== null) {
              $mapStore?.setFeatureState(
                { source: boundaryId, id: $hoveredDistrictId },
                { hover: false }
              );
            }
            $hoveredDistrictId = e.features[0].properties?.namecol;
            $mapStore.setFeatureState(
              { source: boundaryId, id: $hoveredDistrictId },
              { hover: true }
            );
          }

          popup
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="flex items-center -mb-1"><div class="text-2xl mr-2">${
                layers[boundaryId].icon
              }</div><div class="pr-1"><div class="text-xs text-gray-500">${
                layers[boundaryId].name
              }</div><div class="text-sm font-semibold">${layers[
                boundaryId
              ].formatContent(
                e.features[0].properties?.namecol
              )}</div></div></div>`
            )
            .setOffset(8)
            .addTo(map);
        }
      });

      $mapStore.on('mouseleave', `${boundaryId}-layer`, () => {
        $mapStore.getCanvas().style.cursor = '';

        if ($hoveredDistrictId !== null) {
          $mapStore.setFeatureState(
            { source: boundaryId, id: $hoveredDistrictId },
            { hover: false }
          );
        }

        hoveredDistrictId.set(undefined);

        popup.remove();
      });

      $mapStore.on('click', `${boundaryId}-layer`, e => {
        if (e.features) {
          zoomToBound($mapStore, turf.bbox(e.features[0]));
          onDistrictChange(e.features[0].properties?.namecol, true);
        }
      });
    }

    // Prepare for future boundary change
    prevLayerId = boundaryId;
  }

  function onDistrictChange(
    districtId: string | null,
    interactionFromClick: boolean = false
  ) {
    // Remove existing clicked states
    if (prevDistrictId && $selectedBoundaryMap) {
      $mapStore?.setFeatureState(
        { source: $selectedBoundaryMap, id: prevDistrictId },
        { selected: false }
      );
    }

    $selectedDistrict = districtId;

    // Fetch bbox from districtId, fly to bbox.
    // If there interaction came from a click, it will fly in before the function.
    if ($mapStore && $selectedBoundaryMap && $selectedDistrict) {
      if (!interactionFromClick) {
        const feature = getDistrictFromSource(
          $mapStore,
          $selectedBoundaryMap,
          $selectedDistrict
        );
        if (feature) {
          zoomToBound($mapStore, turf.bbox(feature));
        }
      }

      $mapStore.setFeatureState(
        { source: $selectedBoundaryMap, id: $selectedDistrict },
        { selected: true }
      );
    }

    prevDistrictId = $selectedDistrict;
  }

  $: if ($mapStore) {
    $selectedBoundaryMap ? showMap($selectedBoundaryMap) : clearMap();
  }
  $: isSourceLoaded && onDistrictChange($selectedDistrict);
</script>

<div id="map" class="flex-1 h-full" use:initMap />
