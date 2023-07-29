import { useSettingsStore } from '../stores/SettingsStore';

/**
 * Get the anime title, depending on the language setting.
 * @param {Object} anime The anime object.
 * @returns The anime title, depending on the language setting.
 */
export function getTitle(anime) {
    const settings = useSettingsStore();

    switch(settings.animeLanguage) {
        case 'original':
            return anime.titles.original || anime.titles.original;
        case 'en':
            return anime.titles.en || anime.titles.original;
        case 'ja':
            return anime.titles.ja || anime.titles.original;
        default:
            return anime.title.original;
    }
}

/**
 * Get the language code to use for the anime title.
 * @returns The language code to use for the anime title.
 */
export function getLangCode() {
    const settings = useSettingsStore();

    return settings.animeLanguage === 'ja' ? 'ja' : 'en'
}

/**
 * Get the anime type.
 * @param {Object} anime The anime object.
 * @returns The anime type.
 */
export function getType(anime) {
    if(anime === undefined || anime.type === undefined) return '';

    switch(anime.type) {
        case 'tv':
            return 'Series';
        case 'movie':
            return 'Movie';
        case 'ova':
            return 'Original Video Animation';
        case 'ona':
            return 'Original Net Animation';
        case 'special':
            return 'Special';
        case 'music':
            return 'Music';
        default:
            return '';
    }
}