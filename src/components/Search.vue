<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { pluralize } from '../utils/Pluralize';
import { useSearchStore } from '../stores/SearchStore';
import { getRating } from '../utils/AnimeLabels';
import { useDataStore } from '../stores/DataStore';

import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';
import Dialog from './Dialog.vue';

import ResetIcon from '@/assets/reset.svg';

/**
 * The props for this component.
 */
const props = defineProps<{
    /**
     * The number of search results.
     */
    searchResultCount: number;
}>();


const searchStore = useSearchStore();

const dataStore = useDataStore();
const { data } = storeToRefs(dataStore);

const {
    search,
    searchType,
    searchAiringFilter,
    listFilterType,
    maxAgeRating,
    selectedGenres,
    selectedStudios,
    sortType,
    minSongsCount,
    maxSongsCount,
    reverseOrder,
} = storeToRefs(searchStore);

/**
 * The search type filter.
 */
const searchTypeFilter = ref({
    tv: true,
    movie: true,
    ova: true,
    ona: true,
    special: true,
    music: true,
});

/**
 * Whether or not the search dialog is open.
 */
const dialogOpen = ref(false);

/**
 * Maximum number of songs in an anime.
 */
const upperSongsLimit = computed(() => data.value?.animes.reduce((acc, cur) => {
    if(cur.music !== undefined && cur.music.length > acc) {
        return cur.music.length;
    }

    return acc;
}, 0));

onMounted(() => {
    if(upperSongsLimit.value !== undefined) { // Should always be true, but this is just to make TypeScript happy.
        maxSongsCount.value = upperSongsLimit.value;
    }
});

const searchTypeFilterArray = computed(() => {
    const searchTypeFilterArray = [];

    if(searchTypeFilter.value.tv) {
        searchTypeFilterArray.push('tv');
    }

    if(searchTypeFilter.value.movie) {
        searchTypeFilterArray.push('movie');
    }

    if(searchTypeFilter.value.ova) {
        searchTypeFilterArray.push('ova');
    }

    if(searchTypeFilter.value.ona) {
        searchTypeFilterArray.push('ona');
    }

    if(searchTypeFilter.value.special) {
        searchTypeFilterArray.push('special');
    }

    if(searchTypeFilter.value.music) {
        searchTypeFilterArray.push('music');
    }

    return searchTypeFilterArray;
});

watch(searchTypeFilterArray, () => {
    searchStore.$patch({
        searchTypeFilter: searchTypeFilterArray.value,
    });
});

watch(upperSongsLimit, () => {
    searchStore.$patch({
        maxSongsCount: upperSongsLimit.value,
    });
});

// Watch for changes in the min/max songs count.
watch(maxSongsCount, () => {
    if(upperSongsLimit.value !== undefined && maxSongsCount.value > upperSongsLimit.value && upperSongsLimit.value !== undefined) {
        maxSongsCount.value = upperSongsLimit.value;
    } else if(maxSongsCount.value < minSongsCount.value) {
        minSongsCount.value = maxSongsCount.value | 0;
    }
});

watch(minSongsCount, () => {
    if(minSongsCount.value > maxSongsCount.value) {
        maxSongsCount.value = minSongsCount.value | 0;
    } else if(minSongsCount.value < 0) {
        minSongsCount.value = 0;
    }
});

/**
 * Clears the search field.
 */
function clear() {
    search.value = '';
}

/**
 * Resets the search fields.
 */
function reset() {
    searchTypeFilter.value = {
        tv: true,
        movie: true,
        ova: true,
        ona: true,
        special: true,
        music: true,
    };

    searchStore.$patch({
        search: '',
        searchType: 'anime',
        searchAiringFilter: 'any',
        listFilterType: 'union',
        maxAgeRating: 4,
        selectedGenres: [],
        selectedStudios: [],
        sortType: 'mal',
        minSongsCount: 0,
        maxSongsCount: upperSongsLimit.value,
        reverseOrder: false,
    });
}

</script>

