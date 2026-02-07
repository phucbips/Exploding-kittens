'use client';

import Card from './Card';

interface PlayerHandProps {
  hand: any[];
  isCurrentPlayer: boolean;
  onPlayCard: (card: any, index: number) => void;
  disabled?: boolean;
}

export default function PlayerHand({ hand, isCurrentPlayer, onPlayCard, disabled }: PlayerHandProps) {
  return (
    <div className="flex justify-center items-end -space-x-8 sm:-space-x-12 py-4 px-4 overflow-x-auto min-h-[180px]">
      {hand && hand.map((card, index) => (
        <div key={card.id || index} className="relative transition-transform hover:-translate-y-4">
          <Card
            card={card}
            isFaceUp={true}
            onClick={() => onPlayCard(card, index)}
            disabled={disabled || !isCurrentPlayer}
          />
        </div>
      ))}
    </div>
  );
}
