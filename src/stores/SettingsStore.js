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
        colorizeLinks: localStorage.getItem('colorizeLinks') === 'true' || false,

        /**
         * The anime language
         * 
         * @type {'original' | 'en' | 'jp'}
         */
        animeLanguage: localStorage.getItem('animeLanguage') || 'original',

        /**
         * Whether to order anime by original name
         */
        orderByOriginalName: localStorage.getItem('orderByOriginalName') === 'true' || true,
    }),
});

/**
 * Setup the settings store. Should be called in the main app component at startup.
 */
export function setupSettings() {
    const settingsStore = useSettingsStore();
    const { headerColor, colorizeLinks, animeLanguage, orderByOriginalName } = storeToRefs(settingsStore);
    
    watch(headerColor, save);
    watch(colorizeLinks, save);
    watch(animeLanguage, save);
    watch(orderByOriginalName, save);
}

/**
 * Save the settings to local storage.
 */
function save() {
    localStorage.setItem('headerColor', headerColor.value);
    localStorage.setItem('colorizeLinks', colorizeLinks.value);
    localStorage.setItem('animeLanguage', animeLanguage.value);
    localStorage.setItem('orderByOriginalName', orderByOriginalName.value);
}