<template>
    <div id="desktopSearchField" class="mobile-hide">
        <div id="desktopSearchFieldContent">
            <select v-model="searchType">
                <option value="anime">Anime</option>
                <option value="song">Song</option>
                <option value="artist">Artist</option>
                <option value="id" v-if="searchType === 'id'">ID</option>
            </select>
            <input v-model="search" type="text" id="search" placeholder="Type here to search...">
            <img id="advancedSearchButton" @click="dialogOpen = true" src="@/assets/dropdown-white.svg" alt="Advanced Search" title="Advanced Search" height="30" width="30">
        </div>
    </div>

    <img class="mobile-show svgFix" id="mobileSearchIcon" src="@/assets/search.svg" alt="Search" @click="dialogOpen = true" height="30" width="30">

    <Dialog
            :title="'Search'"
            :subtitle="`${props.searchResultCount} ${pluralize(props.searchResultCount, 'result', 'results')}`"
            :visible="dialogOpen"
            :hide="() => dialogOpen = false"
            :buttons="[
                {
                    icon: ResetIcon,
                    alt: 'Clear all',
                    action: reset
                }
            ]"
            :fit-content="true">

        <div>
            <div id="searchField">
                <input v-model="search" type="text" id="search" placeholder="Type here to search...">
                <img src="@/assets/backspace.svg" alt="Clear" @click="clear" height="30" width="30">
            </div>

            <table class="tableOptions">
                <tbody>
                    <tr>
                        <td>
                            <label for="searchFilterType">Search by: </label>
                        </td>
                        <td>
                            <select v-model="searchType" id="searchFilterType">
                                <option value="anime">Anime</option>
                                <option value="song">Song</option>
                                <option value="artist">Artist</option>
                                <option value="id" v-if="searchType === 'id'">ID</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="reverse">Reverse order: </label>
                        </td>
                        <td>
                            <input type="checkbox" name="reverse" id="reverse" v-model="reverseOrder">
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="genres">Genres: </label>
                        </td>
                        <td class="vueselect">
                            <VueSelect v-model="selectedGenres" :options="dataStore.data?.genres" multiple/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="studios">Studios: </label>
                        </td>
                        <td class="vueselect">
                            <VueSelect v-model="selectedStudios" :options="dataStore.data?.studios" multiple/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="searchAiringFilter">Airing state: </label>
                        </td>
                        <td>
                            <select v-model="searchAiringFilter" id="searchAiringFilter">
                                <option value="any">Any</option>
                                <option value="finished">Finished</option>
                                <option value="airing">Currently Airing</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="listFilterType">List filter mode: </label>
                        </td>
                        <td>
                            <select id="listFilterType" v-model="listFilterType">
                                <option value="union">Union</option>
                                <option value="intersect">Intersect</option>
                                <option value="strict">Strict</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="ageRating">Max age rating: </label>
                        </td>
                        <td>
                            <select id="ageRating" v-model="maxAgeRating">
                                <option value="0">{{ getRating(0) }}</option>
                                <option value="1">{{ getRating(1) }}</option>
                                <option value="2">{{ getRating(2) }}</option>
                                <option value="3">{{ getRating(3) }}</option>
                                <option value="4">{{ getRating(4) }}</option>
                                <option value="5">{{ getRating(5) }}</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="sortType">Sort by: </label>
                        </td>
                        <td>
                            <select id="sortType" v-model="sortType">
                                <option value="mal">MyAnimeList ordering</option>
                                <option value="title">Title</option>
                                <option value="score">Average score (everyone)</option>
                                <option value="score-list">Average score (selected lists)</option>
                                <option value="score-mal">MyAnimeList score</option>
                                <option value="start-date">Start date</option>
                                <option value="watch-count">Watch count</option>
                                <option value="add-date">Added date</option>
                                <option value="song-count">Number of songs</option>
                            </select>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            Number of songs
                        </td>

                        <td>
                            <table id="songsFilter">
                                <tr>
                                    <td>
                                        <label for="songsMin">Min: </label>
                                    </td>
                                    <td>
                                        <input type="number" id="songsMin" step="1" min="0" :max="upperSongsLimit" v-model="minSongsCount">
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <label for="songsMax">Max: </label>
                                    </td>
                                    <td>
                                        <input type="number" id="songsMax" step="1" :min="minSongsCount" :max="upperSongsLimit" v-model="maxSongsCount">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <span>Type: </span>
                        </td>
                        <td id="advancedSearchTypes">
                            <div><input v-model="searchTypeFilter.tv" type="checkbox" id="tv"> <label for="tv">Series</label></div>
                            <div><input v-model="searchTypeFilter.movie" type="checkbox" id="movie"> <label for="movie">Movie</label></div>
                            <div><input v-model="searchTypeFilter.ova" type="checkbox" id="ova"> <label for="ova">OVA</label></div>
                            <div><input v-model="searchTypeFilter.ona" type="checkbox" id="ona"> <label for="ona">ONA</label></div>
                            <div><input v-model="searchTypeFilter.special" type="checkbox" id="special"> <label for="special">Special</label></div>
                            <div><input v-model="searchTypeFilter.music" type="checkbox" id="music"> <label for="music">Music</label></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Dialog>
