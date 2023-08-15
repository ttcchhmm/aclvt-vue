import { promises as fsPromise, createReadStream, createWriteStream, mkdirSync, PathLike } from 'fs';
import { createGzip, createBrotliCompress, constants as zlibConstants } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Anime, AnimeBase, MusicType, Rating } from '../src/Types.js';

/**
 * The anime API v1 type.
 */
type AnimeAPIv1 = {
    scores: {
        A?: number,
        C?: number,
        L?: number,
        V?: number,
        T?: number,
        Q?: number,
    },
    cover: string,
    titles: {
        original: string,
        en?: string,
        synonyms?: string[],
        ja?: string,
    },
    status: string,
    type: string,
    wasWatched: boolean,
};

/**
 * The Tiralex JSON API type.
 */
type TiralexData = {
    nb_anime: number,
    nb_musique: number,
    anime: {
        nom: string,
        id: number,
        mal_id: number,
        nb_musique: number,
        musique: {
            type: MusicType,
            nom: string,
            artiste: string,
            lien: string,
            numero: number,
        }[],
    }[],
}

const pipe = promisify(pipeline);

/**
 * Fetches the anime list of a user from the MAL API
 * @param username The username of the user
 * @returns An array of anime
 */
async function fetchUserList(username: string) {
    let data: any[] = [];
    let offset = 0;

    // Loop until the paging.next field is undefined
    let hasMore = true;
    while (hasMore) {
        console.log(`Fetching ${username} offset ${offset}`);

        // @ts-ignore - The fetch type definition is missing for Node
        const response = await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?limit=100&fields=list_status,alternative_titles,media_type,status,synopsis,start_date,end_date,num_episodes,start_season,studios,rating,genres&offset=${offset}&nsfw=true`, {
            headers: {
                'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID, // Authenticate with the MAL API
            }
        });

        // Append the data to the array
        const json = await response.json();
        data = data.concat(json.data);

        // Check if there is more data to fetch
        hasMore = json.paging.next !== undefined;
        offset += 100;
    }

    return data;
}

/**
 * Compresses a file using gzip.
 * @param input Input file.
 * @param output Output file.
 */
async function gzipFile(input: PathLike, output: PathLike) {
    const gzip = createGzip({
        level: 9,
    });
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, gzip, destination);
}

/**
 * Compresses a file using brotli.
 * @param input Input file.
 * @param output Output file.
 */
async function brotliFile(input: PathLike, output: PathLike) {
    const brotli = createBrotliCompress({
        params: {
            [zlibConstants.BROTLI_PARAM_MODE]: zlibConstants.BROTLI_MODE_TEXT,
            [zlibConstants.BROTLI_PARAM_QUALITY]: zlibConstants.BROTLI_MAX_QUALITY,

        },
    });
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, brotli, destination);
}

// Check if the MAL_CLIENT_ID environment variable is set
if(process.env.MAL_CLIENT_ID === undefined || process.env.MAL_CLIENT_ID === '') {
    console.error("Please set the MAL_CLIENT_ID environment variable");
    process.exit(1);
}

// Fetch the data for each user
const [tiralex, cycy, leo, gyrehio, tchm, qgWolf] = await Promise.all([
    fetchUserList('Tiralex1'),
    fetchUserList('CycyGonzales'),
    fetchUserList('49Leo'),
    fetchUserList('Gyrehio'),
    fetchUserList('tchm'),
    fetchUserList('QGWolfWarrior'),
]);

/**
 * Generates the API v1 data, also known as additional-data.json
 */
async function generateApiV1() {
    // Create a map of anime id to additional data
    const additionalData = new Map<number, AnimeAPIv1>();

    // Add the data for each user
    for(const user of [tiralex, cycy, leo, gyrehio, tchm, qgWolf]) {
        // Add the data for each anime
        for(const anime of user) {
            // Check if the anime is already in the map
            if(!additionalData.has(anime.node.id)) {
                additionalData.set(anime.node.id, {
                    scores: {},
                    cover: anime.node.main_picture.large !== undefined ? anime.node.main_picture.large : anime.node.main_picture.medium,
                    titles: { original: anime.node.title , ...anime.node.alternative_titles },
                    status: anime.node.status,
                    type: anime.node.media_type,
                    wasWatched: false,
                });
            }

            // Check if the anime was watched
            if(anime.list_status.status === 'completed' || anime.list_status.status === 'watching') {
                (additionalData.get(anime.node.id) as AnimeAPIv1).wasWatched = true;

                // Add the score
                switch(user) {
                    case tiralex:
                        (additionalData.get(anime.node.id) as AnimeAPIv1).scores.A = anime.list_status.score;
                        break;

                    case cycy:
                        (additionalData.get(anime.node.id) as AnimeAPIv1).scores.C = anime.list_status.score;
                        break;

                    case leo:
                        (additionalData.get(anime.node.id) as AnimeAPIv1).scores.L = anime.list_status.score;
                        break;

                    case gyrehio:
                        (additionalData.get(anime.node.id) as AnimeAPIv1).scores.V = anime.list_status.score;
                        break;

                    case tchm:
                        (additionalData.get(anime.node.id) as AnimeAPIv1).scores.T = anime.list_status.score;
                        break;

                    case qgWolf:
                        (additionalData.get(anime.node.id) as AnimeAPIv1).scores.Q = anime.list_status.score;
                        break;
                }
            }
        }
    }

    await fsPromise.writeFile('additional-data.json', JSON.stringify(additionalData));

    // Compress the file
    await Promise.all([
        gzipFile('additional-data.json', 'additional-data.json.gz'),
        brotliFile('additional-data.json', 'additional-data.json.br'),
    ]);

    console.log('Generated API v1.');
}

/**
 * Converts a rating to a number.
 * @param rating The rating to convert.
 * @returns A number representing the rating.
 */
function ratingToValue(rating: string): Rating {
    switch(rating) {
        default:
        case 'g':
            return 0;

        case 'pg':
            return 1;

        case 'pg_13':
            return 2;

        case 'r':
            return 3;

        case 'r+':
            return 4;

        case 'rx':
            return 5;
    }
}

/**
 * Generates the API v2 data
 */
async function generateApiV2() {
    // Fetch data from Tiralex1's API
    // @ts-ignore - The fetch type definition is missing for Node
    const tiralexJson: TiralexData = await fetch('https://raw.githubusercontent.com/Tiralex1/ACLV/main/data.json').then(res => res.json());

    // Create directories
    mkdirSync('api/v2/animes', { recursive: true });

    // Create a map of anime id to animes
    const mergedData: Anime[] = [];

    // Add the data for each user
    for(const user of [tiralex, cycy, leo, gyrehio, tchm, qgWolf]) {
        for(const anime of user) {
            // Get the current state of the anime
            let currentState = mergedData.find(a => a.id === anime.node.id);

            if(currentState === undefined) {
                const music = tiralexJson.anime.find(a => a.mal_id === anime.node.id)?.musique.map(m => { return { type: m.type, name: m.nom, artist: m.artiste, link: m.lien.replace('https://nl.catbox.moe/', 'https://nl.catbox.video/'), number: m.numero } });

                currentState = {
                    id: anime.node.id,
                    scores: {},
                    cover: anime.node.main_picture.large !== undefined ? anime.node.main_picture.large : anime.node.main_picture.medium,
                    titles: { original: anime.node.title , ...anime.node.alternative_titles },
                    status: anime.node.status,
                    type: anime.node.media_type,
                    wasWatched: false,
                    synopsis: anime.node.synopsis,
                    startDate: anime.node.start_date,
                    endDate: anime.node.end_date,
                    startSeason: anime.node.start_season,
                    studios: anime.node.studios.map((s: { name: string }) => s.name),
                    genres: anime.node.genres.map((g: { name: string }) => g.name),
                    episodes: anime.node.num_episodes,
                    rating: ratingToValue(anime.node.rating),
                    music: music === undefined ? [] : music,
                    oldestUpdate: anime.list_status.updated_at,
                };

                mergedData.push(currentState);
            } else {
                // Update the oldest update
                if(anime.list_status.updated_at < currentState.oldestUpdate) {
                    currentState.oldestUpdate = anime.list_status.updated_at;
                }
            }

            // Check if the anime was watched
            if(anime.list_status.status === 'completed' || anime.list_status.status === 'watching') {
                currentState.wasWatched = true;

                // Add the score
                switch(user) {
                    case tiralex:
                        currentState.scores.A = anime.list_status.score;
                        break;

                    case cycy:
                        currentState.scores.C = anime.list_status.score;
                        break;

                    case leo:
                        currentState.scores.L = anime.list_status.score;
                        break;

                    case gyrehio:
                        currentState.scores.V = anime.list_status.score;
                        break;

                    case tchm:
                        currentState.scores.T = anime.list_status.score;
                        break;

                    case qgWolf:
                        currentState.scores.Q = anime.list_status.score;
                        break;
                }
            }
        }
    }

    // Generate a file for each anime and an index file
    const animes: AnimeBase[] = [];
    const promises: Promise<any>[] = [];

    for(const anime of mergedData) {
        // Add the anime to the index
        animes.push({
            id: anime.id,
            scores: anime.scores,
            cover: anime.cover,
            titles: anime.titles,
            status: anime.status,
            type: anime.type,
            wasWatched: anime.wasWatched,
            music: anime.music === undefined ? [] : anime.music,
            rating: anime.rating,
            genres: anime.genres,
            studios: anime.studios,
            startDate: anime.startDate,
            oldestUpdate: anime.oldestUpdate,
        });

        // Generate the secondary file
        await fsPromise.writeFile(`api/v2/animes/${anime.id}.json`, JSON.stringify({
            synopsis: anime.synopsis,
            endDate: anime.endDate,
            startSeason: anime.startSeason,
            episodes: anime.episodes,
        }));

        // Compress the file
        promises.push(gzipFile(`api/v2/animes/${anime.id}.json`, `api/v2/animes/${anime.id}.json.gz`));
        promises.push(brotliFile(`api/v2/animes/${anime.id}.json`, `api/v2/animes/${anime.id}.json.br`));
    }

    // Generate the index file
    await fsPromise.writeFile('api/v2/index.json', JSON.stringify({
        animes,
        genres: animes.reduce((acc, anime) => {
            for(const genre of anime.genres) {
                if(!acc.includes(genre)) {
                    acc.push(genre);
                }
            }

            return acc;
        }, [] as string[]).sort(),
        studios: animes.reduce((acc, anime) => {
            for(const studio of anime.studios) {
                if(!acc.includes(studio)) {
                    acc.push(studio);
                }
            }

            return acc;
        }, [] as string[]).sort(),
        updatedAt: new Date().toISOString(),
    }));
    promises.push(gzipFile('api/v2/index.json', 'api/v2/index.json.gz'));
    promises.push(brotliFile('api/v2/index.json', 'api/v2/index.json.br'));

    await Promise.all(promises);

    console.log('Generated API v2.');

    console.log('\nSome stats:');
    console.log(`- ${animes.length} animes`);
    console.log(`- ${animes.filter(a => a.wasWatched).length} animes were watched`);
    console.log(`- ${animes.reduce((acc, a) => a.music === undefined ? acc : acc + a.music.length, 0)} music entries`);
}

await Promise.all([
    generateApiV1(),
    generateApiV2(),
]);

console.log('Done.');