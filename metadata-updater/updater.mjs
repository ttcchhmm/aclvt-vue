import { promises as fsPromise, createReadStream, createWriteStream, mkdirSync } from 'fs';
import { createGzip, createBrotliCompress, constants as zlibConstants } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pipe = promisify(pipeline);

/**
 * Fetches the anime list of a user from the MAL API
 * @param {string} username 
 * @returns An array of anime
 */
async function fetchUserList(username) {
    let data = [];
    let offset = 0;

    // Loop until the paging.next field is undefined
    let hasMore = true;
    while (hasMore) {
        console.log(`Fetching ${username} offset ${offset}`);

        const response = await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?limit=100&fields=list_status,alternative_titles,media_type,status,synopsis,start_date,end_date,num_episodes,start_season,studios&offset=${offset}&nsfw=true`, {
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
 * @param {import('fs').PathLike} input Input file.
 * @param {import('fs').PathLike} output Output file.
 */
async function gzipFile(input, output) {
    const gzip = createGzip({
        level: 9,
    });
    const source = createReadStream(input);
    const destination = createWriteStream(output);
    await pipe(source, gzip, destination);
}

/**
 * Compresses a file using brotli.
 * @param {import('fs').PathLike} input Input file.
 * @param {import('fs').PathLike} output Output file.
 */
async function brotliFile(input, output) {
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
const [tiralex, cycy, leo, gyrehio, tchm] = await Promise.all([
    fetchUserList('Tiralex1'),
    fetchUserList('CycyGonzales'),
    fetchUserList('49Leo'),
    fetchUserList('Gyrehio'),
    fetchUserList('tchm'),
]);

/**
 * Generates the API v1 data, also known as additional-data.json
 */
async function generateApiV1() {
    // Create a map of anime id to additional data
    const additionalData = {}

    // Add the data for each user
    for(const user of [tiralex, cycy, leo, gyrehio, tchm]) {
        // Add the data for each anime
        for(const anime of user) {
            // Check if the anime is already in the map
            if(additionalData[anime.node.id] === undefined) {
                additionalData[anime.node.id] = {
                    scores: {},
                    cover: anime.node.main_picture.large !== undefined ? anime.node.main_picture.large : anime.node.main_picture.medium,
                    titles: { original: anime.node.title , ...anime.node.alternative_titles },
                    status: anime.node.status,
                    type: anime.node.media_type,
                    wasWatched: false,
                };
            }

            // Check if the anime was watched
            if(anime.list_status.status === 'completed' || anime.list_status.status === 'watching') {
                additionalData[anime.node.id].wasWatched = true;

                // Add the score
                switch(user) {
                    case tiralex:
                        additionalData[anime.node.id].scores.A = anime.list_status.score;
                        break;

                    case cycy:
                        additionalData[anime.node.id].scores.C = anime.list_status.score;
                        break;

                    case leo:
                        additionalData[anime.node.id].scores.L = anime.list_status.score;
                        break;

                    case gyrehio:
                        additionalData[anime.node.id].scores.V = anime.list_status.score;
                        break;

                    case tchm:
                        additionalData[anime.node.id].scores.T = anime.list_status.score;
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
 * Generates the API v2 data
 */
async function generateApiV2() {
    // Fetch data from Tiralex1's API
    const tiralexJson = await fetch('https://raw.githubusercontent.com/Tiralex1/ACLV/main/data.json').then(res => res.json());

    // Create directories
    mkdirSync('api/v2/animes', { recursive: true });

    // Create a map of anime id to animes
    const mergedData = [];

    // Add the data for each user
    for(const user of [tiralex, cycy, leo, gyrehio, tchm]) {
        for(const anime of user) {
            // Get the current state of the anime
            let currentState = mergedData.find(a => a.id === anime.node.id);

            if(currentState === undefined) {
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
                    studios: anime.node.studios,
                    episodes: anime.node.num_episodes,
                    music: tiralexJson.anime.find(a => a.mal_id === anime.node.id)?.musique.map(m => { return { type: m.type, name: m.nom, artist: m.artiste, link: m.lien, number: m.numero } }),
                };

                mergedData.push(currentState);
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
                }
            }
        }
    }

    // Generate a file for each anime and an index file
    const index = [];
    const promises = [];

    for(const anime of mergedData) {
        // Add the anime to the index
        index.push({
            id: anime.id,
            scores: anime.scores,
            cover: anime.cover,
            titles: anime.titles,
            status: anime.status,
            type: anime.type,
            wasWatched: anime.wasWatched,
            music: anime.music === undefined ? [] : anime.music,
        });

        // Generate the secondary file
        await fsPromise.writeFile(`api/v2/animes/${anime.id}.json`, JSON.stringify({
            synopsis: anime.synopsis,
            startDate: anime.startDate,
            endDate: anime.endDate,
            startSeason: anime.startSeason,
            studios: anime.studios,
            episodes: anime.episodes,
        }));

        // Compress the file
        promises.push(gzipFile(`api/v2/animes/${anime.id}.json`, `api/v2/animes/${anime.id}.json.gz`));
        promises.push(brotliFile(`api/v2/animes/${anime.id}.json`, `api/v2/animes/${anime.id}.json.br`));
    }

    // Generate the index file
    await fsPromise.writeFile('api/v2/index.json', JSON.stringify(index));
    promises.push(gzipFile('api/v2/index.json', 'api/v2/index.json.gz'));
    promises.push(brotliFile('api/v2/index.json', 'api/v2/index.json.br'));

    await Promise.all(promises);

    console.log('Generated API v2.');
}

await Promise.all([
    generateApiV1(),
    generateApiV2(),
]);

console.log('Done.');