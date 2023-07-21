import { defineStore } from "pinia";

/**
 * Data state
 */
export const useDataStore = defineStore("data", {
    state: () => ({
        /**
         * Primary data source, coming from Tiralex1's API
         */
        primary: localStorage.getItem('data:primary') !== null ? tryParseJSON(localStorage.getItem('data:primary')) : null,

        /**
         * Secondary data source, coming from the MyAnimeList API
         */
        secondary: localStorage.getItem('data:secondary') !== null ? tryParseJSON(localStorage.getItem('data:secondary')) : null,
    }),
    actions: {
        /**
         * Set and save the primary data source to local storage
         * @param {Object} data Data loaded from Tiralex1's API
         */
        setPrimary(data) {
            this.primary = data;
            localStorage.setItem('data:primary', JSON.stringify(data));
        },

        /**
         * Set and save the secondary data source to local storage
         * @param {Object} data Data loaded from the MyAnimeList API
         */
        setSecondary(data) {
            this.secondary = data;
            localStorage.setItem('data:secondary', JSON.stringify(data));
        },
    }
});

/**
 * Try to parse a JSON string, return null if it fails.
 * @param {String} json A JSON string
 * @returns A JSON object or null if the string is not valid JSON
 */
function tryParseJSON(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        console.error(e);
        return null;
    }
}