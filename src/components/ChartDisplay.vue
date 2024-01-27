<script setup lang="ts">

import type { ChartEntry } from '@/Types';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, PieController } from 'chart.js';

// Set up ChartJS.
ChartJS.register(ArcElement, Tooltip, PieController);

const props = defineProps<{
    /**
     * The data to display.
     */
    chartData: ChartEntry[],

    /**
     * The label of the chart.
     */
    label: string,
}>();

</script>

<template>
    <div class="statsEntry">
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
                    <tr v-for="g in props.chartData">
                        <td>{{ g.name }}</td>
                        <td>{{ g.entries }}</td>
                        <td :style="`background-color: ${g.color};`"></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="chart">
            <Pie v-if="chartData" id="genreChart" :options="{
                responsive: true,
            }"
            :data="{
                labels: chartData.map(e => e.name),
                datasets: [ {
                    label: props.label,
                    data: chartData.map(e => e.entries),
                    backgroundColor: chartData.map(e => e.color),
                } ]
            }"></Pie>
        </div>
    </div>
</template>

<style>
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
        align-self: center;
        width: 90%;
        margin-bottom: 20px;
    }

    .table {
        width: 100%;
    }
}
</style>