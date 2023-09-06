<script setup>
import { ref, toRefs, watch } from "vue";
import { useScroll } from "@vueuse/core";

import AppServerStatusIcon from "@/components/AppServerStatusIcon.vue";

import { useSocketStore } from "@/stores/use-socket-store";

import { stringToColor } from "@/utils/colors";

const socketStore = useSocketStore();
const { messages } = toRefs(socketStore);

//
// Preview messages

/** @type {import("vue").Ref<import('@/models/message').Message[]>} */
const latestMessages = ref([]);

watch(socketStore.messages, () => {
  latestMessages.value.push(messages.value[messages.value.length - 1]);
  setTimeout(() => latestMessages.value.shift(), 4000);
});

//
// Overlay

const overlayRef = ref();
const scrollContainerRef = ref();
const showMessagesOverlay = ref(false);

const { y } = useScroll(overlayRef);

watch(
  [showMessagesOverlay, messages],
  () => (y.value = scrollContainerRef.value?.$el.clientHeight),
  { flush: "post" }
);
</script>

<template>
  <div v-if="showMessagesOverlay" ref="overlayRef" class="messages-overlay">
    <!-- All message -->
    <transition-group
      class="scroll-container"
      ref="scrollContainerRef"
      tag="div"
      name="list"
    >
      <p
        v-for="({ author, message, timestamp }, i) in messages"
        :key="i"
        class="message"
      >
        <b class="timestamp">{{ timestamp.toLocaleTimeString() }}</b>
        <b :style="{ color: stringToColor(author) }" class="author">
          {{ author }}:
        </b>
        {{ message }}
      </p>
      <p v-if="messages.length === 0" class="message">no messages</p>
    </transition-group>
  </div>

  <!-- Latest messages preview -->
  <transition-group v-else class="messages-preview" tag="div" name="list">
    <p
      v-for="{ author, message, timestamp } in latestMessages"
      :key="timestamp.toISOString()"
      class="message"
    >
      <b :style="{ color: stringToColor(author) }" class="author">
        {{ author }}:
      </b>
      {{ message }}
    </p>
  </transition-group>

  <!-- Toggle messages -->
  <button @click="showMessagesOverlay = !showMessagesOverlay">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path
        v-if="showMessagesOverlay"
        fill="white"
        d="m10.5 11.174l.874-.998a.5.5 0 0 1 .752.658l-1.75 2a.5.5 0 0 1-.752 0l-1.75-2a.5.5 0 1 1 .752-.658l.874.998V7.495a.5.5 0 0 1 1 0v3.68ZM4 16a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4Zm-1-2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9h-5.5V7.495a1.5 1.5 0 1 0-3 0V9H3v5Z"
      />

      <path
        v-else
        fill="black"
        d="m10.5 8.826l.874.998a.5.5 0 0 0 .752-.658l-1.75-2a.5.5 0 0 0-.752 0l-1.75 2a.5.5 0 0 0 .752.658l.874-.998v3.679a.5.5 0 0 0 1 0v-3.68ZM4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4ZM3 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5h-5.5v1H17v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2h5.5v-1H3V6Z"
      />
    </svg>
  </button>

  <!-- Server connection status -->
  <div class="status-icon">
    <app-server-status-icon />
  </div>
</template>

<style scoped>
button {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 24px;
  margin: 4px;
  background-color: transparent;
}
button:hover {
  border-color: transparent;
}
svg {
  height: 100%;
}

.messages-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 100%;
  overflow: auto;

  padding-left: 48px;

  background-color: #000a;
}

.messages-overlay.scroll-container {
  position: relative;
  height: 100%;
}

.messages-preview {
  position: absolute;
  bottom: 0;
  left: 40px;
  right: 0;

  text-align: start;
  pointer-events: none;
}

.message {
  color: v-bind("showMessagesOverlay ? 'white' : 'black'");
  font-family: monospace;
  font-size: 18px;
  display: flex;
  align-items: start;
}

.timestamp {
  text-wrap: nowrap;
  margin-inline-end: 16px;
  color: #aaa;
}

.author {
  margin-inline-end: 16px;
}

.status-icon {
  position: absolute;
  right: 0;
  bottom: 0;
  height: 24px;
  width: 24px;
}

/* List transition animation classes */

.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 200ms ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
