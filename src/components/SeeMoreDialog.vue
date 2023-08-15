<script setup lang="ts">

import { storeToRefs } from 'pinia';
import { useSeeMoreStore } from '../stores/SeeMoreStore';
import { onMounted, watch, ref, computed } from 'vue';
import { getTitle, getLangCode, getType, getRating } from '../utils/AnimeLabels';
import LoadingIcon from './LoadingIcon.vue';
import Scores from './Scores.vue';
import { useSettingsStore } from '../stores/SettingsStore';
import { useSearchStore } from '../stores/SearchStore';
import { pluralize } from '../utils/Pluralize';
import { type AnimeExtended } from '../Types';

/**
 * Settings store.
 */
const settingsStore = useSettingsStore();

const { anime, visible } = storeToRefs(useSeeMoreStore());

const { selectedGenres, selectedStudios } = storeToRefs(useSearchStore());

/**
 * Additional data for the dialog.
 */
const data = ref<{ secondary: AnimeExtended | null }>({
    /**
     * Nested object containing the additional data.
     * Needed because of the way refs work.
     */
    secondary: null,
});

/**
 * Whether the copy to clipboard action is done.
 */
const clipboardCopyDone = ref(false);

const dialogRef = ref<HTMLDialogElement | null>(null);

onMounted(() => {
    if(dialogRef.value !== null) {
        dialogRef.value.addEventListener('close', () => {
            visible.value = false;
        });
    }
});

// Fetch the additional data when the anime changes.
watch(anime, () => {
    // Will show the loading indicator.
    data.value.secondary = null;

    if(anime.value.id !== undefined) {
        fetch(`/api/v2/animes/${anime.value.id}.json`)
            .then(res => res.json())
            .then(json => {
                data.value.secondary = json;
            });
    }
});

/*
 * Watch for changes to the visible state, and open/close the dialog accordingly.
 */
watch(visible, (newVal) => {
    if(dialogRef.value !== null) {
        if(newVal) {
            dialogRef.value.showModal();
        } else {
            dialogRef.value.close();
        }
    }
});

watch(clipboardCopyDone, (newVal) => {
    if(newVal) {
        setTimeout(() => {
            clipboardCopyDone.value = false;
        }, 2000);
    }
});

/**
 * The title of the anime.
 */
const title = computed(() => getTitle(anime.value));

/**
 * The title language used.
 */
const titleLanguage = computed(() => getLangCode());

/**
 * The type of the anime.
 */
const type = computed(() => getType(anime.value));

/**
 * Capitalizes the first letter of a string.
 * @param string The string to capitalize.
 * @returns The capitalized string.
 */
function capitlizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Share a link to the anime.
 */
function share(e: MouseEvent) {
    e.preventDefault();

    // The data to share.
    const data: ShareData = {
        title: getTitle(anime.value),
        text: `Check out ${getTitle(anime.value)} on ACLVTQ!`,
        url: `https://aclvt.tchm.dev/?id=${anime.value.id}`,
    };

    // Check if the browser supports the Web Share API.
    if('share' in navigator && 'canShare' in navigator && navigator.canShare(data)) {
        try {
            navigator.share(data);
        } catch(e) {
            // Do nothing. If the user cancels the share, an error will be thrown.
        }
    } else { // Use the clipboard API as a fallback.
        navigator.clipboard.writeText(data.url as string);
        clipboardCopyDone.value = true;
    }
}

</script>

