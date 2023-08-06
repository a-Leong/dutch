import { WebSocketServer } from "ws";
import chalk from "chalk";

import useSocketConnections from "./composables/use-socket-connections.js";

const { handleConnectionRequest } = useSocketConnections();

const wss = new WebSocketServer({ port: 3000, host: "0.0.0.0" });
wss.on("connection", handleConnectionRequest);

const location = process.env.NODE_ENV
  ? "wss://dutch-cards-server.fly.dev"
  : "ws://localhost:3000";

console.log(
  "\n\n🃏",
  chalk.green(`dutch.cards WebSocket server running at ${location}`),
  "\n"
);
