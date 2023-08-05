import { WebSocketServer } from "ws";
import url from "url";

import useGameState from "./composables/use-game-state.js";
import { auth } from "./firebase-admin-config.js";

const wss = new WebSocketServer({ port: 3000, host: "0.0.0.0" });

wss.on("connection", async function connection(ws, req) {
  if (req.url === undefined) {
    ws.close(3000, "invalid URL");
    return;
  }
  const { query } = url.parse(req.url, true);
  const { uid } = query;

  if (typeof uid !== "string") {
    ws.close(3000, "malformed UID");
    return;
  }

  try {
    // Verify user has valid auth
    await auth.getUser(uid);

    // If reconnecting to existing game, send current state
    const { executeCommand } = useGameState();
    executeCommand(ws, {
      player: uid,
      command: { id: "connect-to-room" },
    });

    ws.on("error", console.error);
    ws.on("message", async (message) => {
      try {
        /** @type {import("@/models/game-state.js").ClientCommand['command']} */
        const command = JSON.parse(message.toString());
        executeCommand(ws, { player: uid, command });
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    ws.close(3000, "invalid UID");
  }
});

const location = process.env.NODE_ENV ? "port 3000" : "localhost:3000";
console.log(`Running dutch.cards server on ${location} ♠️♥️♣️♦️`);
