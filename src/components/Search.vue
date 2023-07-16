<script setup>

import { computed, onMounted, ref, watch } from 'vue';
import { pluralize } from '../utils/Pluralize';

/**
 * The props for this component.
 */
const props = defineProps({
    /**
     * The search result count.
     */
   searchResultCount: Number,

   /**
    * The list filter type.
    */
   listFilterType: String
});

/**
 * The search query.
 */
const search = ref('');

/**
 * The search type.
 */
const searchType = ref('anime');

/**
 * The search airing filter.
 */
const searchAiringFilter = ref('any');

/**
 * The list filter type.
 */
const listFilterType = ref(props.listFilterType);

/**
 * The search type filter.
 */
const searchTypeFilter = ref({
    tv: true,
    movie: true,
    ova: true,
    ona: true,
    special: true
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

/**
 * The event emitter.
 */
const emit = defineEmits(['updated']);

function update() {
    emit('updated', search.value, searchType.value, searchAiringFilter.value, searchTypeFilterArray.value, listFilterType.value);
}

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

    return searchTypeFilterArray;
});

// Watchers
watch(search, update);
watch(searchType, update);
watch(searchAiringFilter, update);
watch(searchTypeFilterArray, update);
watch(listFilterType, update);

watch(() => props.listFilterType, (newValue) => {
    listFilterType.value = newValue;
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
        special: true
    };
}

</script>

<template>
    <div id="desktopSearchField" class="mobile-hide">
        <div id="desktopSearchFieldContent">
            <select v-model="searchType">
                <option value="anime">Anime</option>
                <option value="song">Song</option>
                <option value="artist">Artist</option>
            </select>
            <input v-model="search" type="text" id="search" placeholder="Type here to search...">
            <img @click="toggleDialog" class="svgFix" src="@/assets/more.svg" alt="Advanced Search" title="Advanced Search" height="30" width="30">
        </div>
    </div>

    <img class="mobile-show svgFix" id="mobileSearchIcon" src="@/assets/search.svg" alt="Search" @click="toggleDialog" height="30" width="30">

    <dialog ref="dialogRef" id="advancedSearchDialog">
        <div class="dialogHeader">
            <div>
                <h2>Search</h2>
                <small>{{ `${props.searchResultCount} ${pluralize(props.searchResultCount, 'result', 'results')}` }}</small>
            </div>

            <div>
                <img @click="reset" src="@/assets/reset.svg" alt="Clear all" height="30" width="30">
                <img @click="toggleDialog" src="@/assets/close.svg" alt="Close" height="30" width="30">
            </div>
        </div>

        <div>
            <div id="searchField">
                <input v-model="search" type="text" id="search" placeholder="Type here to search...">
                <img src="@/assets/backspace.svg" alt="Clear" @click="clear" height="30" width="30">
            </div>

            <table id="advancedSearchCategories">
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
                            <span>Type: </span>
                        </td>
                        <td id="advancedSearchTypes">
                            <div><input v-model="searchTypeFilter.tv" type="checkbox" id="tv"> <label for="tv">Series</label></div>
                            <div><input v-model="searchTypeFilter.movie" type="checkbox" id="movie"> <label for="movie">Movie</label></div>
                            <div><input v-model="searchTypeFilter.ova" type="checkbox" id="ova"> <label for="ova">OVA</label></div>
                            <div><input v-model="searchTypeFilter.ona" type="checkbox" id="ona"> <label for="ona">ONA</label></div>
                            <div><input v-model="searchTypeFilter.special" type="checkbox" id="special"> <label for="special">Special</label></div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </dialog>
</template>

<style>
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

    #desktopSearchFieldContent select {
        margin-right: 10px;
    }

    #advancedSearchDialog {
        max-width: 500px;
    }

    #advancedSearchCategories {
        margin-top: 10px;
    }

    #advancedSearchCategories td {
        padding: 5px;
        border: none;
    }

    #advancedSearchCategories tr {
        border-bottom: 1px dotted lightslategray;
    }

    #advancedSearchCategories tr:last-child {
        border-bottom: none;
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

    @media screen and ((max-width: 450px) or (orientation: portrait)) {
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