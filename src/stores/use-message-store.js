import { readonly, ref } from "vue";
import { defineStore } from "pinia";

import { useSocketStore } from "@/stores/use-socket-store";

export const useMessageStore = defineStore("message", () => {
  /** @type {import("vue").Ref<import("@/models/message").Message[]>} */
  const messages = ref([]);

  /**
   * @param {import("@/models/message").Message} message
   */
  function addLocalMessage(message) {
    messages.value = [...messages.value, message];
  }

  /**
   * @param {string} text
   */
  function addRemoteMessage(text) {
    const socketStore = useSocketStore();
    socketStore.sendCommand({ id: "send-message", text });
  }

  return {
    messages: readonly(messages),

    addLocalMessage,
    addRemoteMessage,
  };
});
