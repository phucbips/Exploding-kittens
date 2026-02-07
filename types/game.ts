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
  pendingAction?: {
    type: 'favor_give' | 'explode' | 'pair_steal';
    sourcePlayerId?: string;
    targetPlayerId?: string;
    count?: number;
  } | null;
  activeBomb?: Card | null;
}
