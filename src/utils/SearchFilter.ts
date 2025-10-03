import { storeToRefs } from 'pinia';
import { type SortType, useSearchStore } from '../stores/SearchStore';
import { useSettingsStore } from '../stores/SettingsStore';
import { type AnimeBase, type Scores, type UserEntry, type UserStatus } from '../Types';

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
        userStatusFilter,
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
        // ID search.
        if(searchType.value === 'id') {
            return a.id === parseInt(search.value);
        }

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
        if(!searchAiringFilter.value.reduce((prev, curr) => (prev || a.status === curr), false)) {
            return false;
        }

        // If a user status filter is present, filter based on it.
        if(userStatusFilter.value.length !== 0) {
            const status: UserStatus[] = [];

            if(checkTiralex.value && a.scores.A?.status) {
                status.push(a.scores.A.status);
            }

            if(checkCycy.value && a.scores.C?.status) {
                status.push(a.scores.C.status);
            }

            if(checkLeo.value && a.scores.L?.status) {
                status.push(a.scores.L.status);
            }

            if(checkGyrehio.value && a.scores.V?.status) {
                status.push(a.scores.V.status);
            }

            if(checktchm.value && a.scores.T?.status) {
                status.push(a.scores.T.status);
            }

            if(checkqgWolf.value && a.scores.Q?.status) {
                status.push(a.scores.Q.status);
            }

            if(!userStatusFilter.value.reduce((prev, curr) => (prev || status.includes(curr)), false)) {
                return false;
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
                const aScore = getAverageScore(a.scores);
                const bScore = getAverageScore(b.scores);

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

        // Score (MyAnimeList) order.
        case 'score-mal':
            return (a: AnimeBase, b: AnimeBase) => {
                if(a.malMeanScore === undefined) {
                    return 1;
                } else if(b.malMeanScore === undefined) {
                    return -1;
                }

                return b.malMeanScore - a.malMeanScore;
            }

        // Score (selected users) order.
        case 'score-list':
            const {
                checkTiralex,
                checkCycy,
                checkLeo,
                checkGyrehio,
                checktchm,
                checkqgWolf,
            } = storeToRefs(useSearchStore());
            
            return (a: AnimeBase, b: AnimeBase) => {
                const aScore = getAverageScore(keepScoresPerUser(a.scores, checkTiralex.value, checkCycy.value, checkLeo.value, checkGyrehio.value, checktchm.value, checkqgWolf.value));
                const bScore = getAverageScore(keepScoresPerUser(b.scores, checkTiralex.value, checkCycy.value, checkLeo.value, checkGyrehio.value, checktchm.value, checkqgWolf.value));

                if(aScore === undefined) {
                    return 1;
                } else if(bScore === undefined) {
                    return -1;
                } else {
                    return bScore - aScore;
                }
            }

    }
}

/**
 * Check whether an anime has been watched by a user.
 * @param score The score given by a user.
 * @returns True if the anime has been watched by the user, false otherwise.
 */
function watched(score: UserEntry | undefined): boolean {
    return score !== undefined && score.status !== "plan_to_watch";
}

/**
 * Return the average score of an anime.
 * @param s A score object.
 */
function getAverageScore(s: Scores) {
    // Get an array of all the scores. Remove undefined values as they either mean the anime has not been watched or not scored.
    const scoresObj = Object.values(s).filter(s2 => s2 != undefined || s2 != null).filter(s2 => s2.rating != undefined || s2.rating != null);
    const scores = scoresObj.map(entry => entry.rating as number);

    if(scores.length === 0) {
        return undefined;
    } else {
        return (scores.reduce((a, b) => a + b) / scores.length) + scoresObj.length / 1000;
    }
}

/**
 * Keep only the scores of the users that are checked.
 * @param scores The score object to keep scores from.
 * @param a Whether to keep the scores of Tiralex.
 * @param c Whether to keep the scores of Cycy.
 * @param l Whether to keep the scores of Leo.
 * @param v Whether to keep the scores of Gyrehio.
 * @param t Whether to keep the scores of tchm.
 * @param q Whether to keep the scores of QGWolfWarrior.
 */
function keepScoresPerUser(scores: Scores, a: boolean, c: boolean, l: boolean, v: boolean, t: boolean, q: boolean): Scores {
    return {
        A: a ? scores.A : undefined,
        C: c ? scores.C : undefined,
        L: l ? scores.L : undefined,
        V: v ? scores.V : undefined,
        T: t ? scores.T : undefined,
        Q: q ? scores.Q : undefined,
    };
}