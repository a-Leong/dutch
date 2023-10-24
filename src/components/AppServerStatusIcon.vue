<script setup>
import { useSocketStore } from "@/stores/use-socket-store";

const socketStore = useSocketStore();
</script>

<template>
  <span
    :title="
      socketStore.isConnected
        ? 'CONNECTED TO SERVER'
        : 'NOT CONNECTED TO SERVER'
    "
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      :class="socketStore.isConnected ? 'slow-fade' : 'fast-fade'"
    >
      <!-- https://api.iconify.design/fluent:plug-connected-checkmark-20-filled.svg -->
      <path
        v-if="socketStore.isConnected"
        fill="#35792E"
        d="M17.78 3.28a.75.75 0 0 0-1.06-1.06l-2.446 2.445a4.037 4.037 0 0 0-5.128.481l-.3.3a1.49 1.49 0 0 0 0 2.108l2.465 2.464a5.51 5.51 0 0 1 4.552-.848a4.041 4.041 0 0 0-.528-3.444L17.78 3.28ZM7.554 8.846l2.464 2.465a5.51 5.51 0 0 0-.848 4.552a4.041 4.041 0 0 1-3.444-.528L3.28 17.78a.75.75 0 0 1-1.06-1.06l2.446-2.446a4.037 4.037 0 0 1 .48-5.128l.3-.3a1.49 1.49 0 0 1 2.108 0ZM19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0Zm-2.146-1.854a.5.5 0 0 0-.708 0L13.5 15.293l-.646-.647a.5.5 0 0 0-.708.708l1 1a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0 0-.708Z"
      />

      <!-- https://api.iconify.design/fluent:plug-disconnected-20-filled.svg -->
      <path
        v-else
        fill="red"
        d="M17.78 2.22a.75.75 0 0 1 0 1.06l-1.445 1.446a4.037 4.037 0 0 1-.481 5.127l-.3.3l-.003.003l-.309.309a1.05 1.05 0 0 1-1.484 0L9.535 6.242a1.05 1.05 0 0 1 0-1.485l.611-.61a4.04 4.04 0 0 1 5.128-.481L16.72 2.22a.75.75 0 0 1 1.06 0Zm-9 6.25a.75.75 0 0 1 0 1.06l-1.27 1.272l1.69 1.69l1.27-1.272a.75.75 0 1 1 1.061 1.06l-1.276 1.277a1.49 1.49 0 0 1-.1 1.997l-.3.3a4.037 4.037 0 0 1-5.128.48L3.28 17.78a.75.75 0 0 1-1.06-1.06l1.445-1.446a4.037 4.037 0 0 1 .481-5.127l.3-.3a1.49 1.49 0 0 1 1.997-.1L7.72 8.47a.75.75 0 0 1 1.06 0Z"
      />
    </svg>
  </span>
</template>

<style scoped>
svg {
  height: 24px;
  min-width: 24px;
}

svg.fast-fade {
  animation: fade-in-out 400ms linear infinite alternate;
}
</style>
