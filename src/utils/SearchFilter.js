import { useSettingsStore } from '../stores/SettingsStore';

/**
 * Get a function that filters animes based on the search query, the search type, the airing filter, the type filter and the list filter.
 * 
 * @param {string} search The search query.
 * @param {string} searchType The search type, either 'anime', 'song' or 'artist'.
 * @param {string} searchAiringFilter The airing filter, either 'any', 'airing' or 'finished'.
 * @param {string[]} searchTypeFilter The type filter, either 'any', 'tv', 'ova', 'movie', 'special' or 'ona'.
 * @param {string} listFilterType The list filter type, either 'strict', 'union' or 'intersect'. 
 * @param {boolean} checkTiralex Whether to display animes from Tiralex's list.
 * @param {boolean} checkCycy Whether to display animes from Cycy's list.
 * @param {boolean} checkLeo Whether to display animes from Leo's list.
 * @param {boolean} checkGyrehio Whether to display animes from Gyrehio's list.
 * @param {boolean} checktchm Whether to display animes from tchm's list.
 * @param {boolean} checkqgWolf Whether to display animes from QGWolfWarrior's list.
 * @param {number} maxAgeRating The maximum age rating to display.
 * @param {string[]} genres The genres to display.
 * @param {string[]} studios The studios to display.
 * @param {number} minSongsCount The minimum number of songs to display.
 * @param {number} maxSongsCount The maximum number of songs to display.
 * @param {Object} alternativeTitles The alternative titles of the animes.
 * @returns A function that takes an anime as a parameter and returns whether it should be displayed or not.
 */
export function getFilterAnimes(search, searchType, searchAiringFilter, searchTypeFilter, listFilterType, checkTiralex, checkCycy, checkLeo, checkGyrehio, checktchm, checkqgWolf, maxAgeRating, genres, studios, minSongsCount, maxSongsCount, alternativeTitles) {
    return (a) => {
        // Check the age rating.
        if(a.rating > maxAgeRating) {
            return false;
        }

        // Check the number of songs.
        if(a.music?.length < minSongsCount || a.music?.length > maxSongsCount) {
            return false;
        }

        // Check the genres.
        if(genres.length !== 0) {
            for(const genre of genres) {
                if(!a.genres.includes(genre)) {
                    return false;
                }
            }
        }

        // Check the studios.
        if(studios.length !== 0) {
            if(!studios.some(s => a.studios.includes(s))) {
                return false;
            }
        }

        // If a search query is present, filter based on it.
        if(search.trim().length > 0) {
            switch(searchType) {
                case 'anime':
                    if(!alternativeTitles[a.id].some(t => t.toLowerCase().includes(search.toLowerCase()))) {
                        return false;
                    }

                    break;
                
                case 'song':
                    if(!a.music?.some(m => m.name.toLowerCase().includes(search.toLowerCase()))) {
                        return false;
                    }

                    break;
                
                case 'artist':
                    if(!a.music?.some(m => m.artist?.toLowerCase().includes(search.toLowerCase()))) {
                        return false;
                    }

                    break;
            }
        }

        // If an airing filter is present, filter based on it.
        if(searchAiringFilter !== 'any') {
            switch(searchAiringFilter) {
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
        if(searchTypeFilter.length !== 0) {
            if(!searchTypeFilter.includes(a.type)) {
                return false;
            }
        }

        // Checkboxes filter.
        if(listFilterType !== 'strict') {
            let display = listFilterType === 'intersect';

            if(checkTiralex) {
                if(listFilterType === 'union') {
                    if(watched(a.scores.A)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.A)) {
                        return false;
                    }
                }
            }

            if(checkCycy) {
                if(listFilterType === 'union') {
                    if(watched(a.scores.C)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.C)) {
                        return false;
                    }
                }
            }

            if(checkLeo) {
                if(listFilterType === 'union') {
                    if(watched(a.scores.L)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.L)) {
                        return false;
                    }
                }
            }

            if(checkGyrehio) {
                if(listFilterType === 'union') {
                    if(watched(a.scores.V)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.V)) {
                        return false;
                    }
                }
            }

            if(checktchm) {
                if(listFilterType === 'union') {
                    if(watched(a.scores.T)) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(!watched(a.scores.T)) {
                        return false;
                    }
                }
            }

            if(checkqgWolf) {
                if(listFilterType === 'union') {
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
            return checkTiralex === watched(a.scores.A) &&
                    checkCycy === watched(a.scores.C) &&
                    checkLeo === watched(a.scores.L) &&
                    checkGyrehio === watched(a.scores.V) &&
                    checktchm === watched(a.scores.T) &&
                    checkqgWolf === watched(a.scores.Q);
        }
    };
}

/**
 * Get a sorting function for animes.
 * @param { 'mal' | 'title' | 'score' | 'start-date' } sortType The type of sorting to apply.
 */
export function sortAnimes(sortType) {
    switch(sortType) {
        // MyAnimeList order.
        default:
        case 'mal':
            return () => 0;

        // Title order.
        case 'title':
            switch(useSettingsStore().animeLanguage) {
                case 'en': // English
                    return (a, b) => {
                        const aTitle = a.titles.en || a.titles.original;
                        const bTitle = b.titles.en || b.titles.original;
                
                        return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });
                    }

                case 'ja': // Japanese
                    return (a, b) => {
                        const aTitle = a.titles.ja || a.titles.original;
                        const bTitle = b.titles.ja || b.titles.original;
                
                        return aTitle.localeCompare(bTitle, 'ja', { ignorePunctuation: true, numeric: true });
                    }

                default:
                case 'original': // Romaji
                    return (a, b) => {
                        const aTitle = a.titles.original;
                        const bTitle = b.titles.original;
                
                        return aTitle.localeCompare(bTitle, 'en', { ignorePunctuation: true, numeric: true });
                    }
            }

        // Score order.
        case 'score':
            return (a, b) => {
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
            return (a, b) => {
                const aDate = new Date(a.startDate);
                const bDate = new Date(b.startDate);

                return aDate - bDate;
            }

        // Watch count order.
        case 'watch-count':
            return (a, b) => {
                const aWatchCount = Object.values(a.scores).filter(s => s !== undefined).length;
                const bWatchCount = Object.values(b.scores).filter(s => s !== undefined).length;

                return bWatchCount - aWatchCount;
            }

        case 'add-date':
            return (a, b) => {
                const aDate = new Date(a.oldestUpdate);
                const bDate = new Date(b.oldestUpdate);

                return aDate - bDate;
            }

        // Song count order.
        case 'song-count':
            return (a, b) => {
                const aCount = a.music.length;
                const bCount = b.music.length;

                return bCount - aCount;
            }

    }
}

/**
 * Check whether an anime has been watched by a user.
 * @param {number | undefined} score The score given by a user.
 * @returns True if the anime has been watched by the user, false otherwise.
 */
function watched(score) {
    return score !== undefined;
}

/**
 * Return the average score of an anime.
 * @param {Object} a An anime.
 */
function getAverageScore(a) {
    // Get an array of all the scores. Remove undefined and 0 values as they either mean the anime has not been watched or not scored.
    const scores = Object.values(a.scores).filter(s => s !== undefined).filter(s => s !== 0);

    if(scores.length === 0) {
        return undefined;
    } else {
        return (scores.reduce((a, b) => a + b) / scores.length) + Object.values(a.scores).filter(s => s !== undefined).length / 1000;
    }
}