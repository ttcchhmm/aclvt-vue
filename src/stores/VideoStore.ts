import { defineStore } from 'pinia';

/**
 * Video player state
 */
export const useVideoStore = defineStore('video', {
    state: () => ({
        /**
         * Whether the video player is visible
         */
        visible: false,

        /**
         * The video URL
         */
        url: '',

        /**
         * The video title
         */
        title: '',

        /**
         * The artist name
         */
        artist: '',
    }),
});