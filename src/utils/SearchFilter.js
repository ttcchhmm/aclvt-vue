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
 * @param {Object} alternativeTitles The alternative titles of the animes.
 * @returns A function that takes an anime as a parameter and returns whether it should be displayed or not.
 */
export function getFilterAnimes(search, searchType, searchAiringFilter, searchTypeFilter, listFilterType, checkTiralex, checkCycy, checkLeo, checkGyrehio, checktchm, checkqgWolf, maxAgeRating, genres, alternativeTitles) {
    return (a) => {
        // Check the age rating.
        if(a.rating > maxAgeRating) {
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
 * Check whether an anime has been watched by a user.
 * @param {number | undefined} score The score given by a user.
 * @returns True if the anime has been watched by the user, false otherwise.
 */
function watched(score) {
    return score !== undefined;
}