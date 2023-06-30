<script setup>

import LoadingIcon from './components/LoadingIcon.vue';
import Anime from './components/Anime.vue';
import Search from './components/Search.vue';
import { ref } from 'vue';

const checkTiralex = ref(true);
const checkCycy = ref(true);
const checkLeo = ref(true);
const checkGyrehio = ref(true);
const checktchm = ref(true);

const search = ref('');

const data = ref(undefined);

function updateSearch(value) {
  search.value = value;
}

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

  <LoadingIcon v-if="!data" />
  <div v-else id="loadedData">
    <span id="stats" class="mobile-hide">Loaded {{ data.nb_musique }} entries across {{ data.nb_anime }} animes.</span>
    <small id="stats" class="mobile-show">Loaded {{ data.nb_musique }} entries across {{ data.nb_anime }} animes.</small>

    <div id="animes">
      <Anime v-for="anime in data.anime" :key="anime.lien" :anime="anime" :checkTiralex="checkTiralex" :checkCycy="checkCycy" :checkLeo="checkLeo" :checkGyrehio="checkGyrehio" :checktchm="checktchm" :search="search"/>
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
