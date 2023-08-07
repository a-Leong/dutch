<script setup>
import { ref, watchEffect } from "vue";
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

const selectedCards = ref([]);
watchEffect(() => {
  if (selectedCards.value.length > 2) selectedCards.value.shift();
});
</script>

<template>
  <div>
    <!-- Debug clientState JSON -->
    <section>
      <pre>{{ game }}</pre>
    </section>

    <!-- Draw and discard piles -->
    <section v-if="game.phase === 'ingame'" class="even-row">
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

    <!-- Players' hands -->
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

    <!-- Handshake game commands (all players must agree for server to make change) -->
    <section>
      <button type="button" @click="sendCommand({ id: 'toggle-start' })">
        toggle start
      </button>

      <button type="button" @click="sendCommand({ id: 'toggle-restart' })">
        toggle restart
      </button>

      <button type="button" @click="sendCommand({ id: 'toggle-end' })">
        toggle end
      </button>
    </section>

    <!-- Individual game commands -->
    <section>
      <button type="button" @click="sendCommand({ id: 'draw-discard-pile' })">
        draw from draw pile
      </button>

      <button type="button" @click="sendCommand({ id: 'draw-discard-pile' })">
        draw from discard pile
      </button>

      <button
        type="button"
        @click="sendCommand({ id: 'match-discard', cardId: 'PLACEHOLDER' })"
      >
        match discard
      </button>

      <button type="button" @click="sendCommand({ id: 'call-dutch' })">
        call dutch
      </button>
    </section>

    <!-- Player settings -->
    <section>
      <button type="button" @click="auth.signOut">sign out</button>
    </section>

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
