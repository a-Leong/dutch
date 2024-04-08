import { defineStore } from "pinia";
import { readonly, ref } from "vue";

import router, { ERROR_PAGE } from "@/router";

import { useGameStore } from "@/stores/use-game-store";
import { useMessageStore } from "@/stores/use-message-store";

const SERVER_RECONNECT_TIMEOUT = 1000 * 2;

export const useSocketStore = defineStore("server-socket", () => {
  /** @type {import("vue").Ref<WebSocket | undefined>} */
  const ws = ref();

  const initLoadResolver = ref();

  const isConnected = ref();
  const autoReconnect = ref(false);
  const isReconnecting = ref(false);

  const reconnectAttempts = ref(0);
  const timeoutId = ref();

  /**
   * @param { string } token
   */
  async function startReconnecting(token) {
    isReconnecting.value = true;
    init(token);
    const nextReconnectDelay = 1.2 ** reconnectAttempts.value * 250; // Exp backoff
    if (nextReconnectDelay > SERVER_RECONNECT_TIMEOUT) {
      clearTimeout(timeoutId.value);
      await router.push({
        name: ERROR_PAGE,
        query: {
          msg: "Timeout: server appears to be unavailable.",
        },
      });
      return initLoadResolver.value?.();
    }
    reconnectAttempts.value++;
    timeoutId.value = setTimeout(
      () => startReconnecting(token),
      nextReconnectDelay
    );
  }

  function stopReconnecting() {
    isReconnecting.value = false;
    clearTimeout(timeoutId.value);
    reconnectAttempts.value = 0;
  }

  /**
   * @param {string} token
   */
  async function init(token) {
    autoReconnect.value = true;

    const initResolver = (resolve) => {
      if (initLoadResolver.value === undefined) {
        initLoadResolver.value = resolve;
      }
      const wsUrl = new URL(import.meta.env.VITE_SERVER_ADDRESS);
      wsUrl.searchParams.append("token", token);
      ws.value = new WebSocket(wsUrl);
      ws.value.addEventListener("open", () => {
        isConnected.value = true;
        stopReconnecting();
        initLoadResolver.value?.();
      });
      const onclose = (token, response) => {
        isConnected.value = false;
        if (response.code === 3000 || response.code === 3001) {
          // Server told me request or auth UID was bad; stop retrying
          router.push({
            name: ERROR_PAGE,
            query: { msg: response.reason },
          });
        } else {
          // Server told me WebSocket closed normally; consider retrying
          const shouldReconnect = autoReconnect.value && !isReconnecting.value;
          if (shouldReconnect) startReconnecting(token);
        }
      };
      ws.value.addEventListener("close", (r) => onclose(token, r));
      ws.value.addEventListener("error", (r) => onclose(token, r));

      ws.value.addEventListener("message", (message) => {
        /** @type {import("@/models/response").Response } */
        const response = JSON.parse(message.data);
        handleResponse(response);
      });
    };

    return /** @type {Promise<void>} */ (new Promise(initResolver));
  }

  /**
   * @param {import("@/models/response").Response} response
   */
  function handleResponse(response) {
    const gameStore = useGameStore();
    const messageStore = useMessageStore();

    switch (response.id) {
      case "update": {
        const { gameState } = response;
        gameStore.set(gameState);
        if (gameState.latestPlayerMessage) {
          messageStore.addLocalMessage(gameState.latestPlayerMessage);
        }

        console.log("Server says:", response);
        break;
      }
      case "reject": {
        const timestamp = new Date().toISOString();
        messageStore.addLocalMessage({
          author: "Server",
          message: response.reason,
          timestamp,
        });
        console.warn("Server says:", response);
        break;
      }
      default: {
        // Handle other responses
        console.log("Server says (unhandled):", response);
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
