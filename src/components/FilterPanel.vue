<script setup>
import { ref, watch, computed, nextTick } from 'vue';

const props = defineProps({
  availableCategories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-filters']);

const category = ref('');
const startDate = ref('');
const endDate = ref('');
const excludeLocation = ref(false);

const presetLimit = ref('50');
const customLimit = ref('');
const previousPreset = ref('50');
const customInputRef = ref(null);

const categoryDictionary = {
  'Volcanoes': 'Volcans',
  'Wildfires': 'Feux de forêt',
  'Severe Storms': 'Tempêtes',
  'Sea and Lake Ice': 'Glace',
  'Floods': 'Inondations',
  'Earthquakes': 'Séismes',
  'Drought': 'Sécheresses',
  'Landslides': 'Glissements & Avalanches',
  'Extreme Temperature': 'Températures Extrêmes',
  'Dust and Haze': 'Tempêtes de sable & Brume',
  'Snow': 'Neige Extrême',
  'Manmade': 'Origine humaine'
};

const locationText = ref('');
const showSuggestions = ref(false);
const selectedLocations = ref([]);
const locationError = ref(false);
const locationInputRef = ref(null);

const englishLocations = [
  'afghanistan', 'albania', 'algeria', 'andorra', 'angola', 'antigua and barbuda', 'argentina', 'armenia', 'australia', 'austria', 'azerbaijan',
  'bahamas', 'bahrain', 'bangladesh', 'barbados', 'belarus', 'belgium', 'belize', 'benin', 'bhutan', 'bolivia', 'bosnia and herzegovina', 'botswana', 'brazil', 'brunei', 'bulgaria', 'burkina faso', 'burundi',
  'cabo verde', 'cambodia', 'cameroon', 'canada', 'central african republic', 'chad', 'chile', 'china', 'colombia', 'comoros', 'congo', 'costa rica', 'cote d\'ivoire', 'croatia', 'cuba', 'cyprus', 'czechia', 'democratic republic of the congo', 'denmark', 'djibouti', 'dominica', 'dominican republic',
  'ecuador', 'egypt', 'el salvador', 'equatorial guinea', 'eritrea', 'estonia', 'eswatini', 'ethiopia',
  'fiji', 'finland', 'france', 'gabon', 'gambia', 'georgia', 'germany', 'ghana', 'greece', 'grenada', 'guatemala', 'guinea', 'guinea-bissau', 'guyana',
  'haiti', 'honduras', 'hungary', 'iceland', 'india', 'indonesia', 'iran', 'iraq', 'ireland', 'israel', 'italy', 'jamaica', 'japan', 'jordan',
  'kazakhstan', 'kenya', 'kiribati', 'kosovo', 'kuwait', 'kyrgyzstan', 'laos', 'latvia', 'lebanon', 'lesotho', 'liberia', 'libya', 'liechtenstein', 'lithuania', 'luxembourg',
  'madagascar', 'malawi', 'malaysia', 'maldives', 'mali', 'malta', 'marshall islands', 'mauritania', 'mauritius', 'mexico', 'micronesia', 'moldova', 'monaco', 'mongolia', 'montenegro', 'morocco', 'mozambique', 'myanmar',
  'namibia', 'nauru', 'nepal', 'netherlands', 'new zealand', 'nicaragua', 'niger', 'nigeria', 'north korea', 'north macedonia', 'norway',
  'oman', 'pakistan', 'palau', 'palestine', 'panama', 'papua new guinea', 'paraguay', 'peru', 'philippines', 'poland', 'portugal', 'qatar',
  'romania', 'russia', 'rwanda', 'saint kitts and nevis', 'saint lucia', 'saint vincent and the grenadines', 'samoa', 'san marino', 'sao tome and principe', 'saudi arabia', 'senegal', 'serbia', 'seychelles', 'sierra leone', 'singapore', 'slovakia', 'slovenia', 'solomon islands', 'somalia', 'south africa', 'south korea', 'south sudan', 'spain', 'sri lanka', 'sudan', 'suriname', 'sweden', 'switzerland', 'syria',
  'taiwan', 'tajikistan', 'tanzania', 'thailand', 'timor-leste', 'togo', 'tonga', 'trinidad and tobago', 'tunisia', 'turkey', 'turkmenistan', 'tuvalu',
  'uganda', 'ukraine', 'united arab emirates', 'united kingdom', 'united states', 'uruguay', 'uzbekistan', 'vanuatu', 'vatican city', 'venezuela', 'vietnam', 'yemen', 'zambia', 'zimbabwe',
  'alaska', 'california', 'texas', 'florida', 'hawaii', 'siberia', 'kamchatka', 'reunion', 'canary islands', 'greenland', 'antarctica'
];

const suggestedCountries = computed(() => {
  if (!locationText.value) return [];
  const search = locationText.value.toLowerCase();
  return englishLocations
    .filter(loc => loc.includes(search))
    .slice(0, 5);
});

const selectCountry = (loc) => {
  locationText.value = loc;
  showSuggestions.value = false;
  addLocation();
};

const addLocation = () => {
  const val = locationText.value.trim().toLowerCase();
  if (!val) {
    if (locationInputRef.value) locationInputRef.value.focus();
    return;
  }
  const isValid = englishLocations.includes(val);
  if (!isValid) {
    locationError.value = true;
    return;
  }
  locationError.value = false;
  if (!selectedLocations.value.includes(val)) {
    selectedLocations.value.push(val);
  }
  locationText.value = '';
  showSuggestions.value = false;
  nextTick(() => {
    if (locationInputRef.value) locationInputRef.value.focus();
  });
};

const clearError = () => {
  locationError.value = false;
};

const removeLocation = (index) => {
  selectedLocations.value.splice(index, 1);
};

const today = new Date();
const maxDateStr = today.toISOString().split('T')[0];
const lastYear = new Date();
lastYear.setFullYear(today.getFullYear() - 1);
const minDateStr = lastYear.toISOString().split('T')[0];

const onPresetChange = async () => {
  if (presetLimit.value === 'custom') {
    await nextTick();
    if (customInputRef.value) customInputRef.value.focus();
  } else {
    previousPreset.value = presetLimit.value;
    customLimit.value = '';
  }
};

const onCustomInput = () => { if (customLimit.value) presetLimit.value = 'custom'; };
const onCustomBlur = () => {
  if (presetLimit.value === 'custom' && (!customLimit.value || customLimit.value <= 0)) {
    presetLimit.value = previousPreset.value;
  }
};

watch([category, startDate, endDate, selectedLocations, excludeLocation, presetLimit, customLimit], () => {
  let finalLimit;
  if (presetLimit.value === 'custom' && customLimit.value && customLimit.value > 0) {
    finalLimit = Number(customLimit.value);
  } else if (presetLimit.value !== 'custom') {
    finalLimit = Number(presetLimit.value);
  } else {
    finalLimit = Number(previousPreset.value);
  }
  emit('update-filters', {
    category: category.value,
    startDate: startDate.value,
    endDate: endDate.value,
    locations: [...selectedLocations.value],
    excludeLocation: excludeLocation.value,
    displayLimit: finalLimit
  });
}, { deep: true, immediate: true });
</script>

<template>
  <div class="filter-bar">
    <div class="filter-item">
      <label>Catégorie :</label>
      <select v-model="category">
        <option value="">Toutes</option>
        <option
          v-for="cat in props.availableCategories"
          :key="cat"
          :value="cat"
        >
          {{ categoryDictionary[cat] || cat }}
        </option>
      </select>
    </div>

    <div class="filter-item">
      <label>Du:</label><input type="date" v-model="startDate" :min="minDateStr" :max="maxDateStr">
      <label>Au:</label><input type="date" v-model="endDate" :min="minDateStr" :max="maxDateStr">
    </div>

    <div class="filter-item location-group">
      <label>Lieu (EN):</label>
      <div class="location-input-row">
        <div class="autocomplete-wrapper">
          <input
            type="text"
            v-model="locationText"
            ref="locationInputRef"
            @focus="showSuggestions = true"
            @blur="setTimeout(() => showSuggestions = false, 200)"
            @keydown.enter.prevent="addLocation"
            @input="clearError(); showSuggestions = true"
            placeholder="Ex: japan, france..."
            class="location-input"
            :class="{ 'input-error': locationError }"
          >
          <ul v-if="showSuggestions && suggestedCountries.length" class="suggestions-list">
            <li
              v-for="loc in suggestedCountries"
              :key="loc"
              @mousedown.prevent="selectCountry(loc)"
              class="capitalize-text"
            >
              {{ loc }}
            </li>
          </ul>
        </div>
        <button type="button" @click="addLocation" class="add-btn">+</button>
      </div>
      <span v-if="locationError" class="error-text">Lieu inconnu. Utilisez l'aide à la saisie.</span>
      <label class="exclude-label">
        <input type="checkbox" v-model="excludeLocation"> Sauf
      </label>
      <div class="tags-container" v-if="selectedLocations.length > 0">
        <span class="tag" v-for="(loc, index) in selectedLocations" :key="index">
          {{ loc }} <span class="tag-close" @click="removeLocation(index)">x</span>
        </span>
      </div>
    </div>

    <div class="filter-item limit-controls">
      <label>Afficher:</label>
      <select v-model="presetLimit" @change="onPresetChange">
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
        <option value="custom">Personnalisé</option>
        <option value="10000">Tous</option>
      </select>
      <input
        type="number"
        v-model="customLimit"
        ref="customInputRef"
        @input="onCustomInput"
        @blur="onCustomBlur"
        min="1"
        placeholder="Ex: 63"
        class="custom-limit-input"
      >
    </div>
  </div>
</template>

<style scoped>
.filter-bar { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: 0.8rem; background-color: #f1f3f5; border-bottom: 2px solid #ddd; padding: 0.5rem 1rem; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); flex-shrink: 0; position: relative; z-index: 2000; }
.filter-item { display: flex; align-items: center; gap: 0.5rem; height: 28px; }
.location-group { flex-direction: column; align-items: flex-start; height: auto; gap: 0.3rem; position: relative; }
.location-input-row { display: flex; align-items: center; gap: 0.3rem; }
input[type="text"], input[type="date"], input[type="number"], select { padding: 0.2rem 0.4rem; border: 1px solid #ccc; border-radius: 4px; background-color: white; height: 28px; box-sizing: border-box; }
.autocomplete-wrapper { position: relative; }
.location-input { width: 140px; }
.suggestions-list { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1px solid #ccc; border-top: none; border-radius: 0 0 4px 4px; margin: 0; padding: 0; list-style: none; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 100; max-height: 200px; overflow-y: auto; }
.suggestions-list li { padding: 0.5rem; cursor: pointer; transition: background-color 0.2s; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.suggestions-list li:hover { background-color: #e3f2fd; color: #0b3d91; }
.capitalize-text { text-transform: capitalize; }
.input-error { border: 1px solid #d9534f !important; background-color: #fdf0f0 !important; }
.error-text { color: #d9534f; font-size: 0.75rem; font-weight: bold; margin-top: -0.2rem; }
.add-btn { background-color: #0b3d91; color: white; border: none; border-radius: 4px; width: 32px; height: 32px; cursor: pointer; font-weight: bold; }
.add-btn:hover { background-color: #1a56c0; }
.tags-container { display: flex; flex-wrap: wrap; gap: 0.3rem; max-width: 250px; }
.tag { background-color: #e3f2fd; color: #0b3d91; border: 1px solid #b6d4fe; padding: 0.1rem 0.4rem; border-radius: 12px; font-size: 0.75rem; display: flex; align-items: center; gap: 0.3rem; }
.tag-close { cursor: pointer; color: #d9534f; }
.tag-close:hover { color: #c9302c; }
.exclude-label { display: flex; align-items: center; gap: 0.2rem; cursor: pointer; }
.limit-controls { display: flex; gap: 0.3rem; }
.custom-limit-input { width: 70px; }
@media (max-width: 1200px) { .filter-bar { justify-content: flex-start; } }
</style>
