import { defineStore } from 'pinia';

/**
 * "See more" dialog state.
 */
export const useSeeMoreStore = defineStore('seeMore', {
    state: () => ({
        /**
         * The anime to display.
         */
        anime: {
            titles: {
                en: '',
                ja: '',
                original: '',
            },
            cover: '',
            id: -1,
            type: '',
            status: '',
            type: '',
            wasWatched: false,
            scores: {},
            rating: 0,
        },

        /**
         * Whether or not the dialog is visible.
         */
        visible: false,
    }),
});