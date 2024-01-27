/**
 * Defines the index for the v2 API.
 */
export type Index = {
    /**
     * Contains an anime data.
     */
    animes: AnimeBase[];

    /**
     * An array of anime genres.
     */
    genres: string[];

    /**
     * An array of anime studios.
     */
    studios: string[];

    /**
     * The last time the data was updated. Should be in ISO 8601 format.
     */
    updatedAt: string;
}

/**
 * Defines anime data found in the index.
 */
export type AnimeBase = {
    /**
     * The anime ID. Is the same as the one used by MyAnimeList.
     */
    id: number;

    /**
     * Scores given by users.
     */
    scores: Scores,

    /**
     * An URL to the anime cover.
     */
    cover: string;

    /**
     * Titles in different languages.
     */
    titles: {
        /**
         * The original title, usually in Romaji.
         */
        original: string;

        /**
         * English title.
         */
        en: string;

        /**
         * Japanese title.
         */
        ja: string;

        /**
         * An array of alternative names.
         */
        synonyms?: string[] | undefined;
    },

    /**
     * The current airing status of the anime.
     */
    status: AiringStatus;

    /**
     * The type of the anime.
     */
    type: AnimeType;

    /**
     * True if someone watched the anime.
     */
    wasWatched: boolean;

    /**
     * The airing date of the first episode.
     */
    startDate: string;

    /**
     * The studios that produced the anime.
     */
    studios: string[];

    /**
     * The genres of the anime.
     */
    genres: string[];

    /**
     * The age rating of the anime.
     */
    rating: Rating;

    /**
     * Songs found in the anime.
     */
    music: Music[];

    /**
     * The mean score on MyAnimeList.
     * 
     * Can be undefined if the anime is not rated on MyAnimeList.
     */
    malMeanScore?: number;

    /**
     * The oldest update about this anime in a list from the users.
     * Should be in ISO 8601 format.
     */
    oldestUpdate: string;

    /**
     * The source of the anime.
     */
    source: Source;

    /**
     * The average duration of an episode.
     */
    averageEpisodeDuration?: number | undefined;
}

/**
 * Defines data found in the `/api/v2/animes/:id.json` endpoint.
 */
export type AnimeExtended = {
    /**
     * The season the anime started airing.
     */
    startSeason: {
        /**
         * The season the anime started airing.
         */
        season: Season;

        /**
         * The year the anime started airing.
         */
        year: number;
    },

    /**
     * The synopsis of the anime.
     */
    synopsis: string;

    /**
     * The airing date of the last episode.
     */
    endDate: string | undefined;

    /**
     * The number of episodes.
     */
    episodes: number;
}

/**
 * Defines a song found in an anime.
 */
export type Music = {
    /**
     * The type of song.
     */
    type: MusicType;

    /**
     * The name of the song.
     */
    name: string;

    /**
     * The artist of the song.
     */
    artist: string;

    /**
     * The link to the song.
     */
    link: string;

    /**
     * The number of the song.
     */
    number: number;
}

/**
 * Represent the entry of an user about one anime.
 */
export type UserEntry = {
    /**
     * The rating given by this user. Undefined if not rated.
     */
    rating?: number | undefined;

    /**
     * The number of episodes watched by this user.
     */
    watchedEpisodesCount: number;

    /**
     * The current status for this user.
     */
    status: UserStatus;
};

/**
 * Defines scores given by users.
 */
export type Scores = {
    /**
     * Tiralex's score.
     */
    A?: UserEntry | undefined;

    /**
     * Cycy's score.
     */
    C?: UserEntry | undefined;

    /**
     * Leo's score.
     */
    L?: UserEntry | undefined;

    /**
     * Gyrehio's score.
     */
    V?: UserEntry | undefined;

    /**
     * tchm's score.
     */
    T?: UserEntry | undefined;

    /**
     * QGWolfWarrior's score.
     */
    Q?: UserEntry | undefined;
}

/**
 * Defines the airing status of an anime.
 */
export type AiringStatus = 'finished_airing' | 'currently_airing' | 'not_yet_aired';

/**
 * Defines the type of an anime.
 */
export type AnimeType = 'tv' | 'movie' | 'ova' | 'ona' | 'special' | 'music';

/**
 * Defines the age rating of an anime.
 */
export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Defines the season of an anime.
 */
export type Season = 'winter' | 'spring' | 'summer' | 'fall';

/**
 * Defines the type of a song.
 */
export type MusicType = 'Opening' | 'Ending' | 'Insert Song';

/**
 * Defines the source of an anime.
 */
export type Source = 'other' | 'original' | 'manga' | '4_koma_manga' | 'web_manga' | 'digital_manga' | 'novel' | 'light_novel' | 'visual_novel' | 'game' | 'card_game' | 'book' | 'picture_book' | 'radio' | 'music';

/**
 * Defines the status of an anime for a given user.
 */
export type UserStatus = 'watching' | 'competed' | 'on_hold' | 'dropped' | 'plan_to_watch';

/**
 * Defines an anime.
 */
export type Anime = AnimeBase & AnimeExtended;

/**
 * Defines an entry within a pie chart.
 */
export type ChartEntry = {
    /**
     * The label of this entry.
     */
    name: string,

    /**
     * The weight associated with this entry.
     */
    entries: number,

    /**
     * The CSS color of this entry.
     */
    color: string,
};