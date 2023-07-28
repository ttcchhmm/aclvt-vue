import { defineStore } from "pinia";

/**
 * Data state
 */
export const useDataStore = defineStore("data", {
    state: () => ({
        /**
         * The data loaded from the API
         */
        data: localStorage.getItem('data') !== null ? tryParseJSON(localStorage.getItem('data')) : null
    }),
    actions: {
        setData(data) {
            this.data = data;
            localStorage.setItem('data', JSON.stringify(data));
        }
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

// Remove traces of the V1 API
if(localStorage.getItem('data:primary') !== null) {
    localStorage.removeItem('data:primary');
}

if(localStorage.getItem('data:secondary') !== null) {
    localStorage.removeItem('data:secondary');
}