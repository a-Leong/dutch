<script setup>
import { useCount } from "@/stores/use-count";

defineProps({
  msg: {
    /** @type {import('vue').PropType<{text: string}>} */
    type: Object,
    required: true,
  },
});

const countStore = useCount();

function alertMe() {
  if (countStore.count > 10) {
    alert("count is huge 😳");
  }
}
</script>

<template>
  <h1>{{ msg.text }}</h1>

  <div class="card">
    <button type="button" @click="countStore.incrementCount(), alertMe()">
      count is {{ countStore.count }}
    </button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Install
    <a href="https://github.com/vuejs/language-tools" target="_blank">Volar</a>
    in your IDE for a better DX
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped></style>
@/composables/use-count
