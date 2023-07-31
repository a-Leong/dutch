import { WebSocketServer } from "ws";

import useGameState from "./composables/use-game-state.js";
import { sendAllow, sendInit } from "./utils/responses.js";

const wss = new WebSocketServer({ port: 3000, host: "0.0.0.0" });

const { gameState, init, incrementDocCount, incrementdbOjbCount } =
  useGameState();

await init();

wss.on("connection", function connection(ws) {
  sendInit(ws, { id: "init", gameState });

  ws.on("error", console.error);
  ws.on("message", async (message) => {
    try {
      /** @type {import("@/models/command.js").Command} */
      const { id } = JSON.parse(message.toString());

      switch (id) {
        case "increment-doc-count": {
          incrementDocCount();
          sendAllow(ws, { id: "allow", gameState: gameState, action: id });
          break;
        }

        case "increment-db-obj-count": {
          incrementdbOjbCount();
          sendAllow(ws, { id: "allow", gameState: gameState, action: id });
          break;
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
});

const location = process.env.NODE_ENV ? "port 3000" : "localhost:3000";
console.log(`Running dutch.cards server on ${location} ♠️♥️♣️♦️`);
