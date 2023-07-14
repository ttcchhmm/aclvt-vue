import { defineStore } from 'pinia';

/**
 * Video player state
 */
export const useVideoStore = defineStore('video', {
    state: () => ({
        /**
         * Whether the video player is visible
         * 
         * @type {boolean}
         */
        visible: false,

        /**
         * The video URL
         * 
         * @type {string}
         */
        url: '',

        /**
         * The video title
         * 
         * @type {string}
         */
        title: '',

        /**
         * The artist name
         * 
         * @type {string}
         */
        artist: '',
    }),
});