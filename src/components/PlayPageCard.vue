<script setup>
import { computed } from "vue";

const props = defineProps({
  card: {
    /** @type {import('vue').PropType<import('@/models/game-state').FaceUpCard | import('@/models/game-state').FaceDownCard>} */
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
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
  <div :class="['card', { selected }]">
    <label>{{ extendedCardName }}</label>
  </div>
</template>

<style scoped>
.card {
  margin: 2px;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  border: solid transparent 4px; /* prevents position change when .selected */
  border-radius: 4px;
  height: 150px;
  aspect-ratio: 2.5 / 3.5;

  box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
    rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
}

.card.selected {
  border-bottom: solid blue 4px;
}
</style>
