<script setup>
const props = defineProps({
  showMessagesOverlay: { type: Boolean, required: true },
  latestMessages: {
    /** @type {import('vue').PropType<import('vue').DeepReadonly<import('@/models/message').Message[]>>} */
    type: Object,
    required: true,
  },
  messages: {
    /** @type {import('vue').PropType<import('vue').DeepReadonly<import('@/models/message').Message[]>>} */
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["toggleShowMessagesOverlay"]);
</script>

<template>
  <button @click="emit('toggleShowMessagesOverlay')">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path
        v-if="showMessagesOverlay"
        fill="currentColor"
        d="m10.5 11.174l.874-.998a.5.5 0 0 1 .752.658l-1.75 2a.5.5 0 0 1-.752 0l-1.75-2a.5.5 0 1 1 .752-.658l.874.998V7.495a.5.5 0 0 1 1 0v3.68ZM4 16a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4Zm-1-2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9h-5.5V7.495a1.5 1.5 0 1 0-3 0V9H3v5Z"
      />

      <path
        v-else
        fill="currentColor"
        d="m10.5 8.826l.874.998a.5.5 0 0 0 .752-.658l-1.75-2a.5.5 0 0 0-.752 0l-1.75 2a.5.5 0 0 0 .752.658l.874-.998v3.679a.5.5 0 0 0 1 0v-3.68ZM4 4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4ZM3 6a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v5h-5.5v1H17v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2h5.5v-1H3V6Z"
      />
    </svg>
  </button>

  <transition-group
    v-if="showMessagesOverlay"
    class="messages-overlay"
    tag="div"
    name="list"
  >
    <p v-for="({ message, timestamp }, i) in messages" :key="i">
      <b class="timestamp">{{ timestamp.toLocaleTimeString() }}:</b>
      {{ message }}
    </p>
    <p v-if="messages.length === 0">no messages</p>
  </transition-group>

  <transition-group v-else class="messages-preview" tag="div" name="list">
    <p
      v-for="{ message, timestamp } in latestMessages"
      :key="timestamp.toISOString()"
    >
      <b class="timestamp">{{ timestamp.toLocaleTimeString() }}:</b>
      {{ message }}
    </p>
  </transition-group>
</template>

<style scoped>
button {
  pointer-events: all;
  height: 24px;
  margin-inline-end: 16px;
  background-color: transparent;
}
button:hover {
  border-color: transparent;
}
svg {
  height: 100%;
}

.messages-preview {
  padding-left: 8px;
  text-align: start;
}

.messages-overlay {
  padding-left: 8px;
  text-align: start;
  border-left: dotted 1px black;
}

.timestamp {
  color: #ccc;
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
