import { defineStore, storeToRefs } from 'pinia';
import { watch } from 'vue';

/**
 * Settings state
 */
export const useSettingsStore = defineStore('settings', {
    state: () => ({
        /**
         * The header color
         * 
         * @type {string}
         */
        headerColor: localStorage.getItem('headerColor') || '#00bfff',

        /**
         * Whether to colorize links
         * 
         * @type {boolean}
         */
        colorizeLinks: localStorage.getItem('colorizeLinks') === 'true',

        /**
         * The anime language
         * 
         * @type {'original' | 'en' | 'jp'}
         */
        animeLanguage: localStorage.getItem('animeLanguage') || 'original',
    }),
});

/**
 * Setup the settings store. Should be called in the main app component at startup.
 */
export function setupSettings() {
    const settingsStore = useSettingsStore();
    const { headerColor, colorizeLinks, animeLanguage } = storeToRefs(settingsStore);
    
    watch(headerColor, save);
    watch(colorizeLinks, save);
    watch(animeLanguage, save);
}

/**
 * Save the settings to local storage.
 */
function save() {
    const settingsStore = useSettingsStore();

    localStorage.setItem('headerColor', settingsStore.headerColor);
    localStorage.setItem('colorizeLinks', settingsStore.colorizeLinks);
    localStorage.setItem('animeLanguage', settingsStore.animeLanguage);
}

// Clear the old settings
if(localStorage.getItem('orderByOriginalName') !== null) {
    localStorage.removeItem('orderByOriginalName');
}

if(localStorage.getItem('sortByMAL') !== null) {
    localStorage.removeItem('sortByMAL');
}