<script setup lang="ts">

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import VideoPlayer from './components/VideoPlayer.vue';
import Settings from './components/Settings.vue';
import Stats from './components/Stats.vue';
import SeeMoreDialog from './components/SeeMoreDialog.vue';
import ReloadPrompt from './components/ReloadPrompt.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { pluralize } from './utils/Pluralize';
import { getFilterAnimes, sortAnimes } from './utils/SearchFilter';
import { setupSettings, useSettingsStore } from './stores/SettingsStore';
import { storeToRefs } from 'pinia';
import { useSearchStore } from './stores/SearchStore';
import { useDataStore } from './stores/DataStore';
import { type AnimeBase } from './Types';

/**
 * True if the data failed to load.
 */
const dataLoadingFailed = ref(false);

/**
 * The search store.
 */
const searchStore = useSearchStore();

const {
  checkTiralex,
  checkCycy,
  checkLeo,
  checkGyrehio,
  checktchm,
  checkqgWolf,
  listFilterType,
  sortType,
  reverseOrder,
} = storeToRefs(searchStore);

const dataStore = useDataStore();

const { data } = storeToRefs(dataStore);

const settingsStore = useSettingsStore();

const { headerColor, colorizeLinks } = storeToRefs(settingsStore);

const linksCss = computed(() => {
  return colorizeLinks.value ? '#0091FF' : 'white';
});

const headerColorWithAlpha = computed(() => `${headerColor.value}80`);

const endAnchorRef = ref<HTMLSpanElement | null>(null);

const animeDatabase = computed(() => {
  return data.value === null ? [] : data.value?.animes.filter(a => a.wasWatched === true);
});

/**
 * The animes to display.
 */
const animes = computed(() => {
  const filteredAnimes = animeDatabase.value.filter(getFilterAnimes(alternativeTitles.value)).sort(sortAnimes(sortType.value));

  if(reverseOrder.value) {
    return filteredAnimes.reverse();
  } else {
    return filteredAnimes;
  }
});

/**
 * A map of alternative titles for each anime.
 */
const alternativeTitles = computed(() => {
  const titles: Map<number, string[]> = new Map();

  if(data.value === null) {
    return titles;
  } else {
    animeDatabase.value.forEach((a) => {
      titles.set(a.id, getAlternativeTitles(a));
    })

    return titles;
  }
});

const songsCount = computed(() => {
  if(animeDatabase.value.length === 0) {
    return 0;
  } else {
    return data.value?.animes.reduce((acc, anime) => acc + anime.music.length, 0);
  }
});

/**
 * The number of additional animes shown each time the end of the page is reached.
 */
const virtualListStep = ref(35);

/**
 * The number of step taken within the virtual list.
 */
const virtualListStepCount = ref(3);

/**
 * The maximum number of lines that can be displayed on the screen at any given time.
 */
const maxLinesOnScreen = ref(3);

/**
 * Gets the alternative titles for an anime.
 * @param anime The anime.
 * @returns The alternative titles.
 */