<template>
    <dialog ref="dialogRef">
        <div class="toast" v-if="clipboardCopyDone">
            <p>Link copied to the clipboard !</p>
        </div>

        <div class="dialogHeader">
            <div>
                <h2 :lang="titleLanguage" id="animeTitle"><a :href="`https://myanimelist.net/anime/${anime.id}`" target="_blank" :style="settingsStore.colorizeLinks ? 'color: #0091FF' : 'color: black'">{{ title }} <img src="@/assets/open-external.svg" height="20" width="20"></a></h2>
                <small>{{ type }}</small>
            </div>
            <div class="buttons">
                <a @click="(e) => share(e)" :href="`https://aclvt.tchm.dev/?id=${anime.id}`"><img src="@/assets/share.svg" alt="Share" height="30" width="30"></a>
                <img @click="visible = false" src="@/assets/close.svg" alt="Close" height="30" width="30">
            </div>
        </div>

        <div id="seeMoreDialogBody">
            <div id="coverContainer">
                <h3 id="coverHeading">Cover art</h3>
                <a :href="anime.cover" target="_blank" title="Open in a new tab">
                    <img :src="anime.cover" height="600" width="424">
                </a>
            </div>

            <LoadingIcon v-if="data.secondary === null" :light-mode="true" />
            <div v-else class="rightPart">
                <h3>Synopsis</h3>
                <p v-for="paragraph in data.secondary.synopsis.split('\n')">{{ paragraph }}</p>

                <div id="moreInfo">
                    <div class="infoSection">
                        <h3>More info</h3>
                        <table class="tableOptions">
                            <tr v-if="data.secondary.episodes !== undefined && data.secondary.episodes > 0 && anime.type !== 'movie'">
                                <td class="label">Episodes</td>
                                <td>{{ data.secondary.episodes }}</td>
                            </tr>
                            <tr v-if="anime.startDate !== undefined">
                                <td class="label">Start date</td>
                                <td>{{ anime.startDate }}</td>
                            </tr>
                            <tr v-if="data.secondary.endDate !== undefined && anime.type !== 'movie'">
                                <td class="label">End date</td>
                                <td>{{ data.secondary.endDate }}</td>
                            </tr>
                            <tr v-if="data.secondary.startSeason !== undefined">
                                <td class="label">Airing season</td>
                                <td>{{ `${capitlizeFirstLetter(data.secondary.startSeason.season)} ${data.secondary.startSeason.year}` }}</td>
                            </tr>
                            <tr v-if="anime.malMeanScore !== undefined">
                                <td class="label">MyAnimeList score</td>
                                <td>{{ anime.malMeanScore }} / 10</td>
                            </tr>
                            <tr v-if="anime.studios.length !== 0">
                                <td class="label">{{ pluralize(anime.studios.length, 'Studio', 'Studios') }}</td>
                                <td class="commaList">
                                    <span v-for="studio in anime.studios" @click="() => { if(!selectedStudios.some(s => s === studio)) { selectedStudios.push(studio) } }"><span class="searchEdit" title="Add to search">{{ studio }}</span><span class="comma">, </span></span>
                                </td>
                            </tr>
                            <tr v-if="anime.genres.length !== 0">
                                <td class="label">{{ pluralize(anime.genres.length, 'Genre', 'Genres') }}</td>
                                <td class="commaList">
                                    <span v-for="genre in anime.genres" @click="() => { if(!selectedGenres.some(g => g === genre)) { selectedGenres.push(genre) } }"><span class="searchEdit" title="Add to search">{{ genre }}</span><span class="comma">, </span></span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="infoSection">
                        <h3>Titles</h3>
                        <table class="tableOptions">
                            <tr>
                                <td class="label">Romaji title</td>
                                <td>{{ anime.titles.original }}</td>
                            </tr>
                            <tr v-if="anime.titles.en !== undefined">
                                <td class="label">English title</td>
                                <td>{{ anime.titles.en }}</td>
                            </tr>
                            <tr v-if="anime.titles.ja !== undefined">
                                <td class="label">Japanese title</td>
                                <td lang="ja">{{ anime.titles.ja }}</td>
                            </tr>
                            <tr v-if="anime.titles.synonyms !== undefined && anime.titles.synonyms.length !== 0">
                                <td class="label">Alternative {{ pluralize(anime.titles.synonyms.length, 'name', 'names') }}</td>
                                <td>{{ anime.titles.synonyms.join(', ') }}</td>
                            </tr>
                            <tr>
                                <td class="label">Age rating</td>
                                <td>{{ getRating(anime.rating) }}</td>
                            </tr>
                        </table>
                    </div>

                    <div class="infoSection">
                        <h3>Scores</h3>
                        <div id="scoresDisplay"><Scores :scores="anime.scores" /></div>
                    </div>
                </div>
            </div>
        </div>
    </dialog>
</template>

<style>
.label {
    font-weight: bold;
}

#seeMoreDialogBody {
    display: flex;
}

#seeMoreDialogBody > .rightPart h3:first-child {
    margin-top: 0;
}

#coverContainer {
    margin-right: 1rem;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

#coverHeading {
    display: none;
    align-self: flex-start;
    
    margin-top: 0px;
}

#animeTitle a {
    display: flex;
    align-items: flex-start;
}

#animeTitle a img {
    margin-left: 5px;
}

#moreInfo {
    display: flex;
    align-items: flex-start;
    justify-content: space-around;
    flex-wrap: wrap;
}

.infoSection {
    margin-bottom: 15px;
    margin-right: 30px;
}

.searchEdit {
    cursor: pointer;
}

.searchEdit:hover {
    text-decoration: underline;
}

@media screen and ((max-width: 1005px) or (orientation: portrait)) {
    #coverContainer {
        margin-right: 0px;
        margin-top: 1rem;

        height: fit-content;
    }

    #coverContainer img {
        height: 100%;
        width: 100%;
    }

    #seeMoreDialogBody {
        flex-direction: column-reverse;
    }

    #coverHeading {
        display: block;
    }

    #moreInfo {
        flex-direction: column;
        flex-wrap: nowrap;
        align-items: flex-start;
    }

    #moreInfo table, .infoSection, #moreInfo, #seeMoreDialogBody {
        width: 100%;
    }

    #scoresDisplay {
        display: flex;
        justify-content: center;
    }

    #scoresDisplay > table {
        width: fit-content;
    }
}
</style>