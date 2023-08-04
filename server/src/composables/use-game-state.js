import { reactive, readonly } from "@vue/reactivity";

import { sendInit } from "../utils/responses.js";

const debug = false;

/** @type {import("@/models/game-state").GameState} */
const gameState = reactive({
  actionQueue: [],
  cardMap: {},
  discardPile: [],
  drawPile: [{ id: "some random id", suit: "d", value: "a", pointValue: 1 }],
  players: {},
  commands: [],
});

export default function () {
  function addPlayer(uid) {
    // Add player to game
  }

  /**
   * @returns {import('@/models/game-state').ClientState}
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

    const clientState = {
      actionQueue: [],
      discardPile,
      drawPile,
      players: {},
    };

    return clientState;
  }

  function startGame() {
    // Verify enough players
    // Determine active player
    // Shuffle and add cards to draw pile
    // Deal cards to players, start discard pile
  }

  /**
   * @param {import("ws").WebSocket} ws
   * @param {import('@/models/game-state').ClientCommand} clientCommand
   */
  function executeCommand(ws, { player, command }) {
    try {
      switch (command.id) {
        case "ready-to-play": {
          // TODO: If valid, process, else, throw error
          // TODO: Eval all client states and send responses
          startGame();
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
    } catch (error) {
      // Reject command
    }
  }

  return {
    gameState: readonly(gameState),

    addPlayer,
    executeCommand,
    startGame,
  };
}