function getAlternativeTitles(anime: AnimeBase) {
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

/**
 * Displays an alert when the database failed to download but the website is still accessible.
 */
function offlineAlert() {
  alert('Failed to download the database.\n\nCheck your Internet connectivity and refresh the page.\n\nYou currently are viewing an offline version of the website.');
}

/**
 * Called each time the end of the page is reached. Increment the number of animes to show at a given time.
 * @param entries
 * @param observer
 */
function showMore(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
  entries.forEach(e => {
    if(e.isIntersecting) {
      if(window.innerWidth / window.innerHeight < 1) {
        virtualListStepCount.value += 6;
      } else {
        virtualListStepCount.value += 2;
      }
    }
  });
}

/**
 * Called each tile the window is resized. Used to calculate the number of animes to render when reaching the end of the page.
 */
function onResize() {
  // Vertical screen
  if(window.innerWidth / window.innerHeight < 1) {
    virtualListStep.value = 1;
    maxLinesOnScreen.value = Math.floor(window.innerHeight / 300) + 1;
  } else {
    virtualListStep.value = Math.floor(window.innerWidth / 320) - 1;
    maxLinesOnScreen.value = Math.floor(window.innerHeight / 400) + 1;
  }
}

/**
 * Triggered when right clicking (PC) or by a long touch (mobile) on a list checkbox.
 * @param e The DOM mouse event.
 * @param selectedList The selected list.
 */
function showOnlyOneList(e: MouseEvent, selectedList: string) {
  e.preventDefault();

  let checked = 0;

  if(searchStore.checkTiralex) {
    checked++;
  }

  if(searchStore.checkCycy) {
    checked++;
  }

  if(searchStore.checkLeo) {
    checked++;
  }

  if(searchStore.checkGyrehio) {
    checked++;
  }

  if(searchStore.checktchm) {
    checked++;
  }

  if(searchStore.checkqgWolf) {
    checked++;
  }

  if(checked <= 1) {
    searchStore.$patch({
      checkTiralex: true,
      checkCycy: true,
      checkGyrehio: true,
      checkLeo: true,
      checktchm: true,
      checkqgWolf: true,
    });
  } else {
    searchStore.$patch({
      checkTiralex: selectedList === 'A',
      checkCycy: selectedList === 'C',
      checkLeo: selectedList === 'L',
      checkGyrehio: selectedList === 'V',
      checktchm: selectedList === 'T',
      checkqgWolf: selectedList === 'Q',
    });
  }

  if(navigator.vibrate) {
    navigator.vibrate(10);
  }
}

onMounted(() => {
  setupSettings();

  // Load the data.
  fetch('/api/v2/index.json')
    .then(response => response.json())
    .then((data) => {
      dataStore.setData(data);
    })
    .catch((error) => {
      console.error(error);

      dataLoadingFailed.value = true;
    });

  // Check for a shared link.
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('id')) {
    const id = parseInt(urlParams.get('id')!);

    if(!isNaN(id)) {
      searchStore.$patch({
        searchType: 'id',
        search: id.toString(),
      });
    }
  }

  // Set up the resize event listener
  window.addEventListener('resize', onResize);
  onResize(); // Set initial values.
});

// Setup the virtual list
const observer = new IntersectionObserver(showMore, { root: null, rootMargin: '100px' });
watch(endAnchorRef, () => {
  if(endAnchorRef.value !== null) {
    observer.observe(endAnchorRef.value);
  }
});

// Reset the virtual list step count when the dataset changes and go to the top of the page.
watch(animes, () => {
  virtualListStepCount.value = maxLinesOnScreen.value;

  setTimeout(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, 10); // Small delay to make sure that the page is properly rendered before scrolling.
});

</script>

