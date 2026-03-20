'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { CARD_TYPES } from '@/utils/gameConfig';
import { getSecureRandomInt } from '@/utils/cryptoUtils';
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

const NewGameBoard = forwardRef(({ gameState, currentPlayerId, onDrawCard, onPlayCard, onStartGame, onGiveCard, onSelectTarget }: GameBoardProps, ref) => {
  const { players, deck, discardPile, turnIndex, gameState: status, pendingAction } = gameState;

  const currentPlayerIndex = players.findIndex((p: any) => p.id === currentPlayerId);
  const currentPlayer = players[currentPlayerIndex];
  const isMyTurn = players[turnIndex]?.id === currentPlayerId && status === 'playing';

  // Logic for interaction states
  const isTargeting = isMyTurn && pendingAction?.type === 'favor_give' && pendingAction?.sourcePlayerId === currentPlayerId; // Actually targeting happens BEFORE favor_give
  // Correction: "pendingAction" in DB is usually "waiting for player X to give card".
  // We need a local state for "Select a player to favor" if we haven't sent the action yet.
  // But typically we select target immediately when playing the card.

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
          onPlayCard(currentPlayer.hand[selectedCardIndex], selectedCardIndex); // This is where we need to pass targetId
          // But onPlayCard signature is (card, index). We need to update page.tsx to handle targetId.
          // Temporary fix: Call a prop "onSelectTarget" which resolves the pending play
          onSelectTarget(targetId);
          setLocalTargetMode(false);
          setSelectedCardIndex(null);
      }
  };

  const getCardStyle = (type: string) => {
      switch(type) {
          case 'ATTACK': return { border: 'border-plasma-cyan', shadow: 'shadow-[0_0_10px_rgba(0,240,255,0.3)]', text: 'text-plasma-cyan', icon: 'swords' };
          case 'DEFUSE': return { border: 'border-green-400', shadow: 'shadow-[0_0_10px_rgba(74,222,128,0.3)]', text: 'text-green-400', icon: 'build' };
          case 'SKIP': return { border: 'border-blue-400', shadow: 'shadow-[0_0_10px_rgba(96,165,250,0.3)]', text: 'text-blue-400', icon: 'fast_forward' };
          case 'NOPE': return { border: 'border-magma-red', shadow: 'shadow-[0_0_10px_rgba(255,69,0,0.3)]', text: 'text-magma-red', icon: 'block' };
          case 'SEE_FUTURE': return { border: 'border-purple-400', shadow: 'shadow-[0_0_10px_rgba(192,132,252,0.3)]', text: 'text-purple-400', icon: 'visibility' };
          default: return { border: 'border-gray-400', shadow: 'shadow-[0_0_10px_rgba(156,163,175,0.3)]', text: 'text-gray-400', icon: 'pets' };
      }
  };

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

                         return (
                            <div
                                key={player.id}
                                onClick={() => isTargetable && handleOpponentClick(player.id)}
                                className={`flex flex-col items-center gap-2 group ${isTargetable ? 'cursor-pointer hover:scale-110' : ''} ${isTurn ? 'transform -translate-y-2' : ''}`}
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
                                    <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-white/20 rounded-full w-8 h-8 flex items-center justify-center z-20 shadow-md">
                                        <span className="text-xs font-bold text-plasma-cyan">{player.hand ? player.hand.length : 0}</span>
                                    </div>
                                </div>
                                <div className="text-center">
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

                <div className="flex items-center justify-center gap-24 w-full max-w-4xl">
                    {/* Draw Pile Area */}
                    <div className="flex flex-col items-center gap-4 group">
                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase group-hover:text-plasma-cyan transition-colors">Draw Pile</span>
                        <div className="relative">
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-48 h-12 bg-yellow-200 rounded-full rotate-1 blur-[1px] opacity-80 border-2 border-orange-400" style={{background: 'radial-gradient(circle, #fde047 0%, #f59e0b 100%)'}}></div>
                            <div
                                onClick={() => isMyTurn && !pendingAction && onDrawCard()}
                                className={`relative w-36 h-52 bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl border-2 border-white/20 card-stack flex items-center justify-center ${(isMyTurn && !pendingAction) ? 'cursor-pointer hover:-translate-y-2' : ''} transition-transform duration-300`}
                            >
                                <div className="absolute inset-2 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-blue-950/50 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-plasma-cyan/50">rocket_launch</span>
                                    </div>
                                </div>
                                <div className="absolute -top-3 -right-3 bg-red-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg border-2 border-slate-900">
                                    {deck ? deck.length : 0}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Discard Pile Area */}
                    <div className="flex flex-col items-center gap-4 group">
                        <span className="text-xs font-bold tracking-widest text-white/40 uppercase group-hover:text-magma-red transition-colors">Discard Pile</span>
                        <div className="relative w-52 h-52 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-dashed border-magma-red/60 animate-[spin_20s_linear_infinite]"></div>
                            <div className="absolute inset-2 rounded-full bg-black/60 volcano-glow flex items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-50 bg-black"></div>
                            </div>

                            {discardPile && discardPile.length > 0 && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, rotate: 0 }}
                                    animate={{ scale: 1, opacity: 1, rotate: getSecureRandomInt(20) - 10 }}
                                    key={discardPile.length} // Key change triggers animation
                                    className="relative w-36 h-52 rounded-xl overflow-hidden shadow-2xl"
                                >
                                    <Image
                                        src={discardPile[discardPile.length-1].image || ''}
                                        alt="Discarded"
                                        fill
                                        className="object-cover"
                                    />
                                </motion.div>
                            )}
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
            <footer className="flex-none relative w-full flex flex-col items-center">
                <div className="absolute -top-10 z-30 flex items-center gap-6">
                    <button
                        onClick={() => isMyTurn && !pendingAction && onDrawCard()}
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

                        {currentPlayer?.hand && currentPlayer.hand.map((card: any, index: number) => {
                             const config = (CARD_TYPES as any)[card.type] || {};

                             // Disable playing Defuse if not in Explode pending state (logic to be added in page.tsx validation too)
                             const isPlayable = isMyTurn && !pendingAction;
                             // Specific check for Defuse playability could be visual here too

                             return (
                                <motion.div
                                    key={card.id || index}
                                    whileHover={{ y: -40, scale: 1.1, zIndex: 10 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => isPlayable && onPlayCard(card, index)}
                                    className={`relative flex-none w-36 h-52 rounded-xl shadow-2xl cursor-pointer group overflow-hidden ${!isPlayable ? 'opacity-50 grayscale' : ''}`}
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
