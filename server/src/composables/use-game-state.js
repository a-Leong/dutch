import { computed, reactive } from "@vue/reactivity";
import chalk from "chalk";

import useSocketConnections from "./use-socket-connections.js";

import { generateDeck, getCardEffect, shuffleCards } from "../utils/deck.js";

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
   * @param {import("@/models/game-state").Card | import("@/models/game-state").FaceUpCard | import("@/models/game-state").FaceDownCard | string} card
   */
  function toCard(card) {
    if (debug) console.log("toCard", card);
    if (typeof card === "string") {
      return gameState.cardMap[card];
    } else {
      return gameState.cardMap[card.id];
    }
  }

  /**
   * @param {import("@/models/game-state").Card | import("@/models/game-state").FaceUpCard | import("@/models/game-state").FaceDownCard | string} card
   * @returns {import("@/models/game-state").FaceUpCard}
   */
  function toFaceUp(card) {
    // TODO: prevent return object from leaking visibleTo property
    if (debug) console.log("toFaceUp", card);
    if (typeof card === "string") {
      return { ...gameState.cardMap[card], orientation: "up" };
    } else {
      return { ...gameState.cardMap[card.id], orientation: "up" };
    }
  }

  /**
   * @param {import("@/models/game-state").Card | import("@/models/game-state").FaceUpCard | import("@/models/game-state").FaceDownCard | string} card
   * @returns {import("@/models/game-state").FaceDownCard}
   */
  function toFaceDown(card) {
    if (debug) console.log("toFaceDown", card);
    if (typeof card === "string") {
      return { id: card, orientation: "down" };
    } else {
      return { id: gameState.cardMap[card.id].id, orientation: "down" };
    }
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
          ? toFaceUp(gameState.discardPile[discardPileCount - 1])
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

    const players = playersArray.value.map((playerI) => {
      const hand = playerI.hand.map((card) => {
        return card.visibleTo.includes(player)
          ? toFaceUp(card)
          : toFaceDown(card);
      });
      return { ...playerI, hand };
    });

    // Expose drawn card to clients
    let drawnCard;
    gameState.actionQueue.forEach((action) => {
      if (action !== undefined && action.effect.id === "discard") {
        drawnCard =
          action.player === player
            ? toFaceUp(action.effect.cardId)
            : toFaceDown(action.effect.cardId);
      }
    });

    const clientState = {
      phase: gameState.phase,
      activePlayerUid: gameState.activePlayerUid,
      actionQueue: gameState.actionQueue,
      discardPile,
      drawPile,
      drawnCard,
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
        gameState.players[uid].hand.push(card);
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

  function endGame() {
    // TODO: save ended state to Firestore

    Object.keys(gameState.players).forEach((uid) => {
      gameState.players[uid].hand = [];
      gameState.players[uid].status = "start";
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

    gameState.actionQueue = [];
    gameState.commands = [];
    gameState.discardPile = [];
    gameState.drawPile = [];

    return newStartingPlayer;
  }

  /**
   * @param {import('@/models/game-state').ClientCommand} clientCommand
   */
  function executeCommand({ player, command }) {
    const { broadcastUpdate, sendReject } = useSocketConnections();
    try {
      // Reset card visibility of all hand card before each command (expose cards on demand every time)
      Object.values(gameState.players).forEach((player) => [
        player.hand.forEach((card) => (card.visibleTo = [])),
      ]);

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
        case "toggle-start": {
          if (playersArray.value.length <= 1) {
            throw new Error("Need at least two players to start game");
          }

          if (gameState.phase === "ingame") {
            throw new Error("Game has already started");
          }

          if (gameState.players[player].status === "start") {
            gameState.players[player].status = "wait";
          } else {
            gameState.players[player].status = "start";
          }

          if (playersArray.value.every(({ status }) => status === "start")) {
            startGame();
          }
          break;
        }
        case "toggle-restart": {
          if (gameState.phase !== "ingame") {
            throw new Error("Game hasn't started");
          }

          if (gameState.players[player].status === "restart") {
            gameState.players[player].status = "start";
          } else {
            gameState.players[player].status = "restart";
          }

          if (playersArray.value.every(({ status }) => status === "restart")) {
            const newStartingPlayer = endGame();
            startGame(newStartingPlayer);
          }
          break;
        }
        case "toggle-end": {
          if (gameState.phase !== "ingame") {
            throw new Error("Game hasn't started");
          }

          if (gameState.players[player].status === "end") {
            gameState.players[player].status = "start";
          } else {
            gameState.players[player].status = "end";
          }

          if (playersArray.value.every(({ status }) => status === "end")) {
            endGame();
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
          break;
        }
        case "draw-discard-pile": {
          if (gameState.phase !== "ingame") {
            throw new Error("Game hasn't started");
          }

          if (gameState.activePlayerUid !== player) {
            throw new Error("Not your turn");
          }

          if (gameState.actionQueue.length > 0) {
            throw new Error("Must wait for all actions to complete");
          }

          const drawnCard = gameState.discardPile.pop();

          if (drawnCard === undefined) {
            throw new Error("Discard pile is empty");
          }

          gameState.actionQueue.push({
            player,
            effect: { id: "discard", cardId: drawnCard.id },
          });

          break;
        }
        case "draw-draw-pile": {
          if (gameState.phase !== "ingame") {
            throw new Error("Game hasn't started");
          }

          if (gameState.activePlayerUid !== player) {
            throw new Error("Not your turn");
          }

          if (gameState.actionQueue.length > 0) {
            throw new Error("Must wait for all actions to complete");
          }

          const drawnCard = gameState.drawPile.pop();

          if (drawnCard === undefined) {
            throw new Error("Draw pile is empty");
          }

          gameState.actionQueue.push({
            player,
            effect: { id: "discard", cardId: drawnCard.id },
          });

          if (gameState.drawPile.length === 0) {
            // Drew last card in draw pile, shuffle discard pile for draw pile
            const discardPileTopCard =
              /** @type {import("@/models/game-state").Card} */ (
                gameState.discardPile.pop()
              );

            const newDrawPile = shuffleCards(gameState.discardPile);
            gameState.discardPile = [discardPileTopCard];
            gameState.drawPile = newDrawPile;
          }
          break;
        }
        case "match-discard": {
          if (gameState.phase !== "ingame") {
            throw new Error("Game hasn't started");
          }

          if (gameState.discardPile.length === 0) {
            throw new Error("Discard pile is empty");
          }

          const cardInHand = gameState.players[player].hand.find(
            ({ id }) => id === command.cardId
          );
          if (cardInHand === undefined) {
            throw new Error("Cannot match discard that card");
          }

          // Remove card from player's hand
          gameState.players[player].hand = gameState.players[
            player
          ].hand.filter((card) => card.id !== command.cardId);

          const discardedCard = toCard(command.cardId);

          // If card has effect, add to action queue
          const effect = getCardEffect(discardedCard);
          if (effect !== undefined) {
            // Card has effect
            gameState.actionQueue.push({ player, effect });
          }

          if (
            discardedCard.value !==
            gameState.discardPile[gameState.discardPile.length - 1].value
          ) {
            // Discard doesn't match
            gameState.actionQueue.push({
              player,
              effect: { id: "blind-draw" },
            });
          }

          // Add discarded card to discard pile
          gameState.discardPile.push(discardedCard);

          break;
        }
        case "peek": {
          // TODO: If valid, process, else, throw error
          break;
        }
        case "replace-discard": {
          // TODO: If valid, process, else, throw error
          break;
        }
        case "swap": {
          // TODO: If valid, process, else, throw error
          break;
        }
        case "blind-draw": {
          // TODO: If valid, process, else, throw error
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
