'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { CARD_TYPES, CARD_BACK_IMAGE } from '@/utils/gameConfig';
import type { GameState, Player, Card } from '@/types/game';

interface GameBoardProps {
  gameState: GameState;
  currentPlayerId: string;
  onDrawCard: () => void;
  onPlayCard: (cards: any[], indices: number[]) => void; // Modified to accept multiple cards
  onStartGame: () => void;
  onGiveCard: (cardIndex: number) => void; // For Favor
  onSelectTarget: (targetId: string) => void; // For Favor/Pair
  onNope: () => void; // New Nope handler
  stealTarget?: {playerId: string, playerName: string, cardCount: number, type: string} | null;
  onStealCard?: (cardIndex: number) => void;
  onInsertBomb?: (index: number) => void;
}

// Bomb Insertion Overlay Component
const BombInsertionOverlay = ({ deckCount, onInsert }: { deckCount: number, onInsert: (idx: number) => void }) => {
    const [insertIndex, setInsertIndex] = useState(0);

    const handleUp = () => setInsertIndex(prev => Math.max(0, prev - 1));
    const handleDown = () => setInsertIndex(prev => Math.min(deckCount, prev + 1));

    return (
        <div className="absolute inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fadeIn pointer-events-auto">
            <h2 className="text-3xl text-red-500 font-black mb-8 animate-pulse">HIDE THE BOMB!</h2>

            <div className="relative flex items-center gap-12">
                <div className="flex flex-col gap-4">
                    <button onClick={handleUp} className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 active:scale-95">
                        <span className="material-symbols-outlined text-4xl">arrow_upward</span>
                    </button>
                    <button onClick={handleDown} className="p-4 bg-gray-700 rounded-full hover:bg-gray-600 active:scale-95">
                        <span className="material-symbols-outlined text-4xl">arrow_downward</span>
                    </button>
                </div>

                {/* Visual Stack Representation */}
                <div className="relative w-40 h-64 perspective-1000">
                    {/* Deck Block */}
                    <div className="absolute top-10 left-0 w-full h-full bg-blue-900/50 rounded-xl border-4 border-blue-500 flex items-center justify-center">
                        <span className="font-bold text-blue-300">DECK ({deckCount})</span>
                    </div>

                    {/* Bomb Card Floating */}
                    <motion.div
                        animate={{
                            y: (insertIndex / (deckCount + 1)) * 200 - 50, // Map index to visual Y position
                            scale: 1.1
                        }}
                        className="absolute left-0 w-full h-10 bg-red-600 rounded-md border-2 border-yellow-400 shadow-[0_0_15px_rgba(255,0,0,0.8)] z-20 flex items-center justify-center"
                    >
                        <span className="text-xs font-bold text-white">BOMB</span>
                    </motion.div>
                </div>

                <div className="w-24">
                    <p className="text-center text-gray-400 text-sm mb-2">Position</p>
                    <div className="text-4xl font-mono font-bold text-center text-yellow-400 border-2 border-gray-700 rounded p-2">
                        {insertIndex}
                    </div>
                    <p className="text-center text-gray-500 text-xs mt-1">From Top</p>
                </div>
            </div>

            <button
                onClick={() => onInsert(insertIndex)}
                className="mt-12 px-12 py-4 bg-red-600 text-white font-bold rounded-xl text-2xl hover:bg-red-500 shadow-lg active:scale-95 border-b-4 border-red-800"
            >
                PLACE BOMB
            </button>
        </div>
    );
};

