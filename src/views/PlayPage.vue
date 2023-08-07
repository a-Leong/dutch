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
    <section>
      <pre>{{ game }}</pre>
    </section>

    <section class="even-row">
      <div>
        <label>Draw</label>
        <play-page-card
          v-if="game.drawPile?.topCard"
          :card="game.drawPile.topCard"
        />
      </div>

      <div>
        <label>Discard</label>
        <play-page-card
          v-if="game.discardPile?.topCard"
          :card="game.discardPile.topCard"
        />
      </div>
    </section>

    <section
      v-if="game.phase === 'ingame'"
      v-for="player in game.players"
      :key="player.uid"
    >
      <p>{{ player.uid.substring(0, 4) }}</p>
      <div class="even-row">
        <play-page-card
          v-for="card in player.hand"
          v-bind="{ card }"
          :key="card.id"
        />
      </div>
    </section>

    <section>
      <button type="button" @click="sendCommand({ id: 'toggle-ready' })">
        toggle ready
      </button>
    </section>

    <section>
      <button type="button" @click="auth.signOut">sign out</button>
    </section>

    <!-- Fixed position bottom corner -->
    <app-server-status-icon class="server-status-icon" :size="24" />
  </div>
</template>

<style scoped>
section {
  margin: 16px;
}

.even-row {
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
