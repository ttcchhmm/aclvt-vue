<script setup>

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
        url: props.song.link,
        title: props.song.name,
        artist: props.song.artist,
    });
}

</script>

<template>
<div class="songDetails">
    <div>
        <h4>{{ props.song.name }}</h4>
        <h5>{{ props.song.artist }}</h5>
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