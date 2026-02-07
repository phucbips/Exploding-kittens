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
  onPlayCard: (card: any, index: number) => void;
  onStartGame: () => void;
  onGiveCard: (cardIndex: number) => void; // For Favor
  onSelectTarget: (targetId: string) => void; // For Favor/Pair
}

// 3D Card Stack Component - Optimized with "Squash" and "Impact"
const CardStack = ({ count, type = 'draw', topCardImage = null, onClick }: { count: number, type?: 'draw' | 'discard', topCardImage?: string | null, onClick?: () => void }) => {
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

    // Impact Animation trigger (when count increases for discard)
    // We use a key to re-trigger animation on change if needed, or rely on whileTap for interaction.
    // For "Impact" on discard (new card landing), we can use `animate`.

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

const NewGameBoard = forwardRef(({ gameState, currentPlayerId, onDrawCard, onPlayCard, onStartGame, onGiveCard, onSelectTarget }: GameBoardProps, ref) => {
  const { players, deck, discardPile, turnIndex, gameState: status, pendingAction, isDealing } = gameState;

  const currentPlayerIndex = players.findIndex((p: any) => p.id === currentPlayerId);
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = players[turnIndex]?.id === currentPlayerId && status === 'playing';

  // Logic for interaction states
  const isTargeting = isMyTurn && pendingAction?.type === 'favor_give' && pendingAction?.sourcePlayerId === currentPlayerId;
  const [localTargetMode, setLocalTargetMode] = useState<boolean>(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

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
  const [drawAnimation, setDrawAnimation] = useState<{from: string, to: string} | null>(null);
  const [prevDeckLen, setPrevDeckLen] = useState(deck ? deck.length : 0);

  // Trigger Dealing Animation
  useEffect(() => {
      if (isDealing) {
          setIsDealingAnimation(true);
          setTimeout(() => setIsDealingAnimation(false), 3000);
      }
  }, [isDealing]);

  // Trigger Draw Animation
  useEffect(() => {
      if (deck && deck.length < prevDeckLen) {
          // A card was drawn. Who drew it? Current turn player usually.
          // We trigger a visual animation from Deck -> Player
          // We approximate "Deck" as center and "Player" as bottom (for me) or top (opponents)
          // Since we don't have exact coordinates without measuring refs, we use fixed percentages.
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
      enableTargetMode: (cardIndex: number) => {
          setSelectedCardIndex(cardIndex);
          setLocalTargetMode(true);
      }
  }));

  const handleOpponentClick = (targetId: string) => {
      if (localTargetMode && selectedCardIndex !== null) {
          onPlayCard(currentPlayer.hand[selectedCardIndex], selectedCardIndex);
          onSelectTarget(targetId);
          setLocalTargetMode(false);
          setSelectedCardIndex(null);
      }
  };

  const handleDrawClick = () => {
      if (isMyTurn && !pendingAction) {
          onDrawCard();
      }
  }

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

                {/* ANIMATION OVERLAYS */}
                <AnimatePresence>
                    {/* Dealing Animation */}
                    {isDealingAnimation && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center"
                        >
                            <div className="relative w-full h-full">
                                {players.map((p: any, idx: number) => {
                                    const isMe = p.id === currentPlayerId;
                                    const targetX = isMe ? '50%' : `${(idx + 1) * (100 / (players.length + 1))}%`;
                                    const targetY = isMe ? '90%' : '10%';

                                    return (
                                        <motion.div
                                            key={`deal-${p.id}`}
                                            initial={{ x: '50%', y: '50%', scale: 0, opacity: 0 }}
                                            animate={{ x: targetX, y: targetY, scale: 0.5, opacity: 1, rotate: 360 }}
                                            transition={{ duration: 1.5, delay: idx * 0.2, ease: "easeInOut" }}
                                            className="absolute flex items-center justify-center"
                                            style={{ top: '50%', left: '50%' }}
                                        >
                                           <div className="w-24 h-36 rounded-lg border-2 border-white/50 shadow-xl overflow-hidden bg-slate-800">
                                                <Image src={CARD_BACK_IMAGE} alt="Back" fill className="object-cover" />
                                           </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
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

                <div className="flex items-center justify-center gap-24 w-full max-w-4xl relative z-10">
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
                                    topCardImage={discardPile && discardPile.length > 0 ? discardPile[discardPile.length - 1].image : null}
                                />
                            </div>
                        </div>
                    </div>
                </div>

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
                <div className="absolute -top-10 z-30 flex items-center gap-6">
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
                </div>

                <div className="w-full h-56 relative mt-6 bg-[#d2b48c]/10 backdrop-blur-md border-t border-[#d2b48c]/20 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col justify-end pb-4">
                    <div className="absolute bottom-0 w-full h-8 bg-gradient-to-t from-[#0f172a] to-transparent z-0"></div>

                    <div className="flex items-end justify-center px-10 gap-2 overflow-x-auto overflow-y-visible hand-scroll min-h-[220px] pb-4 pt-10 scroll-smooth">

                        <AnimatePresence>
                        {currentPlayer?.hand && currentPlayer.hand.map((card: any, index: number) => {
                             const config = (CARD_TYPES as any)[card.type] || {};

                             const isPlayable = isMyTurn && !pendingAction;

                             return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 50, scale: 0.5 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, y: -50 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    key={card.id || index}
                                    whileHover={{ y: -60, scale: 1.1, zIndex: 100, rotate: Math.random() * 4 - 2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => isPlayable && onPlayCard(card, index)}
                                    className={`relative flex-none w-36 h-52 rounded-xl shadow-2xl cursor-pointer group overflow-hidden ${!isPlayable ? 'opacity-50 grayscale' : ''}`}
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
