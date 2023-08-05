import { computed, reactive } from "@vue/reactivity";
import chalk from "chalk";

import { generateDeck } from "../utils/deck.js";
import { sendInit } from "../utils/responses.js";

/** @type {import("@/models/game-state").GameState} */
const initGameState = {
  phase: "pregame",
  actionQueue: [],
  cardMap: {},
  discardPile: [],
  drawPile: [],
  players: {},
  commands: [],
};

const gameState = reactive({ ...initGameState });

const playersArray = computed(() => {
  return Object.keys(gameState.players)
    .map((uid) => ({ ...gameState.players[uid], uid }))
    .sort((a, b) => a.position - b.position);
});

export default function () {
  /**
   * @param {string} uid
   */
  function addPlayer(uid) {
    // Add player to game
    const position = playersArray.value.length;
    const newPlayer = { name: `Player ${position + 1}`, position, hand: [] };
    gameState.players = { ...gameState.players, [uid]: newPlayer };
  }

  /**
   * @returns {import('@/models/game-state').ClientState}
   * @param {string} player
   */
  function evalClientState(player) {
    const discardPileCount = gameState.discardPile.length;
    const discardPile = {
      topCard: gameState.discardPile[discardPileCount - 1],
      count: discardPileCount,
    };

    const drawPileCount = gameState.drawPile.length;
    const drawPile = {
      topCard: gameState.drawPile[drawPileCount - 1],
      count: drawPileCount,
    };

    // TODO: set players' hands according to gameState
    const players = gameState.players;

    const clientState = {
      activePlayerUid: gameState.activePlayerUid,
      actionQueue: [],
      discardPile,
      drawPile,
      players,
    };

    return clientState;
  }

  /**
   * @param {string | undefined} [startingPlayer]
   */
  function startGame(startingPlayer) {
    // Verify enough players
    if (playersArray.value.length <= 1) {
      throw new Error("Need at least two players to start game");
    }

    gameState.phase = "game";

    // Determine active player
    const randomPlayer =
      playersArray.value[(playersArray.value.length * Math.random()) | 0];
    gameState.activePlayerUid = startingPlayer ?? randomPlayer.uid;

    // Shuffle and add cards to draw pile
    const { deck, cardMap } = generateDeck();
    gameState.drawPile = deck;
    gameState.cardMap = cardMap;

    // Deal cards to players
    const CARDS_PER_HAND = 4;
    for (let i = 1; i <= CARDS_PER_HAND; i++) {
      playersArray.value.forEach(({ uid }) => {
        const card = gameState.drawPile.pop();
        if (card === undefined) {
          throw new Error("Overdraw from draw pile");
        }
        gameState.players[uid].hand.push(card);
      });
    }

    // Start discard pile
    const card = gameState.drawPile.pop();
    if (card === undefined) {
      throw new Error("Overdraw from draw pile");
    }
    gameState.discardPile.push(card);
  }

  /**
   * @param {import("ws").WebSocket} ws
   * @param {import('@/models/game-state').ClientCommand} clientCommand
   */
  function executeCommand(ws, { player, command }) {
    try {
      switch (command.id) {
        case "connect-to-room": {
          if (gameState.players[player] === undefined) {
            if (gameState.phase === "pregame") {
              // Add player to game
              addPlayer(player);
            } else {
              // Add player to observers?
            }
          }

          // TODO: broadcast state updates to all clients
          const clientState = evalClientState(player);
          sendInit(ws, { id: "init", gameState: clientState });

          break;
        }
        case "ready-to-play": {
          // TODO: If valid, process, else, throw error
          if (gameState.phase === "game") {
            throw new Error("Game has already started");
          }

          startGame();

          // TODO: Eval all client states and send responses
          // TODO: broadcast state updates to all clients
          const clientState = evalClientState(player);
          sendInit(ws, { id: "init", gameState: clientState });
          break;
        }
        case "restart-game": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "call-dutch": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "draw-discard-pile": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "draw-draw-pile": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "match-discard": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "peek": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "replace-discard": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
        case "swap": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          break;
        }
      }

      // Command succeeded
      gameState.commands.push({ player, command });
      console.log(
        `🟢 ${chalk.yellow(player.substring(0, 4))}: ${JSON.stringify(command)}`
      );
    } catch (error) {
      // Command rejected
      console.log(
        `🚫 ${chalk.yellow(player.substring(0, 4))}: ${JSON.stringify(
          command
        )} ${chalk.red(error.message)}`
      );
    }
  }

  return {
    executeCommand,
  };
}
