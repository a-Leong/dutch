<script setup>
import { useGameStore } from "@/stores/use-game-store";
import { useSocketStore } from "@/stores/use-socket-store";
import { onMounted, onUnmounted } from "vue";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
    required: true,
  },
});

const gameStore = useGameStore();
const socketStore = useSocketStore();

onMounted(async () => {
  await socketStore.initSocket();
});
onUnmounted(() => socketStore.deinitSocket());
</script>

<template>
  <h1>{{ msg.text }}</h1>

  <pre>
WebSocket: {{ socketStore.isConnected ? "connected" : "disconnected" }}</pre
  >
  {{ gameStore.gameState }}

  <div class="card">
    <button type="button" @click="gameStore.incrementDocCount()">
      Firestore sandbox.count is {{ gameStore.gameState?.doc?.count }}
    </button>
  </div>

  <div class="card">
    <button type="button" @click="gameStore.incrementDbObjCount()">
      RTDB sandbox.count is {{ gameStore.gameState?.dbObj?.count }}
    </button>
  </div>
</template>

<style scoped></style>
