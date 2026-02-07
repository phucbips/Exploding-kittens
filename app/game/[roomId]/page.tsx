'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, onValue, update, onDisconnect, remove } from 'firebase/database';
import { db } from '@/lib/firebase';
import NewGameBoard from '@/components/NewGameBoard';
import { initializeGame, shuffle } from '@/utils/gameLogic';
import type { GameState, Card, Player } from '@/types/game';

export default function GamePage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [actionIntent, setActionIntent] = useState<{ type: string, cardIndices: number[] } | null>(null);

  const gameBoardRef = useRef<any>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem('userId');
    if (!storedUserId) {
        router.push('/');
        return;
    }
    setUserId(storedUserId);

    const gameRef = ref(db, `rooms/${roomId}`);

    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        setError(null);

        // Host Presence for Game Page
        if (data.players && data.players[0]?.id === storedUserId) {
            onDisconnect(ref(db, `public_rooms/${roomId}`)).remove();
            onDisconnect(ref(db, `rooms/${roomId}`)).remove();
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
  }, [roomId, router]);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Đã sao chép link mời!');
  };

  const handleStartGame = async () => {
    // Game start is now handled in Lobby
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

    // Check if there is a pending action that prevents drawing (like being asked to give a favor card)
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
    let newActiveBomb = null;

    if (card.type === 'EXPLODE') {
        const defuseIndex = player.hand ? player.hand.findIndex((c) => c.type === 'DEFUSE') : -1;

        if (defuseIndex !== -1) {
            // Can Defuse
            gameBoardRef.current?.triggerDefuse();
            alert('Bạn đã rút phải Mèo Nổ! Hãy dùng lá Gỡ Bom!'); // In real flow, we might force them to play it or just auto-play
            // Auto-play Defuse for MVP smoothness, or require interaction?
            // Rule: "If you draw an Exploding Kitten, you can play a Defuse Card."
            // Let's auto-play it to simplify state for now, or set pendingAction='explode'

            player.hand.splice(defuseIndex, 1); // Remove Defuse

            // Re-insert Explode
            const insertIndex = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertIndex, 0, card);
            alert(`Mèo Nổ đã được nhét lại vào bộ bài!`);

            // Turn ends if we survived and used our action? No, Defuse saves you, but you still end your turn (usually)
            // Actually, playing Defuse is the action. Drawing ended the turn (if you survive).

            if (nextTurnsLeft <= 0) {
                nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
                nextTurnsLeft = 1;
            }
        } else {
            alert('BÙM! Bạn đã bị nổ tung!');
            player.isAlive = false;
            nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
            nextTurnsLeft = 1;
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
    const { players, turnIndex, discardPile, deck, turnsLeft = 1, pendingAction, nopeTimer } = gameState;
    const currentPlayer = players[turnIndex];

    if (currentPlayer.id !== userId) {
        alert("Chưa đến lượt của bạn!");
        return;
    }

    if (pendingAction && pendingAction.type !== 'play_action') {
        alert("Resolving pending action...");
        return;
    }

    // Multi-card Logic (Pair/Triple)
    const card = cards[0];
    const isPair = cards.length === 2 && cards[0].type === cards[1].type;
    const isTriple = cards.length === 3 && cards[0].type === cards[1].type && cards[1].type === cards[2].type;
    const isSpecial = cards.length === 5; // 5 diff cards = reclaim discard (advanced)

    if (cards.length > 1 && !isPair && !isTriple && !isSpecial) {
        alert("Chỉ được đánh bài lẻ, đôi hoặc bộ ba cùng loại!");
        return;
    }

    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p) => p.id === userId);
    const player = newPlayers[playerIndex];

    // Remove cards from hand (indices must be sorted desc to avoid shift issues)
    indices.sort((a, b) => b - a).forEach(idx => {
        player.hand.splice(idx, 1);
    });

    const newDiscardPile = [...(discardPile || []), ...cards];

    // UNTARGETED ACTIONS (Skip, Attack, Shuffle, SeeFuture, Nope, etc)
    const pending = {
        type: 'play_action',
        cardType: card.type,
        count: cards.length,
        sourcePlayerId: userId,
        startTime: Date.now()
    };

    try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            discardPile: newDiscardPile,
            pendingAction: pending,
            nopeTimer: Date.now() + 4000 // 4s window (3s + buffer)
        });
        // We also need a cloud function or client-side poller to execute the action when timer expires.
        // We'll use a useEffect in this component to watch the timer.
    } catch (err: any) {
        console.error("Play error:", err);
    }
  };

  const handleNope = async () => {
      if (!gameState || !gameState.pendingAction) return;

      // Check if user has Nope
      const playerIndex = gameState.players.findIndex(p => p.id === userId);
      const player = gameState.players[playerIndex];
      const nopeIndex = player.hand.findIndex(c => c.type === 'NOPE');

      if (nopeIndex === -1) return;

      const newPlayers = [...gameState.players];
      const nopeCard = newPlayers[playerIndex].hand.splice(nopeIndex, 1)[0];
      const newDiscardPile = [...(gameState.discardPile || []), nopeCard];

      // Logic: If pendingAction is 'play_action', we cancel it.
      // If it was already Noped (how to track?), we might re-enable it?
      // "YUP" card? Standard rules: Nope cancels Nope.
      // We need to track `nopeCount` in pendingAction?

      // Simplified: If pendingAction exists, Nope cancels it and clears pendingAction.
      // Unless it's an Explode? (Nope can't stop explode).
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

  // Effect to execute pending actions after timer
  useEffect(() => {
      if (!gameState || !gameState.nopeTimer || !gameState.pendingAction) return;
      if (gameState.players[gameState.turnIndex].id !== userId) return; // Only host/turn owner executes?
      // Actually better if the turn owner executes their own action to avoid race conditions.
      // But if it's Noped, action is null.

      const timeLeft = gameState.nopeTimer - Date.now();
      if (timeLeft <= 0) {
          // Timer expired! Execute Action.
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

      // Execute Logic based on pendingAction.cardType
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
                nextTurnsLeft = 0;
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
                     const randomIndex = Math.floor(Math.random() * targetHand.length);
                     const stolenCard = newPlayers[targetIndex].hand.splice(randomIndex, 1)[0];
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

  // New handler for Favor/Pair/Triple flow
  const handleSelectTarget = async (targetId: string) => {
      if (!gameState || !actionIntent) return;
      const { players, discardPile } = gameState;

      const newPlayers = [...players];
      const playerIndex = newPlayers.findIndex((p) => p.id === userId);
      const targetIndex = newPlayers.findIndex((p) => p.id === targetId);

      if (targetIndex === -1) return;

      // Remove played cards from hand based on stored intent
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
              // Pair/Triple -> Set Pending Action with Timer (allow Nope)
              const pendingAction = {
                  type: actionIntent.type === 'PAIR' ? 'pair_steal' : 'triple_steal',
                  sourcePlayerId: userId,
                  targetPlayerId: targetId
              };

              await update(ref(db, `rooms/${roomId}`), {
                  players: newPlayers,
                  discardPile: newDiscardPile,
                  pendingAction: pendingAction,
                  nopeTimer: Date.now() + 4000
              });
          }
      } catch (err: any) {
          console.error("Target action error:", err);
      }

      setActionIntent(null);
  };

  const handleGiveCard = async (cardIndex: number) => {
      // Target player selects a card to give
      if (!gameState || !gameState.pendingAction) return;
      const { players, pendingAction } = gameState;

      if (pendingAction.targetPlayerId !== userId) return; // Security check

      const newPlayers = [...players];
      const giverIndex = newPlayers.findIndex((p) => p.id === userId);
      const receiverIndex = newPlayers.findIndex((p) => p.id === pendingAction.sourcePlayerId);

      const cardToGive = newPlayers[giverIndex].hand.splice(cardIndex, 1)[0];
      newPlayers[receiverIndex].hand.push(cardToGive);

      try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            pendingAction: null // Clear action
        });
        alert(`Bạn đã đưa lá ${cardToGive.name} cho đối thủ.`);
      } catch (err: any) { console.error(err); }
  };

  // Modified UI Handler to intercept Targeted Cards
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

  if (!gameState) return <div className="text-white bg-blue-900 h-screen flex items-center justify-center">Loading...</div>;

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
    />
    </>
  );
}
