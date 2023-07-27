<script setup>
import { useSandboxStore } from "@/stores/use-sandbox-store";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
    required: true,
  },
});

const sandboxStore = useSandboxStore();
</script>

<template>
  <h1>{{ msg.text }}</h1>

  <div class="card">
    <button type="button" @click="sandboxStore.incrementDocCount()">
      Firestore sandbox.count is {{ sandboxStore.doc?.count }}
    </button>
  </div>

  <div class="card">
    <button type="button" @click="sandboxStore.incrementDbObjCount()">
      RTDB sandbox.count is {{ sandboxStore.dbObj?.count }}
    </button>
  </div>
</template>

<style scoped></style>
