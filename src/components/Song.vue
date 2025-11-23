<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { type Music } from '../Types';
import { useVideoStore } from '../stores/VideoStore';
import { useSearchStore } from '@/stores/SearchStore';
import { computed } from 'vue';

/**
 * The props for this component.
 */
const props = defineProps<{
    /**
     * The song to display.
     */
    song: Music;
}>();

const videoStore = useVideoStore();

const { search, searchType } = storeToRefs(useSearchStore()); 

/**
 * Whether or not the song should be highlighted.
 */
const shouldHighlight = computed(() => {
    if(search.value.trim().length === 0) return false;

    return (searchType.value === 'artist' && props.song.artist.toLowerCase().includes(search.value.toLowerCase())) ||
           (searchType.value === 'song' && props.song.name.toLowerCase().includes(search.value.toLowerCase()));
})

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
<div :class="shouldHighlight ? 'songDetails songHighlight' : 'songDetails'">
    <div v-once>
        <h4>{{ props.song.name }}</h4>
        <h5>{{ props.song.artist }}</h5>
    </div>

    <img v-if="props.song.link" v-once @click="playVideo" src="@/assets/play.svg" alt="Play video" class="svgFix playButton" :title="`Watch ${props.song.name} by ${props.song.artist}`" height="30" width="30">
    <img v-else v-once src="@/assets/error.svg" alt="Missing video" class="svgFix" title="Missing video file" height="30" width="30">
</div>
</template>

<style>
h4, h5 {
    margin: 0;
    max-width: 250px;

    hyphens: auto;
    -webkit-hyphens: auto;

    word-wrap: break-word;
}

.songDetails {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-bottom: 10px;

    padding: 5px;
}

.songDetails img {
    margin-left: 10px;
}

.playButton {
    cursor: pointer;
}

.songHighlight {
    background-color: rgba(130, 130, 0, 0.5);
    border-radius: 5px;
}
</style>