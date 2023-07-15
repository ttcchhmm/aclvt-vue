<script setup>

import { ref, watch } from 'vue';

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
 * The search type filter.
 */
const searchTypeFilter = ref('any');

/**
 * Whether or not the search dialog is open.
 */
const dialogOpen = ref(false);

/**
 * The dialog reference.
 */
const dialogRef = ref(null);

/**
 * The event emitter.
 */
const emit = defineEmits(['updated']);

function update() {
    emit('updated', search.value, searchType.value, searchAiringFilter.value, searchTypeFilter.value);
}

// Watchers
watch(search, update);
watch(searchType, update);
watch(searchAiringFilter, update);
watch(searchTypeFilter, update);

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
            <h2>Search</h2>
            <img @click="toggleDialog" src="@/assets/close.svg" alt="Close" height="30" width="30">
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
                            <label for="searchTypeFilter">Type: </label>
                        </td>
                        <td>
                            <select v-model="searchTypeFilter" id="searchTypeFilter">
                                <option value="any">Any</option>
                                <option value="tv">Series</option>
                                <option value="movie">Movie</option>
                                <option value="ova">Original Video Animation</option>
                                <option value="ona">Original Net Animation</option>
                                <option value="special">Special</option>
                            </select>
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
</style>