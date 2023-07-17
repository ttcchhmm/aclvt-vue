import { defineStore } from 'pinia';

/**
 * Search store.
 */
export const useSearchStore = defineStore('search', {
    state: () => ({
        /**
         * Whether or not Tiralex's list should be displayed.
         * 
         * @type {boolean}
         */
        checkTiralex: true,

        /**
         * Whether or not the Cycy's list should be displayed.
         * 
         * @type {boolean}
         */
        checkCycy: true,

        /**
         * Whether or not Leo's list should be displayed.
         * 
         * @type {boolean}
         */
        checkLeo: true,

        /**
         * Whether or not Gyrehio's list should be displayed.
         * 
         * @type {boolean}
         */
        checkGyrehio: true,

        /**
         * Whether or not tchm's list should be displayed.
         * 
         * @type {boolean}
         */
        checktchm: true,

        /**
         * The type of list filter.
         * 
         * @type {'union' | 'intersect' | 'strict'}
         */
        listFilterType: 'union',

        /**
         * The search query.
         * 
         * @type {string}
         */
        search: '',

        /**
         * The search type.
         * 
         * @type {'anime' | 'song' | 'artist'}
         */
        searchType: 'anime',

        /**
         * The search airing filter.
         * 
         * @type {'any' | 'airing' | 'finished'}
         */
        searchAiringFilter: 'any',

        /**
         * The search type filter.
         * 
         * @type {string[]}
         */
        searchTypeFilter: [],
    }),
});