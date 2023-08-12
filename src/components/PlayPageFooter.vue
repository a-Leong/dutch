<script setup>
import { ref, toRefs, watch } from "vue";

import AppServerResponses from "@/components/AppServerResponses.vue";
import AppServerStatusIcon from "@/components/AppServerStatusIcon.vue";

import { useSocketStore } from "@/stores/use-socket-store";

const socketStore = useSocketStore();
const { messages } = toRefs(socketStore);

//
// Preview messages

/** @type {import("vue").Ref<import('@/models/message').Message[]>} */
const latestMessages = ref([]);

watch(socketStore.messages, () => {
  latestMessages.value.push(messages.value[messages.value.length - 1]);
  setTimeout(() => latestMessages.value.shift(), 2000);
});

//
// Overlay

const showMessagesOverlay = ref(false);
</script>

<template>
  <footer>
    <app-server-responses
      v-bind="{ showMessagesOverlay, messages, latestMessages }"
      @toggle-show-messages-overlay="showMessagesOverlay = !showMessagesOverlay"
    />
    <app-server-status-icon style="margin-start: auto" />
  </footer>
</template>

<style scoped>
footer {
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;

  display: flex;
  align-items: end;
  justify-content: start;

  padding: 4px;

  pointer-events: none;
}
</style>
