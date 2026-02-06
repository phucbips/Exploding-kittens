'use client';

import { useEffect, useState } from 'react';
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
      } else {
        router.push('/');
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

    await update(ref(db, `rooms/${roomId}`), {
        ...initialGameData,
        players: patchedPlayers,
        gameState: 'playing'
    });
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

    await update(ref(db, `rooms/${roomId}`), {
        deck: newDeck,
        players: newPlayers,
        turnIndex: nextTurnIndex,
        gameState: newStatus
    });
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
            alert('Đã xào lại bài!');
            break;
        case 'SEE_FUTURE':
            const top3 = currentDeck.slice(-3).reverse().map((c: any) => c.name).join(', ');
            alert(`Tương lai: ${top3}`);
            break;
        default:
            break;
    }

    if (shouldPassTurn) {
         nextTurnIndex = getNextAlivePlayerIndex(turnIndex, newPlayers);
    }

    await update(ref(db, `rooms/${roomId}`), {
        players: newPlayers,
        discardPile: newDiscardPile,
        deck: currentDeck,
        turnIndex: nextTurnIndex
    });
  };

  if (!gameState) return <div className="text-white bg-blue-900 h-screen flex items-center justify-center">Loading...</div>;

  return (
    <NewGameBoard
        gameState={gameState}
        currentPlayerId={userId}
        onDrawCard={handleDrawCard}
        onPlayCard={handlePlayCard}
        onStartGame={handleStartGame}
    />
  );
}
