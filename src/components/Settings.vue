<script setup lang="ts">

import { ref, computed } from 'vue';
import { useSettingsStore } from '../stores/SettingsStore';
import { storeToRefs } from 'pinia';
import { useDataStore } from '../stores/DataStore';

import Dialog from './Dialog.vue';
import ResetIcon from '@/assets/reset.svg';

/**
 * Whether or not the search dialog is open.
 */
const dialogOpen = ref(false);

/**
 * Whether or not the database is currently downloading.
 */
const downloading = ref(false);

/**
 * Whether or not an error occurred while downloading the database.
 */
const errorDownloading = ref(false);

/**
 * The current number of downloaded entries.
 */
const currentDownloaded = ref(0);

/**
 * The settings store.
 */
const settingsStore = useSettingsStore();

const { headerColor, colorizeLinks, animeLanguage } = storeToRefs(settingsStore);

const { data } = storeToRefs(useDataStore());

const viewedAnimes = computed(() => {
    return data.value?.animes.filter(a => a.wasWatched === true);
});

/**
 * The date of the last database update.
 */
const dbUpdate = computed(() => new Date(data.value?.updatedAt ?? 0));

/**
 * The date of the next database update.
 */
const nextDbUpdate = computed(() => new Date(dbUpdate.value.getTime() + 30 * 60000));

function reset() {
    settingsStore.$patch({
        headerColor: '#00bfff',
        colorizeLinks: false,
        animeLanguage: 'original',
    });
}

async function downloadMetadata() {
    downloading.value = true;
    errorDownloading.value = false;
    currentDownloaded.value = 0;

    let promises: Promise<any>[] = [fetch('/api/v2/index.json')];

    if(viewedAnimes.value !== undefined) {
        const length = viewedAnimes.value.length;

        let i = 0;
        for(const a of viewedAnimes.value) {
            promises.push(fetch(`/api/v2/animes/${a.id}.json`)
            .then(() => {
                currentDownloaded.value++;
                console.log(`Downloaded ${currentDownloaded.value} of ${length} entries.`);
            }).catch((e) => {
                errorDownloading.value = true;
                console.error(e);
            }));

            i++;

            if(i >= 50) {
                await Promise.all(promises);
                i = 0;
                promises = [];
            }
        }
    }

    await Promise.all(promises);
    downloading.value = false;
}

async function downloadPictures() {
    downloading.value = true;
    errorDownloading.value = false;
    currentDownloaded.value = 0;
    
    let promises = [];

    if(viewedAnimes.value !== undefined) {
        const length = viewedAnimes.value.length;

        let i = 0;
        for(const a of viewedAnimes.value) {
            promises.push(fetch(a.cover)
            .then(() => {
                currentDownloaded.value++;
                console.log(`Downloaded ${currentDownloaded.value} of ${length} entries.`);
            }).catch((e) => {
                errorDownloading.value = true;
                console.error(e);
            }));

            i++;

            if(i >= 50) {
                await Promise.all(promises);
                i = 0;
                promises = [];
            }
        }
    }

    await Promise.all(promises);
    downloading.value = false;
}

</script>

<template>
    <img @click="dialogOpen = true" src="@/assets/settings.svg" alt="Settings" title="Settings" height="30" width="30" class="svgFix" id="settingsButton">

    <Dialog
            :title="'Settings'"
            :visible="dialogOpen"
            :hide="() => dialogOpen = false"
            :buttons="[
                {
                    icon: ResetIcon,
                    alt: 'Reset',
                    action: reset,
                }
            ]">

        <table class="tableOptions" id="settingsContent">
            <tbody>
                <tr>
                    <td>
                        <label for="animeLanguage">Anime names: </label>
                    </td>
                    <td>
                        <select id="animeLanguage" v-model="animeLanguage">
                            <option value="original">Romaji</option>
                            <option value="en">English</option>
                            <option value="ja">Japanese</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="colorizeLinks">Colorize links: </label>
                    </td>
                    <td>
                        <input type="checkbox" id="colorizeLinks" v-model="colorizeLinks">
                    </td>
                </tr>

                <tr>
                    <td>
                        <label for="headerColor">Header color: </label>
                    </td>
                    <td>
                        <input type="color" id="headerColor" v-model="headerColor">
                    </td>
                </tr>
            </tbody>
        </table>

        <h3>Offline mode</h3>
        <p>You can choose to download part of the database to make it available while offline.</p>
        <p><strong>Metadata :</strong> names, scores, studios, genres and more.</p>
        <p><strong>Pictures :</strong> cover art.</p>

        <div id="downloadButtons" v-if="!downloading">
            <button @click="downloadMetadata">Download metadata</button>
            <button @click="downloadPictures">Download pictures</button>
        </div>
        <div v-else id="downloadProgress">
            <p>Downloading... {{ currentDownloaded }} / {{ viewedAnimes?.length }}</p>
            <progress :value="currentDownloaded" :max="viewedAnimes?.length"></progress>
        </div>

        <p v-if="errorDownloading">An error occurred while downloading the database.</p>

        <h3>About</h3>
        <div class="colorizeLinks">
            <p>This website was initially made as a remake of <a href="https://tiralex1.github.io/ACLV/" target="_blank">the original AMQ ACLVT</a> by <a href="https://github.com/Tiralex1/" target="_blank">Tiralex1</a> as a way for me to learn <a href="https://vuejs.org/" target="_blank">Vue.js</a>. Since then, this project became a bit larger in scope and I added some stuff not in the original website.</p>

            <p>I use data pulled directly from Tiralex1's GitHub repository (music data such as titles, artists and links) plus additional metadata from <a href="https://myanimelist.net/" target="_blank">MyAnimeList</a> (scores, airing state, type, cover art and more).</p>

            <p>This website was made using the following technologies :</p>
            <ul>
                <li><a href="https://vuejs.org/" target="_blank">Vue.js</a></li>
                <li><a href="https://pinia.vuejs.org/" target="_blank">Pinia</a></li>
                <li><a href="https://vue-select.org/" target="_blank">Vue Select</a></li>
                <li><a href="https://vite-pwa-org.netlify.app/" target="_blank">Vite PWA</a></li>
                <li><a href="https://www.typescriptlang.org/" target="_blank">TypeScript</a></li>
            </ul>

            <p>The source code for this website is available on <a href="https://github.com/ttcchhmm/aclvt-vue" target="_blank">GitHub</a>.</p>
        </div>

        <small>
            Last database update: {{ dbUpdate.toLocaleString() }}
            <br>
            Next database update: {{ nextDbUpdate.toLocaleString() }}
        </small>
    </Dialog>
</template>

<style>
#settingsButton {
    cursor: pointer;
}

#settingsContent {
    width: 100%;
}

#downloadButtons {
    display: flex;
    justify-content: space-evenly;
}

#downloadProgress {
    text-align: center;
    width: 100%;
}

#downloadProgress progress {
    width: 100%;
}
</style>

<style scoped>
@media screen and (min-width: 450px) {
    .dialog {
        max-width: 40%;
    }
}
</style>