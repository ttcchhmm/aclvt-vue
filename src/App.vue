<script setup>

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import Settings from './components/Settings.vue';
import { computed, onMounted, ref } from 'vue';
import { pluralize } from './utils/Pluralize';
import { getFilterAnimes } from './utils/SearchFilter';
import { setupSettings, useSettingsStore } from './stores/SettingsStore';
import { storeToRefs } from 'pinia';
import { useSearchStore } from './stores/SearchStore';
import { useDataStore } from './stores/DataStore';

const {
  checkTiralex,
  checkCycy,
  checkLeo,
  checkGyrehio,
  checktchm,
  listFilterType,
  search,
  searchType,
  searchAiringFilter,
  searchTypeFilter,
} = storeToRefs(useSearchStore());

/**
 * The data loaded from the JSON file.
 */
// const data = ref({primary: null, secondary: null});

const dataStore = useDataStore();

const { primary, secondary } = storeToRefs(dataStore);

const settingsStore = useSettingsStore();

const { headerColor, colorizeLinks, animeLanguage, orderByOriginalName } = storeToRefs(settingsStore);

const linksCss = computed(() => {
  return colorizeLinks.value ? '#0091FF' : 'white';
});

const headerColorWithAlpha = computed(() => `${headerColor.value}80`);

/**
 * The animes to display.
 */
const animes = computed(() => {
  if(primary.value === null) {
    return [];
  } else {
    const filteredAnimes = primary.value.anime.filter(getFilterAnimes(search.value, searchType.value, searchAiringFilter.value, searchTypeFilter.value, listFilterType.value, checkTiralex.value, checkCycy.value, checkLeo.value, checkGyrehio.value, checktchm.value, alternativeTitles.value, secondary));

    return orderByOriginalName.value ? filteredAnimes : filteredAnimes.sort((a, b) => {
      switch(animeLanguage.value) {
        case 'en': {
          const aTitle = secondary.value[a.mal_id].titles.en || a.nom;
          const bTitle = secondary.value[b.mal_id].titles.en || b.nom;

          return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });
        }

        case 'ja': {
          const aTitle = secondary.value[a.mal_id].titles.ja || a.nom;
          const bTitle = secondary.value[b.mal_id].titles.ja || b.nom;

          return aTitle.localeCompare(bTitle, 'ja', { ignorePunctuation: true, numeric: true });
        }

        default:
          return 0; // Should never happen, but keep the default case to avoid warnings.
      }
    });
  }
});

/**
 * A map of alternative titles for each anime.
 */
const alternativeTitles = computed(() => {
  if(primary === null) {
    return {};
  } else {
    const titles = {};

    for(const anime of primary.value.anime) {
      titles[anime.mal_id] = getAlternativeTitles(anime.mal_id);
    }

    return titles;
  }
});

/**
 * Gets the alternative titles for an anime.
 * @param {number} malId The MyAnimeList ID of the anime.
 */
function getAlternativeTitles(malId) {
  return [
    secondary.value[malId].titles.original,
    secondary.value[malId].titles.en,
    secondary.value[malId].titles.ja,
    ...secondary.value[malId].titles.synonyms,
  ];
}

onMounted(async () => {
  setupSettings();

  const [primaryResponse, secondaryResponse] = await Promise.all([
    fetch('https://raw.githubusercontent.com/Tiralex1/ACLV/main/data.json').then(response => response.json()),
    fetch('/additional-data.json').then(response => response.json()),
  ]);

  // data.value = {
  //   primary: primary,
  //   secondary: secondary,
  // };

  dataStore.setPrimary(primaryResponse);
  dataStore.setSecondary(secondaryResponse);
});

</script>

<template>
  <header>
    <h1 class="mobile-hide">AMQ ACLVT</h1>

    <div id="headerCenter">
      <Search :searchResultCount="animes.length" />
      <Settings />
    </div>

    <div>
      <select class="mobile-hide" id="listFilterType" v-model="listFilterType">
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

  <LoadingIcon v-if="primary === null" />
  <main v-else id="loadedData">
    <div class="stats" role="status" aria-label="Current statistics">
      <div>Loaded {{ primary?.nb_musique }} entries across {{ primary?.nb_anime }} animes.</div>
      <div>Showing {{ `${animes.length} ${pluralize(animes.length, 'anime', 'animes')}` }}.</div>
    </div>

    <div id="animes">
      <Anime v-for="anime in animes" :key="anime.mal_id" :anime="anime" :metadata="secondary[anime.mal_id]"/>
    </div>

    <div v-if="animes.length === 0" id="noResults">
      <img src="./assets/no-results.svg" class="svgFix">
      <p>No results found.</p>
    </div>
  </main>
</template>

<style>
a {
  color: v-bind(linksCss);
}

header {
  position: fixed;
  top: 0px;
  left: 0px;
  width: calc(100% - 50px);
  height: 50px;
  
  /* background-color: rgba(0, 191, 255, 0.5); */
  background-color: v-bind(headerColorWithAlpha);
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
  margin-top: 20px;
  margin-bottom: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
}

#headerCenter {
  display: flex;
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
