<script setup lang="ts">

import { useSettingsStore } from '@/stores/SettingsStore';
import { ref, watch, onMounted } from 'vue';

const settingsStore = useSettingsStore();

/**
 * The props for this component.
 */
const props = defineProps<{
    /**
     * The title of the dialog.
     */
    title: string;

    /**
     * An URL to link from the title.
     */
    titleLink?: string;

    /**
     * The language of the title.
     */
    titleLang?: string;

    /**
     * The subtitle of the dialog.
     */
    subtitle?: string;

    /**
     * The buttons to display in the header.
     */
    buttons: {
        /**
         * The icon to display.
         */
        icon: string;

        /**
         * The alt text for the icon.
         */
        alt: string;

        /**
         * The action to perform when the button is clicked.
         */
        action: (e: MouseEvent) => void;

        /**
         * An URL to link to.
         */
        link?: string;
    }[];

    /**
     * Whether the dialog is visible.
     */
    visible: boolean;

    /**
     * The action to perform to close the dialog.
     */
    hide: () => void;

    /**
     * The action to perform when the dialog is mounted.
     *
     * @param dialogRef The reference to the dialog element.
     */
    onMounted?: (dialogRef: HTMLDialogElement) => void;

    /**
     * Whether the dialog should fit its content.
     */
    fitContent?: boolean;
}>();

/**
 * Event emitter.
 */
const emit = defineEmits<{
    /**
     * Emitted when the dialog is closed.
     */
    (e: 'closed'): void;

    /**
     * Emitted when the dialog is shown.
     */
    (e: 'shown'): void;
}>();

/**
 * The reference to the dialog element.
 */
const dialogRef = ref<HTMLDialogElement | null>(null);

// Watch for changes to the visible property.
watch(() => props.visible, (newVal) => {
    if(newVal) {
        document.querySelector('body')?.classList.add('noScroll');

        dialogRef.value?.showModal();
        emit('shown');
    } else {
        document.querySelector('body')?.classList.remove('noScroll');

        dialogRef.value?.close();
        emit('closed');
    }
});

onMounted(() => {
    if(dialogRef.value !== null) {
        // When the dialog is closed, hide the video player.
        dialogRef.value.addEventListener('close', () => {
            props.hide();
        });

        // Run the onMounted callback.
        if(props.onMounted !== undefined) {
            props.onMounted(dialogRef.value);
        }
    }
});

</script>

<template>
    <dialog ref="dialogRef" :class="props.fitContent ? 'fitContent dialog' : 'dialog'">
        <div class="dialogHeader">
            <div>
                <h2 v-if="props.titleLink !== undefined">
                    <a :href="props.titleLink" target="_blank" :style="settingsStore.colorizeLinks ? 'color: #0091FF' : 'color: black'">
                        <span :lang="props.titleLang === undefined ? 'en' : props.titleLang">{{ props.title }}</span>
                        <img src="@/assets/open-external.svg" height="20" width="20">
                    </a>
                </h2>
                <h2 v-else :lang="props.titleLang === undefined ? 'en' : props.titleLang">{{ props.title }}</h2>

                <small v-if="props.subtitle !== undefined">{{ props.subtitle }}</small>
            </div>
            <div class="buttons">
                <span v-for="btn in props.buttons">
                    <a v-if="btn.link !== undefined" :href="btn.link">
                        <img :src="btn.icon" :alt="btn.alt" :title="btn.alt" @click="(e) => btn.action(e)" height="30" width="30">
                    </a>

                    <img v-else :src="btn.icon" :alt="btn.alt" :title="btn.alt" @click="(e) => btn.action(e)" height="30" width="30">
                </span>

                <img @click="props.hide" src="@/assets/close.svg" alt="Close" title="Close" height="30" width="30">
            </div>
        </div>

        <slot>You found a bug. Congratulations.</slot>
    </dialog>
</template>

<style>
dialog {
  border: 1px solid lightslategray;
  border-radius: 5px;

  padding-left: 10px;
  padding-right: 10px;

  width: 80%;
  max-height: 90%;

  animation: fadein 0.75s;

  background-color: white;
}

dialog::backdrop {
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  animation: fadein 0.75s;
}

.dialogHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin: 0px;
  margin-bottom: 20px;
  padding: 0px;
}

.dialogHeader h2 {
  margin: 0px;
  padding: 0px;
}

.dialogHeader .buttons > * {
  margin-right: 10px;
  cursor: pointer;
}

.dialogHeader .buttons > *:last-child {
  margin-right: 0px;
}

.buttons {
  display: flex;
  flex-direction: row;
}
</style>