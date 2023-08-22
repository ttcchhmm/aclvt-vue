<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useVideoStore } from '../stores/VideoStore';
import { ref, onMounted, computed } from 'vue';
import Dialog from './Dialog.vue';

import PiPIcon from '@/assets/picture-in-picture.svg';

/**
 * The video player state.
 */
const videoStore = useVideoStore();

const { visible, url, title, artist } = storeToRefs(videoStore);

/**
 * A reference to the video element.
 */
const videoRef = ref<HTMLVideoElement | null>(null);

/**
 * True if the video is coming from a known CORS-compatible source.
 */
const isCorsCompatible = computed(() => url.value.startsWith('https://nl.catbox.video/'));

/**
 * True if the browser supports picture-in-picture mode.
 */
const isPipSupported = computed(() => 'exitPictureInPicture' in document);

onMounted(() => {
    // When the video is ready to play, start playing it.
    if(videoRef.value !== null) {
        videoRef.value.addEventListener('canplay', () => {
            if(visible.value && videoRef.value !== null) {
                videoRef.value.play();
            }
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

/**
 * Toggles picture-in-picture mode.
 */
function togglePictureInPicture() {
    if(isPipSupported && videoRef.value !== null) {
        if(document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else {
            videoRef.value.requestPictureInPicture();
        }
    }
}

/**
 * Called when the dialog is shown.
 */
function shown() {
    videoRef.value?.play();
}

/**
 * Called when the dialog is hidden.
 */
function hidden() {
    if(document.pictureInPictureElement) {
        document.exitPictureInPicture();
    }

    videoRef.value?.pause();
}

</script>

<template>
    <Dialog :title="title"
            :subtitle="artist"
            :visible="visible"
            :hide="() => videoStore.$patch({ visible: false })"
            :buttons="isPipSupported ? [
                    {
                        icon: PiPIcon,
                        alt: 'Toggle picture-in-picture mode',
                        action: togglePictureInPicture
                    }
                ] : []"
            :fit-content="true"
            @shown="shown"
            @closed="hidden">

        <div id="videoDialogContent">
            <video id="videoPlayer" controls :src="url" ref="videoRef" :crossorigin="isCorsCompatible ? 'anonymous' : undefined"></video>
        </div>
    </Dialog>
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
</style>