// 3D Card Stack Component - Optimized with "Squash" and "Impact"
// Modified to support "Messy Discard Pile" visualization
const CardStack = ({ count, type = 'draw', topCardImage = null, onClick, discardCards = [] }: { count: number, type?: 'draw' | 'discard', topCardImage?: string | null, onClick?: () => void, discardCards?: any[] }) => {
    const thickness = Math.min(count, 20); // Clamp visual thickness

    const generateStackShadow = (size: number) => {
        let shadow = "";
        for (let i = 1; i <= size; i++) {
            shadow += `${i}px ${i}px 0px 0px ${type === 'draw' ? '#1e293b' : '#334155'}${i === size ? '' : ','}`;
        }
        return shadow;
    };

    if (count === 0 && type === 'draw') return (
        <div className="w-36 h-52 rounded-xl border-2 border-white/10 bg-black/20 flex items-center justify-center">
            <span className="text-white/20 text-xs">EMPTY</span>
        </div>
    );

    // Discard Pile: Render last 5 cards messily if provided
    if (type === 'discard' && discardCards && discardCards.length > 0) {
        const visibleCards = discardCards.slice(-5); // Only show last 5 for performance/clutter

        return (
            <div className="relative w-36 h-52 group cursor-pointer" onClick={onClick}>
                 {visibleCards.map((card, idx) => {
                     // Seeded random rotation based on card ID or index
                     const seed = card.id ? card.id.charCodeAt(card.id.length - 1) : idx;
                     const rotate = (seed % 20) - 10; // -10 to 10 deg
                     const xOffset = (seed % 10) - 5;
                     const yOffset = (seed % 10) - 5;

                     const isTop = idx === visibleCards.length - 1;

                     return (
                         <motion.div
                            key={card.id || idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, rotate: rotate, x: xOffset, y: yOffset }}
                            className="absolute inset-0 w-36 h-52 rounded-xl border-2 border-white/20 bg-white shadow-md overflow-hidden"
                            style={{ zIndex: idx }}
                         >
                            <Image src={card.image} alt="Discard" fill className="object-cover" />
                         </motion.div>
                     );
                 })}

                 {/* Badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-black text-sm z-50">
                  {count}
                </div>
            </div>
        );
    }

    return (
        <div className="relative perspective-1000 group cursor-pointer" onClick={onClick}>
            {/* Main Stack Container */}
            <motion.div
                className="relative w-36 h-52 rounded-xl transition-all duration-300 ease-in-out border-2 border-white/20"
                style={{
                    backgroundColor: type === 'draw' ? '#1d4ed8' : '#475569',
                    boxShadow: generateStackShadow(thickness),
                    transform: `rotateX(25deg) rotateZ(-10deg) translateY(${-thickness}px)`,
                }}
                whileTap={type === 'draw' ? { scaleY: 0.9, scaleX: 1.05, translateY: 5 } : {}}
                animate={type === 'discard' ? { x: [0, -2, 2, 0], scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 0.2 }}
                key={count} // Re-trigger impact on count change for discard
            >
                {/* Top Face */}
                <div className="absolute inset-0 w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-800">
                   {type === 'draw' ? (
                     <div className="relative w-full h-full">
                         <Image src={CARD_BACK_IMAGE} alt="Back" fill className="object-cover" />
                         <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center animate-pulse border-2 border-white/30 backdrop-blur-sm">
                                <span className="text-white font-bold text-2xl drop-shadow-md">EK</span>
                            </div>
                         </div>
                     </div>
                   ) : (
                     <div className="relative w-full h-full bg-white p-2">
                        {topCardImage ? (
                            <Image src={topCardImage} alt="Top Card" fill className="object-cover rounded" />
                        ) : (
                            <div className="border-2 border-dashed border-gray-400 w-full h-full rounded flex items-center justify-center text-gray-400 font-bold">
                                DISCARD
                            </div>
                        )}
                     </div>
                   )}
                </div>

                {/* Badge */}
                <div className="absolute -top-4 -right-4 bg-yellow-400 text-black font-black w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-black text-sm z-10">
                  {count}
                </div>
            </motion.div>

            {/* Floor Shadow */}
            <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/50 blur-xl rounded-[100%] transition-all duration-500 pointer-events-none"
                style={{ transform: `scale(${1 + thickness / 40})` }}
            />
        </div>
    );
};

