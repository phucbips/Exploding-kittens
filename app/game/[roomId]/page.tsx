'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, onValue, update, onDisconnect, remove, serverTimestamp } from 'firebase/database';
import { db } from '@/lib/firebase';
import NewGameBoard from '@/components/NewGameBoard';
import Cookies from 'js-cookie';
import { initializeGame, shuffle } from '@/utils/gameLogic';
import type { GameState, Card, Player } from '@/types/game';

export default function GamePage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Initialize userId from cookie if available to prevent loading loop
  const [userId, setUserId] = useState<string>(() => {
      if (typeof window !== 'undefined') {
          return Cookies.get('userId') || '';
      }
      return '';
  });

  const [error, setError] = useState<string | null>(null);
  const [actionIntent, setActionIntent] = useState<{ type: string, cardIndices: number[] } | null>(null);
  const [stealTarget, setStealTarget] = useState<{playerId: string, playerName: string, cardCount: number, type: string} | null>(null);

  const gameBoardRef = useRef<any>(null);

  useEffect(() => {
    // Try Cookie first, then Session (fallback)
    let storedUserId = userId;
    if (!storedUserId && typeof window !== 'undefined') {
        storedUserId = Cookies.get('userId') || sessionStorage.getItem('userId') || '';
        if (storedUserId) setUserId(storedUserId);
    }

    if (!storedUserId) {
        // Redirect if no ID found after checks
        router.push('/');
        return;
    }

    const gameRef = ref(db, `rooms/${roomId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        setError(null);

        // Host Presence for Game Page
        if (data.players && data.players[0]?.id === storedUserId) {
            // Remove public listing immediately
            onDisconnect(ref(db, `public_rooms/${roomId}`)).remove();
            // Mark room as potentially abandoned but wait for cleanup
            onDisconnect(ref(db, `rooms/${roomId}`)).update({
                hostDisconnectedAt: serverTimestamp()
            });

            // Clear disconnection flag if we are back
            if (data.hostDisconnectedAt) {
                update(ref(db, `rooms/${roomId}`), { hostDisconnectedAt: null });
            }
        }

      } else {
        setError('Room not found or empty.');
      }
    }, (error) => {
        console.error("Firebase read error:", error);
        if (error.message.includes("permission_denied")) {
            setError("Permission denied. Please check Database Rules in Firebase Console.");
        } else {
            setError(`Connection error: ${error.message}`);
        }
    });

    return () => unsubscribe();
  }, [roomId, router, userId]);

  // Lazy Cleanup Effect
  useEffect(() => {
      if (!gameState || !gameState.hostDisconnectedAt) return;

      const checkCleanup = setInterval(async () => {
          const disconnectedAt = gameState.hostDisconnectedAt;
          if (disconnectedAt && Date.now() - disconnectedAt > 5 * 60 * 1000) {
              // 5 minutes passed. Remove room.
              try {
                  await remove(ref(db, `rooms/${roomId}`));
                  alert("Room closed due to host inactivity.");
                  router.push('/');
              } catch (err) { console.error("Cleanup error:", err); }
          }
      }, 30000); // Check every 30s

      return () => clearInterval(checkCleanup);
  }, [gameState?.hostDisconnectedAt, roomId, router]);

  // Auto-clear dealing state to ensure Host can play
  useEffect(() => {
      if (gameState && gameState.isDealing && gameState.players && gameState.players[0].id === userId) {
             const timer = setTimeout(() => {
                  // Only update if still dealing
                  update(ref(db, `rooms/${roomId}`), { isDealing: false })
                    .catch(err => console.error("Error clearing dealing state:", err));
             }, 8000); // 8s safety buffer for animation
             return () => clearTimeout(timer);
      }
  }, [gameState?.isDealing, userId, roomId]); // Dependency on isDealing ensures it only runs when needed

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Đã sao chép link mời!');
  };

  const handleStartGame = async () => {
    alert("Game already started!");
  };

  const getNextAlivePlayerIndex = (currentIndex: number, players: Player[]) => {
      let nextIndex = (currentIndex + 1) % players.length;
      let count = 0;
      while (!players[nextIndex].isAlive && count < players.length) {
          nextIndex = (nextIndex + 1) % players.length;
          count++;
      }
      return nextIndex;
  };

  const handleDrawCard = async () => {
    if (!gameState) return;
    const { deck, players, turnIndex, turnsLeft = 1 } = gameState;
    const currentPlayer = players[turnIndex];

    if (currentPlayer.id !== userId) return;

    if (gameState.pendingAction?.targetPlayerId === userId) {
        alert("You must resolve the pending action first!");
        return;
    }

    const newDeck = [...(deck || [])];
    if (newDeck.length === 0) return;

    const card = newDeck.pop();
    if (!card) return;

    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p) => p.id === userId);
    const player = newPlayers[playerIndex];

    let nextTurnIndex = turnIndex;
    let nextTurnsLeft = turnsLeft - 1;
    let newPendingAction = null;

    if (card.type === 'EXPLODE') {
        const hasDefuse = player.hand && player.hand.some((c) => c.type === 'DEFUSE');

        if (hasDefuse) {
             alert('BÙM! Bạn đã rút phải Mèo Nổ! Hãy dùng lá Gỡ Bom để sống sót!');
             newPendingAction = {
                 type: 'defuse_required',
                 targetPlayerId: userId,
                 bombCard: card
             };
             // Add Bomb to Discard Pile temporarily
             const currentDiscard = gameState.discardPile || [];
             const updatedDiscardPile = [...currentDiscard, card];

             try {
                await update(ref(db, `rooms/${roomId}`), {
                    deck: newDeck,
                    discardPile: updatedDiscardPile,
                    pendingAction: newPendingAction
                });
             } catch (err) { console.error(err); }
             return;
        } else {
            alert('BÙM! Bạn không có Gỡ Bom! Bạn đã bị loại!');
            player.isAlive = false;

            const currentDiscard = gameState.discardPile || [];
            const updatedDiscardPile = [...currentDiscard, ...player.hand, card];
            player.hand = [];

            if (nextTurnsLeft <= 0) {
                nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
                nextTurnsLeft = 1;
            }

            const aliveCount = newPlayers.filter(p => p.isAlive).length;

            try {
                await update(ref(db, `rooms/${roomId}`), {
                    deck: newDeck,
                    players: newPlayers,
                    turnIndex: nextTurnIndex,
                    turnsLeft: nextTurnsLeft,
                    gameState: aliveCount <= 1 ? 'ended' : gameState.gameState,
                    discardPile: updatedDiscardPile,
                    pendingAction: null
                });
            } catch (err) { console.error(err); }
            return;
        }
    } else {
        player.hand = [...(player.hand || []), card];
        if (nextTurnsLeft <= 0) {
            nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
            nextTurnsLeft = 1;
        }
    }

    const alivePlayers = newPlayers.filter((p) => p.isAlive);
    let newStatus = gameState.gameState;
    if (alivePlayers.length === 1 && newPlayers.length > 1) {
        newStatus = 'ended';
    }

    try {
        await update(ref(db, `rooms/${roomId}`), {
            deck: newDeck,
            players: newPlayers,
            turnIndex: nextTurnIndex,
            turnsLeft: nextTurnsLeft,
            gameState: newStatus,
            pendingAction: newPendingAction
        });
    } catch (err: any) {
        console.error("Draw card error:", err);
    }
  };

  const handlePlayCard = async (cards: any[], indices: number[]) => {
     if (!gameState) return;
    const { players, turnIndex, discardPile, deck, turnsLeft = 1, pendingAction } = gameState;
    const currentPlayer = players[turnIndex];

    if (pendingAction?.type === 'defuse_required') {
        if (currentPlayer.id !== userId) return;
        const card = cards[0];
        if (card.type !== 'DEFUSE') {
             alert("Bạn phải đánh lá Gỡ Bom! Không thể đánh lá khác lúc này.");
             return;
        } else {
             const newPlayers = [...players];
             const playerIndex = newPlayers.findIndex((p) => p.id === userId);
             const player = newPlayers[playerIndex];

             indices.sort((a, b) => b - a).forEach(idx => player.hand.splice(idx, 1));

             // Remove Bomb from Discard Pile (it was added in handleDrawCard)
             // We assume Bomb is the last card in discardPile (or near end if race condition, but usually last)
             // AND we add Defuse to Discard Pile.
             // Actually, we should just remove the Bomb from discard and put it in pendingAction logic?
             // No, pendingAction already HAS the bombCard data.

             const discardWithoutBomb = [...(discardPile || [])];
             // Find the specific bomb card if possible, or just pop the last one if it matches
             const bombCandidate = discardWithoutBomb[discardWithoutBomb.length - 1];

             // Safety: Only remove if it looks like a bomb.
             if (bombCandidate && bombCandidate.type === 'EXPLODE') {
                 discardWithoutBomb.pop();
             }

             const pileWithDefuse = [...discardWithoutBomb, ...cards];

             await update(ref(db, `rooms/${roomId}`), {
                players: newPlayers,
                discardPile: pileWithDefuse,
                pendingAction: {
                    type: 'insert_bomb',
                    targetPlayerId: userId,
                    bombCard: pendingAction.bombCard
                }
             });
             return;
        }
    }

    if (currentPlayer.id !== userId) {
        alert("Chưa đến lượt của bạn!");
        return;
    }

    if (pendingAction && pendingAction.type !== 'play_action') {
        alert("Resolving pending action...");
        return;
    }

    const card = cards[0];
    const isPair = cards.length === 2 && cards[0].type === cards[1].type;
    const isTriple = cards.length === 3 && cards[0].type === cards[1].type && cards[1].type === cards[2].type;
    const isSpecial = cards.length === 5;

    const isActionCard = ['ATTACK', 'SKIP', 'SHUFFLE', 'SEE_FUTURE', 'FAVOR'].includes(card.type);
    if (cards.length === 1 && !isActionCard && card.type !== 'EXPLODE' && card.type !== 'DEFUSE') {
         if (!confirm("Lá bài này không có chức năng gì khi đánh lẻ. Bạn có chắc muốn đánh không?")) {
             return;
         }
    }

    if (cards.length > 1 && !isPair && !isTriple && !isSpecial) {
        alert("Chỉ được đánh bài lẻ, đôi hoặc bộ ba cùng loại!");
        return;
    }

    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p) => p.id === userId);
    const player = newPlayers[playerIndex];

    indices.sort((a, b) => b - a).forEach(idx => {
        player.hand.splice(idx, 1);
    });

    const newDiscardPile = [...(discardPile || []), ...cards];

    let pending = null;
    let nopeTimerVal = null;

    if (isActionCard || isPair || isTriple || isSpecial) {
        pending = {
            type: 'play_action',
            cardType: isPair ? 'PAIR' : (isTriple ? 'TRIPLE' : card.type),
            count: cards.length,
            sourcePlayerId: userId,
            startTime: Date.now()
        };
        nopeTimerVal = Date.now() + 4000;
    }

    try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            discardPile: newDiscardPile,
            pendingAction: pending,
            nopeTimer: nopeTimerVal
        });
    } catch (err: any) {
        console.error("Play error:", err);
    }
  };

  const handleNope = async () => {
      if (!gameState || !gameState.pendingAction) return;

      const playerIndex = gameState.players.findIndex(p => p.id === userId);
      const player = gameState.players[playerIndex];
      const nopeIndex = player.hand.findIndex(c => c.type === 'NOPE');

      if (nopeIndex === -1) return;

      const newPlayers = [...gameState.players];
      const nopeCard = newPlayers[playerIndex].hand.splice(nopeIndex, 1)[0];
      const newDiscardPile = [...(gameState.discardPile || []), nopeCard];

      if (gameState.pendingAction.type === 'explode') return;

      try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            discardPile: newDiscardPile,
            pendingAction: null, // Action Cancelled!
            nopeTimer: null
        });
        alert("NOPE! Action cancelled.");
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
      if (!gameState || !gameState.nopeTimer || !gameState.pendingAction) return;
      if (gameState.players[gameState.turnIndex].id !== userId) return;

      const timeLeft = gameState.nopeTimer - Date.now();
      if (timeLeft <= 0) {
          executePendingAction();
      } else {
          const timer = setTimeout(() => {
              executePendingAction();
          }, timeLeft);
          return () => clearTimeout(timer);
      }
  }, [gameState?.nopeTimer, gameState?.pendingAction]);

  const executePendingAction = async () => {
      if (!gameState || !gameState.pendingAction) return;
      const { pendingAction, turnIndex, players, deck, turnsLeft = 1 } = gameState;

      let nextTurnIndex = turnIndex;
      let nextTurnsLeft = turnsLeft;
      let currentDeck = deck ? [...deck] : [];
      let newPlayers = [...players];

      if (pendingAction.type === 'play_action') {
          switch (pendingAction.cardType) {
            case 'SKIP':
                nextTurnsLeft -= 1;
                gameBoardRef.current?.triggerSkip();
                break;
            case 'ATTACK':
                nextTurnsLeft = 0; // End current turns
                gameBoardRef.current?.triggerAttack();
                break;
            case 'SHUFFLE':
                currentDeck = shuffle(currentDeck);
                gameBoardRef.current?.triggerShuffle();
                break;
            case 'SEE_FUTURE':
                const top3 = currentDeck.slice(-3).reverse();
                gameBoardRef.current?.triggerSeeFuture(top3);
                break;
          }
      } else if (pendingAction.type === 'pair_steal' || pendingAction.type === 'triple_steal') {
            const targetId = pendingAction.targetPlayerId;
            const sourceId = pendingAction.sourcePlayerId;
            const targetIndex = newPlayers.findIndex((p) => p.id === targetId);
            const sourceIndex = newPlayers.findIndex((p) => p.id === sourceId);

            if (targetIndex !== -1 && sourceIndex !== -1) {
                const targetHand = newPlayers[targetIndex].hand;
                if (targetHand && targetHand.length > 0) {
                     let indexToSteal = (pendingAction as any).targetCardIndex;
                     if (indexToSteal === undefined || indexToSteal < 0 || indexToSteal >= targetHand.length) {
                         indexToSteal = Math.floor(Math.random() * targetHand.length);
                     }
                     const stolenCard = newPlayers[targetIndex].hand.splice(indexToSteal, 1)[0];
                     newPlayers[sourceIndex].hand.push(stolenCard);
                }
            }
      }

      if (nextTurnsLeft <= 0) {
         nextTurnIndex = getNextAlivePlayerIndex(turnIndex, players);
         nextTurnsLeft = pendingAction.cardType === 'ATTACK' ? 2 : 1;
      }

      await update(ref(db, `rooms/${roomId}`), {
          deck: currentDeck,
          players: newPlayers,
          turnIndex: nextTurnIndex,
          turnsLeft: nextTurnsLeft,
          pendingAction: null,
          nopeTimer: null
      });
  };

  const handleSelectTarget = async (targetId: string) => {
      if (!gameState || !actionIntent) return;
      const { players, discardPile } = gameState;

      const newPlayers = [...players];
      const playerIndex = newPlayers.findIndex((p) => p.id === userId);
      const targetIndex = newPlayers.findIndex((p) => p.id === targetId);

      if (targetIndex === -1) return;

      const playedCards: Card[] = [];
      [...actionIntent.cardIndices].sort((a, b) => b - a).forEach(idx => {
          if (newPlayers[playerIndex].hand[idx]) {
            playedCards.push(newPlayers[playerIndex].hand.splice(idx, 1)[0]);
          }
      });

      const newDiscardPile = [...(discardPile || []), ...playedCards];

      try {
          if (actionIntent.type === 'FAVOR') {
              const pendingAction = {
                  type: 'favor_give',
                  sourcePlayerId: userId,
                  targetPlayerId: targetId
              };

              await update(ref(db, `rooms/${roomId}`), {
                  players: newPlayers,
                  discardPile: newDiscardPile,
                  pendingAction: pendingAction
              });
              gameBoardRef.current?.triggerFavor(players[targetIndex]?.name || 'Target');

          } else if (actionIntent.type === 'PAIR' || actionIntent.type === 'TRIPLE') {
              const targetPlayer = newPlayers[targetIndex];
              const cardCount = targetPlayer.hand ? targetPlayer.hand.length : 0;

              if (cardCount === 0) {
                  alert("Đối thủ không còn bài để cướp!");
                  return;
              }

              setStealTarget({
                  playerId: targetId,
                  playerName: targetPlayer.name,
                  cardCount: cardCount,
                  type: actionIntent.type
              });

              await update(ref(db, `rooms/${roomId}`), {
                  players: newPlayers,
                  discardPile: newDiscardPile
              });
          }
      } catch (err: any) {
          console.error("Target action error:", err);
      }

      setActionIntent(null);
  };

  const handleGiveCard = async (cardIndex: number) => {
      if (!gameState || !gameState.pendingAction) return;
      const { players, pendingAction } = gameState;

      if (pendingAction.targetPlayerId !== userId) return;

      const newPlayers = [...players];
      const giverIndex = newPlayers.findIndex((p) => p.id === userId);
      const receiverIndex = newPlayers.findIndex((p) => p.id === pendingAction.sourcePlayerId);

      const cardToGive = newPlayers[giverIndex].hand.splice(cardIndex, 1)[0];
      newPlayers[receiverIndex].hand.push(cardToGive);

      try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            pendingAction: null
        });
        alert(`Bạn đã đưa lá ${cardToGive.name} cho đối thủ.`);
      } catch (err: any) { console.error(err); }
  };

  const handleStealSpecificCard = async (cardIndex: number) => {
      if (!gameState || !stealTarget) return;

      const pendingAction = {
          type: stealTarget.type === 'PAIR' ? 'pair_steal' : 'triple_steal',
          sourcePlayerId: userId,
          targetPlayerId: stealTarget.playerId,
          targetCardIndex: cardIndex
      };

      try {
           await update(ref(db, `rooms/${roomId}`), {
              pendingAction: pendingAction,
              nopeTimer: Date.now() + 4000
          });
      } catch (err: any) { console.error(err); }

      setStealTarget(null);
  };

  const handleInsertBomb = async (insertIndex: number) => {
      if (!gameState || !gameState.pendingAction || gameState.pendingAction.type !== 'insert_bomb') return;
      const { deck, players, turnIndex, turnsLeft = 1, pendingAction } = gameState;

      const bombCard = (pendingAction as any).bombCard;
      const newDeck = [...(deck || [])];

      const realIndex = Math.max(0, newDeck.length - insertIndex);
      newDeck.splice(realIndex, 0, bombCard);

      let nextTurnIndex = turnIndex;
      let nextTurnsLeft = turnsLeft - 1;

      if (nextTurnsLeft <= 0) {
          nextTurnIndex = getNextAlivePlayerIndex(turnIndex, players);
          nextTurnsLeft = 1;
      }

      await update(ref(db, `rooms/${roomId}`), {
          deck: newDeck,
          pendingAction: null,
          turnIndex: nextTurnIndex,
          turnsLeft: nextTurnsLeft
      });
  };

  const handleHandReorder = async (newHand: Card[]) => {
      if (!gameState) return;
      const { players } = gameState;

      const newPlayers = [...players];
      const playerIndex = newPlayers.findIndex((p) => p.id === userId);
      if (playerIndex === -1) return;

      newPlayers[playerIndex].hand = newHand;

      try {
          await update(ref(db, `rooms/${roomId}/players/${playerIndex}`), {
              hand: newHand
          });
      } catch (err) {
          console.error("Reorder sync error:", err);
      }
  };

  const onUIPlayCard = (cards: any[], indices: number[]) => {
      const type = cards[0].type;
      const isPair = cards.length === 2 && cards[0].type === cards[1].type;
      const isTriple = cards.length === 3 && cards[0].type === cards[1].type && cards[1].type === cards[2].type;

      if (type === 'FAVOR') {
          setActionIntent({ type: 'FAVOR', cardIndices: indices });
          gameBoardRef.current?.enableTargetMode();
      } else if (isPair) {
          setActionIntent({ type: 'PAIR', cardIndices: indices });
          gameBoardRef.current?.enableTargetMode();
      } else if (isTriple) {
          setActionIntent({ type: 'TRIPLE', cardIndices: indices });
          gameBoardRef.current?.enableTargetMode();
      } else {
          handlePlayCard(cards, indices);
      }
  }

  if (error) {
      return (
          <div className="bg-slate-900 h-screen flex items-center justify-center flex-col p-4">
              <div className="text-red-500 text-2xl font-bold mb-4 text-center">Connection Issue</div>
              <p className="text-white mb-4 text-center">{error}</p>
              <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Retry</button>
          </div>
      );
  }

  // Enhanced Loading State
  // We check for gameState.players existing to ensure we have data.
  if (!gameState || !gameState.players || !userId) {
      return (
        <div className="text-white bg-blue-900 h-screen flex items-center justify-center flex-col gap-4">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-lg animate-pulse">Loading Game Data...</p>
        </div>
      );
  }

  return (
    <>
      <div className="absolute top-4 left-4 z-50 flex flex-col gap-2">
         <div className="bg-blue-950/80 p-2 rounded-lg border border-blue-700 text-xs text-blue-200 backdrop-blur-sm">
             <div className="flex items-center gap-2 mb-1">
                 <span className="font-bold text-yellow-400">ID:</span>
                 <span className="font-mono bg-black/30 px-1 rounded">{String(roomId)}</span>
                 <button onClick={handleCopyLink} className="text-teal-400 hover:text-white" title="Copy Link">
                    <span className="material-symbols-outlined text-sm">content_copy</span>
                 </button>
             </div>
             {gameState.gameState === 'waiting' && <p>Chờ người chơi...</p>}
         </div>
      </div>

      <NewGameBoard
        ref={gameBoardRef}
        gameState={gameState}
        currentPlayerId={userId}
        onDrawCard={handleDrawCard}
        onPlayCard={onUIPlayCard}
        onStartGame={handleStartGame}
        onGiveCard={handleGiveCard}
        onSelectTarget={handleSelectTarget}
        onNope={handleNope}
        stealTarget={stealTarget}
        onStealCard={handleStealSpecificCard}
        onInsertBomb={handleInsertBomb}
        onHandReorder={handleHandReorder}
    />
    </>
  );
}
