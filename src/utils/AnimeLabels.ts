import { useSettingsStore } from '../stores/SettingsStore';
import { type AnimeBase, type Rating, type Source } from '../Types';

/**
 * Get the anime title, depending on the language setting.
 * @param anime The anime object.
 * @returns The anime title, depending on the language setting.
 */
export function getTitle(anime: AnimeBase) {
    const settings = useSettingsStore();

    switch(settings.animeLanguage) {
        case 'original':
            return anime.titles.original || anime.titles.original;
        case 'en':
            return anime.titles.en || anime.titles.original;
        case 'ja':
            return anime.titles.ja || anime.titles.original;
        default:
            return anime.titles.original;
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
 * @param anime The anime object.
 * @returns The anime type.
 */
export function getType(anime: AnimeBase) {
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

/**
 * Get the age rating of the anime.
 * @param rating The age rating of the anime.
 * @returns A string representing the age rating of the anime.
 */
export function getRating(rating: Rating) {
    switch(rating) {
        case 0:
            return 'All Ages';

        case 1:
            return 'Children';

        case 2:
            return '13 and older';

        case 3:
            return '17 - Violence and profanity';

        case 4:
            return '17 - Mild Nudity';

        case 5:
            return '18+ - Not Safe for Work';
    }
}

/**
 * Get the source in a displayable string.
 * @param source The source of the anime.
 * @returns The source in a displayable string.
 */
export function getSource(source: Source) {
    switch(source) {
        case 'other':
            return 'Other';
        
        case 'original':
            return 'Original';
        
        case 'manga':
            return 'Manga';
        
        case '4_koma_manga':
            return 'Yonkoma manga';
        
        case 'web_manga':
            return 'Web manga';
        
        case 'digital_manga':
            return 'Digital manga';
        
        case 'novel':
            return 'Novel';
        
        case 'light_novel':
            return 'Light novel';
        
        case 'visual_novel':
            return 'Visual novel';
        
        case 'game':
            return 'Game';
        
        case 'card_game':
            return 'Card game';
        
        case 'book':
            return 'Book';
        
        case 'picture_book':
            return 'Picture book';
        
        case 'radio':
            return 'Radio';
        
        case 'music':
            return 'Music';
    }
}