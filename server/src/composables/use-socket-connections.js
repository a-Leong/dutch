import { ref } from "@vue/reactivity";
import url from "url";
import chalk from "chalk";
import { IncomingMessage } from "http";

import useGameState from "./use-game-state.js";
import { auth } from "../firebase-admin-config.js";

const connections = ref({});

export default function () {
  /**
   * @param {import('ws').WebSocket} ws
   * @param {IncomingMessage} req
   */
  async function handleConnectionRequest(ws, req) {
    if (req.url === undefined) {
      ws.close(3000, "Unauthorized: invalid origin");
      return;
    }
    const { query } = url.parse(req.url, true);
    const { token } = query;

    if (typeof token !== "string") {
      ws.close(3000, "Unauthorized: malformed token");
      return;
    }

    try {
      // Verify user has valid auth
      const { uid, email } = await auth.verifyIdToken(token);
      console.log(
        `🔐 Token verified, WebSocket opened for ${chalk.yellow(
          email
        )} (${chalk.yellow(uid.substring(0, 4))})`
      );

      connections.value[uid] = ws;
      // Bind send method to original context (internally uses `this` keyword)
      connections.value[uid].send = ws.send.bind(ws);

      // Connect player to room
      const { executeCommand } = useGameState();
      executeCommand({ player: uid, command: { id: "connect-to-room" } });

      ws.on("error", console.error);
      ws.on("message", (/** @type {{ toString: () => string; }} */ message) => {
        try {
          /** @type {import("@/models/game-state.js").ClientCommand['command']} */
          const command = JSON.parse(message.toString());
          executeCommand({ player: uid, command });
        } catch (error) {
          console.error(error);
        }
      });
      ws.on("close", () => {
        delete connections.value[uid];
        executeCommand({
          player: uid,
          command: { id: "disconnect-from-room" },
        });
      });
    } catch (error) {
      if (error.code === "auth/id-token-expired") {
        ws.close(3001, "Unauthorized: token is expired.");
        console.log(
          `🚩 Closed WebSocket connection with expired token from ${req.headers["origin"]}`
        );
      } else {
        ws.close(3000, "Unauthorized: invalid token.");
        console.log(
          `🚩 Closed unauthorized WebSocket connection from ${req.headers["origin"]}`
        );
      }
    }
  }

  /**
   * Sends allow message to client
   * @param {string} uid
   * @param {import("@/models/response").UpdateResponse['gameState']} gameState
   */
  function sendUpdate(uid, gameState) {
    const ws = connections.value[uid];

    if (!ws) {
      console.error(
        `Attempting to send update over WS for ${uid} failed.`,
        connections.value
      );
    }

    if (!ws || ws.readyState !== ws.OPEN) return;

    const encodedData = JSON.stringify({ id: "update", gameState });
    ws.send(encodedData);
  }

  /**
   *
   * @param {{ [uid: string]: import("@/models/game-state.js").ClientState }} clientStates
   */
  function broadcastUpdate(clientStates) {
    Object.keys(clientStates).forEach((uid) => {
      sendUpdate(uid, clientStates[uid]);
    });
  }

  /**
   * Sends reject message to client
   *
   * @param {string} uid
   * @param {import("@/models/response").RejectResponse} data
   */
  function sendReject(uid, data) {
    const ws = connections.value[uid];
    if (!ws || ws.readyState !== ws.OPEN) return;

    const encodedData = JSON.stringify(data);
    ws.send(encodedData);
  }

  return {
    connections,

    broadcastUpdate,
    handleConnectionRequest,
    sendReject,
  };
}
