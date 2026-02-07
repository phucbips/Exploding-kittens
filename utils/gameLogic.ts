// @ts-nocheck
import { CARD_TYPES } from '@/utils/gameConfig';

export const shuffle = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const getRandomVariant = (cardType: any) => {
    // Basic variant logic
    return cardType.image;
};

// Create initial deck without Defuse or Exploding Kittens
const createBaseDeck = () => {
  let deck: any[] = [];
  Object.keys(CARD_TYPES).forEach(key => {
    if (key !== 'EXPLODE' && key !== 'DEFUSE') {
      const cardType = (CARD_TYPES as any)[key];
      for (let i = 0; i < cardType.count; i++) {
        deck.push({
          id: `${key}_${Math.random().toString(36).substr(2, 9)}`,
          type: key,
          name: cardType.name,
          description: cardType.description,
          image: cardType.image
        });
      }
    }
  });
  return shuffle(deck);
};

export const initializeGame = (playerNames: string[], settings: any = {}) => {
  const { initialCards = 4 } = settings; // Default 4 extra cards + 1 Defuse

  // 1. Create Base Deck (No Defuse, No Explode)
  let baseDeck = createBaseDeck();

  // 2. Initialize Players with empty hands
  const players = playerNames.map((name, index) => ({
    id: `player_${index}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    hand: [],
    isAlive: true,
    hasDefuse: false
  }));

  // 3. Prepare "Deal Animation" Stacks
  // We don't put cards in hand yet. We put them in a temporary structure or just flag the state.
  // Actually, to simplify, we will put them in hand but mark the game state as "dealing"
  // The UI will see "dealing" and animate the cards flying from deck to hand.

  // Deal 1 Defuse to each player
  players.forEach(player => {
    player.hand.push({
      id: `DEFUSE_${Math.random().toString(36).substr(2, 9)}`,
      type: 'DEFUSE',
      name: (CARD_TYPES as any).DEFUSE.name,
      description: (CARD_TYPES as any).DEFUSE.description,
      image: (CARD_TYPES as any).DEFUSE.image
    });
  });

  // Deal X random cards to each player from base deck
  players.forEach(player => {
    for (let i = 0; i < initialCards; i++) {
      if (baseDeck.length > 0) {
        player.hand.push(baseDeck.pop());
      }
    }
  });

  // 4. Insert remaining Defuse cards into deck
  // Standard rule: Deck has total Defuses = 6? Or 2 minus players?
  // Config usually says: 6 Defuses total in deck (minus dealt ones).
  // Let's assume standard deck has 6 Defuses.
  const totalDefuses = (CARD_TYPES as any).DEFUSE.count || 6;
  const remainingDefuseCount = Math.max(0, totalDefuses - players.length);

  for (let i = 0; i < remainingDefuseCount; i++) {
    baseDeck.push({
        id: `DEFUSE_deck_${i}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'DEFUSE',
        name: (CARD_TYPES as any).DEFUSE.name,
        description: (CARD_TYPES as any).DEFUSE.description,
        image: (CARD_TYPES as any).DEFUSE.image
    });
  }

  // 5. Insert Exploding Kittens
  // Count = Players - 1
  const explodeCount = Math.max(1, players.length - 1);
  for (let i = 0; i < explodeCount; i++) {
    baseDeck.push({
      id: `EXPLODE_${i}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'EXPLODE',
      name: (CARD_TYPES as any).EXPLODE.name,
      description: (CARD_TYPES as any).EXPLODE.description,
      image: (CARD_TYPES as any).EXPLODE.image
    });
  }

  // 6. Final Shuffle
  const finalDeck = shuffle(baseDeck);

  return {
    deck: finalDeck,
    players,
    turnIndex: 0,
    turnsLeft: 1,
    gameState: 'playing',
    isDealing: true, // Flag for animation
    discardPile: [],
    pendingAction: null,
    activeBomb: null
  };
};