const NewGameBoard = forwardRef(({ gameState, currentPlayerId, onDrawCard, onPlayCard, onStartGame, onGiveCard, onSelectTarget, onNope, stealTarget, onStealCard, onInsertBomb }: GameBoardProps, ref) => {
  const { players, deck, discardPile, turnIndex, gameState: status, pendingAction, isDealing, nopeTimer } = gameState;

  const currentPlayerIndex = players.findIndex((p: any) => p.id === currentPlayerId);
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = players[turnIndex]?.id === currentPlayerId && status === 'playing';

  // State for multi-selection
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [localTargetMode, setLocalTargetMode] = useState<boolean>(false);

  // Helper to toggle selection
  const toggleSelectCard = (index: number) => {
      if (selectedIndices.includes(index)) {
          setSelectedIndices(selectedIndices.filter(i => i !== index));
      } else {
          // Validation: Can only select same type for pairs/triples?
          // Or limit to max 3? Let's keep it flexible but maybe visual cue.
          const card = currentPlayer.hand[index];
          const firstSelected = selectedIndices.length > 0 ? currentPlayer.hand[selectedIndices[0]] : null;

          if (firstSelected && firstSelected.type !== card.type) {
              // If type different, reset selection to new card (simplified UX)
              setSelectedIndices([index]);
          } else {
              setSelectedIndices([...selectedIndices, index]);
          }
      }
  };

  const handlePlaySelected = () => {
      // Validate cards (Simple: Must be same type or special 5-diff)
      const cards = selectedIndices.map(i => currentPlayer.hand[i]);
      const type = cards[0].type;
      const allSame = cards.every(c => c.type === type);

      if (cards.length > 1 && !allSame && cards.length !== 5) {
          alert("Cards must match (Pair/Triple) or be 5 different cards!");
          return;
      }

      onPlayCard(cards, selectedIndices);
      setSelectedIndices([]);
  };

  // Check if player has Nope
  const hasNope = currentPlayer?.hand.some((c: Card) => c.type === 'NOPE');
  const canNope = hasNope && (nopeTimer && Date.now() < nopeTimer); // Simplified, real timer logic needs hydration or server time sync
  // Actually, we'll just check if `nopeTimer` exists in state.
  const isNopeActive = !!nopeTimer;

  // Opponents mapping (excluding self)
  const opponents = players.filter((p: any) => p.id !== currentPlayerId);

  // Avatar mapping logic
  const AVATARS = [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBPH36HKB4gCwU1n2WR2Eu5dfaeKE-rxjsNwW6hJGRbwbayBm_Gqxc9YvfjCXTxdo4TGKUdHnwE-SZGd-hIS-IoX2RnSgqcdjlQojjkYvKrbUuZRtZDQAs5I5lXlJPPq7QUkOx5qStwQtMisldB6NDQ0kyRx_ypJcdoxnz04qwrAwTrT9M0YwCkTYQZQ9lORajrNYNEZZ3PKhIGyulFL7jc8RO_1_ZZ7c-PXpLhLneh7zNZAS9uY2WlKYmaXJddXefLLH50Sp-P", // Jumba
      "https://lh3.googleusercontent.com/aida-public/AB6AXuANlDGRyAn-1rwCtA1TohvPemylnZgqEg9YX7E_pyWsAnwOqlfthqzy2DtTdyA1FBEiBFoVRYbx3RWRQl4r9pgUlyclKctgFJENqQ5CDukdZouaBGls5g15HT9qUirkiZFCWtlrU1g5nGQ_PsC61_DgMADblLimS16QSPWNx5sDEwFPI6qPM8CdpRyHyAXNpIcpsBQ-lmbHiO7e15-chHnRt1Id4zXKImQ565_6ho47QQXl_tfHJt56Box4BTouZzsHtYRplhNA", // Pleakley
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAQo2gM01_Oq0iClbwr6GoBiUocH7Oa-P0llUjFkcrfMMCjBfWzfF5Fvk4Y8FQCm-JQzo6JhQWnDa_DDVPeEGhABm-zdP7CU0jx3OTQOOPo40qIwRDDC-S9_ZnFb4Xw6glqIZ3HI_9y6PQNA4DyArNifHTXrfGrD1OFoNHFquCacEfRG1rdcrJ8rfMXcq6hm6n_lFfMhs8ZLKy1W-TCjeFrSb2s5Vk2_z50QvHOfKLD1QOh2y8MMKyoBAE5tQZ7TCwhsAABEI6I", // Lilo
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ5xsTYfH0jSrZBvl89twgyuDoDbeWasNLQZja9hIl8Brvf-j9cLeAkyyPPGxyWR88VsFKNHN-O646R-e56ZBs72Da9OfPirDgvIaDitsDCUhRnedXWjjLippqLvI-UkURLSysY03Icmahb7xhnY9qmvH4EIm-I5PmL0abRvY-wbw2gQDwEbjkf8t_kkKyeMcYulXujLKjWUpPT_vNlgN5cXvCEzzzm_H7s1pq23DUR-h5aiU9WxDdzN4C1kBQF8U7SM4l1TtC", // Stitch
  ];

  const getAvatar = (index: number) => AVATARS[index % AVATARS.length];

  // Helper for animations
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [overlayData, setOverlayData] = useState<any>(null);
  const [isDealingAnimation, setIsDealingAnimation] = useState(false);
  const [dealingPhase, setDealingPhase] = useState<'none' | 'defuse' | 'hand' | 'bomb'>('none');
  const [drawAnimation, setDrawAnimation] = useState<{from: string, to: string} | null>(null);
  const [prevDeckLen, setPrevDeckLen] = useState(deck ? deck.length : 0);

  // Trigger Dealing Animation Sequence
  useEffect(() => {
      if (isDealing) {
          setIsDealingAnimation(true);
          setDealingPhase('defuse');

          // Timeline:
          // 0s: Defuse cards fly up and deal to players (1s)
          // 1s: Hand cards deal round-robin (4 * players * 0.2s approx)
          // Let's calculate duration dynamically based on player count
          const defuseDuration = 1500;
          const handDuration = players.length * 4 * 200 + 1000; // 200ms per card + buffer

          setTimeout(() => setDealingPhase('hand'), defuseDuration);
          setTimeout(() => setDealingPhase('bomb'), defuseDuration + handDuration);
          setTimeout(() => {
              setDealingPhase('none');
              setIsDealingAnimation(false);
          }, defuseDuration + handDuration + 2000); // +2s for bomb insert
      }
  }, [isDealing, players.length]);

  // Trigger Draw Animation
  useEffect(() => {
      if (deck && deck.length < prevDeckLen) {
          setDrawAnimation({ from: 'deck', to: players[turnIndex]?.id || 'unknown' });
          setTimeout(() => setDrawAnimation(null), 800);
      }
      setPrevDeckLen(deck ? deck.length : 0);
  }, [deck, prevDeckLen, players, turnIndex]);

  useImperativeHandle(ref, () => ({
      triggerSeeFuture: (cards: any[]) => {
          setOverlayData(cards);
          setActiveOverlay('see_future');
          setTimeout(() => setActiveOverlay(null), 3000);
      },
      triggerAttack: () => {
          setActiveOverlay('attack');
          setTimeout(() => setActiveOverlay(null), 2000);
      },
      triggerSkip: () => {
          setActiveOverlay('skip');
          setTimeout(() => setActiveOverlay(null), 1500);
      },
      triggerDefuse: () => {
          setActiveOverlay('defuse');
          setTimeout(() => setActiveOverlay(null), 2500);
      },
      triggerShuffle: () => {
          setActiveOverlay('shuffle');
          setTimeout(() => setActiveOverlay(null), 1500);
      },
      triggerFavor: (targetName: string) => {
          setOverlayData(targetName);
          setActiveOverlay('favor');
          setTimeout(() => setActiveOverlay(null), 2500);
      },
      enableTargetMode: () => {
          setLocalTargetMode(true);
      }
  }));

  const handleOpponentClick = (targetId: string) => {
      if (localTargetMode) {
          onSelectTarget(targetId);
          setLocalTargetMode(false);
      }
  };

  const handleDrawClick = () => {
      if (isMyTurn && !pendingAction) {
          onDrawCard();
      }
  }

  // Enable target mode from parent via ref (kept for compatibility)
  // But now we likely trigger it from play logic in parent
  // We'll update the imperative handle to just set visual state
  useImperativeHandle(ref, () => ({
      // ... existing handlers ...
      enableTargetMode: () => setLocalTargetMode(true),
      triggerSeeFuture: (cards: any[]) => {
          setOverlayData(cards);
          setActiveOverlay('see_future');
          setTimeout(() => setActiveOverlay(null), 3000);
      },
      triggerAttack: () => {
          setActiveOverlay('attack');
          setTimeout(() => setActiveOverlay(null), 2000);
      },
      triggerSkip: () => {
          setActiveOverlay('skip');
          setTimeout(() => setActiveOverlay(null), 1500);
      },
      triggerDefuse: () => {
          setActiveOverlay('defuse');
          setTimeout(() => setActiveOverlay(null), 2500);
      },
      triggerShuffle: () => {
          setActiveOverlay('shuffle');
          setTimeout(() => setActiveOverlay(null), 1500);
      },
      triggerFavor: (targetName: string) => {
          setOverlayData(targetName);
          setActiveOverlay('favor');
          setTimeout(() => setActiveOverlay(null), 2500);
      }
  }));

  return (
    <div className="font-display bg-tropical-night text-white h-screen w-full overflow-hidden selection:bg-plasma-cyan selection:text-black">
        <div className="absolute inset-0 bg-sand-pattern pointer-events-none z-0 mix-blend-overlay"></div>

        <div className="relative z-10 flex flex-col h-full w-full max-w-[1920px] mx-auto">

            {/* TOP: Header & Opponents */}
            <header className="flex-none px-6 py-4 border-b border-white/10 bg-black/20 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-3 w-1/4">
                    <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-plasma-cyan">
                        <span className="material-symbols-outlined text-3xl">menu</span>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-xl tracking-wide text-white">Stitch's Chaos</h1>
                        <span className="text-xs text-white/60 font-mono tracking-widest">GALACTIC FEDERATION: ONLINE</span>
                    </div>
                </div>

                <div className="flex items-start justify-center gap-8 md:gap-16 flex-1">
                    {opponents.map((player: any, idx: number) => {
                         const isTurn = players[turnIndex]?.id === player.id;
                         const isTargetable = localTargetMode && player.isAlive;
                         const cardCount = player.hand ? player.hand.length : 0;

                         return (
                            <div
                                key={player.id}
                                onClick={() => isTargetable && handleOpponentClick(player.id)}
                                className={`relative flex flex-col items-center gap-2 group ${isTargetable ? 'cursor-pointer hover:scale-110' : ''} ${isTurn ? 'transform -translate-y-2' : ''}`}
                            >
                                <div className="relative">
                                    <div className={`w-16 h-16 rounded-full border-4 ${isTargetable ? 'border-yellow-400 animate-pulse' : (isTurn ? 'border-plasma-cyan ring-4 ring-plasma-cyan/30' : 'border-tiki-wood')} bg-slate-800 overflow-hidden shadow-lg relative z-10 transition-all`}>
                                        <Image
                                            src={getAvatar(idx)}
                                            alt={player.name}
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover"
                                        />
                                        {isTargetable && (
                                            <div className="absolute inset-0 bg-yellow-400/30 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white font-bold">target</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Opponent Hand Count as Card Backs */}
                                    <div className="absolute -bottom-4 -right-8 w-12 h-16 flex items-center justify-center z-20">
                                        {/* Simple visual of a stack */}
                                        <div className="absolute top-0 left-0 w-8 h-12 bg-red-800 rounded border border-white/30 transform -rotate-6"></div>
                                        <div className="absolute top-0 left-1 w-8 h-12 bg-red-800 rounded border border-white/30 transform rotate-6"></div>
                                        <div className="absolute top-0 left-0.5 w-8 h-12 bg-red-700 rounded border border-white/30 flex items-center justify-center z-30">
                                            <span className="font-bold text-xs text-white">{cardCount}</span>
                                        </div>
                                    </div>

                                </div>
                                <div className="text-center mt-2">
                                    <p className={`text-sm font-bold drop-shadow-md ${isTargetable ? 'text-yellow-400' : (isTurn ? 'text-plasma-cyan' : 'text-tiki-wood')}`}>{player.name}</p>
                                    {!player.isAlive && <span className="text-red-500 font-bold text-xs">ELIMINATED</span>}
                                </div>
                            </div>
                         );
                    })}
                </div>

                <div className="flex items-center justify-end gap-3 w-1/4">
                    <button className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </header>

            {/* MIDDLE: Play Area */}
            <main className="flex-1 flex flex-col items-center justify-center relative p-8">
                 {/* ... Status messages ... */}

                 {localTargetMode && (
                     <div className="absolute z-50 top-24 bg-yellow-500 text-black px-6 py-2 rounded-full font-bold animate-bounce shadow-lg">
                         SELECT A PLAYER TO TARGET
                     </div>
                 )}

                 {pendingAction?.type === 'favor_give' && pendingAction.targetPlayerId === currentPlayerId && (
                     <div className="absolute z-50 inset-0 bg-black/80 flex flex-col items-center justify-center pointer-events-auto">
                         <h2 className="text-3xl text-yellow-400 font-bold mb-8">You must give a card!</h2>
                         <div className="flex gap-4 overflow-x-auto max-w-full p-4">
                             {currentPlayer.hand.map((card: Card, idx: number) => (
                                 <div
                                    key={idx}
                                    onClick={() => onGiveCard(idx)}
                                    className="w-24 h-36 bg-slate-800 rounded-lg border-2 border-white/50 cursor-pointer hover:scale-110 transition-transform"
                                 >
                                     <Image src={card.image || ''} alt="Card" width={96} height={144} className="w-full h-full object-cover rounded-md"/>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* Steal Card Overlay (Active Player picks from Victim) */}
                 {stealTarget && onStealCard && (
                     <div className="absolute z-50 inset-0 bg-black/90 flex flex-col items-center justify-center pointer-events-auto animate-fadeIn">
                         <h2 className="text-3xl text-yellow-400 font-bold mb-4">Pick a card from {stealTarget.playerName}!</h2>
                         <div className="flex flex-wrap gap-4 justify-center max-w-3xl p-4">
                             {Array.from({ length: stealTarget.cardCount }).map((_, idx) => (
                                 <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.1, translateY: -10 }}
                                    onClick={() => onStealCard(idx)}
                                    className="w-24 h-36 bg-red-900 rounded-lg border-2 border-white/30 cursor-pointer shadow-lg relative overflow-hidden"
                                 >
                                      <Image src={CARD_BACK_IMAGE} alt="Back" fill className="object-cover" />
                                      <div className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors"></div>
                                 </motion.div>
                             ))}
                         </div>
                         <p className="text-white/50 mt-4">Click a card back to steal it.</p>
                     </div>
                 )}

                 {/* Bomb Insertion Overlay */}
                 {pendingAction?.type === 'insert_bomb' && pendingAction.targetPlayerId === currentPlayerId && onInsertBomb && (
                     <BombInsertionOverlay deckCount={deck ? deck.length : 0} onInsert={onInsertBomb} />
                 )}

                {/* ANIMATION OVERLAYS */}
                <AnimatePresence>
                    {/* Dealing Animation - Phase 1: Defuse (Fly up from bottom, fan out, deal) */}
                    {isDealingAnimation && dealingPhase === 'defuse' && (
                         <div className="absolute inset-0 z-[100] pointer-events-none">
                             {players.map((p: any, idx: number) => {
                                 const isMe = p.id === currentPlayerId;
                                 // Target positions
                                 const targetX = isMe ? '50%' : `${(idx + 1) * (100 / (players.length + 1))}%`;
                                 const targetY = isMe ? '90%' : '10%';

                                 // Fan out calculation (center bottom)
                                 const fanAngle = (idx - (players.length - 1) / 2) * 10;
                                 const fanX = 50 + (idx - (players.length - 1) / 2) * 5;

                                 return (
                                     <motion.div
                                         key={`defuse-${p.id}`}
                                         initial={{ bottom: '-20%', left: '50%', x: '-50%', rotate: 0, scale: 0.8, opacity: 0 }}
                                         animate={{
                                             bottom: ['-20%', '20%', 'auto'],
                                             top: ['auto', 'auto', targetY],
                                             left: ['50%', `${fanX}%`, targetX],
                                             rotate: [0, fanAngle, 0],
                                             scale: [0.8, 1, 0.6],
                                             opacity: [0, 1, 0]
                                         }}
                                         transition={{
                                             duration: 1.5,
                                             times: [0, 0.3, 1], // 0-30% fan out, 30%-100% deal
                                             ease: "easeInOut",
                                             delay: idx * 0.1 // Stagger start slightly
                                         }}
                                         className="absolute w-24 h-36 rounded-lg border-2 border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5)] overflow-hidden bg-slate-800 origin-bottom"
                                     >
                                         <Image src={(CARD_TYPES as any).DEFUSE.image} alt="Defuse" fill className="object-cover" />
                                     </motion.div>
                                 );
                             })}
                         </div>
                    )}

                    {/* Dealing Animation - Phase 2: Hand (Round Robin Deal) */}
                    {isDealingAnimation && dealingPhase === 'hand' && (
                        <div className="absolute inset-0 z-[100] pointer-events-none">
                             {/* Generate flat list of deals: [P1-C1, P2-C1, P3-C1, P1-C2, ...] */}
                             {Array.from({ length: 4 }).flatMap((_, roundIdx) =>
                                players.map((p: any, pIdx: number) => {
                                     const isMe = p.id === currentPlayerId;
                                     const targetX = isMe ? '50%' : `${(pIdx + 1) * (100 / (players.length + 1))}%`;
                                     const targetY = isMe ? '90%' : '10%';

                                     // Calculate strict delay: (Round * Players + PlayerIndex) * speed
                                     const delay = (roundIdx * players.length + pIdx) * 0.15;

                                     return (
                                         <motion.div
                                             key={`hand-${p.id}-${roundIdx}`}
                                             initial={{ top: '-10%', left: '50%', scale: 1, opacity: 1, x: '-50%' }}
                                             animate={{ top: targetY, left: targetX, scale: 0.5, opacity: 0, rotate: 360 }}
                                             transition={{ duration: 0.4, delay: delay, ease: "linear" }}
                                             className="absolute w-24 h-36 rounded-lg border-2 border-white/50 shadow-xl overflow-hidden bg-slate-800"
                                         >
                                             <Image src={CARD_BACK_IMAGE} alt="Back" fill className="object-cover" />
                                         </motion.div>
                                     );
                                })
                             )}
                        </div>
                    )}

                    {/* Dealing Animation - Phase 3: Bomb Insert */}
                    {isDealingAnimation && dealingPhase === 'bomb' && (
                        <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center">
                            <motion.div
                                initial={{ scale: 0, opacity: 0, y: -200 }}
                                animate={{ scale: 1.5, opacity: 1, y: 0 }}
                                exit={{ scale: 0, opacity: 0, y: 50 }}
                                transition={{ duration: 1, type: 'spring' }}
                                className="relative w-36 h-52 rounded-xl border-4 border-red-600 shadow-[0_0_50px_rgba(255,0,0,0.8)] overflow-hidden bg-black"
                            >
                                <Image src={(CARD_TYPES as any).EXPLODE.image} alt="Bomb" fill className="object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                    <span className="text-red-500 font-black text-4xl animate-pulse">BOMB!</span>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Draw Animation */}
                    {drawAnimation && (
                        <motion.div
                            initial={{ x: '50%', y: '50%', opacity: 1, scale: 1, rotate: 0 }}
                            animate={{
                                x: drawAnimation.to === currentPlayerId ? '50%' : (players.length > 2 ? '10%' : '90%'), // Simplistic target logic
                                y: drawAnimation.to === currentPlayerId ? '100%' : '0%',
                                opacity: 0,
                                scale: 1.5,
                                rotate: 360
                            }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                            className="absolute z-[90] pointer-events-none w-24 h-36 rounded-lg border-2 border-white/50 shadow-xl overflow-hidden bg-slate-800"
                            style={{ top: '50%', left: '50%' }}
                        >
                            <Image src={CARD_BACK_IMAGE} alt="Back" fill className="object-cover" />
                        </motion.div>
                    )}

                    {activeOverlay === 'see_future' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center gap-4"
                        >
                            {overlayData && overlayData.map((card: any, idx: number) => (
                                <motion.div
                                    key={idx}
                                    initial={{ y: 50, opacity: 0, rotateY: 90 }}
                                    animate={{ y: 0, opacity: 1, rotateY: 0 }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="w-36 h-52 bg-white rounded-lg overflow-hidden relative shadow-2xl"
                                >
                                    <Image src={card.image} alt={card.type} fill className="object-cover" />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                    {/* ... other animations ... */}
                </AnimatePresence>

                {/* Hide piles during dealing animation */}
                {!isDealingAnimation && (
                    <div className="flex items-center justify-center gap-24 w-full max-w-4xl relative z-10 animate-fadeIn">
                        {/* Draw Pile Area */}
                        <div className={`flex flex-col items-center gap-4 transition-transform duration-300 ${(isMyTurn && !pendingAction) ? 'cursor-pointer hover:-translate-y-2' : ''}`}>
                            <span className="text-xs font-bold tracking-widest text-white/40 uppercase group-hover:text-plasma-cyan transition-colors">Draw Pile</span>
                            <CardStack
                                count={deck ? deck.length : 0}
                                type="draw"
                                onClick={handleDrawClick}
                            />
                        </div>

                        {/* Discard Pile Area */}
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-xs font-bold tracking-widest text-white/40 uppercase group-hover:text-magma-red transition-colors">Discard Pile</span>
                            <div className="relative w-52 h-52 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-dashed border-magma-red/60 animate-[spin_20s_linear_infinite]"></div>

                                <div className="flex items-center justify-center">
                                    <CardStack
                                        count={discardPile ? discardPile.length : 0}
                                        type="discard"
                                    discardCards={discardPile}
                                        topCardImage={discardPile && discardPile.length > 0 ? discardPile[discardPile.length - 1].image : null}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="absolute top-8 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full">
                        <p className={`font-bold tracking-wider text-sm uppercase ${isMyTurn ? 'text-plasma-cyan plasma-glow-text' : 'text-white/50'}`}>
                            {isMyTurn ? "It's your turn" : `${players[turnIndex]?.name}'s turn`}
                        </p>
                    </div>
                </div>
            </main>

            {/* BOTTOM: Player Hand & Controls */}
            <footer className="flex-none relative w-full flex flex-col items-center z-50">
                <div className="absolute -top-20 z-30 flex items-center gap-6 pointer-events-auto">
                    {/* NOPE BUTTON (Left) */}
                    <button
                        onClick={onNope}
                        disabled={!hasNope || !isNopeActive}
                        className={`w-20 h-20 rounded-full border-4 border-white shadow-xl flex items-center justify-center font-black text-white text-xl transform transition-all active:scale-90 ${hasNope && isNopeActive ? 'bg-red-600 animate-pulse scale-110 cursor-pointer' : 'bg-gray-700 opacity-50 grayscale cursor-not-allowed'}`}
                    >
                        NOPE
                    </button>

                    {/* PLAY BUTTON (Center - appears if selected) */}
                    {selectedIndices.length > 0 && isMyTurn && !pendingAction && (
                        <motion.button
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            onClick={handlePlaySelected}
                            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl border-b-4 border-orange-700 font-bold text-blue-900 shadow-xl uppercase tracking-widest hover:brightness-110 active:border-b-0 active:translate-y-1"
                        >
                            Play {selectedIndices.length} Card{selectedIndices.length > 1 ? 's' : ''}
                        </motion.button>
                    )}

                    {/* DRAW BUTTON (Right - if no selection) */}
                    {selectedIndices.length === 0 && (
                        <button
                            onClick={handleDrawClick}
                            disabled={!isMyTurn || !!pendingAction}
                            className={`group relative px-8 py-3 bg-slate-900 rounded-xl border border-plasma-cyan overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all active:scale-95 ${(!isMyTurn || !!pendingAction) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="absolute inset-0 bg-plasma-cyan/10 group-hover:bg-plasma-cyan/20 transition-colors"></div>
                            <span className="relative z-10 font-bold text-plasma-cyan tracking-widest uppercase text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">touch_app</span> Draw Card
                            </span>
                        </button>
                    )}
                </div>

                <div className="w-full h-56 relative mt-6 bg-[#d2b48c]/10 backdrop-blur-md border-t border-[#d2b48c]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-end pb-4">
                    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-[#0f172a] to-transparent z-0"></div>

                    <div className="flex items-end justify-center px-10 gap-2 overflow-x-auto overflow-y-visible hand-scroll min-h-[220px] pb-4 pt-10 scroll-smooth">

                        <AnimatePresence>
                        {currentPlayer?.hand && currentPlayer.hand.map((card: any, index: number) => {
                             const config = (CARD_TYPES as any)[card.type] || {};

                             const isSelected = selectedIndices.includes(index);
                             const isPlayable = isMyTurn && !pendingAction;

                             return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 200, scale: 0.5 }}
                                    animate={{
                                        opacity: 1,
                                        y: isSelected ? -80 : 0,
                                        scale: 1,
                                        zIndex: isSelected ? 50 : 0,
                                        rotate: 0
                                    }}
                                    exit={{
                                        opacity: 0,
                                        y: -400, // Fly up towards discard pile
                                        scale: 0.2,
                                        rotate: Math.random() * 360,
                                        transition: { duration: 0.5 }
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    key={card.id || index}
                                    whileHover={{ y: isSelected ? -90 : -60, scale: 1.1, zIndex: 100, rotate: Math.random() * 4 - 2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => isPlayable && toggleSelectCard(index)}
                                    className={`relative flex-none w-36 h-52 rounded-xl shadow-2xl cursor-pointer group overflow-hidden ${!isPlayable ? 'opacity-50 grayscale' : ''} ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                                    style={{ marginLeft: index === 0 ? 0 : -60 }} // Overlap cards
                                >
                                    <Image
                                        src={card.image || config.image}
                                        alt={config.name || 'Card'}
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Subtle highlight on hover */}
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none"></div>
                                </motion.div>
                             );
                        })}
                        </AnimatePresence>

                        {!currentPlayer?.hand?.length && (
                             <div className="text-white/30 text-sm font-bold pb-8">No cards in hand</div>
                        )}

                    </div>
                </div>
            </footer>
        </div>
    </div>
  );
});

NewGameBoard.displayName = "NewGameBoard";
export default NewGameBoard;
