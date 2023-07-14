<script setup>

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import { computed, onMounted, ref } from 'vue';
import { pluralize } from './utils/Pluralize';

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
    return data.value.primary.anime.filter(filterAnimes)
  }
});

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
  let display = listFilterType.value === 'intersect';

  if(checkTiralex.value) {
    if(listFilterType.value === 'union') {
      if(a.users.A === 1) {
        display = true;
      }
    } else { // Intersect mode
      if(a.users.A === 0) {
        return false;
      }
    }
  }

  if(checkCycy.value) {
    if(listFilterType.value === 'union') {
      if(a.users.C === 1) {
        display = true;
      }
    } else { // Intersect mode
      if(a.users.C === 0) {
        return false;
      }
    }
  }

  if(checkLeo.value) {
    if(listFilterType.value === 'union') {
      if(a.users.L === 1) {
        display = true;
      }
    } else { // Intersect mode
      if(a.users.L === 0) {
        return false;
      }
    }
  }

  if(checkGyrehio.value) {
    if(listFilterType.value === 'union') {
      if(a.users.V === 1) {
        display = true;
      }
    } else { // Intersect mode
      if(a.users.V === 0) {
        return false;
      }
    }
  }

  if(checktchm.value) {
    if(listFilterType.value === 'union') {
      if(a.users.T === 1) {
        display = true;
      }
    } else { // Intersect mode
      if(a.users.T === 0) {
        return false;
      }
    }
  }

  return display;
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
      </select>

      <span class="cursorHelp listFilter" title="Alexis"><label for="checkTiralex">A</label> <input v-model="checkTiralex" type="checkbox" id="checkTiralex"></span>
      <span class="cursorHelp listFilter" title="Cyprien"><label for="checkCycy">C</label> <input v-model="checkCycy" type="checkbox" id="checkCycy"></span>
      <span class="cursorHelp listFilter" title="Léonard"><label for="checkLeo">L</label> <input v-model="checkLeo" type="checkbox" id="checkLeo"></span>
      <span class="cursorHelp listFilter" title="Victor"><label for="checkGyrehio">V</label> <input v-model="checkGyrehio" type="checkbox" id="checkGyrehio"></span>
      <span class="cursorHelp listFilter" title="Tom"><label for="checktchm">T</label> <input v-model="checktchm" type="checkbox" id="checktchm"></span>
    </div>
  </header>

  <LoadingIcon v-if="data.primary === null" />
  <div v-else id="loadedData">
    <div class="stats">
      <div>Loaded {{ data.primary?.nb_musique }} entries across {{ data.primary?.nb_anime }} animes.</div>
      <div>Showing {{ `${animes.length} ${pluralize(animes.length, 'anime', 'animes')}` }}.</div>
    </div>

    <div id="animes">
      <Anime v-for="anime in animes" :key="anime.lien" :anime="anime" :metadata="data.secondary[anime.lien.substring(30).split('/')[0]]"/>
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

#loadedData {
  display: flex;
  flex-direction: column;
  align-items: center;
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
