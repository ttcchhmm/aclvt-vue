import { defineStore } from 'pinia';
import { type AiringStatus, type Rating, type UserStatus } from '../Types';

/**
 * Search store.
 */
export const useSearchStore = defineStore('search', {
    state: () => ({
        /**
         * Whether or not Tiralex's list should be displayed.
         */
        checkTiralex: true,

        /**
         * Whether or not the Cycy's list should be displayed.
         */
        checkCycy: true,

        /**
         * Whether or not Leo's list should be displayed.
         */
        checkLeo: true,

        /**
         * Whether or not Gyrehio's list should be displayed.
         */
        checkGyrehio: true,

        /**
         * Whether or not tchm's list should be displayed.
         */
        checktchm: true,

        /**
         * Whether or not QGWolfWarrior's list should be displayed.
         */
        checkqgWolf: true,

        /**
         * The type of list filter.
         */
        listFilterType: 'union' as 'union' | 'intersect' | 'strict',

        /**
         * The search query.
         */
        search: '',

        /**
         * The search type.
         */
        searchType: 'anime' as 'anime' | 'song' | 'artist' | 'id',

        /**
         * The search airing filter.
         */
        searchAiringFilter: ['currently_airing', 'finished_airing'] as AiringStatus[],

        /**
         * The user status filter.
         */
        userStatusFilter: ['completed', 'watching'] as UserStatus[],

        /**
         * The search type filter.
         */
        searchTypeFilter: [] as string[],

        /**
         * The search age rating filter.
         */
        maxAgeRating: 4 as Rating,

        /**
         * The searched genres.
         */
        selectedGenres: [] as string[],

        /**
         * The searched studios.
         */
        selectedStudios: [] as string[],

        /**
         * The sort type.
         */
        sortType: 'mal' as SortType,

        /**
         * The minimum number of songs.
         */
        minSongsCount: 0,

        /**
         * The maximum number of songs.
         */
        maxSongsCount: 0,

        /**
         * Whether to reverse the display order or not.
         */
        reverseOrder: false,
    }),
});

/**
 * The sort type.
 */
export type SortType = 'mal' | 'title' | 'score' | 'start-date' | 'watch-count' | 'add-date' | 'song-count' | 'score-list' | 'score-mal';