</template>

<style>
    :root {
        --vs-dropdown-max-height: 200px;
        --vs-search-input-color: black;
        --vs-dropdown-color: black;
    }

    header div#desktopSearchFieldContent input[type=text]#search {
        appearance: none;

        height: 30px;

        color: white;

        background-color: transparent;
        border: 1px solid white;

        padding-right: 10px;
        padding-left: 10px;
    }

    header div#desktopSearchFieldContent input[type=text]#search::placeholder {
        color: white;
        font-style: italic;
        opacity: 0.5;
    }

    header div#desktopSearchFieldContent input[type=text]#search:focus {
        outline: none;
    }

    header div#desktopSearchFieldContent img#advancedSearchButton {
        border: 1px solid white;
        border-left: unset;
        border-radius: 0px 5px 5px 0px;

        height: 32px;

        cursor: pointer;
    }

    #mobileSearchIcon {
        height: 30px;
    }

    #searchField {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    #searchField input {
        width: calc(100% - 40px);
    }

    #mobileCloseSearch {
        margin-top: 15px;
    }

    #desktopSearchFieldContent {
        display: flex;
        align-items: center;
    }

    #advancedSearchDialog {
        max-width: 500px;
    }

    #advancedSearchTypes {
        display: flex;
    }

    #advancedSearchTypes div {
        border-left: 1px solid black;
        padding-left: 10px;
        margin-left: 10px;
    }

    #advancedSearchTypes div:nth-child(1) {
        border-left: none;
        padding-left: 0px;
        margin-left: 0px;
    }

    #advancedSearchTypes div input {
        margin-left: 0px;
        margin-right: 0px;
    }

    #songsFilter {
        width: 100%;
    }

    #songsFilter input {
        width: 100%;
    }

    .vueselect > * {
        background-color: white;
        border-radius: var(--vs-border-radius);
    }

    @media screen and ((max-width: 1005px) or (orientation: portrait)) {
        #advancedSearchTypes {
            flex-direction: column;
        }

        #advancedSearchTypes div {
            border-left: none;
            padding-left: 0px;
            margin-left: 0px;
        }
    }
</style>

<style scoped>
    header div#desktopSearchFieldContent select {
        appearance: none;

        height: 34px;

        color: white;
        font-weight: bold;

        background-color: transparent;
        border: 1px solid white;
        border-right: unset;
        border-radius: 5px 0px 0px 5px;

        padding-right: 10px;
        padding-top: 5px;
        padding-bottom: 5px;
        padding-left: 10px;

        cursor: pointer;
        
        text-align: center;

        font-family: 'Montserrat', 'Noto Sans', sans-serif;
    }

    header div#desktopSearchFieldContent select:focus {
        outline: none;
    }

    @media screen and (prefers-color-scheme: dark) {
        #searchField img {
            filter: invert(1);
        }
    }
</style>