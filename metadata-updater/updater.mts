import { promises as fsPromise, createReadStream, createWriteStream, mkdirSync, PathLike } from 'fs';
import { createGzip, createBrotliCompress, constants as zlibConstants } from 'zlib';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { Anime, AnimeBase, MusicType, Rating, UserEntry } from '../src/Types.js';

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
        genres: number[],
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
        const response = await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?limit=100&fields=list_status,alternative_titles,media_type,status,synopsis,start_date,end_date,num_episodes,start_season,studios,rating,genres,mean,num_times_rewatched,average_episode_duration,source&offset=${offset}&nsfw=true`, {
            headers: {
                'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID, // Authenticate with the MAL API
            } as any,
        });

        // Append the data to the array
        const json: any = await response.json();
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
    const additionalData: Record<number, AnimeAPIv1> = {};

    // Add the data for each user
    for(const user of [tiralex, cycy, leo, gyrehio, tchm, qgWolf]) {
        // Add the data for each anime
        for(const anime of user) {
            // Check if the anime is already in the map
            if(additionalData[anime.node.id] === undefined) {
                let cover = undefined;
                if(anime.node.main_picture !== undefined) {
                    cover = anime.node.main_picture.large !== undefined ? anime.node.main_picture.large : anime.node.main_picture.medium;
                }

                additionalData[anime.node.id] = {
                    scores: {},
                    cover,
                    titles: { original: anime.node.title , ...anime.node.alternative_titles },
                    status: anime.node.status,
                    type: anime.node.media_type,
                    wasWatched: false,
                };
            }

            // Check if the anime was watched
            if(anime.list_status.status === 'completed' || anime.list_status.status === 'watching') {
                (additionalData[anime.node.id] as AnimeAPIv1).wasWatched = true;

                // Add the score
                switch(user) {
                    case tiralex:
                        (additionalData[anime.node.id] as AnimeAPIv1).scores.A = anime.list_status.score;
                        break;

                    case cycy:
                        (additionalData[anime.node.id] as AnimeAPIv1).scores.C = anime.list_status.score;
                        break;

                    case leo:
                        (additionalData[anime.node.id] as AnimeAPIv1).scores.L = anime.list_status.score;
                        break;

                    case gyrehio:
                        (additionalData[anime.node.id] as AnimeAPIv1).scores.V = anime.list_status.score;
                        break;

                    case tchm:
                        (additionalData[anime.node.id] as AnimeAPIv1).scores.T = anime.list_status.score;
                        break;

                    case qgWolf:
                        (additionalData[anime.node.id] as AnimeAPIv1).scores.Q = anime.list_status.score;
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
                const music = tiralexJson.anime.find(a => a.mal_id === anime.node.id)?.musique.map(m => { return { type: m.type, name: m.nom, artist: m.artiste, link: m.lien, number: m.numero } });

                let cover = undefined;
                if(anime.node.main_picture !== undefined) {
                    cover = anime.node.main_picture.large !== undefined ? anime.node.main_picture.large : anime.node.main_picture.medium;
                }

                currentState = {
                    id: anime.node.id,
                    scores: {},
                    cover,
                    titles: { original: anime.node.title , ...anime.node.alternative_titles },
                    status: anime.node.status,
                    type: anime.node.media_type,
                    wasWatched: false,
                    synopsis: anime.node.synopsis,
                    startDate: anime.node.start_date,
                    endDate: anime.node.end_date,
                    startSeason: anime.node.start_season,
                    studios: anime.node.studios.map((s: { name: string }) => s.name),
                    genres: anime.node.genres != undefined ? anime.node.genres.map((g: { name: string }) => g.name) : [],
                    episodes: anime.node.num_episodes,
                    rating: ratingToValue(anime.node.rating),
                    music: music === undefined ? [] : music,
                    malMeanScore: anime.node.mean,
                    oldestUpdate: anime.list_status.updated_at,
                    source: anime.node.source,
                    averageEpisodeDuration: anime.node.average_episode_duration,
                };

                mergedData.push(currentState);
            } else {
                // Update the oldest update
                if(anime.list_status.updated_at < currentState.oldestUpdate) {
                    currentState.oldestUpdate = anime.list_status.updated_at;
                }
            }

            // Check if the anime was watched
            currentState.wasWatched = true;

            const entry: UserEntry = {
                rating: anime.list_status.score == 0 ? undefined : anime.list_status.score,
                status: anime.list_status.status,
                watchedEpisodesCount: anime.list_status.num_episodes_watched,
            };

            // Add the score
            switch(user) {
                case tiralex:
                    currentState.scores.A = entry;
                    break;

                case cycy:
                    currentState.scores.C = entry;
                    break;

                case leo:
                    currentState.scores.L = entry;
                    break;

                case gyrehio:
                    currentState.scores.V = entry;
                    break;

                case tchm:
                    currentState.scores.T = entry;
                    break;

                case qgWolf:
                    currentState.scores.Q = entry;
                    break;
            }
        }
    }

    const filterNoMusic = (animes: Anime[]) => animes.filter(a => a.status !== 'not_yet_aired')
        .filter(a => {
            let toKeep = false;

            if(a.scores.A != undefined && a.scores.A.status !== "plan_to_watch") {
                toKeep = true;
            } else if(a.scores.C != undefined && a.scores.C.status !== "plan_to_watch") {
                toKeep = true;
            } else if(a.scores.L != undefined && a.scores.L.status !== "plan_to_watch") {
                toKeep = true;
            } else if(a.scores.V != undefined && a.scores.V.status !== "plan_to_watch") {
                toKeep = true;
            } else if(a.scores.T != undefined && a.scores.T.status !== "plan_to_watch") {
                toKeep = true;
            } else if(a.scores.Q != undefined && a.scores.Q.status !== "plan_to_watch") {
                toKeep = true;
            }
        
            return toKeep;
        })
        .filter(a => a.music.length === 0);

    const animesNoMusic = filterNoMusic(mergedData);
    
    console.log(`${animesNoMusic.length} without entries.`);

    // Query anisongdb
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const batchSize = 3;
    for (let i = 0; i < animesNoMusic.length; i += batchSize) {
        const batch = animesNoMusic.slice(i, i + batchSize);
    
        await Promise.all(batch.map(async (a) => {
            // Remove season information, if possible
            const cleanName = a.titles.original.replaceAll(/(?:\s*(?:Final|(?:\d+(?:st|nd|rd|th)?)?)\s+(?:Season|Movie)(?: \d+)?)?(?:\s*Part \d?)?(?:\s+M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$)?/ig, '').replaceAll(/Specials?/ig, '').trim();
    
            console.log(`Searching AnisongDB for ${cleanName}`);
    
            const anisongDB: any = await fetch("https://anisongdb.com/api/search_request", {
                method: 'POST',
                body: JSON.stringify({
                    and_logic: false,
                    anime_search_filter: {
                        partial_match: true,
                        search: cleanName,
                    },
                    artist_search_filter: {
                        group_granularity: 0,
                        partial_match: true,
                        max_other_artist: 99,
                        search: cleanName, // Copy the behavior of the website
                    },
                    chanting: true,
                    character: true,
                    composer_search_filter: {
                        arrangement: true,
                        partial_match: true,
                        search: cleanName, // Copy the behavior of the website
                    },
                    dub: true,
                    ending_filter: true,
                    ignore_duplicate: false,
                    insert_filter: true,
                    instrumental: true,
                    normal_broadcast: true,
                    opening_filter: true,
                    rebroadcast: true,
                    song_name_search_filter: {
                        partial_match: true,
                        search: cleanName, // Copy the behavior of the website
                    },
                    standard: true,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'ACLVTQ-Updater/1.0',
                },
            }).then(r => r.json()).catch((e) => console.error(e));

            if(anisongDB === undefined) {
                console.error(`Failed to fetch AnisongDB for ${cleanName}`);
                return;
            }
    
            // For every result
            anisongDB
                // Make sure that the MAL id match
                .filter((adb: any) => adb.linked_ids.myanimelist === a.id)
                // Process each music
                .forEach((adb: any) => {
                    // Check if the anime is already in Tiralex's database
                    let tiralexAnime = tiralexJson.anime.find(at => adb.linked_ids.myanimelist === at.mal_id);
    
                    let mergedAnime = mergedData.find(a => a.id === adb.linked_ids.myanimelist);
    
                    // If not, add it
                    if(!tiralexAnime) {
                        tiralexAnime = {
                            nom: adb.animeJPName,
                            id: 0, // TODO: really unused?
                            mal_id: a.id,
                            nb_musique: 0, // Will be recalculated later
                            genres: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // TODO: fill correctly
                            musique: [],
                        };
    
                        tiralexJson.anime.push(tiralexAnime);
                        tiralexJson.nb_anime++;
                    }
    
                    // Extract the Opening, Ending or Insert status
                    const type = adb.songType === "Insert Song" ? "Insert Song" : adb.songType.split(' ')[0];
    
                    // Add the music
                    const song = {
                        type,
                        numero: type === "Insert Song" ? 0 : adb.songType.split(' ')[1],
                        nom: adb.songName,
                        artiste: adb.songArtist,
                        lien: `https://eudist.animemusicquiz.com/${adb.HQ}`,
                    };
    
                    console.log(`Added ${song.nom} (${adb.songType}) by ${song.artiste} for ${adb.animeJPName}`);
    
                    tiralexAnime.musique.push(song);
                    mergedAnime?.music.push({
                        type: type as MusicType,
                        artist: adb.songArtist,
                        link: `https://eudist.animemusicquiz.com/${adb.HQ}`,
                        name: adb.songName,
                        number: type === "Insert Song" ? 0 : adb.songType.split(' ')[1],
                    });
                });
        }));
    
        // Wait for 1 second before processing the next batch
        await delay(250);
    }

    // As a last resort, query Animethemes.moe for recent-ish animes
    const toQueryAnimethemes = filterNoMusic(mergedData)
        .filter(a => a.startSeason.year >= 2025);
    
    const splicedQueries = [];
    for (let i = 0; i < toQueryAnimethemes.length; i += 85) {
        splicedQueries.push(toQueryAnimethemes.slice(i, i + 85));
    }

    for (const batch of splicedQueries) {
        console.log(`Processing batch of ${batch.length} animes for Animethemes.moe`);

        const responses = await Promise.all(batch.map(a =>
            fetch(`https://api.animethemes.moe/anime?include=animethemes,resources,animethemes.animethemeentries.videos,animethemes.song,animethemes.song.artists&fields%5Banime%5D=id,name,slug,year&filter%5Bhas%5D=resources&filter%5Bsite%5D=myanimelist&filter%5Bexternal_id%5D=${a.id}`)
            .then(r => r.json())
        ));

        responses.forEach((r: any) => {
            r.anime.forEach((a: any) => {
                const mergedAnime = mergedData.find(ma => ma.id === a.resources.find((res: any) => res.site === 'MyAnimeList').external_id);

                console.log(`Animetheme.moe: found results for ${a.name}`);

                if(mergedAnime) {
                    a.animethemes.forEach((theme: any) => {
                        const song = {
                            type: theme.type === 'OP' ? 'Opening' : 'Ending' as MusicType,
                            artist: theme.song.artists.map((artist: any) => artist.name).join(', '),
                            name: theme.song.title,
                            number: theme.type.substr(2),
                            link: theme.animethemeentries[0].videos?.sort((x: any, y: any) => y.size - x.size)[0]?.link,
                        };

                        mergedAnime.music.push(song);
                        
                        let tiralexAnime = tiralexJson.anime.find(at => mergedAnime.id === at.mal_id);
                        if(!tiralexAnime) {
                            tiralexAnime = {
                                nom: mergedAnime.titles.original,
                                id: 0, // TODO: really unused?
                                mal_id: mergedAnime.id,
                                nb_musique: 0, // Will be recalculated later
                                genres: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // TODO: fill correctly
                                musique: [{
                                    type: song.type,
                                    artiste: song.artist,
                                    lien: song.link,
                                    nom: song.name,
                                    numero: song.number,
                                }],
                            };
        
                            tiralexJson.anime.push(tiralexAnime);
                            tiralexJson.nb_anime++;
                        }
                    });
                } else {
                    console.log(`Animethemes.moe: skipping ${a.name}`);
                }
            });
        });

        if(splicedQueries.length !== 1) {
            await delay(60000);
        }
    }
    
    // Recalculate sizes
    tiralexJson.anime.forEach(a => {
        a.nb_musique = a.musique.length;
    });

    tiralexJson.nb_musique = tiralexJson.anime.reduce((acc, a) => acc + a.musique.length, 0);

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
            malMeanScore: anime.malMeanScore,
            oldestUpdate: anime.oldestUpdate,
            source: anime.source,
            averageEpisodeDuration: anime.averageEpisodeDuration,
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

    await fsPromise.writeFile('api/v2/tiralex.json', JSON.stringify(tiralexJson));
    promises.push(gzipFile('api/v2/tiralex.json', 'api/v2/tiralex.json.gz'));
    promises.push(brotliFile('api/v2/tiralex.json', 'api/v2/tiralex.json.br'))

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