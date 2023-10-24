<script setup>
import { ref } from "vue";

const flipped = ref(false);
</script>

<template>
  <div class="flip-card" @click="flipped = !flipped">
    <div :class="['flip-card-inner', { flipped }]">
      <div class="flip-card-front">
        <slot name="front" />
      </div>
      <div class="flip-card-back">
        <slot name="back" />
      </div>
      <div class="flip-card-inner-shadow"></div>
    </div>
  </div>
</template>

<style scoped>
.flip-card {
  background-color: transparent;
  width: 61mm;
  height: 88mm;

  perspective: 900px;
}

.flip-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: all 0.4s;
  border-radius: 2mm;

  box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
    rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
}

.flip-card-inner-shadow {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  transition: all 0.4s;

  pointer-events: none;

  background: linear-gradient(0deg, #000000, transparent, transparent);
  background-size: 200% 200%;
  background-position: 0% 0%;
  border-radius: 2mm;
}

.flip-card:hover .flip-card-inner {
  transform: rotateX(8deg) scaleY(0.9) translateY(10mm);
}

.flip-card:hover .flip-card-inner-shadow {
  background-position: 0% 21%;
}

.flip-card:hover .flipped .flip-card-inner-shadow {
  background-position: 0% 0%;
}

.flip-card:hover .flipped,
.flipped {
  transform: rotateX(180deg) scaleY(1) translateY(0);
}

.flip-card-front,
.flip-card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flip-card-back {
  transform: rotateX(180deg);
}
</style>
