<script setup>
  import { onMounted, watch } from 'vue';
  import L from 'leaflet';
  import 'leaflet/dist/leaflet.css';

  const props = defineProps({
    events: Array
  });

  let map = null;
  let markersLayer = null;

  // 1. FIX DES ICÔNES (Indispensable pour Vue.js)
  const fixLeafletIcons = () => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  };

  const boundsLimit = L.latLngBounds(L.latLng(-85, -Infinity), L.latLng(85, Infinity));

  const initMap = () => {
    fixLeafletIcons();
    map = L.map('map', {
      center: [20, 0],
      zoom: 3.5,
      minZoom: 2.5,
      worldCopyJump: true,
      zoomSnap: 0,
      wheelDebounceTime: 40,
      wheelPxPerZoomLevel: 2,
      maxBounds: boundsLimit,
      attributionControl: false
    });

    // Tuiles CartoDB (International/Anglais)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
      noWrap: false,
      bounds: boundsLimit
    }).addTo(map);

    // On prépare le calque pour les marqueurs
    markersLayer = L.layerGroup().addTo(map);

    // Le marqueur Paris a été supprimé ici

    if (props.events && props.events.length > 0) {
      updateMarkers();
    }
  };

  const updateMarkers = () => {
    if (!map || !markersLayer) return;

    // Nettoyage avant d'ajouter les nouveaux points
    markersLayer.clearLayers();

    props.events.forEach(event => {
      let geoData = null;
      if (Array.isArray(event.geometry)) geoData = event.geometry[0];
      else if (Array.isArray(event.geometries)) geoData = event.geometries[0];

      if (geoData && geoData.coordinates) {
        const [lon, lat] = geoData.coordinates;
        if (!isNaN(lat) && !isNaN(lon)) {
           const marker = L.marker([lat, lon]);

           // Popup stylisée avec lien Google
           marker.bindPopup(`
             <div style="text-align: center;">
               <strong>${event.title}</strong><br>
               <span style="color:gray; font-size:0.9em;">${event.categories[0].title}</span><br>
               <a href="https://www.google.com/search?q=${event.title}" target="_blank" style="color:#007bff; text-decoration:none;">Détails &rarr;</a>
             </div>
           `);

           markersLayer.addLayer(marker);
        }
      }
    });
  };

  onMounted(() => {
    initMap();
  });

  // Watcher réactif pour mettre à jour les points quand la liste change
  watch(
    () => props.events,
    () => updateMarkers(),
    { deep: true, immediate: true }
  );
</script>

<template>
  <div id="map-container">
    <div id="map"></div>
  </div>
</template>

<style scoped>
#map-container {
  width: 100%;
  height: 100%;
  background-color: #f4f4f4;
}

#map {
  width: 100%;
  height: 100%;
  z-index: 1;
  cursor: grab;
  /* Accélération GPU pour la fluidité */
  transform: translate3d(0, 0, 0);
  will-change: transform;
}

:deep(.leaflet-container) {
  background-color: transparent !important;
}
</style>
