<script setup lang="ts">

import { useRegisterSW } from 'virtual:pwa-register/vue';
import { watch } from 'vue';

const {
    offlineReady,
    needRefresh,
    updateServiceWorker,
} = useRegisterSW();

function close() {
    offlineReady.value = false;
    needRefresh.value = false;
}

watch(offlineReady, () => {
  fetch('/api/v2/index.json'); // Pre-cache the index.
});

</script>

<template>
    <div v-if="offlineReady || needRefresh" class="pwaToast">
        <div class="pwaMsg">
            <span v-if="offlineReady">Ready to work offline.</span>
            <span v-else>New version available.</span>
        </div>

        <button v-if="needRefresh" @click="() => updateServiceWorker()">Reload</button>
        <button @click="close">Close</button>
    </div>
</template>

<style>
.pwaToast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 4px;
  z-index: 1;
  text-align: left;
  box-shadow: 3px 4px 5px 0 #8885;
  background-color: black;
}

.pwaToast .pwaMsg {
  margin-bottom: 8px;
}

.pwaToast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 2px;
  padding: 3px 10px;
}
</style>