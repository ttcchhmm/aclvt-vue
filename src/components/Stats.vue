<script setup lang="ts">

import { ref, computed } from 'vue';
import Dialog from './Dialog.vue';
import { Pie } from 'vue-chartjs';
import type { AnimeBase } from '../Types';
import { useDataStore } from '@/stores/DataStore';
import { storeToRefs } from 'pinia';
import { Chart as ChartJS, ArcElement, Tooltip, PieController } from 'chart.js';

/**
 * Defines an entry within a pie chart.
 */
type ChartEntry = {
    /**
     * The label of this entry.
     */
    name: string,

    /**
     * The weight associated with this entry.
     */
    entries: number,

    /**
     * The CSS color of this entry.
     */
    color: string,
}

// Set up ChartJS.
ChartJS.register(ArcElement, Tooltip, PieController);

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

</script>

<template v-memo="[dialogOpen]">
    <img @click="dialogOpen = true" src="@/assets/stats.svg" alt="See statistics" title="See statistics" height="30" width="30" class="svgFix" id="statsButton"/>

    <Dialog
        :title="'Statistics'"
        :visible="dialogOpen"
        :hide="() => dialogOpen = false"
        :buttons="[]">
            <p><strong>Tip</strong>: The statistics displayed here are based on the current search criteria ! Feel free to go back and change a few things to see what changed.</p>

            <h2>By genre</h2>
            <div class="statsEntry" v-if="dialogOpen === true">
                <div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Genre</th>
                                <th>Number of animes</th>
                                <th>Color</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="g in genreChartData">
                                <td>{{ g.name }}</td>
                                <td>{{ g.entries }}</td>
                                <td :style="`background-color: ${g.color};`"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="chart">
                    <Pie v-if="data && data.genres && props.animes" id="genreChart" :options="{
                        responsive: true,
                    }"
                    :data="{
                        labels: genreChartData.map(e => e.name),
                        datasets: [ {
                            label: 'Genres',
                            data: genreChartData.map(e => e.entries),
                            backgroundColor: genreChartData.map(e => e.color),
                        } ]
                    }"></Pie>
                </div>
            </div>

            <h2>By users</h2>
            <div class="statsEntry" v-if="dialogOpen === true">
                <div>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Number of animes</th>
                                <th>Color</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="g in userChartData">
                                <td>{{ g.name }}</td>
                                <td>{{ g.entries }}</td>
                                <td :style="`background-color: ${g.color};`"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="chart">
                    <Pie v-if="data && data.genres && props.animes" id="genreChart" :options="{
                        responsive: true,
                    }"
                    :data="{
                        labels: userChartData.map(e => e.name),
                        datasets: [ {
                            label: 'Watched animes',
                            data: userChartData.map(e => e.entries),
                            backgroundColor: userChartData.map(e => e.color),
                        } ]
                    }"></Pie>
                </div>
            </div>
        </Dialog>
</template>

<style>
#statsButton {
    cursor: pointer;
}

.statsEntry {
    display: flex;
    justify-content: space-around;
}

.chart {
    width: 30%;
}

@media screen and ((max-width: 1005px) or (orientation: portrait)) {
    .statsEntry {
        flex-direction: column-reverse;
    }

    .chart {
        width: 100%;
        margin-bottom: 20px;
    }

    .table {
        width: 100%;
    }
}
</style>