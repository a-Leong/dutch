/** @type {import('@/models/game-state').Card['suit'][]} */
const suits = ["d", "h", "c", "s"];

/** @type {import('@/models/game-state').Card['value'][]} */
const values = [
  "a",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "j",
  "q",
  "k",
];

/**
 * @param {import('@/models/game-state').Card['suit']} suit
 * @param {import('@/models/game-state').Card['value']} value
 * @returns {import('@/models/game-state').Card['pointValue']}
 */
function getPointValue(suit, value) {
  switch (value) {
    case "a": {
      return 1;
    }
    case "j": {
      return 11;
    }
    case "q": {
      return 12;
    }
    case "k": {
      const isBlackSuit = suit === "c" || suit === "s";
      return isBlackSuit ? 0 : 13;
    }
    default: {
      const parsedInt = parseInt(value);
      if (parsedInt >= 0 && parsedInt <= 13) {
        return /** @type {import('@/models/game-state').Card['pointValue']} */ (
          parsedInt
        );
      } else {
        throw new Error(`Invalid card value: ${value}`);
      }
    }
  }
}

/**
 * @param {Card} card
 * @returns {import('@/models/game-state').Action['effect'] | undefined}
 */
export function getCardEffect(card) {
  switch (card.value) {
    case "j":
      return { id: "swap" };
    case "q":
      return { id: "peek" };
    default:
      return undefined;
  }
}

/**
 * @typedef {import('@/models/game-state').Card} Card
 * @returns {{deck: Card[], cardMap: {[id: string]: Card}}}
 */
export function generateDeck() {
  /** @type {import('@/models/game-state').Card[]} */
  const cards = [];
  /** @type {{[id: string]: Card}} */
  const cardMap = {};
  const cardIds = [...Array(52).keys()].sort(() => Math.random());

  suits.forEach((suit) => {
    values.forEach((value) => {
      const id = `card-${cardIds.pop() ?? cards.length}`;
      const pointValue = getPointValue(suit, value);
      const card = { id, suit, value, pointValue };
      cards.push(card);
      cardMap[id] = card;
    });
  });

  return {
    deck: cards.sort(() => Math.random() - 0.5),
    cardMap: cardMap,
  };
}
