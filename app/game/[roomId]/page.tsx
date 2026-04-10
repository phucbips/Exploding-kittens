'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, onValue, update } from 'firebase/database';
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

  const handleStartGame = async () => {
    if (!gameState || !gameState.players) return;

    const playerNames = gameState.players.map((p: any) => p.name);
    const initialGameData = initializeGame(playerNames);

    const patchedPlayers = initialGameData.players.map((p: any, index: number) => ({
        ...p,
        id: gameState.players[index].id,
        name: gameState.players[index].name
    }));

    try {
        await update(ref(db, `rooms/${roomId}`), {
            ...initialGameData,
            players: patchedPlayers,
            gameState: 'playing'
        });
    } catch (err: any) {
        console.error("Start game error:", err);
        alert(`Failed to start game: ${err.message}`);
    }
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

            // Re-insert Explode using secure random
            const randomVal = globalThis.crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
            const insertIndex = Math.floor(randomVal * (newDeck.length + 1));
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

  const handlePlayCard = async (card: any, cardIndex: number) => {
     if (!gameState) return;
    const { players, turnIndex, discardPile, deck, turnsLeft = 1, pendingAction } = gameState;
    const currentPlayer = players[turnIndex];

    if (currentPlayer.id !== userId) {
        alert("Chưa đến lượt của bạn!");
        return;
    }

    // Check if we are in a special state (like needing to give a Favor card) - but usually PlayCard is for the active player
    // If pendingAction exists and targets ME, I might be giving a card, handled by onGiveCard, not PlayCard
    if (pendingAction) {
        alert("Resolving pending action...");
        return;
    }

    // Special logic for pairs (simple MVP version: check if previous card in discard is same? No, pairs are played together)
    // For now, let's stick to single card actions + Favor/Attack logic

    if (card.type === 'DEFUSE') {
        alert("Chỉ được dùng Gỡ Bom khi rút phải Mèo Nổ!");
        return;
    }

    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p) => p.id === userId);
    const player = newPlayers[playerIndex];

    // Remove card from hand
    player.hand.splice(cardIndex, 1);
    const newDiscardPile = [...(discardPile || []), card];

    let nextTurnIndex = turnIndex;
    let nextTurnsLeft = turnsLeft;
    let currentDeck = deck ? [...deck] : [];
    let newPendingAction = null;

    switch (card.type) {
        case 'SKIP':
            nextTurnsLeft -= 1;
            gameBoardRef.current?.triggerSkip();
            break;
        case 'ATTACK':
            nextTurnsLeft = 0;
            // Next player gets 2 turns
            // This is handled by passing turn logic + forcing 2
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
        case 'FAVOR':
            // Instead of auto-stealing, we enter Target Selection mode
            // We need to pause and ask user to select a target
            // BUT handlePlayCard is called immediately on click.
            // We should have UI handle selection FIRST, then call play.
            // gameBoardRef.current?.enableTargetMode(cardIndex) -> User clicks opponent -> calls onSelectTarget

            // Since we are here, it means we clicked the card.
            // If we haven't selected a target yet, we shouldn't have removed it from hand yet?
            // Correct flow: UI detects Favor click -> Shows "Select Target" -> User clicks Target -> Calls handlePlayCardWithTarget

            // For MVP simplicity in this function:
            // We'll revert the hand change locally and trigger UI mode if no target passed (complex refactor)
            // OR: We just pick random for now to match previous logic?
            // User asked for "Target selection and target gives".

            // Let's implement the UI flow:
            // 1. User clicks Favor in UI -> UI checks type -> if Favor, set localTargetMode = true.
            // 2. User clicks Player -> UI calls `onSelectTarget(targetId)`
            // 3. `onSelectTarget` calls a new function `handlePlayFavor(targetId)` which removes card and sets pendingAction.

            // Since we are inside handlePlayCard which is generic:
            // We'll revert this function to NOT handle Favor if it requires target.
            // We will move Favor logic to `handleFavorPlay` triggered by the new prop.
            return; // Should not reach here for Favor if UI handles it

        default:
            break;
    }

    if (nextTurnsLeft <= 0) {
         nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
         nextTurnsLeft = card.type === 'ATTACK' ? 2 : 1;
    }

    try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            discardPile: newDiscardPile,
            deck: currentDeck,
            turnIndex: nextTurnIndex,
            turnsLeft: nextTurnsLeft
        });
    } catch (err: any) {
        console.error("Play card error:", err);
    }
  };

  // New handler for Favor flow
  const handleSelectTarget = async (targetId: string) => {
      // User selected a target for Favor
      if (!gameState) return;
      const { players, turnIndex, discardPile, deck } = gameState;
      const currentPlayer = players[turnIndex];

      // Find the Favor card in hand (first one)
      const favorCardIndex = currentPlayer.hand.findIndex((c: Card) => c.type === 'FAVOR');
      if (favorCardIndex === -1) return;

      const newPlayers = [...players];
      const playerIndex = newPlayers.findIndex((p) => p.id === userId);
      const favorCard = newPlayers[playerIndex].hand.splice(favorCardIndex, 1)[0];

      const newDiscardPile = [...(discardPile || []), favorCard];

      // Set pending action for the TARGET player to give a card
      const pendingAction = {
          type: 'favor_give',
          sourcePlayerId: userId,
          targetPlayerId: targetId
      };

      // Don't pass turn yet! Wait for resolution.

      try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            discardPile: newDiscardPile,
            pendingAction: pendingAction
        });
        gameBoardRef.current?.triggerFavor(players.find((p) => p.id === targetId)?.name || 'Target');
      } catch (err: any) { console.error(err); }
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

  // Modified UI Handler to intercept Favor
  const onUIPlayCard = (card: any, index: number) => {
      if (card.type === 'FAVOR') {
          gameBoardRef.current?.enableTargetMode(index);
      } else {
          handlePlayCard(card, index);
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
    <NewGameBoard
        ref={gameBoardRef}
        gameState={gameState}
        currentPlayerId={userId}
        onDrawCard={handleDrawCard}
        onPlayCard={onUIPlayCard}
        onStartGame={handleStartGame}
        onGiveCard={handleGiveCard}
        onSelectTarget={handleSelectTarget}
    />
  );
}
