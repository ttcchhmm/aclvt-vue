<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { pluralize } from '../utils/Pluralize';
import { useSearchStore } from '../stores/SearchStore';
import { getRating } from '../utils/AnimeLabels';
import { useDataStore } from '../stores/DataStore';

import VueSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

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
 * The dialog reference.
 */
const dialogRef = ref<HTMLDialogElement | null>(null);

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

    // Support closing the dialog by pressing the escape key.
    if(dialogRef.value !== null) {
        dialogRef.value.addEventListener('close', () => {
            dialogOpen.value = false;
        });
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
 * Toggles the dialog.
 */
function toggleDialog() {
    if(dialogRef.value !== null) {
        if(dialogOpen.value) {
            dialogRef.value.close();
        } else {
            dialogRef.value.showModal();
        }

        dialogOpen.value = !dialogOpen.value;
    }
}

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
            <img id="advancedSearchButton" @click="toggleDialog" src="@/assets/dropdown-white.svg" alt="Advanced Search" title="Advanced Search" height="30" width="30">
        </div>
    </div>

    <img class="mobile-show svgFix" id="mobileSearchIcon" src="@/assets/search.svg" alt="Search" @click="toggleDialog" height="30" width="30">

    <dialog ref="dialogRef" id="advancedSearchDialog">
        <div class="dialogHeader">
            <div>
                <h2>Search</h2>
                <small>{{ `${props.searchResultCount} ${pluralize(props.searchResultCount, 'result', 'results')}` }}</small>
            </div>

            <div class="buttons">
                <img @click="reset" src="@/assets/reset.svg" alt="Clear all" height="30" width="30">
                <img @click="toggleDialog" src="@/assets/close.svg" alt="Close" height="30" width="30">
            </div>
        </div>

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
                            <label for="genres">Genres: </label>
                        </td>
                        <td>
                            <VueSelect v-model="selectedGenres" :options="dataStore.data?.genres" multiple/>
                        </td>
                    </tr>

                    <tr>
                        <td>
                            <label for="studios">Studios: </label>
                        </td>
                        <td>
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
    </dialog>
</template>

<style>
    :root {
        --vs-dropdown-max-height: 200px;
    }

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
    }

    header div#desktopSearchFieldContent select:focus {
        outline: none;
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