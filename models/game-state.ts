export type ClientCommand = {
  player: string;
  command:
    | { id: "connect-to-room" }
    | { id: "disconnect-from-room" }
    | { id: "toggle-ready" }
    | { id: "toggle-restart" }
    | { id: "draw-draw-pile" }
    | { id: "draw-discard-pile" }
    | { id: "replace-discard"; cardId: string }
    | { id: "match-discard"; cardId: string }
    | { id: "peek"; cardId: string }
    | { id: "swap"; card1Id: string; card2Id: string }
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
};

export type FaceUpCard = Card & { orientation: "up" };
export type FaceDownCard = Pick<Card, "id"> & { orientation: "down" };

export type Action = {
  player: string;
  effect: { id: "discard"; cardId: string } | { id: "peek" } | { id: "swap" };
};

export type Player = {
  status: "wait" | "play" | "restart";
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
  dutchCalledBy?: string; // player UID
  players: (Player & { uid: string })[];
  prevCommand?: ClientCommand; // To facilitate UI ? maybe not needed
};
