<script setup>

/**
 * The props for this component.
 */
const props = defineProps({
    /**
     * The scores to display.
     */
    scores: Object,
});

</script>

<template>
    <table class="watchedTable">
        <tbody>
            <tr>
                <td class="cursorHelp" :class="props.scores.A !== undefined ? 'watched' : 'notWatched'" title="Alexis">A <span v-if="props.scores.A !== undefined && props.scores.A !== 0">{{ props.scores['A'] }}</span></td>
                <td class="cursorHelp" :class="props.scores.C !== undefined ? 'watched' : 'notWatched'" title="Cyprien">C <span v-if="props.scores.C !== undefined && props.scores.C !== 0">{{ props.scores['C'] }}</span></td>
                <td class="cursorHelp" :class="props.scores.L !== undefined ? 'watched' : 'notWatched'" title="Léonard">L <span v-if="props.scores.L !== undefined && props.scores.L !== 0">{{ props.scores['L'] }}</span></td>
                <td class="cursorHelp" :class="props.scores.V !== undefined ? 'watched' : 'notWatched'" title="Victor">V <span v-if="props.scores.V !== undefined && props.scores.V !== 0">{{ props.scores['V'] }}</span></td>
                <td class="cursorHelp" :class="props.scores.T !== undefined ? 'watched' : 'notWatched'" title="Tom">T <span v-if="props.scores.T !== undefined && props.scores.T !== 0">{{ props.scores['T'] }}</span></td>
            </tr>
        </tbody>
    </table>
</template>

<style>
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
</style>