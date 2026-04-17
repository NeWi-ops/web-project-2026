<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchEvents } from '../services/nasaAPI';
import { favoritesService } from '../services/favoritesService';
import EventList from '../components/eventList.vue';

const allEvents = ref([]);
const favoriteIds = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    allEvents.value = await fetchEvents();
    favoriteIds.value = favoritesService.getFavorites();
  } finally {
    isLoading.value = false;
  }
});

const favoriteEvents = computed(() => {
  return allEvents.value.filter(event => favoriteIds.value.includes(event.id));
});
</script>

<template>
  <div class="favorites-page">
    <div class="header-section">
      <h2>Mes Événements Sauvegardés</h2>
      <p v-if="favoriteEvents.length > 0">
        Retrouvez ici les catastrophes que vous surveillez de près.
      </p>
    </div>

    <div v-if="isLoading" class="loader">Chargement de vos favoris...</div>

    <div v-else-if="favoriteEvents.length === 0" class="empty-state">
      <p>Vous n'avez pas encore ajouté de favoris.</p>
      <router-link to="/" class="btn-go">Allez à la carte</router-link>
    </div>

    <div v-else class="fav-list-container">
      <EventList :events="favoriteEvents" :isFavoriteView="true" />
    </div>

  </div>
</template>

<style scoped>
.favorites-page { padding: 2rem; max-width: 900px; margin: 0 auto; height: 100%; overflow-y: auto; }
.header-section { margin-bottom: 2rem; border-bottom: 1px solid #ddd; padding-bottom: 1rem; }
.empty-state { text-align: center; margin-top: 4rem; }
.btn-go {
  display: inline-block; margin-top: 1rem; padding: 0.8rem 1.5rem;
  background: #0b3d91; color: white; text-decoration: none; border-radius: 5px;
}
.loader { text-align: center; padding: 3rem; }
.fav-list-container { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
</style>
