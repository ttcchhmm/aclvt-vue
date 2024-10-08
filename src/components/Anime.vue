<script setup lang="ts">

import Song from './Song.vue';
import Scores from './Scores.vue';
import { computed, onMounted, ref } from 'vue';
import { pluralize } from '../utils/Pluralize';
import { getTitle, getLangCode, getType } from '../utils/AnimeLabels';
import { useSeeMoreStore } from '../stores/SeeMoreStore';
import { useSettingsStore } from '../stores/SettingsStore';
import { type AnimeBase } from '../Types';

/**
 * The props for this component.
 */
const props = defineProps<{
    /**
     * The anime to display.
     */
    anime: AnimeBase;
}>();

/**
 * The store for the "See More" dialog.
 */
const seeMoreStore = useSeeMoreStore();

/**
 * The settings store.
 */
const settingsStore = useSettingsStore();

/**
 * The openings of the anime.
 */
const openings = computed(() => props.anime?.music?.filter(m => m.type === 'Opening'));

/**
 * The endings of the anime.
 */
const endings = computed(() => props.anime?.music?.filter(m => m.type === 'Ending'));

/**
 * The insert songs of the anime.
 */
const inserts = computed(() => props.anime?.music?.filter(m => m.type === 'Insert Song'));

/**
 * Whether or not the background should be shown.
 */
const showBackground = ref(false);

/**
 * The background reference.
 */
const backgroundRef = ref<HTMLDivElement | null>(null);

/**
 * CSS code for the background.
 */
const coverRule = computed(() => `background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${props.anime?.cover});`);

/**
 * Contains the label for the type of anime.
 */
const typeLabel = computed(() => getType(props.anime));

/**
 * Contains the label for the state of the anime.
 */
const stateLabel = computed(() => {
    switch(props.anime?.status) {
        case 'finished_airing':
            return 'Finished';
        case 'currently_airing':
            return 'Airing';
        case 'not_yet_aired':
            return 'Not Yet Aired';
        default:
            return '';
    }
});

/**
 * The title of the anime.
 */
const title = computed(() => getTitle(props.anime));

/**
 * The title language used.
 */
const titleLanguage = computed(() => getLangCode());

</script>

<template>
    <div class="background-target" ref="backgroundRef" :style="coverRule">
        <section class="anime">
            <h2 @click="seeMoreStore.$patch({ anime: props.anime, visible: true })" :lang="titleLanguage" :class="titleLanguage === 'ja' ? 'japanese' : ''" :style="settingsStore.colorizeLinks ? 'color: #0091FF' : 'color: white'">{{ title }}</h2>

            <div class="labels" v-once>
                <small v-if="typeLabel.length !== 0">{{ typeLabel }}</small>
                <small v-if="stateLabel.length !== 0">{{ stateLabel }}</small>

                <small class="songCount">{{ `${props.anime.music.length} ${pluralize(props.anime.music.length, 'entry', 'entries')}` }}</small>
            </div>

            <Scores :scores="props.anime.scores" />

            <div class="mobile-fill-width songsDisplay">
                <div v-if="props.anime?.music?.length === 0" class="noSongs" v-once>
                    <img src="@/assets/error.svg" class="svgFix" height="48" width="48">
                    <p>No songs found.</p>
                </div>

                <div v-if="openings.length !== 0" class="songs">
                    <h3>{{ pluralize(openings.length, 'Opening', 'Openings') }}</h3>
                    <Song v-for="song in openings" :key="song.name" :song="song" />
                </div>

                <div v-if="endings.length !== 0" class="songs">
                    <h3>{{ pluralize(endings.length, 'Ending', 'Endings') }}</h3>
                    <Song v-for="song in endings" :key="song.name" :song="song" />
                </div>

                <div v-if="inserts.length !== 0" class="songs">
                    <h3>{{ pluralize(inserts.length, 'Insert', 'Inserts') }}</h3>
                    <Song v-for="song in inserts" :key="song.name" :song="song" />
                </div>
            </div>
        </section>
    </div>
</template>

<style>
.background-target {
    width: fit-content;
    height: fit-content;

    border: 1px solid lightslategray;
    border-radius: 5px;

    margin: 5px;
    margin-bottom: 30px;

    background-size: cover !important;
}

.anime {
    display: flex;
    align-items: center;
    flex-direction: column;

    padding: 5px;

    width: 300px;

    border-radius: 5px;

    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}

.anime:hover {
    animation: hover 0.25s;
    box-shadow: 2px 4px 5px 0px rgba(255,255,255,0.25)
}

.anime h2 {
    margin: 5px;
    margin-bottom: 10px;

    max-width: 300px;
    text-align: center;

    cursor: pointer;

    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
}

.songsDisplay {
    width: 100%;
}

.songs {
    border-bottom: 1px dotted white;
    margin-top: 5px;
    padding-bottom: 5px;
}

.songs:last-child {
    border-bottom: none;
}

.songs h3 {
    margin-bottom: 10px;
    text-align: center;
}

.labels {
    display: flex;
    flex-direction: column;
    align-items: center;

    margin-bottom: 10px;
}

.songCount {
    margin-top: 5px;
}

.noSongs {
    margin-top: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;
}

@media screen and ((max-width: 1005px) or (orientation: portrait)) {
    .background-target {
        border: unset;
        border-radius: unset;
        box-shadow: unset;

        width: 100%;

        margin: 0px;
        margin-bottom: 10px;
    }

    .anime {
        width: calc(100% - 10px);
        box-shadow: unset;
        animation: unset;
    }
}
</style>