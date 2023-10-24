import { Message } from "@/models/message";

export type ClientCommand = {
  player: string;
  command:
    | { id: "connect-to-room" }
    | { id: "disconnect-from-room" }
    | { id: "send-message"; text: string }
    | { id: "toggle-start" }
    | { id: "toggle-restart" }
    | { id: "toggle-end" }
    | { id: "draw-draw-pile" }
    | { id: "draw-discard-pile" }
    | { id: "replace-discard"; cardId: string }
    | { id: "match-discard"; cardId: string }
    | { id: "peek"; cardId: string }
    | { id: "swap"; card1Id: string; card2Id: string }
    | { id: "blind-draw" }
    | { id: "call-dutch" };
};

export type Card = {
  id: string; // randomly generated each game
  suit: "c" | "d" | "h" | "s";
  value:
    | "a"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "j"
    | "q"
    | "k";
  pointValue: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;
  visibleTo: string[]; // Player UIDs
};

export type FaceUpCard = Omit<Card, "visibleTo"> & { orientation: "up" };
export type FaceDownCard = Pick<Card, "id"> & { orientation: "down" };

export type Action = {
  player: string;
  effect:
    | { id: "discard"; cardId: string }
    | { id: "peek" }
    | { id: "swap" }
    | { id: "blind-draw" };
};

export type Player = {
  status: "wait" | "start" | "restart" | "end";
  isOnline: boolean;
  position: number; // ∈ [0 .. players.length - 1]
  hand: Card[];
};

export type ClientPlayer = {
  status: "wait" | "start" | "restart" | "end";
  isOnline: boolean;
  position: number; // ∈ [0 .. players.length - 1]
  hand: (FaceUpCard | FaceDownCard)[];
};

/**
 * Server-only state encapsulating a game of dutch
 */
export type GameState = {
  phase: "pregame" | "ingame" | "postgame";
  startingPlayer?: string;
  activePlayerUid?: string;
  actionQueue: Action[]; // First in, first out
  cardMap: { [id: string]: Card };
  discardPile: Card[]; // Last in, first out
  drawPile: Card[];
  dutchCalledBy?: string; // player UID
  players: { [uid: string]: Player };
  commands: ClientCommand[];
  latestPlayerMessage?: Message;
};

/**
 * Client-accessible, player-specific state necessary for rendering UI
 */
export type ClientState = {
  phase: "pregame" | "ingame" | "postgame";
  activePlayerUid?: string;
  actionQueue: Action[]; // First in, first out
  discardPile: {
    topCard?: FaceUpCard;
    count: number;
  };
  drawPile: {
    topCard?: FaceDownCard;
    count: number;
  };
  drawnCard?: FaceUpCard | FaceDownCard;
  dutchCalledBy?: string; // player UID
  players: (ClientPlayer & { uid: string })[];
  prevCommand?: ClientCommand; // To facilitate UI ? maybe not needed
  latestPlayerMessage?: Message;
};
