'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
// @ts-ignore
import { CARD_TYPES, BACK_CARD_IMAGE } from '@/utils/gameConfig';

interface CardProps {
  card?: any;
  isFaceUp: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export default function Card({ card, isFaceUp, onClick, disabled }: CardProps) {
  // Safe access to card type config
  const cardConfig = card && (CARD_TYPES as any)[card.type];
  const imageSrc = isFaceUp && cardConfig ? cardConfig.image : BACK_CARD_IMAGE;
  const cardName = isFaceUp && cardConfig ? cardConfig.name : 'Unknown';

  return (
    <motion.div
      whileHover={!disabled ? { y: -20, scale: 1.05, zIndex: 10 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      className={`relative w-24 h-36 sm:w-28 sm:h-40 flex-shrink-0 rounded-lg shadow-xl transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onClick && onClick()}
    >
      <div className="absolute inset-0 rounded-lg overflow-hidden border-2 border-white bg-slate-200">
        <Image
          src={imageSrc}
          alt={cardName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100px, 150px"
        />

        {isFaceUp && (
             <div className="absolute bottom-0 w-full bg-black/70 text-white text-[10px] text-center p-1 truncate">
                 {cardName}
             </div>
        )}
      </div>
    </motion.div>
  );
}
