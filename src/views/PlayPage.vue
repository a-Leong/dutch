<script setup>
import { computed, ref, watchEffect } from "vue";
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

const activePlayerTag = computed(() => game.value.activePlayerUid?.slice(0, 4));

const player = computed(() =>
  game.value.players?.find((p) => p.uid === auth.currentUser?.uid)
);

const isPlayersTurn = computed(
  () => game.value.activePlayerUid === player.value?.uid
);

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

function replaceDiscard() {
  if (selectedCards.value.length !== 1) {
    alert("Can only replace discard with one card selected");
  } else {
    sendCommand({ id: "replace-discard", cardId: selectedCards.value[0] });
    selectedCards.value = [];
  }
}
function matchDiscard() {
  if (selectedCards.value.length !== 1) {
    alert("Can only match discard with one card selected");
  } else {
    sendCommand({ id: "match-discard", cardId: selectedCards.value[0] });
    selectedCards.value = [];
  }
}
function peek() {
  if (selectedCards.value.length !== 1) {
    alert("Can only peek with one card selected");
  } else {
    sendCommand({ id: "peek", cardId: selectedCards.value[0] });
    selectedCards.value = [];
  }
}
function swap() {
  if (selectedCards.value.length !== 2) {
    alert("Can only swap with two cards selected");
  } else {
    sendCommand({
      id: "swap",
      card1Id: selectedCards.value[0],
      card2Id: selectedCards.value[1],
    });
    selectedCards.value = [];
  }
}
</script>

<template>
  <div class="play-page">
    <!-- Debug clientState JSON -->
    <!-- <section>
      <pre>{{ game }}</pre>
    </section> -->

    <!-- Pregame -->
    <section v-if="game.phase === 'pregame'">
      <h1>
        {{
          player?.status !== "start"
            ? "ready for dutch?"
            : "waiting for others..."
        }}
      </h1>

      <h2>who's here</h2>
      <div
        v-for="p in game.players"
        :key="p.uid"
        style="font-family: monospace"
      >
        {{ p.status === "start" ? "🟢" : "🟡" }}
        {{ p.uid }}
        <button
          v-if="p.uid === player?.uid"
          type="button"
          @click="sendCommand({ id: 'toggle-start' })"
        >
          {{ player?.status === "start" ? "de-ready" : "ready" }}
        </button>
      </div>
    </section>

    <!-- Ingame -->
    <template v-if="game.phase === 'ingame'">
      <!-- Draw and discard piles -->
      <section class="even-row">
        <div v-if="game.drawnCard">
          <label>
            {{ isPlayersTurn ? "You drew" : `${activePlayerTag} drew` }}
          </label>
          <play-page-card
            :card="game.drawnCard"
            :key="game.drawnCard.id"
            :selected="selectedCards.includes(game.drawnCard.id)"
            @click="toggleCardSelected(game.drawnCard.id)"
            @keydown.enter="toggleCardSelected(game.drawnCard.id)"
          />
        </div>

        <div>
          <label>Draw</label>
          <play-page-card
            v-if="game.drawPile?.topCard"
            :card="game.drawPile.topCard"
            :key="game.drawPile.topCard.id"
          />
        </div>

        <div>
          <label>Discard</label>
          <play-page-card
            v-if="game.discardPile?.topCard"
            :card="game.discardPile.topCard"
            :key="game.discardPile.topCard.id"
          />
        </div>
      </section>

      <!-- Players' hands -->
      <section v-for="p in game.players" :key="p.uid">
        <p>
          {{ p.uid.substring(0, 4) }} {{ p.uid === player?.uid ? "(you)" : "" }}
          {{ p.uid === game.activePlayerUid ? "🟢" : "" }}
        </p>
        <div class="even-row">
          <play-page-card
            v-for="card in p.hand"
            v-bind="{ card }"
            :key="card.id"
            :selected="selectedCards.includes(card.id)"
            @click="toggleCardSelected(card.id)"
            @keydown.enter="toggleCardSelected(card.id)"
          />
        </div>
      </section>

      <!-- Individual game commands -->
      <section>
        <button type="button" @click="sendCommand({ id: 'draw-draw-pile' })">
          draw from draw pile
        </button>

        <button type="button" @click="sendCommand({ id: 'draw-discard-pile' })">
          draw from discard pile
        </button>

        <button type="button" @click="replaceDiscard">replace discard</button>
        <button type="button" @click="matchDiscard">match discard</button>
        <button type="button" @click="peek">peek</button>
        <button type="button" @click="sendCommand({ id: 'de-peek' })">
          de-peek
        </button>
        <button type="button" @click="swap">swap</button>
        <button type="button" @click="sendCommand({ id: 'blind-draw' })">
          blind draw
        </button>
        <button
          type="button"
          @click="sendCommand({ id: 'confirm-blind-draw' })"
        >
          confirm blind draw
        </button>

        <button type="button" @click="sendCommand({ id: 'call-dutch' })">
          call dutch
        </button>
      </section>

      <!-- Handshake game commands (all players must agree for server to make change) -->
      <section>
        <button type="button" @click="sendCommand({ id: 'toggle-restart' })">
          {{
            player?.status === "restart"
              ? "waiting for agreement..."
              : "let's restart"
          }}
        </button>

        <button type="button" @click="sendCommand({ id: 'toggle-end' })">
          {{
            player?.status === "end"
              ? "waiting for agreement..."
              : "let's go back to lobby"
          }}
        </button>
      </section>
    </template>

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
