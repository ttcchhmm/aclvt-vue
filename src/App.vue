<script setup>

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import { computed, ref } from 'vue';

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
 * The search query.
 */
const search = ref('');

/**
 * The search type.
 */
const searchType = ref('anime');

/**
 * The data loaded from the JSON file.
 */
const data = ref({anime: null});

/**
 * The animes to display.
 */
const animes = computed(() => data.value?.anime.filter(filterAnimes));

/**
 * Updates the search query and type.
 * @param {string} newSearch The new search query.
 * @param {string} newSearchType The new search type.
 */
function updateSearch(newSearch, newSearchType) {
  search.value = newSearch;
  searchType.value = newSearchType;
}

/**
 * Filter animes based on the search query and checkboxes.
 * @param {object} a The anime to filter.
 */
function filterAnimes(a) {
  // If a search query is present, filter based on it.
  if(search.value.trim().length > 0) {
      switch(searchType.value) {
          case 'anime':
              if(!a.nom.toLowerCase().includes(search.value.toLowerCase())) {
                  return false;
              }

              break;
          
          case 'song':
              if(!a.musique.some(m => m.nom.toLowerCase().includes(search.value.toLowerCase()))) {
                  return false;
              }

              break;
          
          case 'artist':
              if(!a.musique.some(m => m.artiste.toLowerCase().includes(search.value.toLowerCase()))) {
                  return false;
              }

              break;
      }
  }

  // Checkboxes filter.
  let display = false;

  if (checkTiralex && a.users[0].A === 1) {
      display = true;
  }

  if (checkCycy && a.users[0].C === 1) {
      display = true;
  }

  if (checkLeo && a.users[0].L === 1) {
      display = true;
  }

  if (checkGyrehio && a.users[0].V === 1) {
      display = true;
  }

  if (checktchm && a.users[0].T === 1) {
      display = true;
  }

  return display;
}

// Load the data from the JSON file.
fetch('https://raw.githubusercontent.com/Tiralex1/ACLV/main/data.json')
  .then(response => response.json())
  .then(json => data.value = json);

</script>

<template>
  <header>
    <h1 class="mobile-hide">AMQ ACLVT</h1>

    <Search @updated="updateSearch" />

    <div>
      <span class="listFilter"><label for="checkTiralex">A</label> <input v-model="checkTiralex" type="checkbox" id="checkTiralex"></span>
      <span class="listFilter"><label for="checkCycy">C</label> <input v-model="checkCycy" type="checkbox" id="checkCycy"></span>
      <span class="listFilter"><label for="checkLeo">L</label> <input v-model="checkLeo" type="checkbox" id="checkLeo"></span>
      <span class="listFilter"><label for="checkGyrehio">V</label> <input v-model="checkGyrehio" type="checkbox" id="checkGyrehio"></span>
      <span class="listFilter"><label for="checktchm">T</label> <input v-model="checktchm" type="checkbox" id="checktchm"></span>
    </div>
  </header>

  <LoadingIcon v-if="data.anime === null" />
  <div v-else id="loadedData">
    <span id="stats" class="mobile-hide">Loaded {{ data.nb_musique }} entries across {{ data.nb_anime }} animes.</span>
    <small id="stats" class="mobile-show">Loaded {{ data.nb_musique }} entries across {{ data.nb_anime }} animes.</small>

    <div id="animes">
      <Anime v-for="anime in animes" :key="anime.lien" :anime="anime"/>
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

.listFilter:first-child {
  border-left: unset;
}

#animes {
  display: flex;
  justify-content: space-around;
  flex-flow: row wrap;
}

#loadedData {
  display: flex;
  flex-direction: column;
  align-items: center;
}

#stats {
  margin-top: 10px;
  margin-bottom: 10px;
}

@media screen and (max-width: 450px) {
  header {
    padding-left: 5px;
    padding-right: 5px;

    width: calc(100% - 10px);
  }

  #animes {
    flex-flow: unset;
    flex-direction: column;
    align-items: center;
  }
}

</style>
