import { defineStore } from "pinia";
import { readonly, ref } from "vue";

import { useGameStore } from "@/stores/use-game-store";

export const useSocketStore = defineStore("server-socket", () => {
  /** @type {import("vue").Ref<WebSocket | undefined>} */
  const ws = ref();

  const isConnected = ref();
  const autoReconnect = ref(false);
  const isReconnecting = ref(false);

  const reconnectAttempts = ref(0);
  const timeoutId = ref();
  function startReconnecting(resolver) {
    isReconnecting.value = true;
    initSocket(resolver);
    const nextReconnectDelay = 1.2 ** reconnectAttempts.value * 250; // Exp backoff
    console.log("reconnecting", nextReconnectDelay);
    reconnectAttempts.value++;
    timeoutId.value = setTimeout(
      () => startReconnecting(resolver),
      nextReconnectDelay
    );
  }

  function stopReconnecting() {
    isReconnecting.value = false;
    clearTimeout(timeoutId.value);
    reconnectAttempts.value = 0;
  }

  async function initSocket(reconnectResolver) {
    autoReconnect.value = true;

    return /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        ws.value = new WebSocket(import.meta.env.VITE_SERVER_ADDRESS);
        ws.value.addEventListener("open", () => {
          isConnected.value = true;
          stopReconnecting();
          resolve();
          reconnectResolver?.();
        });
        ws.value.addEventListener("close", () => {
          isConnected.value = false;
          autoReconnect.value &&
            !isReconnecting.value &&
            startReconnecting(resolve);
          reconnectResolver && resolve();
        });
        ws.value.addEventListener("error", () => {
          isConnected.value = false;
          autoReconnect.value &&
            !isReconnecting.value &&
            startReconnecting(resolve);
          reconnectResolver && resolve();
        });

        ws.value.addEventListener("message", (message) => {
          /** @type {import("@/models/response").Response } */
          const response = JSON.parse(message.data);

          switch (response.id) {
            case "init": {
              const { setGameState } = useGameStore();
              setGameState(response.gameState);
              console.log(response);
              break;
            }
            case "allow": {
              const { setGameState } = useGameStore();
              setGameState(response.gameState);
              console.log(response);
              break;
            }
            default: {
              // Handle other responses
              console.log(response);
              break;
            }
          }
        });
      })
    );
  }

  function deinitSocket() {
    autoReconnect.value = false;
    isConnected.value = false;
    ws.value?.close();
    ws.value = undefined;
  }

  /**
   *
   * @param {import("@/models/command").Command} cmd
   */
  function sendCommand(cmd) {
    const encodedCommand = JSON.stringify(cmd);
    ws.value?.send(encodedCommand);
  }

  return {
    isConnected: readonly(isConnected),

    initSocket,
    deinitSocket,
    sendCommand,
  };
});
