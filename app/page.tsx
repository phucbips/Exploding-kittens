'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set, get, child } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function Lobby() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRoomId = () => {
    const array = new Uint8Array(4);
    globalThis.crypto.getRandomValues(array);
    // Convert to base36 to preserve original entropy format (alphanumeric)
    return Array.from(array)
      .map(b => b.toString(36))
      .join('')
      .substring(0, 6)
      .toUpperCase()
      .padEnd(6, 'A');
  };

  const handleCreateRoom = async () => {
    if (!name.trim()) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }

    setLoading(true);
    const newRoomId = generateRoomId();

    // Initial State for a new room
    const playerData = {
      id: `user_${globalThis.crypto.randomUUID()}`,
      name: name,
      isHost: true,
      hand: [],
      isAlive: true,
      hasDefuse: false
    };

    try {
      await set(ref(db, `rooms/${newRoomId}`), {
        gameState: 'waiting',
        players: [playerData],
        createdAt: Date.now()
      });

      // Save user info to session storage
      sessionStorage.setItem('userId', playerData.id);
      sessionStorage.setItem('userName', name);

      router.push(`/game/${newRoomId}`);
    } catch (err) {
      console.error(err);
      setError('Lỗi khi tạo phòng. Thử lại xem!');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!name.trim() || !roomId.trim()) {
      setError('Nhập tên và ID phòng đi nào!');
      return;
    }

    setLoading(true);
    const cleanRoomId = roomId.trim().toUpperCase();

    try {
      const roomRef = ref(db);
      const snapshot = await get(child(roomRef, `rooms/${cleanRoomId}`));

      if (snapshot.exists()) {
        const roomData = snapshot.val();

        if (roomData.gameState !== 'waiting') {
            setError('Game đang chơi rồi, không vào được nữa!');
            setLoading(false);
            return;
        }

        const players = roomData.players || [];
        // Check if name already exists (optional but good)

        const playerData = {
          id: `user_${globalThis.crypto.randomUUID()}`,
          name: name,
          isHost: false,
          hand: [],
          isAlive: true,
          hasDefuse: false
        };

        const updatedPlayers = [...players, playerData];

        await set(ref(db, `rooms/${cleanRoomId}/players`), updatedPlayers);

        sessionStorage.setItem('userId', playerData.id);
        sessionStorage.setItem('userName', name);

        router.push(`/game/${cleanRoomId}`);
      } else {
        setError('Phòng không tồn tại!');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi vào phòng. ' + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900 text-white p-4 font-sans">
      <div className="max-w-md w-full bg-blue-800 p-8 rounded-xl shadow-2xl border-4 border-teal-400">
        <h1 className="text-4xl font-bold text-center mb-8 text-yellow-300 drop-shadow-md">
          Mèo Nổ <br/><span className="text-2xl text-teal-200">Stitch Edition</span>
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-teal-200 mb-2">Tên của bạn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-blue-900 border-2 border-blue-600 focus:border-yellow-400 focus:outline-none text-white placeholder-blue-400 transition-colors"
              placeholder="Ví dụ: Stitch, Lilo..."
            />
          </div>

          <div className="pt-4 border-t border-blue-700">
             <button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-lg shadow-lg transform active:scale-95 transition-all mb-4"
            >
              {loading ? 'Đang tạo...' : 'Tạo Phòng Mới'}
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-blue-600"></div>
                <span className="flex-shrink-0 mx-4 text-blue-400">Hoặc</span>
                <div className="flex-grow border-t border-blue-600"></div>
            </div>

            <div className="flex gap-2 mt-4">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-900 border-2 border-blue-600 focus:border-teal-400 focus:outline-none text-white placeholder-blue-400 uppercase"
                placeholder="ID Phòng"
              />
              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all"
              >
                Vào
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center animate-pulse">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
