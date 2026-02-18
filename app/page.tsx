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
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Vui lòng nhập tên của bạn!');
      return;
    }
    if (cleanName.length > 20) {
      setError('Tên quá dài! Tối đa 20 ký tự thôi.');
      return;
    }

    setLoading(true);

    let success = false;
    let attempts = 0;

    // Retry loop to ensure unique Room ID
    while (!success && attempts < 3) {
      attempts++;
      const newRoomId = generateRoomId();

      const playerData = {
        id: `user_${Date.now()}`,
        name: cleanName,
        isHost: true,
        hand: [],
        isAlive: true,
        hasDefuse: false
      };

      try {
        const result = await runTransaction(ref(db, `rooms/${newRoomId}`), (currentData) => {
          if (currentData === null) {
            return {
              gameState: 'waiting',
              players: [playerData],
              createdAt: Date.now()
            };
          } else {
            return; // Abort if room exists
          }
        });

        if (result.committed) {
          success = true;
          sessionStorage.setItem('userId', playerData.id);
          sessionStorage.setItem('userName', cleanName);
          router.push(`/game/${newRoomId}`);
        }
      } catch (err) {
        console.error("Create room transaction failed:", err);
      }
    }

    if (!success) {
      setError('Không thể tạo phòng (Server busy). Thử lại xem!');
    }
    setLoading(false);
  };

  const handleJoinRoom = async () => {
    const cleanName = name.trim();
    if (!cleanName || !roomId.trim()) {
      setError('Nhập tên và ID phòng đi nào!');
      return;
    }
    if (cleanName.length > 20) {
      setError('Tên quá dài! Tối đa 20 ký tự thôi.');
      return;
    }

    setLoading(true);
    const cleanRoomId = roomId.trim().toUpperCase();

    const playerData = {
      id: `user_${Date.now()}`,
      name: cleanName,
      isHost: false,
      hand: [],
      isAlive: true,
      hasDefuse: false
    };

    try {
      const result = await runTransaction(ref(db, `rooms/${cleanRoomId}`), (currentData) => {
        if (currentData === null) {
          return; // Room doesn't exist
        }
        if (currentData.gameState !== 'waiting') {
          return; // Game already started
        }

        const players = currentData.players || [];
        return {
          ...currentData,
          players: [...players, playerData]
        };
      });

      if (result.committed) {
        sessionStorage.setItem('userId', playerData.id);
        sessionStorage.setItem('userName', cleanName);
        router.push(`/game/${cleanRoomId}`);
      } else {
        // Transaction aborted: check why
        const snapshot = result.snapshot;
        if (!snapshot.exists()) {
          setError('Phòng không tồn tại!');
        } else if (snapshot.val().gameState !== 'waiting') {
          setError('Game đang chơi rồi, không vào được nữa!');
        } else {
          setError('Không thể vào phòng (Unknown error).');
        }
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
