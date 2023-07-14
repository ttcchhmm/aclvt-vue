<script setup>

import { storeToRefs } from 'pinia';
import { useVideoStore } from '../stores/VideoStore';
import { watch, ref, onMounted } from 'vue';

/**
 * The video player state.
 */
const videoStore = useVideoStore();

const { visible, url, title, artist } = storeToRefs(videoStore);

/**
 * The dialog reference.
 */
const dialogRef = ref(null);

/**
 * A reference to the video element.
 */
const videoRef = ref(null);

/*
 * Watch for changes to the visible state, and open/close the dialog accordingly.
 */
watch(visible, (newVal) => {
    if(newVal) {
        dialogRef.value.showModal();
        videoRef.value.play();
    } else {
        dialogRef.value.close();
        videoRef.value.pause();
    }
});

onMounted(() => {
    // When the video is ready to play, start playing it.
    videoRef.value.addEventListener('canplay', () => {
        videoRef.value.play();
    });

    // When the dialog is closed, hide the video player.
    dialogRef.value.addEventListener('close', (e) => {
        videoStore.$patch({ visible: false });
    });
});

</script>

<template>
    <dialog ref="dialogRef" id="videoDialog">
        <div class="dialogHeader">
            <div>
                <h2>{{ title }}</h2>
                <small>{{ artist }}</small>
            </div>

            <img @click="videoStore.$patch({ visible: false })" src="@/assets/close.svg" alt="Close" height="30" width="30">
        </div>

        <div id="videoDialogContent">
            <video id="videoPlayer" controls :src="url" ref="videoRef"></video>
        </div>
    </dialog>
</template>

<style>
#videoPlayer {
    height: 100%;
    width: 100%;

    max-height: 500px;
}

#videoDialogContent {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

#videoDialog {
    width: fit-content;
}
</style>