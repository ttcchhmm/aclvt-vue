<script setup>

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import Settings from './components/Settings.vue';
import SeeMoreDialog from './components/SeeMoreDialog.vue';
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
  checkqgWolf,
  listFilterType,
  search,
  searchType,
  searchAiringFilter,
  searchTypeFilter,
} = storeToRefs(useSearchStore());

const dataStore = useDataStore();

const { data } = storeToRefs(dataStore);

const settingsStore = useSettingsStore();

const { headerColor, colorizeLinks, animeLanguage, orderByMAL } = storeToRefs(settingsStore);

const linksCss = computed(() => {
  return colorizeLinks.value ? '#0091FF' : 'white';
});

const headerColorWithAlpha = computed(() => `${headerColor.value}80`);

const animeDatabase = computed(() => {
  return data.value === null ? [] : data.value.filter(a => a.wasWatched === true);
});

/**
 * The animes to display.
 */
const animes = computed(() => {
  const filteredAnimes = animeDatabase.value.filter(getFilterAnimes(search.value, searchType.value, searchAiringFilter.value, searchTypeFilter.value, listFilterType.value, checkTiralex.value, checkCycy.value, checkLeo.value, checkGyrehio.value, checktchm.value, checkqgWolf.value, alternativeTitles.value));

  return orderByMAL.value ? filteredAnimes : filteredAnimes.sort((a, b) => {
    switch(animeLanguage.value) {
      case 'en': {
        const aTitle = a.titles.en || a.titles.original;
        const bTitle = b.titles.en || b.titles.original;

        return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });
      }

      case 'ja': {
        const aTitle = a.titles.ja || a.titles.original;
        const bTitle = b.titles.ja || b.titles.original;

        return aTitle.localeCompare(bTitle, 'ja', { ignorePunctuation: true, numeric: true });
      }

      case 'original':
        const aTitle = a.titles.original;
        const bTitle = b.titles.original;

        return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });

      default:
        return 0; // Should never happen, but keep the default case to avoid warnings.
    }
  });
});

/**
 * A map of alternative titles for each anime.
 */
const alternativeTitles = computed(() => {
  if(data.value === null) {
    return {};
  } else {
    const titles = {};

    data.value.forEach((a) => {
      titles[a.id] = getAlternativeTitles(a);
    })

    return titles;
  }
});

const songsCount = computed(() => {
  if(data.value === null) {
    return 0;
  } else {
    return data.value.reduce((acc, anime) => acc + anime.music?.length, 0);
  }
});

/**
 * Gets the alternative titles for an anime.
 * @param {Object} anime The anime.
 */
function getAlternativeTitles(anime) {
  const titles = [];

  if(anime.titles.original !== undefined) {
    titles.push(anime.titles.original);
  }

  if(anime.titles.en !== undefined) {
    titles.push(anime.titles.en);
  }

  if(anime.titles.ja !== undefined) {
    titles.push(anime.titles.ja);
  }

  if(anime.titles.synonyms !== undefined) {
    titles.push(...anime.titles.synonyms);
  }

  return titles;
}

onMounted(async () => {
  setupSettings();

  // Load the data.
  const data = await fetch('/api/v2/index.json').then(response => response.json());
  dataStore.setData(data)
});

</script>

<template>
  <header>
    <h1 class="mobile-hide">AMQ ACLVTQ</h1>

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
      <span class="cursorHelp listFilter" title="Quentin"><label for="checkqgWolf">Q</label> <input v-model="checkqgWolf" type="checkbox" id="checkqgWolf"></span>
    </div>
  </header>

  <VideoPlayer />
  <SeeMoreDialog />

  <LoadingIcon v-if="data === null" />
  <main v-else id="loadedData">
    <div class="stats" role="status" aria-label="Current statistics">
      <div>Loaded {{ songsCount }} entries across {{ animeDatabase.length }} animes.</div>
      <div>Showing {{ `${animes.length} ${pluralize(animes.length, 'anime', 'animes')}` }}.</div>
    </div>

    <div id="animes">
      <Anime v-for="anime in animes" :key="anime.id" :anime="anime"/>
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
