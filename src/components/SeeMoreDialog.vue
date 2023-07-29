<script setup>

import { storeToRefs } from 'pinia';
import { useSeeMoreStore } from '../stores/SeeMoreStore';
import { onMounted, watch, ref, computed } from 'vue';
import { getTitle, getLangCode, getType } from '../utils/AnimeLabels';
import LoadingIcon from './LoadingIcon.vue';
import Scores from './Scores.vue';
import { useSettingsStore } from '../stores/SettingsStore';

/**
 * Settings store.
 */
const settingsStore = useSettingsStore();

const { anime, visible } = storeToRefs(useSeeMoreStore());

/**
 * Additional data for the dialog.
 */
const data = ref({
    /**
     * Nested object containing the additional data.
     * Needed because of the way refs work.
     * @type {Object}
     */
    secondary: null,
});

const dialogRef = ref(null);

onMounted(() => {
    dialogRef.value.addEventListener('close', () => {
        visible.value = false;
    });
});

// Fetch the additional data when the anime changes.
watch(anime, () => {
    // Will show the loading indicator.
    data.value.secondary = null;

    if(anime.value.id !== undefined) {
        fetch(`/api/v2/animes/${anime.value.id}.json`)
            .then(res => res.json())
            .then(json => {
                data.value.secondary = json;
            });
    }
});

/*
 * Watch for changes to the visible state, and open/close the dialog accordingly.
 */
watch(visible, (newVal) => {
    if(newVal) {
        dialogRef.value.showModal();
    } else {
        dialogRef.value.close();
    }
});

/**
 * The title of the anime.
 */
const title = computed(() => getTitle(anime.value));

/**
 * The title language used.
 */
const titleLanguage = computed(() => getLangCode());

/**
 * The type of the anime.
 */
const type = computed(() => getType(anime.value));

function capitlizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

</script>

<template>
    <dialog ref="dialogRef">
        <div class="dialogHeader">
            <div>
                <h2 :lang="titleLanguage"><a :href="`https://myanimelist.net/anime/${anime.id}`" :style="settingsStore.colorizeLinks ? 'color: #0091FF' : 'color: black'">{{ title }}</a></h2>
                <small>{{ type }}</small>
            </div>
            <img @click="visible = false" src="@/assets/close.svg" alt="Close" height="30" width="30" role="button">
        </div>

        <div id="seeMoreDialogBody">
            <div id="coverContainer">
                <h3 id="coverHeading">Cover art</h3>
                <img :src="anime.cover" height="600" width="424">
            </div>

            <LoadingIcon v-if="data.secondary === null" :light-mode="true" />
            <div v-else class="rightPart">
                <h3>Synopsis</h3>
                <p v-for="paragraph in data.secondary.synopsis.split('\n')">{{ paragraph }}</p>

                <h3>More info</h3>
                <table class="tableOptions">
                    <tr v-if="data.secondary.startDate !== undefined">
                        <td class="label">Start date</td>
                        <td>{{ data.secondary.startDate }}</td>
                    </tr>
                    <tr v-if="data.secondary.endDate !== undefined">
                        <td class="label">End date</td>
                        <td>{{ data.secondary.endDate }}</td>
                    </tr>
                    <tr v-if="data.secondary.startSeason !== undefined">
                        <td class="label">Start season</td>
                        <td>{{ `${capitlizeFirstLetter(data.secondary.startSeason.season)} ${data.secondary.startSeason.year}` }}</td>
                    </tr>
                    <tr v-if="data.secondary.studios !== undefined">
                        <td class="label">Studios</td>
                        <td>{{ data.secondary.studios.map(s => s.name).join(', ') }}</td>
                    </tr>
                </table>

                <h3>Scores</h3>
                <Scores :scores="anime.scores" />
            </div>
        </div>
    </dialog>
</template>

<style>
.label {
    font-weight: bold;
}

#seeMoreDialogBody {
    display: flex;
}

#seeMoreDialogBody > .rightPart h3:first-child {
    margin-top: 0;
}

#coverContainer {
    margin-right: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#coverHeading {
    display: none;
    align-self: flex-start;
    
    margin-top: 0px;
}

@media screen and ((max-width: 450px) or (orientation: portrait)) {
    #coverContainer {
        margin-right: 0px;
        margin-top: 1rem;

        height: fit-content;
    }

    #coverContainer img {
        height: 100%;
        width: 100%;
    }

    #seeMoreDialogBody {
        flex-direction: column-reverse;
    }

    #coverHeading {
        display: block;
    }
}
</style>