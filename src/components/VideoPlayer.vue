<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useVideoStore } from '../stores/VideoStore';
import { ref, onMounted, computed } from 'vue';
import Dialog from './Dialog.vue';

import PiPIcon from '@/assets/picture-in-picture.svg';
import SearchWebIcon from '@/assets/search-web.svg';

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

function searchOnYouTube() {
    const query = `${artist.value.replaceAll(' ', '+')}+${title.value.replaceAll(' ', '+')}`;
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
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
                    }, {
                        icon: SearchWebIcon,
                        alt: 'Search on YouTube',
                        action: searchOnYouTube,
                    }
                ] : [
                    {
                        icon: SearchWebIcon,
                        alt: 'Search on YouTube',
                        action: searchOnYouTube,
                    }
                ]"
            :fit-content="true"
            @shown="shown"
            @closed="hidden">

        <div id="videoDialogContent">
            <video id="videoPlayer" controls :src="url" ref="videoRef"></video>
        </div>
    </Dialog>
</template>

<style>
#videoPlayer {
    height: 100%;
    width: 100%;

    max-height: 700px;
}

#videoDialogContent {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>