<template>
  <header>
    <div id="headerCenter">
      <Search :searchResultCount="animes.length" />
      <div id="headerIconsNotExpandable">
        <Settings />
        <Stats :animes="animes" />
      </div>
    </div>

    <div id="listFilterComponent">
      <select class="mobile-hide" id="listFilterType" v-model="listFilterType">
        <option value="union">Union</option>
        <option value="intersect">Intersect</option>
        <option value="strict">Strict</option>
      </select>

      <div @contextmenu="(e) => showOnlyOneList(e, 'A')" class="cursorHelp listFilter" title="Alexis"><label for="checkTiralex">A</label> <input v-model="checkTiralex" type="checkbox" id="checkTiralex"></div>
      <div @contextmenu="(e) => showOnlyOneList(e, 'C')" class="cursorHelp listFilter" title="Cyprien"><label for="checkCycy">C</label> <input v-model="checkCycy" type="checkbox" id="checkCycy"></div>
      <div @contextmenu="(e) => showOnlyOneList(e, 'L')" class="cursorHelp listFilter" title="Léonard"><label for="checkLeo">L</label> <input v-model="checkLeo" type="checkbox" id="checkLeo"></div>
      <div @contextmenu="(e) => showOnlyOneList(e, 'V')" class="cursorHelp listFilter" title="Victor"><label for="checkGyrehio">V</label> <input v-model="checkGyrehio" type="checkbox" id="checkGyrehio"></div>
      <div @contextmenu="(e) => showOnlyOneList(e, 'T')" class="cursorHelp listFilter" title="Tom"><label for="checktchm">T</label> <input v-model="checktchm" type="checkbox" id="checktchm"></div>
      <div @contextmenu="(e) => showOnlyOneList(e, 'Q')" class="cursorHelp listFilter" title="Quentin"><label for="checkqgWolf">Q</label> <input v-model="checkqgWolf" type="checkbox" id="checkqgWolf"></div>
    </div>
  </header>

  <VideoPlayer />
  <SeeMoreDialog />
  <ReloadPrompt />

  <LoadingIcon v-if="data === null && dataLoadingFailed === false" :lightMode="false" />

  <div v-else-if="data === null && dataLoadingFailed === true" class="errorMsg">
    <img src="@/assets/offline.svg" class="svgFix" height="48" width="48">

    <h2>Failed to download the database.</h2>
    <p>Please check your Internet connectivity and refresh the page.</p>
    <p>If you think this is a bug, feel free to open an issue on the <a href="https://github.com/ttcchhmm/aclvt-vue/issues" target="_blank" class="colorizeLinks">bug tracker</a>.</p>
  </div>

  <main v-else id="loadedData">
    <div class="stats">
      <div v-memo="[animeDatabase]">Loaded {{ songsCount }} entries across {{ animeDatabase.length }} animes.</div>
      <div>Showing {{ `${animes.length} ${pluralize(animes.length, 'anime', 'animes')}` }}.</div>
      <img v-if="data !== null && dataLoadingFailed === true" @click="offlineAlert" src="@/assets/offline.svg" class="svgFix errorIcon" height="30" width="30">
    </div>

    <table id="animes">
      <tr v-for="index in virtualListStepCount">
          <td v-for="anime in animes.slice((index - 1) * virtualListStep, index * virtualListStep)">
            <Anime :key="anime.id" :anime="anime" />
          </td>
      </tr>
    </table>

    <div v-if="animes.length === 0" id="noResults">
      <img src="./assets/no-results.svg" class="svgFix">
      <p>No results found.</p>
    </div>

    <span ref="endAnchorRef" id="endAnchor"></span>
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
  -webkit-backdrop-filter: blur(5px);

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

#headerCenter {
  flex-direction: row-reverse;
  justify-content: space-between;
  width: calc(50% + 145px);
}

#headerCenter > #headerIconsNotExpandable {
  display: flex;
  align-items: center;
}

#headerCenter > #headerIconsNotExpandable #settingsButton {
  margin-right: 10px;
}

#headerCenter, #listFilterComponent {
  display: flex;
  align-items: center;
}

#listFilterComponent > div.listFilter {
  border: 1px solid white;
  border-left: unset;
  height: 32px;

  padding-left: 10px;
  padding-right: 10px;
}

#listFilterComponent > div.listFilter:last-child {
  border-radius: 0px 5px 5px 0px;
}

#listFilterComponent > div.listFilter > label {
  margin-right: 6px;
}

#listFilterComponent > div.listFilter > input {
  width: 15px;
  height: 15px;

  margin: 0px;
}

.listFilter {
  display: flex;
  align-items: center;
  justify-content: center;
}

#animes > tr > td {
  vertical-align: top;
  text-align: center;

  padding: 15px;
  width: 323px;

  border: unset;
}

#animes > tr > td > div {
  display: inline-block;
  text-align: start;
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

  text-align: center;
}

.errorMsg {
  padding-top: 20px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  text-align: center;
}

.errorIcon {
  margin-top: 10px;
}

#endAnchor {
  width: 100%;
  height: 10px;
}

@media screen and ((max-width: 1005px) or (orientation: portrait)) {
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

  #animes > tr > td {
    width: 100%;
    padding: 0px;
  }

  #listFilterComponent > div.listFilter {
    padding-left: 5px;
    padding-right: 5px;
  }

  #listFilterComponent > div.listFilter:first-of-type {
    border-left: 1px solid white;
    border-radius: 5px 0px 0px 5px;
  }

  #headerCenter {
    width: fit-content;

    flex-direction: row;
  }

  #headerCenter > img:first-of-type {
    margin-right: 10px;
  }
}

</style>

<style scoped>
#listFilterComponent select {
  appearance: none;

  height: 34px;

  color: white;
  font-weight: bold;

  background-color: transparent;
  border: 1px solid white;
  border-radius: 5px 0px 0px 5px;

  padding-right: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;

  cursor: pointer;

  text-align: center;

  font-family: 'Montserrat', 'Noto Sans', sans-serif;
}

#listFilterComponent select:focus {
  outline: none;
}
</style>
