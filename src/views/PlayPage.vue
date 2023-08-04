<script setup>
import { useGameStore } from "@/stores/use-game-store";
import { useSocketStore } from "@/stores/use-socket-store";
import { auth } from "@/firebase-config";
import { storeToRefs } from "pinia";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
  },
});

const gameStore = useGameStore();
const { game } = storeToRefs(gameStore);

const socketStore = useSocketStore();
const { sendCommand } = socketStore;
</script>

<template>
  <div>
    <div class="card">
      <pre>{{ game }}</pre>
    </div>

    <div class="card">
      <p>Game Server Connection: {{ socketStore.isConnected ? "🟢" : "🔴" }}</p>
      <button type="button" @click="sendCommand({ id: 'ready-to-play' })">
        ready to play
      </button>
      <button type="button" @click="auth.signOut">sign out</button>
    </div>
  </div>
</template>

<style scoped></style>
