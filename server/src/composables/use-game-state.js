import { computed, reactive } from "@vue/reactivity";
import chalk from "chalk";

import useSocketConnections from "./use-socket-connections.js";

import { generateDeck } from "../utils/deck.js";

const debug = false;

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

    /** @type {import("@/models/game-state").Player} */
    const newPlayer = {
      status: "wait",
      position,
      hand: [],
      isOnline: true,
    };
    gameState.players = { ...gameState.players, [uid]: newPlayer };
  }

  /**
   * @param {string} uid
   */
  function removePlayer(uid) {
    delete gameState.players[uid];
    playersArray.value.forEach(
      ({ uid }, i) => (gameState.players[uid].position = i)
    );
  }

  /**
   * @param {import("@/models/game-state").FaceUpCard | import("@/models/game-state").FaceDownCard} card
   */
  function toCard(card) {
    if (debug) console.log("toCard", card);
    return gameState.cardMap[card.id];
  }

  /**
   * @param {import("@/models/game-state").Card | import("@/models/game-state").FaceUpCard | import("@/models/game-state").FaceDownCard} card
   * @returns {import("@/models/game-state").FaceUpCard}
   */
  function toFaceUp(card) {
    if (debug) console.log("toFaceUp", card);
    return { ...gameState.cardMap[card.id], orientation: "up" };
  }

  /**
   * @param {import("@/models/game-state").Card | import("@/models/game-state").FaceUpCard | import("@/models/game-state").FaceDownCard} card
   * @returns {import("@/models/game-state").FaceDownCard}
   */
  function toFaceDown(card) {
    if (debug) console.log("toFaceDown", card);
    return { id: card.id, orientation: "down" };
  }

  /**
   * @param {string} player
   * @returns {import('@/models/game-state').ClientState}
   */
  function evalClientState(player) {
    const discardPileCount = gameState.discardPile.length;

    /** @type {import('@/models/game-state.js').ClientState['discardPile']} */
    const discardPile = {
      topCard:
        discardPileCount > 0
          ? {
              ...gameState.discardPile[discardPileCount - 1],
              orientation: "up",
            }
          : undefined,
      count: discardPileCount,
    };

    const drawPileCount = gameState.drawPile.length;

    /** @type {import('@/models/game-state.js').ClientState['drawPile']} */
    const drawPile = {
      topCard:
        drawPileCount > 0
          ? toFaceDown(gameState.drawPile[drawPileCount - 1])
          : undefined,
      count: drawPileCount,
    };

    // TODO: make cards face up or face down depending on player
    const players = playersArray.value.map((playerI) => {
      const hand = playerI.hand.map((card) => {
        return card.orientation === "up" ? toFaceUp(card) : toFaceDown(card);
      });
      return { ...playerI, hand };
    });

    const clientState = {
      phase: gameState.phase,
      activePlayerUid: gameState.activePlayerUid,
      actionQueue: [],
      discardPile,
      drawPile,
      players,
      dutchCalledBy: gameState.dutchCalledBy,
    };

    return clientState;
  }

  /**
   * @param {string?} [startingPlayer]
   */
  function startGame(startingPlayer) {
    // Verify enough players
    if (playersArray.value.length <= 1) {
      throw new Error("Need at least two players to start game");
    }

    gameState.phase = "ingame";

    // Determine active player
    const randomPlayer =
      playersArray.value[(playersArray.value.length * Math.random()) | 0];
    gameState.startingPlayer = startingPlayer ?? randomPlayer.uid;
    gameState.activePlayerUid = gameState.startingPlayer;

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
        gameState.players[uid].hand.push({ ...card, orientation: "down" });
      });
    }

    // Start discard pile
    const card = gameState.drawPile.pop();
    if (card === undefined) {
      throw new Error("Overdraw from draw pile");
    }
    gameState.discardPile.push(card);

    // TODO: save init state to Firestore under new doc
  }

  function restartGame() {
    // TODO: save ended state to Firestore

    Object.keys(gameState.players).forEach((uid) => {
      gameState.players[uid].hand = [];
      gameState.players[uid].status = "play";
    });

    let newStartingPlayer;
    if (gameState.startingPlayer) {
      // Rotate starting player between rounds
      const nextPlayerPosition =
        (gameState.players[gameState.startingPlayer].position + 1) %
        playersArray.value.length;
      newStartingPlayer = playersArray.value[nextPlayerPosition].uid;
    }

    Object.assign(gameState, {
      ...initGameState,
      players: gameState.players,
    });

    startGame(newStartingPlayer);
  }

  /**
   * @param {import('@/models/game-state').ClientCommand} clientCommand
   */
  function executeCommand({ player, command }) {
    const { broadcastUpdate, sendReject } = useSocketConnections();
    try {
      switch (command.id) {
        case "connect-to-room": {
          if (gameState.players[player] === undefined) {
            if (gameState.phase === "pregame") {
              // Add player to game
              addPlayer(player);
            } else {
              // TODO: Add player to observers?
            }
          } else {
            // Set player online
            gameState.players[player].isOnline = true;
          }

          break;
        }
        case "disconnect-from-room": {
          if (gameState.players[player] !== undefined) {
            if (gameState.phase === "ingame") {
              // Set player offline
              gameState.players[player].isOnline = false;
            } else {
              // Remove player from game
              removePlayer(player);
            }

            // TODO: if no players or all remaining players are offline, save gamestate to Firestore to be resumed
          }

          break;
        }
        case "toggle-ready": {
          if (gameState.phase === "ingame") {
            throw new Error("Game has already started");
          }

          if (gameState.players[player].status === "play") {
            gameState.players[player].status = "wait";
          } else {
            gameState.players[player].status = "play";
          }

          if (playersArray.value.every(({ status }) => status === "play")) {
            startGame();
          }
          break;
        }
        case "toggle-restart": {
          if (gameState.phase !== "ingame") {
            throw new Error("Game hasn't started");
          }

          if (gameState.players[player].status === "restart") {
            gameState.players[player].status = "play";
          } else {
            gameState.players[player].status = "restart";
          }

          if (playersArray.value.every(({ status }) => status === "restart")) {
            restartGame();
          }
          break;
        }
        case "call-dutch": {
          const activePlayerUid = gameState.activePlayerUid;
          if (gameState.phase !== "ingame" || activePlayerUid === undefined) {
            throw new Error("Game hasn't started");
          }

          if (gameState.dutchCalledBy !== undefined) {
            throw new Error("Dutch has already been called this round!");
          }

          const playerPosition = gameState.players[player].position;
          const activePlayerPosition =
            gameState.players[activePlayerUid].position;

          const isActivePlayerImmediatelyAfterPlayer =
            (playerPosition + 1) % playersArray.value.length ===
            activePlayerPosition;

          const actionQueneHasActions = gameState.actionQueue.length > 0;

          if (!isActivePlayerImmediatelyAfterPlayer || actionQueneHasActions) {
            throw new Error(
              "Cannot call dutch unless you've just ended your turn and all actions are completed"
            );
          }

          gameState.dutchCalledBy = player;

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

      // Send state update to all players

      const clientStates = Object.keys(gameState.players).reduce((obj, uid) => {
        return { ...obj, [uid]: evalClientState(uid) };
      }, {});
      broadcastUpdate(clientStates);

      // Save and output command
      gameState.commands.push({ player, command });
      console.log(
        `🟢 ${chalk.yellow(player.substring(0, 4))}: ${JSON.stringify(command)}`
      );
    } catch (error) {
      // Command rejected
      sendReject(player, {
        id: "reject",
        commandId: command.id,
        reason: error.message,
      });
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
