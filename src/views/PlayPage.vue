<script setup>
import { ref, watchEffect } from "vue";
import { storeToRefs } from "pinia";

import { auth } from "@/firebase-config";

import { useGameStore } from "@/stores/use-game-store";
import { useSocketStore } from "@/stores/use-socket-store";

import PlayPageCard from "@/components/PlayPageCard.vue";
import PlayPageFooter from "@/components/PlayPageFooter.vue";

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

//
// Local state and command handlers requiring specific card(s) as input
//

/** @type {import('vue').Ref<string[]>} */
const selectedCards = ref([]);

function toggleCardSelected(cardId) {
  const cardIndex = selectedCards.value.indexOf(cardId);
  if (cardIndex !== -1) {
    selectedCards.value.splice(cardIndex, 1);
  } else {
    selectedCards.value.push(cardId);
  }
}

watchEffect(() => {
  if (selectedCards.value.length > 2) selectedCards.value.shift();
});

function matchDiscard() {
  if (selectedCards.value.length !== 1) {
    alert("Can only match discard with one card selected");
  } else {
    sendCommand({ id: "match-discard", cardId: selectedCards.value[0] });
    selectedCards.value = [];
  }
}
</script>

<template>
  <div class="play-page">
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
          :selected="selectedCards.includes(card.id)"
          @click="toggleCardSelected(card.id)"
          @keydown.enter="toggleCardSelected(card.id)"
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
      <button type="button" @click="sendCommand({ id: 'draw-draw-pile' })">
        draw from draw pile
      </button>

      <button type="button" @click="sendCommand({ id: 'draw-discard-pile' })">
        draw from discard pile
      </button>

      <button type="button" @click="matchDiscard">match discard</button>

      <button type="button" @click="sendCommand({ id: 'call-dutch' })">
        call dutch
      </button>
    </section>

    <!-- Player settings -->
    <section>
      <button type="button" @click="auth.signOut">sign out</button>
    </section>

    <play-page-footer />
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

.play-page {
  padding-bottom: 24px;
}
</style>
