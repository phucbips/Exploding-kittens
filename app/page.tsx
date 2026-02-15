'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, runTransaction, get } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function Lobby() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const validateName = (inputName: string) => {
    const trimmed = inputName.trim();
    if (!trimmed) return 'Vui lòng nhập tên của bạn!';
    if (trimmed.length > 15) return 'Tên quá dài (tối đa 15 ký tự)!';
    return null;
  };

  const handleCreateRoom = async () => {
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    setLoading(true);
    setError('');

    // Try to create a room with a unique ID (limit attempts)
    let created = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!created && attempts < maxAttempts) {
        attempts++;
        const newRoomId = generateRoomId();

        // Initial State for a new room
        const playerData = {
            id: `user_${Date.now()}`,
            name: name.trim(),
            isHost: true,
            hand: [],
            isAlive: true,
            hasDefuse: false
        };

        try {
            const result = await runTransaction(ref(db, `rooms/${newRoomId}`), (currentData) => {
                if (currentData === null) {
                    // Room doesn't exist, create it
                    return {
                        gameState: 'waiting',
                        players: [playerData],
                        createdAt: Date.now()
                    };
                } else {
                    // Room exists, abort transaction
                    return;
                }
            }, { applyLocally: false });

            if (result.committed) {
                created = true;
                sessionStorage.setItem('userId', playerData.id);
                sessionStorage.setItem('userName', name.trim());
                router.push(`/game/${newRoomId}`);
            }
            // If not committed, loop runs again with new ID
        } catch (err) {
            console.error(err);
            setError('Lỗi khi tạo phòng. Thử lại xem!');
            setLoading(false);
            return;
        }
    }

    if (!created) {
        setError('Không thể tạo phòng (Server busy). Thử lại sau!');
        setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const nameError = validateName(name);
    if (nameError) {
      setError(nameError);
      return;
    }
    if (!roomId.trim()) {
      setError('Nhập ID phòng đi nào!');
      return;
    }

    setLoading(true);
    setError('');
    const cleanRoomId = roomId.trim().toUpperCase();

    try {
      const roomRef = ref(db, `rooms/${cleanRoomId}`);

      // Check existence first to ensure local cache is populated for transaction
      const snapshot = await get(roomRef);
      if (!snapshot.exists()) {
        setError('Phòng không tồn tại!');
        setLoading(false);
        return;
      }

      let joinError = null;
      const playerId = `user_${Date.now()}`;

      const result = await runTransaction(roomRef, (currentData) => {
        if (currentData === null) {
             // Should not happen if get() succeeded, but robust check
            joinError = 'Phòng không tồn tại!';
            return; // Abort
        }
        if (currentData.gameState !== 'waiting') {
            joinError = 'Game đang chơi rồi, không vào được nữa!';
            return; // Abort
        }

        const players = currentData.players || [];
        // Check for duplicate names
        if (players.some((p: any) => p.name.toLowerCase() === name.trim().toLowerCase())) {
            joinError = 'Tên này đã có người dùng!';
            return; // Abort
        }

        if (players.length >= 5) { // Max players limit
             joinError = 'Phòng đã đầy!';
             return;
        }

        const playerData = {
          id: playerId,
          name: name.trim(),
          isHost: false,
          hand: [],
          isAlive: true,
          hasDefuse: false
        };

        // Add player
        currentData.players = [...players, playerData];
        return currentData;
      });

      if (result.committed) {
        sessionStorage.setItem('userId', playerId);
        sessionStorage.setItem('userName', name.trim());
        router.push(`/game/${cleanRoomId}`);
      } else {
          if (joinError) {
              setError(joinError);
          } else {
              setError('Không thể vào phòng (Lỗi không xác định).');
          }
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi khi vào phòng: ' + (err as any).message);
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
