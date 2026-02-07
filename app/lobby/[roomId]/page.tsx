'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ref, onValue, update } from 'firebase/database';
import { db } from '@/lib/firebase';
import Image from 'next/image';
import { initializeGame } from '@/utils/gameLogic';

export default function LobbyPage() {
  const { roomId } = useParams();
  const router = useRouter();
  const [roomData, setRoomData] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Game Settings State
  const [settings, setSettings] = useState({
      initialCards: 4, // 1 Defuse + 4 Others = 5 total
      extraDecks: {
          imploding: false, // Placeholder for future
          streaking: false, // Placeholder
      }
  });

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    const userName = sessionStorage.getItem('userName');

    if (!userId || !userName) {
        router.push('/');
        return;
    }

    setCurrentUser({ id: userId, name: userName });

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            setRoomData(data);
            if (data.gameState === 'playing') {
                router.push(`/game/${roomId}`);
            }
        } else {
            router.push('/');
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
      if (!roomData || !roomData.players) return;

      // Extract player names for logic init
      const playerNames = roomData.players.map((p: any) => p.name);

      // Initialize with custom settings
      const initialGameData = initializeGame(playerNames, {
          initialCards: settings.initialCards
      });

      // Merge logic data with existing player metadata (id, avatar)
      const patchedPlayers = initialGameData.players.map((p: any, index: number) => ({
          ...p,
          id: roomData.players[index].id,
          name: roomData.players[index].name,
          avatar: roomData.players[index].avatar || roomData.players[index].image // Fallback
      }));

      try {
          await update(ref(db, `rooms/${roomId}`), {
              ...initialGameData,
              players: patchedPlayers,
              gameState: 'playing',
              settings: settings // Save settings for reference
          });

          // Update public status
          await update(ref(db, `public_rooms/${roomId}`), {
              status: 'playing'
          });

      } catch (err: any) {
          console.error(err);
          alert('Lỗi bắt đầu game: ' + err.message);
      }
  };

  if (!roomData) return <div className="text-white flex justify-center items-center h-screen bg-blue-900">Loading Lobby...</div>;

  const isHost = roomData.players && roomData.players[0]?.id === currentUser?.id;

  return (
    <div className="min-h-screen bg-blue-900 text-white font-sans p-8 flex flex-col items-center">
        {/* HEADER */}
        <div className="w-full max-w-4xl flex justify-between items-center mb-12">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
                EXPLODING KITTENS
            </h1>
            <div className="bg-blue-800 px-6 py-2 rounded-full border border-blue-600 flex items-center gap-4 shadow-lg">
                <span className="text-blue-300 font-bold uppercase text-sm">Room ID</span>
                <span className="font-mono text-xl text-white tracking-widest">{String(roomId)}</span>
                <button onClick={handleCopyLink} className="text-teal-400 hover:text-white transition-colors" title="Copy Invite Link">
                    <span className="material-symbols-outlined">content_copy</span>
                </button>
            </div>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* LEFT: PLAYERS LIST */}
            <div className="md:col-span-2 bg-blue-800/50 rounded-2xl p-6 border border-blue-700 backdrop-blur-sm">
                <h2 className="text-xl font-bold text-teal-300 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined">group</span>
                    Players ({roomData.players?.length || 0}/5)
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {roomData.players?.map((player: any, idx: number) => (
                        <div key={player.id || idx} className="bg-blue-900 rounded-xl p-4 flex flex-col items-center gap-3 border border-blue-700 relative group hover:border-teal-500 transition-colors">
                            {idx === 0 && <span className="absolute top-2 right-2 text-yellow-400 text-xs font-bold px-2 py-1 bg-yellow-400/10 rounded-full">HOST</span>}
                            <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-blue-600 overflow-hidden shadow-md">
                                {player.avatar && <Image src={player.avatar} alt={player.name} width={80} height={80} className="object-cover w-full h-full" />}
                            </div>
                            <span className="font-bold text-lg truncate w-full text-center">{player.name}</span>
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {Array.from({ length: Math.max(0, 5 - (roomData.players?.length || 0)) }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-blue-900/30 rounded-xl p-4 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-blue-800 text-blue-600">
                            <span className="material-symbols-outlined text-4xl">person_add</span>
                            <span className="text-sm font-bold">Waiting...</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: SETTINGS & CONTROLS */}
            <div className="space-y-6">

                {/* SETTINGS PANEL (HOST ONLY) */}
                <div className={`bg-blue-800/80 rounded-2xl p-6 border border-blue-600 ${!isHost ? 'opacity-50 pointer-events-none' : ''}`}>
                    <h2 className="text-xl font-bold text-yellow-300 mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined">tune</span>
                        Game Settings
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="flex justify-between text-sm font-bold text-blue-200 mb-2">
                                <span>Starting Cards (Non-Defuse)</span>
                                <span className="text-teal-300">{settings.initialCards}</span>
                            </label>
                            <input
                                type="range"
                                min="2" max="7"
                                value={settings.initialCards}
                                onChange={(e) => setSettings({...settings, initialCards: parseInt(e.target.value)})}
                                className="w-full h-2 bg-blue-950 rounded-lg appearance-none cursor-pointer accent-teal-400"
                            />
                            <p className="text-xs text-blue-400 mt-1">Each player gets 1 Defuse + {settings.initialCards} random cards.</p>
                        </div>

                        <div className="pt-4 border-t border-blue-700">
                            <label className="text-sm font-bold text-blue-200 mb-2 block">Expansion Decks (Coming Soon)</label>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-3 p-3 bg-blue-900/50 rounded-lg border border-blue-800 cursor-not-allowed opacity-60">
                                    <input type="checkbox" disabled checked={settings.extraDecks.imploding} className="w-5 h-5 rounded border-blue-600 bg-blue-950 text-teal-400 focus:ring-0" />
                                    <span className="text-sm font-bold text-gray-400">Imploding Kittens</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-blue-900/50 rounded-lg border border-blue-800 cursor-not-allowed opacity-60">
                                    <input type="checkbox" disabled checked={settings.extraDecks.streaking} className="w-5 h-5 rounded border-blue-600 bg-blue-950 text-teal-400 focus:ring-0" />
                                    <span className="text-sm font-bold text-gray-400">Streaking Kittens</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                {isHost ? (
                    <button
                        onClick={handleStartGame}
                        className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 rounded-2xl font-black text-2xl shadow-lg transform hover:scale-105 transition-all text-white border-b-4 border-red-700 active:border-b-0 active:translate-y-1"
                    >
                        START GAME
                    </button>
                ) : (
                    <div className="w-full py-4 bg-blue-950 rounded-2xl font-bold text-lg text-center text-blue-400 border border-blue-800 animate-pulse">
                        Waiting for host to start...
                    </div>
                )}

                <button
                    onClick={() => router.push('/')}
                    className="w-full py-3 bg-transparent hover:bg-white/10 rounded-xl font-bold text-blue-300 transition-colors"
                >
                    Leave Room
                </button>

            </div>
        </div>
    </div>
  );
}
