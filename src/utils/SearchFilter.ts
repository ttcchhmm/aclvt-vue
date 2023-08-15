import { storeToRefs } from 'pinia';
import { type SortType, useSearchStore } from '../stores/SearchStore';
import { useSettingsStore } from '../stores/SettingsStore';
import { type AnimeBase } from '../Types';

/**
 * Get a function that filters animes based on the search query, the search type, the airing filter, the type filter and the list filter.
 * 
 * @param alternativeTitles The alternative titles of the animes.
 * @returns A function that takes an anime as a parameter and returns whether it should be displayed or not.
 */
export function getFilterAnimes(alternativeTitles: Map<number, string[]>) {
    const {
        search,
        searchType,
        searchAiringFilter,
        searchTypeFilter,
        listFilterType,
        checkTiralex,
        checkCycy,
        checkLeo,
        checkGyrehio,
        checktchm,
        checkqgWolf,
        maxAgeRating,
        selectedGenres,
        selectedStudios,
        minSongsCount,
        maxSongsCount, 
    } = storeToRefs(useSearchStore());

    return (a: AnimeBase) => {
        // Check the age rating.
        if(a.rating > maxAgeRating.value) {
            return false;
        }

        // Check the number of songs.
        if(a.music.length < minSongsCount.value || a.music.length > maxSongsCount.value) {
            return false;
        }

        // Check the genres.
        if(selectedGenres.value.length !== 0) {
            for(const genre of selectedGenres.value) {
                if(!a.genres.includes(genre)) {
                    return false;
                }
            }
        }

        // Check the studios.
        if(selectedStudios.value.length !== 0) {
            if(!selectedStudios.value.some(s => a.studios.includes(s))) {
                return false;
            }
        }

        // If a search query is present, filter based on it.
        if(search.value.trim().length > 0) {
            switch(searchType.value) {
                case 'anime':
                    if(!alternativeTitles.get(a.id)?.some(t => t.toLowerCase().includes(search.value.toLowerCase()))) {
                        return false;
                    }

                    break;
                
                case 'song':
                    if(!a.music?.some(m => m.name.toLowerCase().includes(search.value.toLowerCase()))) {
                        return false;
                    }

                    break;
                
                case 'artist':
                    if(!a.music?.some(m => m.artist?.toLowerCase().includes(search.value.toLowerCase()))) {
                        return false;
                    }

                    break;
            }
        }

        // If an airing filter is present, filter based on it.
        if(searchAiringFilter.value !== 'any') {
            switch(searchAiringFilter.value) {
                case 'airing':
                    if(a.status !== 'currently_airing') {
                        return false;
                    }

                    break;
                
                case 'finished':
                    if(a.status !== 'finished_airing') {
                        return false;
                    }

                    break;
            }
        }

        // If a type filter is present, filter based on it.
        if(searchTypeFilter.value.length !== 0) {
            if(!searchTypeFilter.value.includes(a.type)) {
                return false;
            }
        }

        // Checkboxes filter.
        if(listFilterType.value !== 'strict') {
            let display = listFilterType.value === 'intersect';

            if(checkTiralex.value) {
                if(listFilterType.value === 'union') {
                    if(watched(a.scores.A)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.A)) {
                        return false;
                    }
                }
            }

            if(checkCycy.value) {
                if(listFilterType.value === 'union') {
                    if(watched(a.scores.C)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.C)) {
                        return false;
                    }
                }
            }

            if(checkLeo.value) {
                if(listFilterType.value === 'union') {
                    if(watched(a.scores.L)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.L)) {
                        return false;
                    }
                }
            }

            if(checkGyrehio.value) {
                if(listFilterType.value === 'union') {
                    if(watched(a.scores.V)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.V)) {
                        return false;
                    }
                }
            }

            if(checktchm.value) {
                if(listFilterType.value === 'union') {
                    if(watched(a.scores.T)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.T)) {
                        return false;
                    }
                }
            }

            if(checkqgWolf.value) {
                if(listFilterType.value === 'union') {
                    if(watched(a.scores.Q)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.Q)) {
                        return false;
                    }
                }
            }

            return display;
        } else { // Strict match
            return checkTiralex.value === watched(a.scores.A) &&
                    checkCycy.value === watched(a.scores.C) &&
                    checkLeo.value === watched(a.scores.L) &&
                    checkGyrehio.value === watched(a.scores.V) &&
                    checktchm.value === watched(a.scores.T) &&
                    checkqgWolf.value === watched(a.scores.Q);
        }
    };
}

