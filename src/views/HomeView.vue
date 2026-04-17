<script setup>
import { ref, computed, onMounted } from 'vue';
import EventList from '../components/eventList.vue';
import EventMap from '../components/eventMap.vue';
import FilterPanel from '../components/FilterPanel.vue';
import { fetchEvents } from '../services/nasaAPI.js';

const allEvents = ref([]);
const isLoading = ref(true);
const selectedEventId = ref(null);

const activeFilters = ref({
  category: '',
  startDate: '',
  endDate: '',
  locations: [],
  excludeLocation: false,
  displayLimit: 50
});

onMounted(async () => {
  try {
    allEvents.value = await fetchEvents();
  } finally {
    isLoading.value = false;
  }
});

const handleFiltersUpdate = (newFilters) => {
  activeFilters.value = newFilters;
  selectedEventId.value = null;
};

const availableCategories = computed(() => {
  const categoriesSet = new Set();
  allEvents.value.forEach(event => {
    if (event.categories && event.categories.length > 0) {
      categoriesSet.add(event.categories[0].title);
    }
  });
  return Array.from(categoriesSet).sort();
});

const filteredEvents = computed(() => {
  let result = allEvents.value.filter(event => {
    if (activeFilters.value.category) {
      if (!event.categories || event.categories.length === 0) return false;
      if (event.categories[0].title !== activeFilters.value.category) return false;
    }

    const eventDateStr = event.geometry ? event.geometry[0].date : (event.geometries ? event.geometries[0].date : event.closed);
    if (eventDateStr) {
      const eventDate = new Date(eventDateStr);
      if (activeFilters.value.startDate) {
        const start = new Date(activeFilters.value.startDate);
        start.setHours(0, 0, 0, 0);
        if (eventDate < start) return false;
      }
      if (activeFilters.value.endDate) {
        const end = new Date(activeFilters.value.endDate);
        if (!isNaN(end)) {
          end.setHours(23, 59, 59, 999);
          if (eventDate > end) return false;
        }
      }
    }

    if (activeFilters.value.locations && activeFilters.value.locations.length > 0) {
      const title = (event.title || '').toLowerCase();
      const matchesAny = activeFilters.value.locations.some(loc => title.includes(loc.toLowerCase()));

      if (activeFilters.value.excludeLocation) {
        if (matchesAny) return false;
      } else {
        if (!matchesAny) return false;
      }
    }
    return true;
  });

  result.sort((a, b) => {
    const dateA = new Date(a.geometry ? a.geometry[0].date : (a.geometries ? a.geometries[0].date : a.closed));
    const dateB = new Date(b.geometry ? b.geometry[0].date : (b.geometries ? b.geometries[0].date : b.closed));
    return dateB - dateA;
  });

  return result.slice(0, activeFilters.value.displayLimit);
});
</script>

<template>
  <div class="home-page-container">
    <FilterPanel
      :availableCategories="availableCategories"
      @update-filters="handleFiltersUpdate"
    />

    <div class="content-split">
      <div class="sidebar">
        <EventList
          :events="filteredEvents"
          :loading="isLoading"
          :selected-event-id="selectedEventId"
          @select-event="(id) => selectedEventId = id"
        />
      </div>

      <div class="map-area">
        <transition name="loader-fade">
          <div v-if="isLoading" class="loading-overlay">
            <div class="loader-content">
              <div class="spinner"></div>
              <p class="loader-text">Chargement des données en cours...</p>
            </div>
          </div>
        </transition>

        <EventMap
          :events="filteredEvents"
          :selected-event-id="selectedEventId"
          @select-event="(id) => selectedEventId = id"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.content-split {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 280px;
  height: 100%;
  border-right: 1px solid #ddd;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  z-index: 2;
}

.map-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(11, 61, 145, 0.88);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
}

.loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
}

.spinner {
  width: 56px;
  height: 56px;
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.85s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loader-text {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  margin: 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.loader-fade-leave-active {
  transition: opacity 0.4s ease;
}
.loader-fade-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .content-split {
    flex-direction: column;
  }
  .sidebar {
    width: 100%;
    height: 40vh;
    border-right: none;
    border-top: 1px solid #ddd;
    order: 2;
  }
  .map-area {
    height: 60vh;
    order: 1;
  }
}
</style>
