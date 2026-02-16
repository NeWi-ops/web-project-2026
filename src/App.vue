<script setup>
  import { ref, computed, onMounted } from 'vue';
  import EventList from './components/eventList.vue';
  import EventMap from './components/eventMap.vue';
  import { fetchEvents } from './services/nasaAPI.js';

  const events = ref([]);
  const isLoading = ref(true);

  // --- LOGIQUE DE TRI CENTRALISÉE ---
  const sortType = ref('date');

  onMounted(async () => {
    try {
      const data = await fetchEvents(100);
      events.value = data;
    } finally {
      isLoading.value = false;
    }
  });

  // On crée une liste filtrée/triée ici pour la partager aux deux composants
  const filteredEvents = computed(() => {
    let result = [...events.value];

    // Exemple de tri par date (le même que tu as dans ta liste)
    result.sort((a, b) => new Date(b.closed || b.date) - new Date(a.closed || a.date));

    // On peut limiter à 20 pour ne pas surcharger la carte
    return result.slice(0, 100);
  });
</script>

<template>
  <div class="app-layout">
    <header class="main-header">
      <h1>🌍 NASA Earth Tracker</h1>
    </header>

    <main class="main-content">
      <div class="sidebar">
        <EventList :events="filteredEvents" :loading="isLoading" />
      </div>

      <div class="map-area">
        <EventMap :events="filteredEvents" />
      </div>
    </main>
    </div>
</template>

<style scoped>
/* Ton CSS reste identique */
.app-layout { display: flex; flex-direction: column; height: 100vh; font-family: 'Segoe UI', sans-serif; overflow: hidden; }
.main-header { background-color: #0b3d91; color: white; padding: 1rem; text-align: center; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.2); }
.main-content { display: flex; flex: 1; overflow: hidden; }
.sidebar { width: 400px; height: 100%; border-right: 1px solid #ddd; display: flex; flex-direction: column; z-index: 2;}

.map-area {
  flex: 1;
  position: relative;
}
.main-footer { background-color: #222; color: #aaa; text-align: center; padding: 0.5rem; font-size: 0.8rem; }
</style>
