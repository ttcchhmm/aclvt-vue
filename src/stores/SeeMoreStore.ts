import { defineStore } from 'pinia';
import { type AnimeBase } from '../Types';

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
            type: 'tv',
            status: 'currently_airing',
            wasWatched: false,
            scores: {},
            rating: 0,
            studios: [],
            genres: [],
            music: [],
            oldestUpdate: '',
            startDate: '',
        } as AnimeBase,

        /**
         * Whether or not the dialog is visible.
         */
        visible: false,
    }),
});