import fs from 'fs';

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

        const response = await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?limit=100&fields=list_status&offset=${offset}`, {
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
                cover: anime.node.main_picture.large,
            };
        }

        // Check if the user has a score for this anime
        if(anime.list_status.score !== 0) {
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

fs.writeFileSync('additional-data.json', JSON.stringify(additionalData));
console.log('Done.');