<script setup>
import { ref, onMounted, computed } from 'vue';
import { fetchEvents } from '../services/nasaAPI';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'vue-chartjs';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const allEvents = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    allEvents.value = await fetchEvents();
  } finally {
    isLoading.value = false;
  }
});

const chartData = computed(() => {
  const categoryCounts = {};

  allEvents.value.forEach(event => {
    if (event.categories && event.categories.length > 0) {
      const catName = event.categories[0].title;
      if (categoryCounts[catName]) {
        categoryCounts[catName]++;
      } else {
        categoryCounts[catName] = 1;
      }
    }
  });

  const labels = Object.keys(categoryCounts);
  const dataValues = Object.values(categoryCounts);

  return {
    labels: labels,
    datasets: [
      {
        label: "Nombre d'événements",
        backgroundColor: [
          '#d9534f',
          '#f0ad4e',
          '#5bc0de',
          '#5cb85c',
          '#0b3d91',
          '#6c757d'
        ],
        data: dataValues,
        borderWidth: 2,
        hoverOffset: 10
      }
    ]
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { font: { size: 14 } }
    },
    title: {
      display: true,
      text: 'Répartition mondiale par type de catastrophe',
      font: { size: 18 }
    }
  }
};
</script>

<template>
  <div class="stats-page">
    <div class="header-section">
      <h2>Statistiques Globales en Direct</h2>
      <p>Analyse des données issues des satellites de la NASA (EONET).</p>
    </div>

    <div v-if="isLoading" class="loader">
      Chargement des données en cours...
    </div>

    <div v-else class="dashboard">
      <div class="kpi-cards">
        <div class="kpi">
          <span class="kpi-number">{{ allEvents.length }}</span>
          <span class="kpi-label">Événements Actifs</span>
        </div>
        <div class="kpi">
          <span class="kpi-number">{{ Object.keys(chartData.labels).length }}</span>
          <span class="kpi-label">Types de Catastrophes</span>
        </div>
      </div>

      <div class="chart-container">
        <Doughnut :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats-page {
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  height: 100%;
  overflow-y: auto;
}

.header-section {
  margin-bottom: 2rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
  text-align: center;
}

.loader {
  text-align: center;
  font-size: 1.2rem;
  color: #0b3d91;
  margin-top: 3rem;
}

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
}

.kpi-cards {
  display: flex;
  gap: 2rem;
  width: 100%;
  justify-content: center;
}

.kpi {
  background: white;
  border-radius: 10px;
  padding: 1.5rem 3rem;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  border-top: 4px solid #0b3d91;
}

.kpi-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #d9534f;
}

.kpi-label {
  font-size: 0.9rem;
  color: #666;
  text-transform: uppercase;
  font-weight: bold;
  margin-top: 0.5rem;
}

.chart-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  width: 100%;
  max-width: 600px;
  height: 400px;
}
</style>
