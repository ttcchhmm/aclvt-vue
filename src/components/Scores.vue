<script setup lang="ts">

import { type Scores } from '../Types';

/**
 * The props for this component.
 */
const props = defineProps<{
    /**
     * The scores to display.
     */
    scores: Scores;
}>();

</script>

<template>
    <table class="watchedTable" v-once>
        <tbody>
            <tr>
                <td class="cursorHelp" :class="props.scores.A !== undefined ? 'watched' : 'notWatched'" title="Alexis">A <span v-if="props.scores.A !== undefined && props.scores.A.rating !== undefined">{{ props.scores.A.rating }}</span></td>
                <td class="cursorHelp" :class="props.scores.C !== undefined ? 'watched' : 'notWatched'" title="Cyprien">C <span v-if="props.scores.C !== undefined && props.scores.C.rating !== undefined">{{ props.scores.C.rating }}</span></td>
                <td class="cursorHelp" :class="props.scores.L !== undefined ? 'watched' : 'notWatched'" title="Léonard">L <span v-if="props.scores.L !== undefined && props.scores.L.rating !== undefined">{{ props.scores.L.rating }}</span></td>
                <td class="cursorHelp" :class="props.scores.V !== undefined ? 'watched' : 'notWatched'" title="Victor">V <span v-if="props.scores.V !== undefined && props.scores.V.rating !== undefined">{{ props.scores.V.rating }}</span></td>
                <td class="cursorHelp" :class="props.scores.T !== undefined ? 'watched' : 'notWatched'" title="Tom">T <span v-if="props.scores.T !== undefined && props.scores.T.rating !== undefined">{{ props.scores.T.rating }}</span></td>
                <td class="cursorHelp" :class="props.scores.Q !== undefined ? 'watched' : 'notWatched'" title="Quentin">Q <span v-if="props.scores.Q !== undefined && props.scores.Q.rating !== undefined">{{ props.scores.Q.rating }}</span></td>
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