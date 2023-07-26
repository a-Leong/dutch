<script setup>
import { useSandbox } from "@/stores/use-sandbox";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
    required: true,
  },
});

const sandboxStore = useSandbox();
</script>

<template>
  <h1>{{ msg.text }}</h1>

  <div class="card">
    <button type="button" @click="sandboxStore.incrementDocCount()">
      Firestore sandbox.count is {{ sandboxStore.sandboxDoc?.count }}
    </button>
  </div>

  <div class="card">
    <button type="button" @click="sandboxStore.incrementRTCount()">
      RTDB sandbox.count is {{ sandboxStore.sandboxRTObject?.count }}
    </button>
  </div>
</template>

<style scoped></style>
@/stores/use-sandbox
