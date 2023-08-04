<script setup></script>
<template>
  <h1>♠️♥️♣️♦️</h1>
</template>

<style scoped>
h1 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  animation: fade-in-out 300ms linear alternate infinite;
}

@keyframes fade-in-out {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
