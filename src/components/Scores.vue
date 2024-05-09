<script setup lang="ts">

import { type Scores, type UserEntry } from '../Types';

/**
 * The props for this component.
 */
const props = defineProps<{
    /**
     * The scores to display.
     */
    scores: Scores;
}>();

function getStatusClass(entry: UserEntry | undefined) {
    if(entry == undefined) {
        return 'notWatched';
    } else {
        switch(entry.status) {
            case 'watching':
                return 'watching';

            case 'completed':
                return 'watched';

            case 'on_hold':
                return 'onHold';

            case 'dropped':
                return 'dropped';

            case 'plan_to_watch':
                return 'planToWatch';

            default:
                return 'notWatched';
        }
    }
}

function displayMoreDetails(name: string, entry: UserEntry | undefined) {
    let msg = `${name}\n`;

    if(entry != undefined) {
        // Score
        if(entry.rating == undefined || entry.rating == 0) {
            msg += '\n- Not scored';
        } else {
            msg += `\n- Scored ${entry.rating}/10`;
        }

        // Status
        switch(entry.status) {
            case 'watching': {
                msg += '\n- Currently watching';
                break;
            }

            case 'completed': {
                msg += '\n- Finished';
                break;
            }

            case 'on_hold': {
                msg += '\n- On hold';
                break;
            }

            case 'dropped': {
                msg += '\n- Dropped';
                break;
            }

            case 'plan_to_watch': {
                msg += '\n- Plan to watch';
                break;
            }
        }
    } else {
        msg += '\n- Not watched';
    }

    alert(msg);
}

</script>

<template>
    <table class="watchedTable" v-once>
        <tbody>
            <tr>
                <td class="cursorHelp" :class="getStatusClass(props.scores.A)" @click="displayMoreDetails('Alexis', props.scores.A)" title="Alexis">A <span v-if="props.scores.A !== undefined && props.scores.A.rating !== undefined">{{ props.scores.A.rating }}</span></td>
                <td class="cursorHelp" :class="getStatusClass(props.scores.C)" @click="displayMoreDetails('Cyprien', props.scores.C)" title="Cyprien">C <span v-if="props.scores.C !== undefined && props.scores.C.rating !== undefined">{{ props.scores.C.rating }}</span></td>
                <td class="cursorHelp" :class="getStatusClass(props.scores.L)" @click="displayMoreDetails('Léonard', props.scores.L)" title="Léonard">L <span v-if="props.scores.L !== undefined && props.scores.L.rating !== undefined">{{ props.scores.L.rating }}</span></td>
                <td class="cursorHelp" :class="getStatusClass(props.scores.V)" @click="displayMoreDetails('Victor', props.scores.V)" title="Victor">V <span v-if="props.scores.V !== undefined && props.scores.V.rating !== undefined">{{ props.scores.V.rating }}</span></td>
                <td class="cursorHelp" :class="getStatusClass(props.scores.T)" @click="displayMoreDetails('Tom', props.scores.T)" title="Tom">T <span v-if="props.scores.T !== undefined && props.scores.T.rating !== undefined">{{ props.scores.T.rating }}</span></td>
                <td class="cursorHelp" :class="getStatusClass(props.scores.Q)" @click="displayMoreDetails('Quentin', props.scores.Q)" title="Quentin">Q <span v-if="props.scores.Q !== undefined && props.scores.Q.rating !== undefined">{{ props.scores.Q.rating }}</span></td>
            </tr>
        </tbody>
    </table>
</template>

<style>
.planToWatch {
    background-color: lightskyblue;
}

.onHold {
    background-color: lightsalmon;
}

.watched {
    background-color: lightgreen;
}

.watching {
    background-color: greenyellow;
}

.dropped {
    background-color: violet;
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