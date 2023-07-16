<script setup>

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import { computed, onMounted, ref } from 'vue';
import { pluralize } from './utils/Pluralize';
import { getFilterAnimes } from './utils/SearchFilter';

/**
 * Whether or not the Tiralex checkbox is checked.
 */
const checkTiralex = ref(true);

/**
 * Whether or not the Cycy checkbox is checked.
 */
const checkCycy = ref(true);

/**
 * Whether or not the Leo checkbox is checked.
 */
const checkLeo = ref(true);

/**
 * Whether or not the Gyrehio checkbox is checked.
 */
const checkGyrehio = ref(true);

/**
 * Whether or not the tchm checkbox is checked.
 */
const checktchm = ref(true);

/**
 * The list filter type.
 */
const listFilterType = ref('union');

/**
 * The search query.
 */
const search = ref('');

/**
 * The search type.
 */
const searchType = ref('anime');

/**
 * The search airing filter.
 */
const searchAiringFilter = ref('any');

/**
 * The search type filter.
 */
const searchTypeFilter = ref('any');

/**
 * The data loaded from the JSON file.
 */
const data = ref({primary: null, secondary: null});

/**
 * The animes to display.
 */
const animes = computed(() => {
  if(data.value.primary === null) {
    return [];
  } else {
    return data.value.primary.anime.filter(getFilterAnimes(search.value, searchType.value, searchAiringFilter.value, searchTypeFilter.value, listFilterType.value, checkTiralex.value, checkCycy.value, checkLeo.value, checkGyrehio.value, checktchm.value, alternativeTitles.value, data.value.secondary));
  }
});

/**
 * A map of alternative titles for each anime.
 */
const alternativeTitles = computed(() => {
  if(data.value.primary === null) {
    return {};
  } else {
    const titles = {};

    for(const anime of data.value.primary.anime) {
      titles[anime.mal_id] = getAlternativeTitles(anime.mal_id);
    }

    return titles;
  }
});

/**
 * Updates the search query and type.
 * @param {string} newSearch The new search query.
 * @param {string} newSearchType The new search type.
 */
function updateSearch(newSearch, newSearchType, newSearchAiringFilter, newSearchTypeFilter) {
  search.value = newSearch;
  searchType.value = newSearchType;
  searchAiringFilter.value = newSearchAiringFilter;
  searchTypeFilter.value = newSearchTypeFilter;
}

/**
 * Gets the alternative titles for an anime.
 * @param {number} malId The MyAnimeList ID of the anime.
 */
function getAlternativeTitles(malId) {
  return [
    data.value.secondary[malId].titles.original,
    data.value.secondary[malId].titles.en,
    data.value.secondary[malId].titles.ja,
    ...data.value.secondary[malId].titles.synonyms,
  ];
}

onMounted(async () => {
  const [primary, secondary] = await Promise.all([
    fetch('https://raw.githubusercontent.com/Tiralex1/ACLV/main/data.json').then(response => response.json()),
    fetch('/additional-data.json').then(response => response.json()),
  ]);

  data.value = {
    primary: primary,
    secondary: secondary,
  };
});

</script>

<template>
  <header>
    <h1 class="mobile-hide">AMQ ACLVT</h1>

    <Search @updated="updateSearch" />

    <div>
      <select id="listFilterType" v-model="listFilterType">
        <option value="union">Union</option>
        <option value="intersect">Intersect</option>
        <option value="strict">Strict</option>
      </select>

      <span class="cursorHelp listFilter" title="Alexis"><label for="checkTiralex">A</label> <input v-model="checkTiralex" type="checkbox" id="checkTiralex"></span>
      <span class="cursorHelp listFilter" title="Cyprien"><label for="checkCycy">C</label> <input v-model="checkCycy" type="checkbox" id="checkCycy"></span>
      <span class="cursorHelp listFilter" title="Léonard"><label for="checkLeo">L</label> <input v-model="checkLeo" type="checkbox" id="checkLeo"></span>
      <span class="cursorHelp listFilter" title="Victor"><label for="checkGyrehio">V</label> <input v-model="checkGyrehio" type="checkbox" id="checkGyrehio"></span>
      <span class="cursorHelp listFilter" title="Tom"><label for="checktchm">T</label> <input v-model="checktchm" type="checkbox" id="checktchm"></span>
    </div>
  </header>

  <VideoPlayer />

  <LoadingIcon v-if="data.primary === null" />
  <div v-else id="loadedData">
    <div class="stats">
      <div>Loaded {{ data.primary?.nb_musique }} entries across {{ data.primary?.nb_anime }} animes.</div>
      <div>Showing {{ `${animes.length} ${pluralize(animes.length, 'anime', 'animes')}` }}.</div>
    </div>

    <div id="animes">
      <Anime v-for="anime in animes" :key="anime.mal_id" :anime="anime" :metadata="data.secondary[anime.mal_id]"/>
    </div>

    <div v-if="animes.length === 0" id="noResults">
      <img src="./assets/no-results.svg" class="svgFix">
      <p>No results found.</p>
    </div>
  </div>
</template>

<style>
header {
  position: fixed;
  top: 0px;
  left: 0px;
  width: calc(100% - 50px);
  height: 50px;
  
  background-color: rgba(0, 191, 255, 0.5);
  backdrop-filter: blur(5px);

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding-left: 25px;
  padding-right: 25px;

  box-shadow: 0px 4px 5px 0px rgba(0,0,0,0.25);
}

header h1 {
  margin: 0;
  font-size: 1.75em;
}

.listFilter {
  border-left: 1px solid black;
  padding-left: 0.25em;
  padding-right: 0.25em;
}

#listFilterType {
  margin-right: 10px;
}

#animes {
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
}

#loadedData, #noResults {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#noResults {
  margin-top: 40px;
}

.stats {
  margin-top: 10px;
  margin-bottom: 10px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

@media screen and ((max-width: 450px) or (orientation: portrait)) {
  header {
    padding-left: 5px;
    padding-right: 5px;

    width: calc(100% - 10px);
  }

  .stats div {
    font-size: 14px;
  }

  #animes {
    flex-flow: unset;
    flex-direction: column;
    align-items: center;

    width: 100%;
  }
}

</style>
