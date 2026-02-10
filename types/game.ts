export interface Card {
  id: string;
  type: string;
  name?: string;
  image?: string;
  description?: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  isAlive: boolean;
  hasDefuse: boolean;
  isHost?: boolean;
}

export interface GameState {
  deck: Card[];
  players: Player[];
  discardPile: Card[];
  turnIndex: number;
  turnsLeft: number;
  gameState: 'waiting' | 'playing' | 'ended';
  isDealing?: boolean;

  // New State for Interactions
  nopeTimer?: number | null; // Timestamp when Nope window expires
  pendingAction?: {
    type: 'favor_give' | 'explode' | 'pair_steal' | 'triple_steal' | 'attack' | 'skip' | 'draw' | 'play_action';
    sourcePlayerId?: string;
    targetPlayerId?: string;
    cardIndex?: number; // Index of card played
    cardType?: string; // Type of card played
    count?: number; // How many cards (e.g. Draw 2)
    selectedCardIndex?: number; // For Favor giving
  } | null;
  activeBomb?: Card | null;
}
