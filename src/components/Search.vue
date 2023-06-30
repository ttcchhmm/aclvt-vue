<script setup>

import { ref, watch } from 'vue';

const search = ref('');
const dialogOpen = ref(false);
const dialogRef = ref(null);

const emit = defineEmits(['updated']);

watch(search, (newVal) => {
    // There is a lot of anime in this dataset, so we wait a bit to not trigger too much DOM updates
    setTimeout(() => {
        if(newVal === search.value) {
            emit('updated', newVal);
        }
    }, 500);
});

function toggleDialog() {
    if(dialogOpen.value) {
        dialogRef.value.close();
    } else {
        dialogRef.value.showModal();
    }

    dialogOpen.value = !dialogOpen.value;
}

function clear() {
    search.value = '';
}

</script>

<template>
    <input v-model="search" class="mobile-hide" type="text" id="search" placeholder="Type here to search...">

    <img class="mobile-show" id="mobileSearchIcon" src="@/assets/search.svg" alt="Search" @click="toggleDialog" height="30" width="30">

    <dialog ref="dialogRef">
        <h2>Search</h2>

        <div id="searchField">
            <input v-model="search" type="text" id="search" placeholder="Type here to search...">
            <img src="@/assets/backspace.svg" alt="Clear" @click="clear" height="30" width="30">
        </div>

        <button @click="toggleDialog" class="mobile-fill-width" id="mobileCloseSearch">Close</button>
    </dialog>
</template>

<style scoped>
    #mobileSearchIcon {
        height: 30px;

        border: 1px solid lightslategray;
        border-radius: 5px;

        color: black;
        background-color: white;
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
</style>