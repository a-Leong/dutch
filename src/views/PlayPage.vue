<script setup>
import { useGameStore } from "@/stores/use-game-store";
import { useSocketStore } from "@/stores/use-socket-store";
import { auth } from "@/firebase-config";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
  },
});

const gameStore = useGameStore();
const socketStore = useSocketStore();
</script>

<template>
  <div>
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

    <div class="card">
      <button type="button" @click="auth.signOut">sign out</button>
    </div>
  </div>
</template>

<style scoped></style>
