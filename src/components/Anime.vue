<script setup>

import Song from './Song.vue';
import { computed } from 'vue';

const props = defineProps({
    anime: Object,
});

const openings = computed(() => props.anime.musique.filter(m => m.type === 'Opening'));
const endings = computed(() => props.anime.musique.filter(m => m.type === 'Ending'));
const inserts = computed(() => props.anime.musique.filter(m => m.type === 'Insert Song'));

function pluralize(count, singular, plural) {
    if (count === 1) {
        return singular;
    }

    return plural;
}

</script>

<template>
    <div class="anime">
        <h2><a :href="props.anime.lien">{{ props.anime.nom }}</a></h2>

        <table class="watchedTable">
            <tbody>
                <tr>
                    <td :class="props.anime.users[0].A === 1 ? 'watched' : 'notWatched'">A</td>
                    <td :class="props.anime.users[0].C === 1 ? 'watched' : 'notWatched'">C</td>
                    <td :class="props.anime.users[0].L === 1 ? 'watched' : 'notWatched'">L</td>
                    <td :class="props.anime.users[0].V === 1 ? 'watched' : 'notWatched'">V</td>
                    <td :class="props.anime.users[0].T === 1 ? 'watched' : 'notWatched'">T</td>
                </tr>
            </tbody>
        </table>

        <small>{{ `${props.anime.nb_musique} ${pluralize(props.anime.nb_musique, 'entry', 'entries')}` }}</small>

        <div class="mobile-fill-width">
            <div v-if="openings.length !== 0" class="songs">
                <h3>{{ pluralize(openings.length, 'Opening', 'Openings') }}</h3>
                <Song v-for="song in openings" :key="song.nom" :song="song" />
            </div>

            <div v-if="endings.length !== 0" class="songs">
                <h3>{{ pluralize(endings.length), 'Ending', 'Endings' }}</h3>
                <Song v-for="song in endings" :key="song.nom" :song="song" />
            </div>

            <div v-if="inserts.length !== 0" class="songs">
                <h3>{{ pluralize(inserts.length, 'Insert', 'Inserts') }}</h3>
                <Song v-for="song in inserts" :key="song.nom" :song="song" />
            </div>
        </div>
    </div>
</template>

<style>
.anime {
    display: flex;
    align-items: center;
    flex-direction: column;

    width: fit-content;

    border: 1px solid lightslategray;
    border-radius: 5px;

    padding: 5px;
    margin: 5px;
    margin-bottom: 30px;
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

.watchedTable {
    margin-top: 5px;
    margin-bottom: 5px;
}

.songs {
    border-bottom: 1px dotted lightslategray;
    margin-top: 5px;
    padding-bottom: 5px;
}

.songs:last-child {
    border-bottom: none;
}

@media screen and (max-width: 450px) {
    .anime {
        width: 100%;
        border: unset;
        border-bottom: 1px solid lightslategray;
        border-radius: unset;
    }

    .songs {
        margin-left: 5px;
        margin-right: 5px;
    }
}
</style>