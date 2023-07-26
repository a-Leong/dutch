<script setup>
import { useSandboxDoc } from "@/stores/use-sandbox-doc";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
    required: true,
  },
});

const sandboxDocStore = useSandboxDoc();
</script>

<template>
  <h1>{{ msg.text }}</h1>

  <div class="card">
    <button type="button" @click="sandboxDocStore.incrementCount()">
      count is {{ sandboxDocStore.sandboxDoc?.count }}
    </button>
  </div>
</template>

<style scoped></style>
