<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { favoritesService } from '../services/favoritesService';
import { fetchWikipediaInfo } from '../services/wikipediaAPI';

const props = defineProps({
  events: Array,
  isFavoriteView: { type: Boolean, default: false },
  selectedEventId: String
});

const emit = defineEmits(['select-event']);

const favoriteIds = ref([]);
const loadedWiki = ref({});
const loadingWikiId = ref(null);

onMounted(() => {
  favoriteIds.value = favoritesService.getFavorites();
});

const toggleFav = (id) => {
  favoriteIds.value = favoritesService.toggleFavorite(id);
};

const getGoogleSearchUrl = (event) => {
  let cleanTitle = event.title.replace(/\s\d+$/, '');
  const dateStr = event.geometry ? event.geometry[0].date : (event.geometries ? event.geometries[0].date : event.closed);
  if (dateStr) {
    const dateObj = new Date(dateStr);
    const exactDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    cleanTitle += ` ${exactDate}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(cleanTitle)}`;
};

const getEventSummary = (event) => {
  if (event.description) return event.description;
  const categoryName = event.categories && event.categories.length > 0 ? event.categories[0].title : 'catastrophe naturelle';
  const dateStr = event.geometry ? event.geometry[0].date : (event.geometries ? event.geometries[0].date : event.closed);
  let dateText = 'récemment';
  if (dateStr) {
    const dateObj = new Date(dateStr);
    dateText = 'le ' + dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return `Cet événement classé comme "${categoryName}" a été détecté ${dateText}.`;
};

const loadWiki = async (event) => {
  if (loadedWiki.value[event.id]) return;
  loadingWikiId.value = event.id;
  let cleanTitle = event.title.replace(/[0-9-]/g, '').trim();
  const wikiData = await fetchWikipediaInfo(cleanTitle);
  loadedWiki.value[event.id] = wikiData || { notFound: true };
  loadingWikiId.value = null;
};

watch(() => props.selectedEventId, async (newId) => {
  if (newId) {
    await nextTick();
    const element = document.getElementById(`event-${newId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});
</script>

<template>
  <div class="events-container scrollable-list">
    <div
      v-for="event in events"
      :key="event.id"
      :id="`event-${event.id}`"
      class="event-card"
      :class="{ 'selected': props.selectedEventId === event.id }"
      @click="emit('select-event', event.id)"
    >
      <div class="card-header">
        <h3 class="event-title">{{ event.title }}</h3>
        <button
          @click.stop="toggleFav(event.id)"
          class="fav-btn"
          :class="{ 'active': favoriteIds.includes(event.id) }"
          title="Ajouter/Retirer des favoris"
        >
          {{ favoriteIds.includes(event.id) ? '⭐' : '☆' }}
        </button>
      </div>

      <div v-if="props.isFavoriteView" class="event-summary">
        <p><strong>Résumé :</strong> {{ getEventSummary(event) }}</p>

        <div class="wiki-section">
          <button v-if="!loadedWiki[event.id]" @click.stop="loadWiki(event)" class="load-wiki-btn">
            {{ loadingWikiId === event.id ? 'Interrogation de Wikipédia...' : 'En savoir plus (Wikipédia)' }}
          </button>

          <div v-if="loadedWiki[event.id]" class="wiki-result" @click.stop>
            <div v-if="loadedWiki[event.id].notFound" class="no-wiki">
              <p>Aucun article Wikipédia exact n'a été trouvé pour cet événement précis.</p>
            </div>
            <div v-else class="wiki-content">
              <h4>{{ loadedWiki[event.id].title }}</h4>
              <p class="wiki-extract">"{{ loadedWiki[event.id].extract }}..."</p>
              <a :href="loadedWiki[event.id].url" target="_blank" class="wiki-link">Lire l'article complet sur Wikipédia</a>
            </div>
          </div>
        </div>
      </div>

      <div class="card-footer">
        <span class="event-category" v-if="event.categories && event.categories.length > 0">
          {{ event.categories[0].title.toUpperCase() }}
        </span>

        <a :href="getGoogleSearchUrl(event)" target="_blank" rel="noopener noreferrer" class="search-link" @click.stop>
          {{ props.isFavoriteView ? 'Explorer sur Google' : 'Rechercher' }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.events-container { display: flex; flex-direction: column; gap: 1rem; padding: 1rem; }
.scrollable-list { overflow-y: auto; height: 100%; scrollbar-width: thin; }
.event-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: all 0.2s; cursor: pointer; }
.event-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
.event-card.selected { border-color: #0b3d91; box-shadow: 0 0 0 2px rgba(11, 61, 145, 0.2); background-color: #f4f8ff; }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 1rem; }
.event-title { margin: 0; font-size: 1.1rem; color: #0b3d91; line-height: 1.3; }
.fav-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; transition: transform 0.2s; padding: 0; }
.fav-btn:hover { transform: scale(1.2); }
.fav-btn.active { color: #f1c40f; text-shadow: 0 0 5px rgba(241, 196, 15, 0.5); }
.event-summary { background-color: #f8f9fa; border-left: 3px solid #0b3d91; padding: 0.8rem; margin-bottom: 1rem; font-size: 0.9rem; color: #444; border-radius: 0 4px 4px 0; line-height: 1.4; }
.event-summary p { margin: 0; }
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem; }
.event-category { background-color: #d9534f; color: white; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold; }
.search-link { color: #0b3d91; text-decoration: none; font-weight: bold; font-size: 0.9rem; }
.search-link:hover { text-decoration: underline; }
.wiki-section { margin-top: 1rem; border-top: 1px dashed #ccc; padding-top: 1rem; }
.load-wiki-btn { width: 100%; padding: 0.6rem; background-color: #f8f9fa; color: #333; border: 1px solid #ccc; border-radius: 4px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
.load-wiki-btn:hover { background-color: #e9ecef; border-color: #999; }
.wiki-result { margin-top: 1rem; background: white; padding: 1rem; border-radius: 6px; border: 1px solid #eee; }
.wiki-content h4 { margin: 0 0 0.5rem 0; color: #000; font-size: 1rem; font-family: serif; }
.wiki-extract { font-size: 0.85rem; color: #444; font-style: italic; line-height: 1.5; margin-bottom: 0.8rem !important; }
.wiki-link { font-size: 0.85rem; color: #0645ad; text-decoration: none; font-weight: bold; }
.wiki-link:hover { text-decoration: underline; }
.no-wiki { font-size: 0.85rem; color: #888; font-style: italic; }
</style>
