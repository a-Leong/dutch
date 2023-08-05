import { defineStore } from "pinia";
import { readonly, ref } from "vue";

import { useGameStore } from "@/stores/use-game-store";
import { auth } from "@/firebase-config";

export const useSocketStore = defineStore("server-socket", () => {
  /** @type {import("vue").Ref<WebSocket | undefined>} */
  const ws = ref();

  const isConnected = ref();
  const autoReconnect = ref(false);
  const isReconnecting = ref(false);

  const reconnectAttempts = ref(0);
  const timeoutId = ref();

  /**
   * @param {{ uid: string; reconnectResolver?: () => void; }} options
   */
  function startReconnecting(options) {
    isReconnecting.value = true;
    init(options);
    const nextReconnectDelay = 1.2 ** reconnectAttempts.value * 250; // Exp backoff
    console.log("reconnecting with new delay", nextReconnectDelay);
    reconnectAttempts.value++;
    timeoutId.value = setTimeout(
      () => startReconnecting(options),
      nextReconnectDelay
    );
  }

  function stopReconnecting() {
    isReconnecting.value = false;
    clearTimeout(timeoutId.value);
    reconnectAttempts.value = 0;
  }

  /**
   * @param {{ uid: string; reconnectResolver?: () => void; }} opts
   */
  async function init(opts) {
    autoReconnect.value = true;

    return /** @type {Promise<void>} */ (
      new Promise((resolve) => {
        const wsUrl = new URL(import.meta.env.VITE_SERVER_ADDRESS);
        wsUrl.searchParams.append("uid", opts.uid);
        ws.value = new WebSocket(wsUrl);
        ws.value.addEventListener("open", () => {
          isConnected.value = true;
          stopReconnecting();
          resolve();
          opts.reconnectResolver?.();
        });
        const onclose = (thisOptions, thisResolve, response) => {
          isConnected.value = false;
          if (response.code === 3000) {
            // Server told me request or auth UID was bad; stop retrying
            console.error(response.reason);
          } else {
            // Server told me WebSocket closed normally; consider retrying
            const shouldReconnect =
              autoReconnect.value && !isReconnecting.value;
            if (shouldReconnect) startReconnecting(thisOptions);
          }
          if (thisOptions.reconnectResolver !== undefined) thisResolve();
        };
        ws.value.addEventListener("close", (r) => onclose(opts, resolve, r));
        ws.value.addEventListener("error", (r) => onclose(opts, resolve, r));

        ws.value.addEventListener("message", (message) => {
          /** @type {import("@/models/response").Response } */
          const response = JSON.parse(message.data);
          handleResponse(response);
        });
      })
    );
  }

  /**
   * @param {import("@/models/response").Response} response
   */
  function handleResponse(response) {
    const gameStore = useGameStore();

    switch (response.id) {
      case "init": {
        gameStore.set(response.gameState);
        console.log(response);
        break;
      }
      case "allow": {
        gameStore.set(response.gameState);
        console.log(response);
        break;
      }
      default: {
        // Handle other responses
        console.log(response);
        break;
      }
    }
  }

  function deinit() {
    autoReconnect.value = false;
    isConnected.value = false;
    ws.value?.close();
    ws.value = undefined;
  }

  /**
   *
   * @param {import("@/models/game-state").ClientCommand['command']} command
   */
  function sendCommand(command) {
    const encodedCommand = JSON.stringify(command);
    ws.value?.send(encodedCommand);
  }

  return {
    isConnected: readonly(isConnected),

    init,
    deinit,
    sendCommand,
  };
});
