import { WebSocketServer } from "ws";
import chalk from "chalk";
import url from "url";

import useGameState from "./composables/use-game-state.js";
import { auth } from "./firebase-admin-config.js";

const wss = new WebSocketServer({ port: 3000, host: "0.0.0.0" });

wss.on("connection", async function connection(ws, req) {
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

    // Connect player to room
    const { executeCommand } = useGameState();
    executeCommand(ws, {
      player: uid,
      command: { id: "connect-to-room" },
    });

    ws.on("error", console.error);
    ws.on("message", (message) => {
      try {
        /** @type {import("@/models/game-state.js").ClientCommand['command']} */
        const command = JSON.parse(message.toString());
        executeCommand(ws, { player: uid, command });
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    ws.close(3000, "Unauthorized: invalid token");
    console.log(
      `🚩 Closed unauthorized WebSocket connection from ${req.headers["origin"]}`
    );
  }
});

const location = process.env.NODE_ENV
  ? "wss://dutch-cards-server.fly.dev"
  : "ws://localhost:3000";
console.log(
  "\n\n🃏",
  chalk.green(`dutch.cards WebSocket server running at ${location}`),
  "\n"
);
