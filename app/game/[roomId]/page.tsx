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

  // Ref to trigger UI actions from logic
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

    // Patch players to keep original IDs
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

  const getNextAlivePlayerIndex = (currentIndex: number, players: any[]) => {
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
    const { deck, players, turnIndex, turnsLeft = 1 } = gameState; // Default 1 if missing
    const currentPlayer = players[turnIndex];

    if (currentPlayer.id !== userId) return;

    const newDeck = [...(deck || [])];
    if (newDeck.length === 0) return;

    const card = newDeck.pop();
    if (!card) return;

    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p: any) => p.id === userId);
    const player = newPlayers[playerIndex];

    let nextTurnIndex = turnIndex;
    let nextTurnsLeft = turnsLeft - 1; // Decrease turns left to play

    if (card.type === 'EXPLODE') {
        const defuseIndex = player.hand ? player.hand.findIndex((c: any) => c.type === 'DEFUSE') : -1;

        if (defuseIndex !== -1) {
            gameBoardRef.current?.triggerDefuse(); // Animation
            alert('Bạn đã rút phải Mèo Nổ! May mà có lá Gỡ Bom!');
            player.hand.splice(defuseIndex, 1);

            // Put Explode back randomly
            const insertIndex = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertIndex, 0, card);

            // If defused, you survived, check if you have more turns or pass
            if (nextTurnsLeft <= 0) {
                nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
                nextTurnsLeft = 1; // Reset for next player
            }
        } else {
            alert('BÙM! Bạn đã bị nổ tung!');
            player.isAlive = false;
            // You died, turn passes immediately
            nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
            nextTurnsLeft = 1;
        }
    } else {
        // Safe card
        player.hand = [...(player.hand || []), card];
        // Only pass turn if no turns left
        if (nextTurnsLeft <= 0) {
            nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
            nextTurnsLeft = 1;
        }
    }

    const alivePlayers = newPlayers.filter((p: any) => p.isAlive);
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
            gameState: newStatus
        });
    } catch (err: any) {
        console.error("Draw card error:", err);
    }
  };

  const handlePlayCard = async (card: any, cardIndex: number) => {
     if (!gameState) return;
    const { players, turnIndex, discardPile, deck, turnsLeft = 1 } = gameState;
    const currentPlayer = players[turnIndex];

    if (currentPlayer.id !== userId) {
        alert("Chưa đến lượt của bạn!");
        return;
    }

    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p: any) => p.id === userId);
    const player = newPlayers[playerIndex];

    player.hand.splice(cardIndex, 1);

    const newDiscardPile = [...(discardPile || []), card];

    let nextTurnIndex = turnIndex;
    let nextTurnsLeft = turnsLeft;
    let currentDeck = deck ? [...deck] : [];

    switch (card.type) {
        case 'SKIP':
            nextTurnsLeft -= 1; // Skip one turn
            gameBoardRef.current?.triggerSkip();
            break;
        case 'ATTACK':
            nextTurnsLeft = 0; // End current turns
            // Next player gets 2 turns (or existing + 2 if we implement stacking, but simple rule is 2)
            // Stacking: nextTurnsLeft = (nextPlayerTurnsLeft || 1) + 2?
            // Simple: next player takes 2 turns.
            // We set a temporary flag or just handle it when passing turn logic below.
            // Actually, we force pass turn now, and set next player's turns to 2.
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
            // Logic: Steal a random card from a random ALIVE opponent
            const opponents = newPlayers.filter((p: any) => p.id !== userId && p.isAlive);
            if (opponents.length > 0) {
                const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
                if (randomOpponent.hand && randomOpponent.hand.length > 0) {
                    const randomCardIndex = Math.floor(Math.random() * randomOpponent.hand.length);
                    const stolenCard = randomOpponent.hand.splice(randomCardIndex, 1)[0];
                    player.hand.push(stolenCard);
                    gameBoardRef.current?.triggerFavor(randomOpponent.name);
                    alert(`Bạn đã cướp lá ${stolenCard.name} từ ${randomOpponent.name}!`);
                } else {
                    alert(`${randomOpponent.name} không còn bài để cướp!`);
                }
            }
            break;
        default:
            break;
    }

    // Check if turn should pass due to Skip/Attack or just playing action (playing doesn't usually end turn unless it's Attack/Skip)
    if (nextTurnsLeft <= 0) {
         nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
         // If Attack was played, next player gets 2 turns. Else 1.
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

  if (error) {
      return (
          <div className="bg-slate-900 h-screen flex items-center justify-center flex-col p-4">
              <div className="text-red-500 text-2xl font-bold mb-4 text-center">Connection Issue</div>
              <p className="text-white mb-4 text-center">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-500"
              >
                  Retry
              </button>
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
        onPlayCard={handlePlayCard}
        onStartGame={handleStartGame}
    />
  );
}