/**
 * Get a sorting function for animes.
 * @param sortType The type of sorting to apply.
 */
export function sortAnimes(sortType: SortType) {
    switch(sortType) {
        // MyAnimeList order.
        default:
        case 'mal':
            return () => 0;

        // Title order.
        case 'title':
            switch(useSettingsStore().animeLanguage) {
                case 'en': // English
                    return (a: AnimeBase, b: AnimeBase) => {
                        const aTitle = a.titles.en || a.titles.original;
                        const bTitle = b.titles.en || b.titles.original;
                
                        return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });
                    }

                case 'ja': // Japanese
                    return (a: AnimeBase, b: AnimeBase) => {
                        const aTitle = a.titles.ja || a.titles.original;
                        const bTitle = b.titles.ja || b.titles.original;
                
                        return aTitle.localeCompare(bTitle, 'ja', { ignorePunctuation: true, numeric: true });
                    }

                default:
                case 'original': // Romaji
                    return (a: AnimeBase, b: AnimeBase) => {
                        const aTitle = a.titles.original;
                        const bTitle = b.titles.original;
                
                        return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });
                    }
            }

        // Score order.
        case 'score':
            return (a: AnimeBase, b: AnimeBase) => {
                const aScore = getAverageScore(a);
                const bScore = getAverageScore(b);

                if(aScore === undefined) {
                    return 1;
                } else if(bScore === undefined) {
                    return -1;
                } else {
                    return bScore - aScore;
                }
            }

        // Start date order.
        case 'start-date':
            return (a: AnimeBase, b: AnimeBase) => {
                const aDate = new Date(a.startDate);
                const bDate = new Date(b.startDate);

                return (aDate as unknown as number) - (bDate as unknown as number); // Cast to number to avoid TS errors.
            }

        // Watch count order.
        case 'watch-count':
            return (a: AnimeBase, b: AnimeBase) => {
                const aWatchCount = Object.values(a.scores).filter(s => s !== undefined).length;
                const bWatchCount = Object.values(b.scores).filter(s => s !== undefined).length;

                return bWatchCount - aWatchCount;
            }

        case 'add-date':
            return (a: AnimeBase, b: AnimeBase) => {
                const aDate = new Date(a.oldestUpdate);
                const bDate = new Date(b.oldestUpdate);

                return (aDate as unknown as number) - (bDate as unknown as number); // Cast to number to avoid TS errors.
            }

        // Song count order.
        case 'song-count':
            return (a: AnimeBase, b: AnimeBase) => {
                const aCount = a.music.length;
                const bCount = b.music.length;

                return bCount - aCount;
            }

    }
}

/**
 * Check whether an anime has been watched by a user.
 * @param score The score given by a user.
 * @returns True if the anime has been watched by the user, false otherwise.
 */
function watched(score: number | undefined): boolean {
    return score !== undefined;
}

/**
 * Return the average score of an anime.
 * @param a An anime.
 */
function getAverageScore(a: AnimeBase) {
    // Get an array of all the scores. Remove undefined and 0 values as they either mean the anime has not been watched or not scored.
    const scores = Object.values(a.scores).filter(s => s !== undefined).filter(s => s !== 0);

    if(scores.length === 0) {
        return undefined;
    } else {
        return (scores.reduce((a, b) => a + b) / scores.length) + Object.values(a.scores).filter(s => s !== undefined).length / 1000;
    }
}