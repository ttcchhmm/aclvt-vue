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
import type { AiringStatus, UserStatus } from '@/Types';

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
 * The airing state filter.
 */
const airingState = ref({
    completed: true,
    airing: true,
    notYetAired: false,
});

/**
 * The status filter.
 */
const userStatusState = ref({
    completed: true,
    watching: true,
    dropped: false,
    onHold: false,
    planToWatch: false,
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

// Transform the inner type state to an array for filtering.
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

// Transform the inner airing state to an array for filtering.
const airingStateArray = computed(() => {
    const airingStateArray = [];

    if(airingState.value.airing) {
        airingStateArray.push('currently_airing');
    }

    if(airingState.value.completed) {
        airingStateArray.push('finished_airing');
    }

    if(airingState.value.notYetAired) {
        airingStateArray.push('not_yet_aired');
    }

    return airingStateArray;
});

// Transform the inner user status state to an array for filtering.
const userStatusArray = computed(() => {
    const userStatusArray = [];

    if(userStatusState.value.completed) {
        userStatusArray.push('completed');
    }

    if(userStatusState.value.dropped) {
        userStatusArray.push('dropped');
    }

    if(userStatusState.value.onHold) {
        userStatusArray.push('on_hold');
    }

    if(userStatusState.value.planToWatch) {
        userStatusArray.push('plan_to_watch');
    }

    if(userStatusState.value.watching) {
        userStatusArray.push('watching');
    }

    return userStatusArray;
});

// -- Update the stores --
watch(searchTypeFilterArray, () => {
    searchStore.$patch({
        searchTypeFilter: searchTypeFilterArray.value,
    });
});

watch(airingStateArray, () => {
    searchStore.$patch({
        searchAiringFilter: airingStateArray.value as AiringStatus[],
    });
});

watch(userStatusArray, () => {
    searchStore.$patch({
        userStatusFilter: userStatusArray.value as UserStatus[],
    });
});

// Set the max song count if it changes
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

// Same for the min count
watch(minSongsCount, () => {
    if(minSongsCount.value > maxSongsCount.value) {
        maxSongsCount.value = minSongsCount.value | 0;
    } else if(minSongsCount.value < 0) {
        minSongsCount.value = 0;
    }
});

// Disallow choosing "not yet aired" if "plan to watch" is not selected.
watch(userStatusState, () => {
    if(!userStatusState.value.planToWatch) {
        airingState.value.notYetAired = false;
    }
}, { deep: true });

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

    airingState.value = {
        airing: true,
        completed: true,
        notYetAired: false,
    };

    userStatusState.value = {
        completed: true,
        watching: true,
        dropped: false,
        onHold: false,
        planToWatch: false,
    };

    searchStore.$patch({
        search: '',
        searchType: 'anime',
        searchAiringFilter: ['currently_airing', 'finished_airing'],
        userStatusFilter: ['completed', 'watching'],
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
                                <option value="anime">Anime name</option>
                                <option value="song">Song name</option>
                                <option value="artist">Artist name</option>
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
                            <span>Airing state: </span>
                        </td>
                        <td id="advancedSearchTypes">
                            <div><input v-model="airingState.airing" type="checkbox" id="airing"> <label for="airing">Airing</label></div>
                            <div><input v-model="airingState.completed" type="checkbox" id="finished"> <label for="finished">Finished</label></div>
                            <div><input v-model="airingState.notYetAired" type="checkbox" id="notYetAired" :disabled="!userStatusState.planToWatch"> <label for="notYetAired">Not yet aired</label></div>
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
                            <span>State on lists: </span>
                        </td>
                        <td id="advancedSearchTypes">
                            <div><input v-model="userStatusState.completed" type="checkbox" id="completed"> <label for="completed">Completed</label></div>
                            <div><input v-model="userStatusState.watching" type="checkbox" id="watching"> <label for="watching">Watching</label></div>
                            <div><input v-model="userStatusState.onHold" type="checkbox" id="onHold"> <label for="onHold">On hold</label></div>
                            <div><input v-model="userStatusState.dropped" type="checkbox" id="dropped"> <label for="dropped">Dropped</label></div>
                            <div><input v-model="userStatusState.planToWatch" type="checkbox" id="planToWatch"> <label for="planToWatch">Plan to watch</label></div>
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