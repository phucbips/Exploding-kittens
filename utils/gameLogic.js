import { CARD_TYPES } from './gameConfig';

const secureRandomFloat = () => {
  return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / (0xFFFFFFFF + 1);
};

export const shuffle = (array) => {
  let currentIndex = array.length, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(secureRandomFloat() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
};

const getRandomVariant = (cardType) => {
    if (cardType.variants && cardType.variants.length > 0) {
        return cardType.variants[Math.floor(secureRandomFloat() * cardType.variants.length)];
    }
    return cardType.image;
};

export const createDeck = () => {
  let deck = [];

  Object.keys(CARD_TYPES).forEach(key => {
    const cardType = CARD_TYPES[key];

    // We don't add Explode and Defuse yet, they are handled separately
    if (key !== 'EXPLODE' && key !== 'DEFUSE') {
      for (let i = 0; i < cardType.count; i++) {
        deck.push({
          id: `${key}_${i}_${globalThis.crypto.randomUUID()}`,
          type: key,
          ...cardType,
          image: getRandomVariant(cardType)
        });
      }
    }
  });

  return shuffle(deck);
};

export const initializeGame = (playerNames) => {
  let deck = createDeck();
  const players = playerNames.map((name, index) => ({
    id: `player_${index}_${globalThis.crypto.randomUUID()}`,
    name,
    hand: [],
    isAlive: true,
    hasDefuse: false, // Will be set when dealing
    isCurrentTurn: index === 0
  }));

  // Deal 1 Defuse to each player
  const defuseType = CARD_TYPES.DEFUSE;
  players.forEach(player => {
    player.hand.push({
      id: `DEFUSE_${globalThis.crypto.randomUUID()}`,
      type: 'DEFUSE',
      ...defuseType,
      image: getRandomVariant(defuseType)
    });
    player.hasDefuse = true;
  });

  // Deal 4 random cards to each player
  players.forEach(player => {
    for (let i = 0; i < 4; i++) {
      if (deck.length > 0) {
        player.hand.push(deck.pop());
      }
    }
  });

  // Insert remaining Defuse cards into deck
  const remainingDefuseCount = Math.max(0, defuseType.count - players.length);
  for (let i = 0; i < remainingDefuseCount; i++) {
    deck.push({
        id: `DEFUSE_deck_${i}`,
        type: 'DEFUSE',
        ...defuseType,
        image: getRandomVariant(defuseType)
    });
  }

  // Insert Exploding Kittens
  const explodeCount = Math.max(1, players.length - 1);
  const explodeType = CARD_TYPES.EXPLODE;

  for (let i = 0; i < explodeCount; i++) {
    deck.push({
      id: `EXPLODE_${i}`,
      type: 'EXPLODE',
      ...explodeType,
      image: getRandomVariant(explodeType)
    });
  }

  // Shuffle everything again
  deck = shuffle(deck);

  return {
    deck,
    players,
    turnIndex: 0,
    turnsLeft: 1,
    gameState: 'playing',
    discardPile: [],
    pendingAction: null,
    activeBomb: null
  };
};
