import { WebSocketServer } from "ws";

import useGameState from "./composables/use-game-state.js";

const wss = new WebSocketServer({ port: 3000, host: "0.0.0.0" });

wss.on("connection", function connection(ws) {
  // Verify user has valid auth
  // If reconnecting to existing game, send current state

  ws.on("error", console.error);
  ws.on("message", async (message) => {
    try {
      /** @type {import("@/models/game-state.js").ClientCommand} */
      const clientCommand = JSON.parse(message.toString());
      const { executeCommand } = useGameState();
      executeCommand(ws, clientCommand);
    } catch (error) {
      console.error(error);
    }
  });
});

const location = process.env.NODE_ENV ? "port 3000" : "localhost:3000";
console.log(`Running dutch.cards server on ${location} ♠️♥️♣️♦️`);
