<script setup>
import { watch, ref, onMounted, computed } from 'vue';
import { useSettingsStore } from '../stores/SettingsStore';
import { storeToRefs } from 'pinia';

/**
 * Whether or not the search dialog is open.
 */
 const dialogOpen = ref(false);

/**
 * The dialog reference.
 */
const dialogRef = ref(null);

/**
 * The settings store.
 */
const settingsStore = useSettingsStore();

const { headerColor, colorizeLinks, animeLanguage, orderByMAL } = storeToRefs(settingsStore);

watch(dialogOpen, (value) => {
    if (value) {
        dialogRef.value.showModal();
    } else {
        dialogRef.value.close();
    }
});

onMounted(() => {
    // Support closing the dialog by pressing the escape key.
    dialogRef.value.addEventListener('close', () => {
        dialogOpen.value = false;
    });
});

function reset() {
    settingsStore.$patch({
        headerColor: '#00bfff',
        colorizeLinks: false,
        animeLanguage: 'original',
        orderByMAL: true,
    });
}

</script>

<template>
    <img role="button" @click="dialogOpen = true" src="@/assets/settings.svg" alt="Settings" title="Settings" height="30" width="30" class="svgFix" id="settingsButton">

    <dialog ref="dialogRef" id="settingsDialog">
        <div class="dialogHeader">
            <h2>Settings</h2>
            <div>
                <img role="button" @click="reset" src="@/assets/reset.svg" alt="Reset" title="Reset" height="30" width="30">
                <img role="button" @click="dialogOpen = false" src="@/assets/close.svg" alt="Close" title="Close" height="30" width="30">
            </div>
        </div>

        <table class="tableOptions" id="settingsContent">
            <tbody>
                <tr>
                    <td>
                        <label for="animeLanguage">Anime names: </label>
                    </td>
                    <td>
                        <select id="animeLanguage" v-model="animeLanguage">
                            <option value="original">Romanji</option>
                            <option value="en">English</option>
                            <option value="ja">Japanese</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <td>
                        <label for="orderByMAL">Use the same ordering as MyAnimeList: </label>
                    </td>
                    <td>
                        <input type="checkbox" id="orderByMAL" v-model="orderByMAL">
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

        <h3>About</h3>
        <div id="about">
            <p>This website was initially made as a remake of <a href="https://tiralex1.github.io/ACLV/" target="_blank">the original AMQ ACLVT</a> by <a href="https://github.com/Tiralex1/" target="_blank">Tiralex1</a> as a way for me to learn <a href="https://vuejs.org/" target="_blank">Vue.js</a>. Since then, this project became a bit larger in scope and I added some stuff not in the original website.</p>

            <p>I use data pulled directly from Tiralex1's GitHub repository (mostly anime and music data such as names and links) plus additional metadata from <a href="https://myanimelist.net/" target="_blank">MyAnimeList</a> (scores, airing state, type and cover art).</p>

            <p>This website was made using the following technologies :</p>
            <ul>
                <li><a href="https://vuejs.org/" target="_blank">Vue.js</a></li>
                <li><a href="https://pinia.vuejs.org/" target="_blank">Pinia</a></li>
            </ul>

            <p>The source code for this website is available on <a href="https://github.com/ttcchhmm/aclvt-vue" target="_blank">GitHub</a>.</p>
        </div>
    </dialog>
</template>

<style>
#settingsButton {
    margin-left: 10px;
}

#settingsContent {
    width: 100%;
}

#about a {
    color: blue;
}

@media screen and (min-width: 450px) {
    #settingsDialog {
        max-width: 40%;
    }
}
</style>