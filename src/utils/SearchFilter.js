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
 * @param {Object} alternativeTitles The alternative titles of the animes.
 * @param {Object} secondaryData The secondary data JSON.
 * @returns A function that takes an anime as a parameter and returns whether it should be displayed or not.
 */
export function getFilterAnimes(search, searchType, searchAiringFilter, searchTypeFilter, listFilterType, checkTiralex, checkCycy, checkLeo, checkGyrehio, checktchm, alternativeTitles, secondaryData) {
    return (a) => {
        // If a search query is present, filter based on it.
        if(search.trim().length > 0) {
            switch(searchType) {
                case 'anime':
                    if(!a.nom.toLowerCase().includes(search.toLowerCase())) {
                        // If the anime doesn't match the search query, check if any of its alternative titles do.
                        if(!alternativeTitles[a.mal_id].some(t => t.toLowerCase().includes(search.toLowerCase()))) {
                            return false;
                        }
                    }

                    break;
                
                case 'song':
                    if(!a.musique.some(m => m.nom.toLowerCase().includes(search.toLowerCase()))) {
                        return false;
                    }

                    break;
                
                case 'artist':
                    if(!a.musique.some(m => m.artiste.toLowerCase().includes(search.toLowerCase()))) {
                        return false;
                    }

                    break;
            }
        }

        // If an airing filter is present, filter based on it.
        if(searchAiringFilter !== 'any') {
            switch(searchAiringFilter) {
                case 'airing':
                    if(secondaryData[a.mal_id].status !== 'currently_airing') {
                        return false;
                    }

                    break;
                
                case 'finished':
                    if(secondaryData[a.mal_id].status !== 'finished_airing') {
                        return false;
                    }

                    break;
            }
        }

        // If a type filter is present, filter based on it.
        if(searchTypeFilter !== 'any') {
            if(!searchTypeFilter.includes(secondaryData[a.mal_id].type)) {
                return false;
            }
        }

        // Checkboxes filter.
        if(listFilterType !== 'strict') {
            let display = listFilterType === 'intersect';

            if(checkTiralex) {
                if(listFilterType === 'union') {
                    if(a.users.A === 1) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(a.users.A === 0) {
                        return false;
                    }
                }
            }

            if(checkCycy) {
                if(listFilterType === 'union') {
                    if(a.users.C === 1) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(a.users.C === 0) {
                        return false;
                    }
                }
            }

            if(checkLeo) {
                if(listFilterType === 'union') {
                    if(a.users.L === 1) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(a.users.L === 0) {
                        return false;
                    }
                }
            }

            if(checkGyrehio) {
                if(listFilterType === 'union') {
                    if(a.users.V === 1) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(a.users.V === 0) {
                        return false;
                    }
                }
            }

            if(checktchm) {
                if(listFilterType === 'union') {
                    if(a.users.T === 1) {
                        display = true;
                    }
                } else { // Intersect mode
                    if(a.users.T === 0) {
                        return false;
                    }
                }
            }

            return display;
        } else { // Strict match
            return checkTiralex == a.users.A &&
                    checkCycy == a.users.C &&
                    checkLeo == a.users.L &&
                    checkGyrehio == a.users.V &&
                    checktchm == a.users.T;
        }
    };
}