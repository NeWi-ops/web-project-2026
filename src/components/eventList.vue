<script setup>
  import { ref, onMounted, computed } from 'vue'; // Ajout de 'computed'
  import { fetchEvents } from '../services/nasaAPI.js';

  // --- DONNÉES ---
  const events = ref([]);
  const isLoading = ref(true);

  // --- FILTRES DE TRI (L'interaction utilisateur) ---
  const sortType = ref('date'); // Par défaut, on trie par date
  const isDescending = ref(true); // Par défaut, du plus récent au plus vieux

  // --- FONCTION UTILITAIRE ---
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // --- LA MACHINE À TRIER (Computed) ---
  const sortedEvents = computed(() => {
    // 1. On crée une COPIE de la liste ([...events.value]) pour ne pas casser l'originale
    return [...events.value].sort((a, b) => {

      let valA, valB;

      // 2. On choisit quelle donnée comparer selon le choix de l'utilisateur
      if (sortType.value === 'date') {
        valA = new Date(a.geometry[0].date).getTime(); // Convertit en nombre (timestamp)
        valB = new Date(b.geometry[0].date).getTime();
      }
      else if (sortType.value === 'title') {
        valA = a.title.toLowerCase(); // Minuscule pour bien comparer
        valB = b.title.toLowerCase();
      }
      else if (sortType.value === 'category') {
        valA = a.categories[0].title.toLowerCase();
        valB = b.categories[0].title.toLowerCase();
      }

      // 3. La comparaison mathématique
      if (valA < valB) {
        return isDescending.value ? 1 : -1;
      }
      if (valA > valB) {
        return isDescending.value ? -1 : 1;
      }
      return 0; // Si c'est égal
    });
  });

  // --- CHARGEMENT ---
  onMounted(async () => {
    const data = await fetchEvents((100));
    events.value = data;
    isLoading.value = false;
  });
</script>

<template>
  <div class="list-container">

    <div class="list-header">
      <h2>Incidents</h2>

      <div class="controls">
        <select v-model="sortType" class="sort-select">
          <option value="date">Date</option>
          <option value="title">Nom</option>
          <option value="category">Type</option>
        </select>

        <button @click="isDescending = !isDescending" class="order-btn">
          {{ isDescending ? '⬇' : '⬆' }}
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading">
      <p>Réception des données...</p>
    </div>

    <div v-else class="scrollable-list">
      <div v-for="event in sortedEvents" :key="event.id" class="event-card">
        <div class="card-header">
          <h3>{{ event.title }}</h3>
          <span class="tag">{{ event.categories[0].title }}</span>
        </div>

        <div class="card-body">
          <p> {{ formatDate(event.geometry[0].date) }}</p>
          <a :href="`https://www.google.com/search?q=${event.title}`" target="_blank" class="link">Rechercher l'évènement &rarr;</a>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* On garde le même style qu'avant + les nouveaux contrôles */
.list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;
}
.list-header {
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #ddd;
  /* Flexbox pour écarter le titre des boutons */
  display: flex;
  justify-content: space-between;
  align-items: center;
}
h2 { margin: 0; font-size: 1.2rem; color: #2c3e50; }

/* NOUVEAU STYLE POUR LES BOUTONS */
.controls {
  display: flex;
  gap: 10px; /* Espace entre le select et le bouton */
}
.sort-select {
  padding: 5px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.order-btn {
  padding: 5px 10px;
  cursor: pointer;
  background: #eee;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.order-btn:hover { background: #ddd; }


.loading { padding: 2rem; text-align: center; color: #666; }
.scrollable-list { flex: 1; overflow-y: auto; padding: 1rem; }
.event-card { background: white; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s; }
.event-card:hover { transform: translateX(5px); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
h3 { margin: 0; font-size: 1rem; color: #333; width: 70%; }
.tag { background-color: #e74c3c; color: white; font-size: 0.7rem; padding: 3px 8px; border-radius: 10px; text-transform: uppercase; font-weight: bold; }
.card-body { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: #666; }
.link { color: #0b3d91; text-decoration: none; font-weight: bold; }
</style>
