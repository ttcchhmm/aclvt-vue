<script setup>

import { onMounted } from 'vue';
import { useVideoStore } from '../stores/VideoStore';

/**
 * The props for this component.
 */
const props = defineProps({
    /**
     * The song to display.
     */
    song: Object,
});

const videoStore = useVideoStore();

function playVideo() {
    videoStore.$patch({
        visible: true,
        url: props.song.lien,
        title: props.song.nom,
        artist: props.song.artiste,
    });
}

</script>

<template>
<div class="songDetails">
    <div>
        <h4>{{ props.song.nom }}</h4>
        <h5>{{ props.song.artiste }}</h5>
    </div>

    <img @click="playVideo" src="@/assets/play.svg" alt="Play video" class="svgFix" height="30" width="30" role="button">
</div>
</template>

<style>
h4, h5 {
    margin: 0;
    max-width: 250px;
    hyphens: auto;
    word-wrap: break-word;
}

.songDetails {
    display: flex;
    justify-content: space-between;

    margin-bottom: 10px;
}

.songDetails img {
    margin-left: 10px;
}
</style>