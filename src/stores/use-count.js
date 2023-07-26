import { ref } from "vue";
import { defineStore } from "pinia";

export const useCount = defineStore("count", () => {
  const count = ref(1);

  function incrementCount() {
    count.value++;
  }

  return {
    count,
    incrementCount,
  };
});
