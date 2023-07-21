<script setup>

import Song from './Song.vue';
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { pluralize } from '../utils/Pluralize';
import { useSettingsStore } from '../stores/SettingsStore';

/**
 * The props for this component.
 */
const props = defineProps({
    /**
     * The anime to display.
     */
    anime: Object,

    /**
     * Additional metadata, such as scores and covers.
     */
    metadata: Object,
});

/**
 * The openings of the anime.
 */
const openings = computed(() => props.anime.musique.filter(m => m.type === 'Opening'));

/**
 * The endings of the anime.
 */
const endings = computed(() => props.anime.musique.filter(m => m.type === 'Ending'));

/**
 * The insert songs of the anime.
 */
const inserts = computed(() => props.anime.musique.filter(m => m.type === 'Insert Song'));

/**
 * Whether or not the background should be shown.
 */
const showBackground = ref(false);

/**
 * The background reference.
 */
const backgroundRef = ref(null);

const { animeLanguage } = storeToRefs(useSettingsStore());

/**
 * CSS code for the background.
 */
const coverRule = computed(() => {
    if(props.metadata?.cover !== undefined && showBackground.value) {
        return `background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${props.metadata?.cover});`;
    } else {
        return 'background: rgb(70, 70, 70);';
    }
});

/**
 * Contains the label for the type of anime.
 */
const typeLabel = computed(() => {
    switch(props.metadata.type) {
        case 'tv':
            return 'Series';
        case 'movie':
            return 'Movie';
        case 'ova':
            return 'Original Video Animation';
        case 'ona':
            return 'Original Net Animation';
        case 'special':
            return 'Special';
        case 'music':
            return 'Music';
        default:
            return '';
    }
});

/**
 * Contains the label for the state of the anime.
 */
const stateLabel = computed(() => {
    switch(props.metadata.status) {
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

const title = computed(() => {
    switch(animeLanguage.value) {
        case 'original':
            return props.metadata.titles.original || props.anime.nom;
        case 'en':
            return props.metadata.titles.en || props.anime.nom;
        case 'ja':
            return props.metadata.titles.ja || props.anime.nom;
    }
});

/**
 * Lazy load the background image if needed.
 * @param {IntersectionObserverEntry[]} entries 
 * @param {IntersectionObserver} observer 
 */
function lazyBackground(entries, observer) {
    entries.forEach((e) => {
        if(e.isIntersecting) {
            showBackground.value = true;
            observer.unobserve(e.target);
        }
    });
}

onMounted(() => {
    const observer = new IntersectionObserver(lazyBackground, { root: null, rootMargin: '20px' });
    observer.observe(backgroundRef.value);
});

</script>

<template>
    <div class="background-target" ref="backgroundRef" :style="coverRule">
        <section class="anime">
            <h2><a :href="`https://myanimelist.net/anime/${props.anime.mal_id}`" target="_blank">{{ title }}</a></h2>

            <div class="labels">
                <small v-if="typeLabel.length !== 0">{{ typeLabel }}</small>
                <small v-if="stateLabel.length !== 0">{{ stateLabel }}</small>

                <small class="songCount">{{ `${props.anime.nb_musique} ${pluralize(props.anime.nb_musique, 'entry', 'entries')}` }}</small>
            </div>

            <table class="watchedTable">
                <tbody>
                    <tr>
                        <td class="cursorHelp" :class="props.anime.users.A === 1 ? 'watched' : 'notWatched'" title="Alexis">A <span v-if="metadata?.scores['A'] !== undefined">{{ metadata?.scores['A'] }}</span></td>
                        <td class="cursorHelp" :class="props.anime.users.C === 1 ? 'watched' : 'notWatched'" title="Cyprien">C <span v-if="metadata?.scores['C'] !== undefined">{{ metadata?.scores['C'] }}</span></td>
                        <td class="cursorHelp" :class="props.anime.users.L === 1 ? 'watched' : 'notWatched'" title="Léonard">L <span v-if="metadata?.scores['L'] !== undefined">{{ metadata?.scores['L'] }}</span></td>
                        <td class="cursorHelp" :class="props.anime.users.V === 1 ? 'watched' : 'notWatched'" title="Victor">V <span v-if="metadata?.scores['V'] !== undefined">{{ metadata?.scores['V'] }}</span></td>
                        <td class="cursorHelp" :class="props.anime.users.T === 1 ? 'watched' : 'notWatched'" title="Tom">T <span v-if="metadata?.scores['T'] !== undefined">{{ metadata?.scores['T'] }}</span></td>
                    </tr>
                </tbody>
            </table>

            <div class="mobile-fill-width songsDisplay">
                <div v-if="openings.length !== 0" class="songs">
                    <h3>{{ pluralize(openings.length, 'Opening', 'Openings') }}</h3>
                    <Song v-for="song in openings" :key="song.nom" :song="song" />
                </div>

                <div v-if="endings.length !== 0" class="songs">
                    <h3>{{ pluralize(endings.length, 'Ending', 'Endings') }}</h3>
                    <Song v-for="song in endings" :key="song.nom" :song="song" />
                </div>

                <div v-if="inserts.length !== 0" class="songs">
                    <h3>{{ pluralize(inserts.length, 'Insert', 'Inserts') }}</h3>
                    <Song v-for="song in inserts" :key="song.nom" :song="song" />
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

    width: fit-content;
    min-width: 250px;

    backdrop-filter: blur(5px);
}

.anime:hover {
    animation: hover 0.25s;
    box-shadow: 2px 4px 5px 0px rgba(255,255,255,0.25)
}

.anime h2 {
    margin: 0px;
    max-width: 300px;
    text-align: center;
}

.watched {
    background-color: lightgreen;
}

.notWatched {
    background-color: lightcoral;
}

.watchedTable tbody tr td {
    margin-top: 5px;
    margin-bottom: 5px;
}

.watchedTable * {
    color: black;
}

.songsDisplay {
    width: 100%;
}

.songs {
    border-bottom: 1px dotted lightslategray;
    margin-top: 5px;
    padding-bottom: 5px;
}

.songs:last-child {
    border-bottom: none;
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

@media screen and ((max-width: 450px) or (orientation: portrait)) {
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