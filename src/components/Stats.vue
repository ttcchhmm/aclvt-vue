<script setup lang="ts">

import { ref, computed, defineAsyncComponent } from 'vue';
import Dialog from './Dialog.vue';
import type { AnimeBase } from '../Types';
import { useDataStore } from '@/stores/DataStore';
import { storeToRefs } from 'pinia';
import { type ChartEntry } from '../Types';

const ChartDisplay = defineAsyncComponent(() => import('./ChartDisplay.vue'));

/**
 * The props passed to this component.
 */
const props = defineProps<{
    /**
     * The animes to use when calculating.
     */
    animes: AnimeBase[],
}>();

const dataStore = useDataStore();
const { data } = storeToRefs(dataStore);

/**
 * Whether the dialog is opened.
 */
const dialogOpen = ref(false);

/**
 * An array with data about genres.
 */
const genreChartData = computed(() => {
    const chartData = [] as ChartEntry[];

    data.value?.genres.forEach(genre => {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);

        chartData.push({
            name: genre,
            entries: props.animes.filter(a => a.genres.includes(genre)).length,
            color: `rgb(${r}, ${g}, ${b})`,
        });
    });

    return chartData.filter(entry => entry.entries > 0).sort((a, b) => b.entries - a.entries);
});

/**
 * An array with data about users.
 */
const userChartData = computed(() => {
    // Users
    const a: ChartEntry = {
        name: 'Alexis',
        entries: 0,
        color: 'red',
    };

    const c: ChartEntry = {
        name: 'Cyprien',
        entries: 0,
        color: 'fuchsia',
    };

    const l: ChartEntry = {
        name: 'Léonard',
        entries: 0,
        color: 'yellow',
    };

    const v: ChartEntry = {
        name: 'Victor',
        entries: 0,
        color: 'green',
    };

    const t: ChartEntry = {
        name: 'Tom',
        entries: 0,
        color: 'blue',
    };

    const q: ChartEntry = {
        name: 'Quentin',
        entries: 0,
        color: 'orange',
    };

    // Loop through animes
    props.animes.forEach(anime => {
        if(anime.scores.A) {
            a.entries++;
        }

        if(anime.scores.C) {
            c.entries++;
        }

        if(anime.scores.L) {
            l.entries++;
        }

        if(anime.scores.V) {
            v.entries++;
        }

        if(anime.scores.T) {
            t.entries++;
        }

        if(anime.scores.Q) {
            q.entries++;
        }
    });

    return [a, c, l, v, t, q].filter(entry => entry.entries > 0).sort((a, b) => b.entries - a.entries);
});

/**
 * An array with data about music types.
 */
const musicTypeChartData = computed(() => {
    const op: ChartEntry = {
        name: 'Openings',
        entries: 0,
        color: 'red',
    };

    const ed: ChartEntry = {
        name: 'Endings',
        entries: 0,
        color: 'green',
    };

    const inserts: ChartEntry = {
        name: 'Inserts',
        entries: 0,
        color: 'blue',
    };

    props.animes.forEach(anime => {
        op.entries += anime.music.filter(m => m.type === 'Opening').length;
        ed.entries += anime.music.filter(m => m.type === 'Ending').length;
        inserts.entries += anime.music.filter(m => m.type === 'Insert Song').length;
    });

    return [op, ed, inserts].filter(entry => entry.entries > 0).sort((a, b) => b.entries - a.entries);
});

/**
 * The total amount of seconds watched.
 */
const secondsWatched = computed(() => {
    return props.animes.map(a => {
        // The average length of an episode, in seconds. Using 24 minutes as a default if unknown.
        const length = a.averageEpisodeDuration === undefined ? 24 * 60 : a.averageEpisodeDuration; 

        let watched = 0;

        if(a.scores.A) {
            watched += a.scores.A.watchedEpisodesCount * length;
        }

        if(a.scores.C) {
            watched += a.scores.C.watchedEpisodesCount * length;
        }

        if(a.scores.L) {
            watched += a.scores.L.watchedEpisodesCount * length;
        }

        if(a.scores.V) {
            watched += a.scores.V.watchedEpisodesCount * length;
        }

        if(a.scores.T) {
            watched += a.scores.T.watchedEpisodesCount * length;
        }

        if(a.scores.Q) {
            watched += a.scores.Q.watchedEpisodesCount * length;
        }

        return watched;
    }).reduce((a, b) => a + b, 0) as number;
});

</script>

<template v-memo="[dialogOpen]">
    <img @click="dialogOpen = true" src="@/assets/stats.svg" alt="See statistics" title="See statistics" height="30" width="30" class="svgFix" id="statsButton"/>

    <Dialog
        :title="'Statistics'"
        :visible="dialogOpen"
        :hide="() => dialogOpen = false"
        :buttons="[]">
            <p id="statsTip"><strong>Tip</strong>: The statistics displayed here are based on the current search criteria ! Feel free to go back and change a few things to see what changed.</p>

            <div class="statEntry">
                <h3>Watch time</h3>
                <p>The total amount of time spent watching was <strong>{{ new Intl.NumberFormat().format(Math.ceil(((secondsWatched/60)/60)/24)) }} days</strong>, which is <strong>{{ new Intl.NumberFormat().format(Math.ceil((secondsWatched/60)/60)) }} hours</strong>, or <strong>{{ new Intl.NumberFormat().format(Math.ceil(secondsWatched/60)) }} minutes</strong>.</p>
            </div>

            <div class="statEntry">
                <h3>By genre</h3>
                <ChartDisplay v-if="dialogOpen === true" :chart-data="genreChartData" :label="'Genres'" :first-col-label="'Genres'" :second-col-label="'Number of animes'"/>
            </div>

            <div class="statEntry">
                <h3>By users</h3>
                <ChartDisplay v-if="dialogOpen === true" :chart-data="userChartData" :label="'Watched animes'" :first-col-label="'Users'" :second-col-label="'Number of animes'"/>
            </div>

            <div class="statEntry">
                <h3>By songs</h3>
                <ChartDisplay v-if="dialogOpen === true" :chart-data="musicTypeChartData" :label="'Songs'" :first-col-label="'Song types'" :second-col-label="'Number of songs'"/>
            </div>

        </Dialog>
</template>

<style>
#statsButton {
    cursor: pointer;
}

.statEntry {
    margin-bottom: 20px;
}

#statsTip {
    margin-bottom: 30px;
}

@media screen and ((max-width: 1005px) or (orientation: portrait)) {
    .statEntry {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px dashed lightslategray;
    }

    .statEntry:last-child {
        margin-bottom: 0px;
        padding-bottom: 0px;
        border-bottom: none;
    }

    .statEntry > h3 {
        text-align: center;
    }
}
</style>