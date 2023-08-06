<script setup>
import { storeToRefs } from "pinia";

import { auth } from "@/firebase-config";

import { useGameStore } from "@/stores/use-game-store";
import { useSocketStore } from "@/stores/use-socket-store";

import AppServerStatusIcon from "@/components/AppServerStatusIcon.vue";
import PlayPageCard from "@/components/PlayPageCard.vue";

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
    <div>
      <pre>{{ game }}</pre>
    </div>

    <template
      v-if="game.phase === 'ingame'"
      v-for="player in game.players"
      :key="player.uid"
    >
      <p>{{ player.uid.substring(0, 4) }}</p>
      <div class="hand">
        <play-page-card
          v-for="card in player.hand"
          v-bind="{ card }"
          :key="card.id"
        />
      </div>
    </template>

    <div>
      <button type="button" @click="sendCommand({ id: 'ready-to-play' })">
        ready to play
      </button>
    </div>

    <div>
      <button type="button" @click="auth.signOut">sign out</button>
    </div>

    <app-server-status-icon class="server-status-icon" :size="24" />
  </div>
</template>

<style scoped>
.hand {
  margin: 16px;
  display: flex;
  justify-content: space-evenly;
}

.server-status-icon {
  position: fixed;
  bottom: 0;
  right: 0;
}
</style>
