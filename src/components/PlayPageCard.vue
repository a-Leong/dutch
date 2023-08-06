<script setup>
import { computed } from "vue";

const props = defineProps({
  card: {
    /** @type {import('vue').PropType<import('@/models/game-state').FaceUpCard | import('@/models/game-state').FaceDownCard>} */
    type: Object,
    required: true,
  },
});

const extendedCardName = computed(() => {
  if (props.card.orientation === "up") {
    // Card is face up
    const { suit, value } = props.card;

    let suitName;
    if (suit === "c") suitName = "clubs";
    else if (suit === "h") suitName = "hearts";
    else if (suit === "s") suitName = "spades";
    else if (suit === "d") suitName = "diamonds";

    /** @type {string} */
    let valueName = value;
    if (value === "a") valueName = "ace";
    else if (value === "j") valueName = "jack";
    else if (value === "q") valueName = "queen";
    else if (value === "k") valueName = "king";
    return `${valueName} ${suitName}`;
  } else {
    // Card is face down
    return undefined;
  }
});
</script>

<template>
  <div class="card">
    <label>{{ extendedCardName }}</label>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  justify-content: center;
  align-items: center;

  border: solid black 1px;
  border-radius: 4px;
  height: 100px;
  aspect-ratio: 2.5 / 3.5;
}
</style>
