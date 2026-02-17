'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ref, set, get, child, runTransaction } from 'firebase/database';
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

  const handleCreateRoom = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }
    if (trimmedName.length > 20) {
        setError('Tên quá dài (tối đa 20 ký tự)!');
        return;
    }

    setLoading(true);

    // Initial State for a new room
    const playerData = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      isHost: true,
      hand: [],
      isAlive: true,
      hasDefuse: false
    };

    let newRoomId = '';
    let committed = false;
    let attempts = 0;

    try {
        while (!committed && attempts < 3) {
            newRoomId = generateRoomId();
            attempts++;

            const roomRef = ref(db, `rooms/${newRoomId}`);
            const result = await runTransaction(roomRef, (currentData) => {
                if (currentData === null) {
                    return {
                        gameState: 'waiting',
                        players: [playerData],
                        createdAt: Date.now()
                    };
                } else {
                    return; // Abort if exists
                }
            });
            committed = result.committed;
        }

        if (committed) {
            // Save user info to session storage
            sessionStorage.setItem('userId', playerData.id);
            sessionStorage.setItem('userName', trimmedName);

            router.push(`/game/${newRoomId}`);
        } else {
            setError('Không thể tạo phòng (Server busy). Thử lại xem!');
        }

    } catch (err: any) {
      console.error(err);
      setError('Lỗi khi tạo phòng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !roomId.trim()) {
      setError('Nhập tên và ID phòng đi nào!');
      return;
    }
    if (trimmedName.length > 20) {
        setError('Tên quá dài (tối đa 20 ký tự)!');
        return;
    }

    setLoading(true);
    const cleanRoomId = roomId.trim().toUpperCase();

    // Prepare player data outside transaction to ensure consistent ID
    const playerData = {
      id: `user_${Date.now()}`,
      name: trimmedName,
      isHost: false,
      hand: [],
      isAlive: true,
      hasDefuse: false
    };

    try {
      const roomRef = ref(db, `rooms/${cleanRoomId}`);

      const result = await runTransaction(roomRef, (currentData) => {
        if (currentData === null) {
          return; // Room does not exist, abort transaction
        }

        if (currentData.gameState !== 'waiting') {
          return; // Game already started, abort
        }

        const players = currentData.players || [];

        if (players.length >= 8) {
            return; // Room full
        }

        // Check for duplicate name
        if (players.some((p: any) => p.name === trimmedName)) {
            return;
        }

        return {
            ...currentData,
            players: [...players, playerData]
        };
      });

      if (result.committed) {
        sessionStorage.setItem('userId', playerData.id);
        sessionStorage.setItem('userName', trimmedName);
        router.push(`/game/${cleanRoomId}`);
      } else {
        // Transaction failed (aborted)
        // We can do a quick check to give a better error message
        const snapshot = await get(roomRef);
        if (!snapshot.exists()) {
            setError('Phòng không tồn tại!');
        } else {
            const data = snapshot.val();
            if (data.gameState !== 'waiting') {
                setError('Game đang chơi rồi, không vào được nữa!');
            } else if ((data.players || []).length >= 8) {
                setError('Phòng đã đầy!');
            } else if ((data.players || []).some((p: any) => p.name === trimmedName)) {
                setError('Tên này đã có người dùng trong phòng!');
            } else {
                setError('Không thể vào phòng (Lỗi không xác định).');
            }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Lỗi khi vào phòng: ' + err.message);
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
