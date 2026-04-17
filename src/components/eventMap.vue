<script setup>
import { onMounted, watch, ref } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps({
  events: Array,
  selectedEventId: String
});

const emit = defineEmits(['select-event']);

const mapElement = ref(null);
let map = null;
let markersLayer = null;
let markersDictionnary = {};

const fixLeafletIcons = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

const initMap = () => {
  fixLeafletIcons();

  map = L.map(mapElement.value, {
    center: [20, 0],
    zoom: 3.5,
    minZoom: 2.5,
    worldCopyJump: true,
    attributionControl: false,
    bounceAtZoomLimits: false,
    scrollWheelZoom: 'center',
    maxBounds: [ [-90, -180], [90, 180] ],
    maxBoundsViscosity: 1.0
  });

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    subdomains: 'abcd', maxZoom: 20
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  if (props.events && props.events.length > 0) updateMarkers();
};

const updateMarkers = () => {
  if (!map || !markersLayer) return;
  markersLayer.clearLayers();
  markersDictionnary = {};

  props.events.forEach(event => {
    let geoData = null;
    if (Array.isArray(event.geometry)) geoData = event.geometry[0];
    else if (Array.isArray(event.geometries)) geoData = event.geometries[0];

    if (geoData && geoData.coordinates) {
      const [lon, lat] = geoData.coordinates;
      if (!isNaN(lat) && !isNaN(lon)) {
         const marker = L.marker([lat, lon]);

         marker.bindPopup(`<strong>${event.title}</strong>`);

         marker.on('click', () => {
           emit('select-event', event.id);
         });

         markersLayer.addLayer(marker);
         markersDictionnary[event.id] = marker;
      }
    }
  });
};

onMounted(() => {
  setTimeout(() => {
    initMap();
  }, 100);
});

watch(() => props.events, () => updateMarkers(), { deep: true, immediate: true });

watch(() => props.selectedEventId, (newId) => {
  if (newId && markersDictionnary[newId] && map) {
    const marker = markersDictionnary[newId];
    marker.openPopup();
    map.flyTo(marker.getLatLng(), 5, { duration: 1.5 });
  }
});
</script>

<template>
  <div class="map-container">
    <div ref="mapElement" class="map-render-area"></div>
  </div>
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
  background-color: #f4f4f4;
  display: flex;
  flex-direction: column;
}

.map-render-area {
  width: 100%;
  height: 100%;
  flex-grow: 1;
  z-index: 1;
}

:deep(.leaflet-container) {
  background-color: #e5e3df !important;
}

:deep(.leaflet-container) {
  overscroll-behavior: none !important;
  touch-action: none !important;
}

:deep(.leaflet-pane) {
  overscroll-behavior: none !important;
}
</style>
