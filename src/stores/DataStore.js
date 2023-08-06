import { defineStore } from "pinia";

/**
 * Data state
 */
export const useDataStore = defineStore("data", {
    state: () => ({
        /**
         * The data loaded from the API
         */
        data: null
    }),
    actions: {
        setData(data) {
            this.data = data;
        }
    }
});

// Remove traces of the V1 API
if(localStorage.getItem('data:primary') !== null) {
    localStorage.removeItem('data:primary');
}

if(localStorage.getItem('data:secondary') !== null) {
    localStorage.removeItem('data:secondary');
}

// Remove traces of the pre-PWA builds
if(localStorage.getItem('data') !== null) {
    localStorage.removeItem('data');
}