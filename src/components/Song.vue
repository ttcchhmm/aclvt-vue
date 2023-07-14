<script setup>

import { ref } from 'vue';

/**
 * The props for this component.
 */
const props = defineProps({
    /**
     * The song to display.
     */
    song: Object,
});

/**
 * Whether or not the video is shown.
 */
const showVideo = ref(false);

</script>

<template>
<div class="songDetails" :class="showVideo ? 'videoShown' : ''">
    <div>
        <h4>{{ props.song.nom }}</h4>
        <h5>{{ props.song.artiste }}</h5>
    </div>
    <div class="video">
        <video controls autoplay :src="props.song.lien" v-if="showVideo"></video>
        <button @click="showVideo = !showVideo">{{ showVideo ? 'Hide' : 'Show' }} video</button>
    </div>
</div>
</template>

<style>
h4, h5 {
    margin: 0;
    max-width: 250px;
}

.songDetails {
    display: flex;
    justify-content: space-between;

    margin-bottom: 10px;
}

.video {
    display: flex;
    align-items: center;
    flex-direction: column;
}

.video video {
    width: calc(100% - 20px);
}

.video button {
    margin-left: 20px;
}

.videoShown {
    flex-direction: column;
}

.videoShown .video {
    margin-top: 15px;
}
</style>