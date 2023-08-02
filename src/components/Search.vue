<script setup>

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
const props = defineProps({
    /**
     * The search result count.
     */
   searchResultCount: Number,
});


const searchStore = useSearchStore();

const dataStore = useDataStore();

const {
    search,
    searchType,
    searchAiringFilter,
    listFilterType,
    maxAgeRating,
    selectedGenres,
    selectedStudios,
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
const dialogRef = ref(null);

onMounted(() => {
    // Support closing the dialog by pressing the escape key.
    dialogRef.value.addEventListener('close', () => {
        dialogOpen.value = false;
    });
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

/**
 * Toggles the dialog.
 */
function toggleDialog() {
    if(dialogOpen.value) {
        dialogRef.value.close();
    } else {
        dialogRef.value.showModal();
    }

    dialogOpen.value = !dialogOpen.value;
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
    search.value = '';
    searchType.value = 'anime';
    searchAiringFilter.value = 'any';
    listFilterType.value = 'union';
    searchTypeFilter.value = {
        tv: true,
        movie: true,
        ova: true,
        ona: true,
        special: true,
        music: true,
    };
    maxAgeRating.value = '4';
    selectedGenres.value = [];
    selectedStudios.value = [];
}

</script>

<template>
    <div id="desktopSearchField" class="mobile-hide">
        <div id="desktopSearchFieldContent" role="search">
            <select v-model="searchType">
                <option value="anime">Anime</option>
                <option value="song">Song</option>
                <option value="artist">Artist</option>
            </select>
            <input v-model="search" type="text" id="search" placeholder="Type here to search..." role="searchbox">
            <img id="advancedSearchButton" role="button" @click="toggleDialog" src="@/assets/dropdown-white.svg" alt="Advanced Search" title="Advanced Search" height="30" width="30">
        </div>
    </div>

    <img role="button" class="mobile-show svgFix" id="mobileSearchIcon" src="@/assets/search.svg" alt="Search" @click="toggleDialog" height="30" width="30">

    <dialog ref="dialogRef" id="advancedSearchDialog">
        <div class="dialogHeader">
            <div>
                <h2>Search</h2>
                <small>{{ `${props.searchResultCount} ${pluralize(props.searchResultCount, 'result', 'results')}` }}</small>
            </div>

            <div>
                <img role="button" @click="reset" src="@/assets/reset.svg" alt="Clear all" height="30" width="30">
                <img role="button" @click="toggleDialog" src="@/assets/close.svg" alt="Close" height="30" width="30">
            </div>
        </div>

        <div role="search">
            <div id="searchField">
                <input v-model="search" type="text" id="search" placeholder="Type here to search..." role="searchbox">
                <img role="button" src="@/assets/backspace.svg" alt="Clear" @click="clear" height="30" width="30">
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