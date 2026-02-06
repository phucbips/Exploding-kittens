'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import NewGameBoard from '@/components/NewGameBoard';
import { initializeGame, shuffle } from '@/utils/gameLogic';

export default function GamePage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [gameState, setGameState] = useState<any>(null);
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

    // Add error handling to onValue
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setGameState(data);
        setError(null);
      } else {
        // Room might not exist or data is null
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
    const { deck, players, turnIndex } = gameState;
    const currentPlayer = players[turnIndex];

    if (currentPlayer.id !== userId) return;

    const newDeck = [...(deck || [])];
    if (newDeck.length === 0) return;

    const card = newDeck.pop();
    const newPlayers = [...players];
    const playerIndex = newPlayers.findIndex((p: any) => p.id === userId);
    const player = newPlayers[playerIndex];
    let nextTurnIndex = turnIndex;

    if (card.type === 'EXPLODE') {
        const defuseIndex = player.hand ? player.hand.findIndex((c: any) => c.type === 'DEFUSE') : -1;

        if (defuseIndex !== -1) {
            alert('Bạn đã rút phải Mèo Nổ! May mà có lá Gỡ Bom!');
            player.hand.splice(defuseIndex, 1);

            // Put Explode back randomly
            const insertIndex = Math.floor(Math.random() * (newDeck.length + 1));
            newDeck.splice(insertIndex, 0, card);

            // Turn ends after Defusing
            nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
        } else {
            alert('BÙM! Bạn đã bị nổ tung!');
            player.isAlive = false;
            // Turn passes
            nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
        }
    } else {
        // Safe card
        player.hand = [...(player.hand || []), card];
        // Turn ends
        nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
    }

    const alivePlayers = newPlayers.filter((p: any) => p.isAlive);
    let newStatus = gameState.gameState;
    if (alivePlayers.length === 1 && newPlayers.length > 1) { // Ensure >1 initial players
        newStatus = 'ended';
    }

    try {
        await update(ref(db, `rooms/${roomId}`), {
            deck: newDeck,
            players: newPlayers,
            turnIndex: nextTurnIndex,
            gameState: newStatus
        });
    } catch (err: any) {
        console.error("Draw card error:", err);
        alert("Failed to draw card. Check console.");
    }
  };

  const handlePlayCard = async (card: any, cardIndex: number) => {
     if (!gameState) return;
    const { players, turnIndex, discardPile, deck } = gameState;
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
    let shouldPassTurn = false;
    let currentDeck = deck ? [...deck] : [];

    switch (card.type) {
        case 'SKIP':
        case 'ATTACK':
            shouldPassTurn = true;
            break;
        case 'SHUFFLE':
            currentDeck = shuffle(currentDeck);
            // Trigger visual shuffle?
            break;
        case 'SEE_FUTURE':
            const top3 = currentDeck.slice(-3).reverse();
            if (gameBoardRef.current) {
                gameBoardRef.current.triggerSeeFuture(top3);
            }
            break;
        default:
            break;
    }

    if (shouldPassTurn) {
         nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
    }

    try {
        await update(ref(db, `rooms/${roomId}`), {
            players: newPlayers,
            discardPile: newDiscardPile,
            deck: currentDeck,
            turnIndex: nextTurnIndex
        });
    } catch (err: any) {
        console.error("Play card error:", err);
        alert("Failed to play card. Check console.");
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
