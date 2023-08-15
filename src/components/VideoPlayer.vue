<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useVideoStore } from '../stores/VideoStore';
import { watch, ref, onMounted, computed } from 'vue';

/**
 * The video player state.
 */
const videoStore = useVideoStore();

const { visible, url, title, artist } = storeToRefs(videoStore);

/**
 * The dialog reference.
 */
const dialogRef = ref<HTMLDialogElement | null>(null);

/**
 * A reference to the video element.
 */
const videoRef = ref<HTMLVideoElement | null>(null);

/**
 * True if the video is coming from a known CORS-compatible source.
 */
const isCorsCompatible = computed(() => url.value.startsWith('https://nl.catbox.video/'));

/*
 * Watch for changes to the visible state, and open/close the dialog accordingly.
 */
watch(visible, (newVal) => {
    if(dialogRef.value !== null && videoRef.value !== null) {
        if(newVal) {
            dialogRef.value.showModal();
            videoRef.value.play();
        } else {
            dialogRef.value.close();
            videoRef.value.pause();
        }
    }
});

onMounted(() => {
    // When the video is ready to play, start playing it.
    if(videoRef.value !== null) {
        videoRef.value.addEventListener('canplay', () => {
            if(visible.value && videoRef.value !== null) {
                videoRef.value.play();
            }
        });
    }

    // When the dialog is closed, hide the video player.
    if(dialogRef.value !== null) {
        dialogRef.value.addEventListener('close', (e) => {
            videoStore.$patch({ visible: false });
        });
    }

    // When the user presses the 'F' key, toggle fullscreen.
    // When the user presses the 'Space' key, toggle play/pause.
    document.addEventListener('keydown', (e) => {
        if(!visible.value || videoRef.value === null) return;

        if(e.key.toLowerCase() === 'f') {
            if(!document.fullscreenElement) {
                videoRef.value.requestFullscreen();
            } else {
                document.exitFullscreen();
            }

            e.preventDefault();
        } else if(e.key.toLowerCase() === ' ') {
            if(videoRef.value.paused) {
                videoRef.value.play();
            } else {
                videoRef.value.pause();
            }

            e.preventDefault();
        }
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
            <video id="videoPlayer" controls :src="url" ref="videoRef" :crossorigin="isCorsCompatible ? 'anonymous' : undefined"></video>
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