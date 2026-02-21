'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ref, set, get, child, onValue, off } from 'firebase/database';
import { db } from '@/lib/firebase';
import { AVATARS } from '@/lib/avatars';
import Image from 'next/image';
import Cookies from 'js-cookie';

const MAX_NAME_LENGTH = 15;
const MAX_ROOM_ID_LENGTH = 10;

function LobbyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [view, setView] = useState<'menu' | 'create' | 'join' | 'profile'>('menu');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

  // Check for invite link
  useEffect(() => {
    const roomParam = searchParams.get('room');
    const storedName = sessionStorage.getItem('userName');
    const storedAvatar = sessionStorage.getItem('userAvatar');

    if (storedName) setName(storedName);
    if (storedAvatar) setSelectedAvatar(storedAvatar);

    if (roomParam) {
      setRoomId(roomParam);
      setView('join');
    }
  }, [searchParams]);

  // Load public rooms when in 'join' view
  useEffect(() => {
    if (view === 'join') {
      // Trigger Cleanup on Join View Load
      import('@/utils/cleanup').then(({ cleanOldRooms }) => cleanOldRooms(db));

      const publicRoomsRef = ref(db, 'public_rooms');
      const listener = onValue(publicRoomsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const roomsList = Object.entries(data).map(([key, val]: [string, any]) => ({
            id: key,
            ...val
          }));
          setPublicRooms(roomsList);
        } else {
          setPublicRooms([]);
        }
      });
      return () => off(publicRoomsRef, 'value', listener);
    }
  }, [view]);

  // Validation Helpers
  const validateName = (val: string) => {
    if (!val.trim()) return 'Vui lòng nhập tên!';
    if (val.length > MAX_NAME_LENGTH) return `Tên tối đa ${MAX_NAME_LENGTH} ký tự.`;
    // if (!/^[a-zA-Z0-9 ]+$/.test(val)) return 'Tên chỉ chứa chữ và số.'; // Relaxed for Vietnamese
    return '';
  };

  const handleCreateRoom = async () => {
    const nameError = validateName(name);
    if (nameError) { setError(nameError); return; }

    setLoading(true);
    setError('');

    try {
      const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const createdAt = Date.now();

      // 1. Create Game Room
      const playerData = {
        id: `user_${createdAt}`,
        name: name,
        avatar: selectedAvatar,
        isHost: true,
        hand: [],
        isAlive: true,
        hasDefuse: false
      };

      const roomData = {
        gameState: 'waiting',
        players: [playerData],
        createdAt: createdAt,
        password: password || null // Store password in secure room node
      };

      await set(ref(db, `rooms/${newRoomId}`), roomData);

      // 2. Create Public Metadata
      const publicData = {
        name: `${name}'s Room`,
        host: name,
        status: 'waiting',
        playerCount: 1,
        isPrivate: !!password,
        createdAt: createdAt
      };

      await set(ref(db, `public_rooms/${newRoomId}`), publicData);

      // 3. Save Session & Redirect
      sessionStorage.setItem('userId', playerData.id);
      sessionStorage.setItem('userName', name);
      sessionStorage.setItem('userAvatar', selectedAvatar);
      Cookies.set('userId', playerData.id, { expires: 1 }); // 1 day

      router.push(`/lobby/${newRoomId}`);

    } catch (err: any) {
      console.error(err);
      setError('Lỗi tạo phòng: ' + err.message);
      setLoading(false);
    }
  };

  const handleJoinRoom = async (targetRoomId: string, targetRoomPassword?: string) => {
    const nameError = validateName(name);
    if (nameError) { setError(nameError); return; }

    if (!targetRoomId) { setError('Chưa chọn phòng!'); return; }

    setLoading(true);
    setError('');

    try {
      const cleanRoomId = targetRoomId.trim().toUpperCase();
      const roomRef = ref(db, `rooms/${cleanRoomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        setError('Phòng không tồn tại!');
        setLoading(false);
        return;
      }

      const roomData = snapshot.val();

      // Password Check
      if (roomData.password && roomData.password !== targetRoomPassword) {
         setError('Mật khẩu không đúng!');
         setLoading(false);
         return;
      }

      const players = roomData.players || [];
      const isAlreadyIn = players.some((p: any) => p.name === name); // Simple check

      if (roomData.gameState === 'playing' && !isAlreadyIn) {
          // Allow spectating? For now, block join if playing
          // Or user requested "xem các người chơi để chơi" -> Spectate mode?
          // Let's allow join but mark as dead/spectator? Or just block.
          // User asked: "nếu đang chơi thì có thể bấm vô xem các người chơi" -> Spectator.
          // I'll just let them in, but the game logic needs to handle late joiners as spectators.
          // Currently `isAlive` defaults to true. Let's make late joiners false?
          // For simplicity/MVP: Warn them.
          if (!confirm('Game đang chơi. Bạn muốn vào xem không?')) {
              setLoading(false);
              return;
          }
      }

      // Add Player
      const newPlayer = {
        id: `user_${Date.now()}`,
        name: name,
        avatar: selectedAvatar,
        isHost: false,
        hand: [],
        isAlive: roomData.gameState === 'waiting', // Alive only if waiting
        hasDefuse: false
      };

      const updatedPlayers = [...players, newPlayer];
      await set(child(roomRef, 'players'), updatedPlayers);

      // Update Public Metadata
      await set(ref(db, `public_rooms/${cleanRoomId}/playerCount`), updatedPlayers.length);
      if (roomData.gameState === 'waiting' && updatedPlayers.length >= 5) {
          // Optional: Mark full?
      }

      sessionStorage.setItem('userId', newPlayer.id);
      sessionStorage.setItem('userName', name);
      sessionStorage.setItem('userAvatar', selectedAvatar);
      Cookies.set('userId', newPlayer.id, { expires: 1 });

      if (roomData.gameState === 'playing') {
          router.push(`/game/${cleanRoomId}`);
      } else {
          router.push(`/lobby/${cleanRoomId}`);
      }

    } catch (err: any) {
      console.error(err);
      setError('Lỗi vào phòng: ' + err.message);
      setLoading(false);
    }
  };

  // --- UI COMPONENTS ---

  const AvatarGrid = () => (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {AVATARS.map((avt) => (
        <div
          key={avt.id}
          onClick={() => setSelectedAvatar(avt.url)}
          className={`cursor-pointer rounded-full p-1 border-4 transition-all ${selectedAvatar === avt.url ? 'border-yellow-400 scale-110' : 'border-transparent hover:border-white/50'}`}
        >
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-800">
             <Image src={avt.url} alt={avt.id} fill className="object-cover" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-900 text-white font-sans flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-blue-800 rounded-2xl shadow-2xl border-4 border-teal-400 overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* LEFT PANEL: PROFILE */}
        <div className="w-full md:w-1/3 bg-blue-950 p-8 flex flex-col items-center border-b md:border-b-0 md:border-r border-blue-700">
           <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Hồ Sơ</h2>

           <div className="relative w-32 h-32 rounded-full border-4 border-teal-400 mb-6 overflow-hidden bg-slate-800 shadow-lg">
              <Image src={selectedAvatar} alt="Selected" fill className="object-cover" />
           </div>

           <div className="w-full space-y-4">
             <div>
               <label className="text-teal-200 text-sm font-bold ml-1">Tên hiển thị</label>
               <input
                 type="text"
                 value={name}
                 maxLength={MAX_NAME_LENGTH}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full px-4 py-2 mt-1 rounded-lg bg-blue-900 border border-blue-600 focus:border-yellow-400 text-white placeholder-blue-400 outline-none"
                 placeholder="Nhập tên bạn..."
               />
             </div>

             <div className="pt-4">
                <p className="text-teal-200 text-sm font-bold mb-2 ml-1">Chọn Avatar</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {AVATARS.map((avt) => (
                        <div
                        key={avt.id}
                        onClick={() => setSelectedAvatar(avt.url)}
                        className={`flex-none w-12 h-12 rounded-full border-2 cursor-pointer ${selectedAvatar === avt.url ? 'border-yellow-400' : 'border-transparent opacity-50 hover:opacity-100'}`}
                        >
                            <img src={avt.url} className="w-full h-full rounded-full object-cover" />
                        </div>
                    ))}
                </div>
             </div>
           </div>
        </div>

        {/* RIGHT PANEL: MAIN CONTENT */}
        <div className="flex-1 p-8 bg-gradient-to-br from-blue-800 to-blue-900 flex flex-col relative">
            <div className="absolute top-4 left-4">
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 drop-shadow-sm">
                    EXPLODING KITTENS
                </h1>
            </div>

            <h1 className="text-4xl font-bold text-center text-yellow-300 drop-shadow-md mb-8 mt-8">
                Mèo Nổ <span className="text-xl text-teal-200 block">Stitch Edition</span>
            </h1>

            {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm text-center">
                    {error}
                </div>
            )}

            {/* TABS */}
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setView('menu')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${view === 'menu' ? 'bg-yellow-400 text-blue-900' : 'bg-blue-950 text-blue-300 hover:bg-blue-700'}`}
                >
                    Menu
                </button>
                <button
                    onClick={() => setView('create')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${view === 'create' ? 'bg-yellow-400 text-blue-900' : 'bg-blue-950 text-blue-300 hover:bg-blue-700'}`}
                >
                    Tạo Phòng
                </button>
                <button
                    onClick={() => setView('join')}
                    className={`px-6 py-2 rounded-full font-bold transition-all ${view === 'join' ? 'bg-yellow-400 text-blue-900' : 'bg-blue-950 text-blue-300 hover:bg-blue-700'}`}
                >
                    Tìm Phòng
                </button>
            </div>

            {/* VIEWS */}
            <div className="flex-1 overflow-y-auto">
                {view === 'menu' && (
                    <div className="flex flex-col items-center justify-center h-full space-y-4">
                        <p className="text-center text-blue-200 max-w-sm">
                            Chào mừng đến với Mèo Nổ phiên bản Stitch! <br/>
                            Hãy chọn nhân vật và bắt đầu cuộc chiến hỗn loạn ngay nào!
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
                             <button onClick={() => setView('create')} className="p-6 bg-teal-500 hover:bg-teal-400 rounded-xl font-bold text-xl shadow-lg transform hover:-translate-y-1 transition-all">
                                🏠 Tạo Phòng
                             </button>
                             <button onClick={() => setView('join')} className="p-6 bg-purple-500 hover:bg-purple-400 rounded-xl font-bold text-xl shadow-lg transform hover:-translate-y-1 transition-all">
                                🔍 Tìm Phòng
                             </button>
                        </div>
                    </div>
                )}

                {view === 'create' && (
                    <div className="max-w-sm mx-auto space-y-6">
                        <div className="bg-blue-950/50 p-6 rounded-xl border border-blue-700">
                            <label className="block text-teal-200 font-bold mb-2">Mật khẩu phòng (Tùy chọn)</label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-blue-900 border border-blue-600 focus:border-yellow-400 outline-none placeholder-blue-500/50"
                                placeholder="Để trống nếu muốn phòng công khai"
                            />
                            <p className="text-xs text-blue-300 mt-2">
                                * Phòng sẽ hiện trên danh sách công khai, nhưng cần mật khẩu để vào.
                            </p>
                        </div>
                        <button
                            onClick={handleCreateRoom}
                            disabled={loading}
                            className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold rounded-xl shadow-lg text-lg transition-transform active:scale-95"
                        >
                            {loading ? 'Đang khởi tạo...' : '🚀 BẮT ĐẦU NGAY'}
                        </button>
                    </div>
                )}

                {view === 'join' && (
                    <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                             <input
                                type="text"
                                placeholder="Nhập ID phòng..."
                                value={roomId}
                                maxLength={MAX_ROOM_ID_LENGTH}
                                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                                className="flex-1 px-4 py-2 rounded-lg bg-blue-950 border border-blue-600 focus:border-yellow-400 outline-none uppercase"
                             />
                             <button
                                onClick={() => handleJoinRoom(roomId, password)}
                                className="px-6 bg-teal-500 hover:bg-teal-400 rounded-lg font-bold"
                             >
                                Vào
                             </button>
                        </div>

                        <div className="h-64 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-blue-600">
                            {publicRooms.length === 0 ? (
                                <p className="text-center text-blue-400 mt-10">Không tìm thấy phòng nào đang mở.</p>
                            ) : (
                                publicRooms.map((room) => (
                                    <div key={room.id} className="bg-blue-950/50 p-4 rounded-xl border border-blue-700 hover:border-teal-400 transition-colors flex items-center justify-between group">
                                        <div>
                                            <h3 className="font-bold text-lg text-white group-hover:text-yellow-300 transition-colors">
                                                {room.name}
                                                {room.isPrivate && <span className="ml-2 text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">🔒 Private</span>}
                                            </h3>
                                            <div className="text-sm text-blue-300 flex gap-3">
                                                <span>Host: {room.host}</span>
                                                <span>Players: {room.playerCount}/5</span>
                                                <span className={`${room.status === 'playing' ? 'text-red-400' : 'text-green-400'}`}>
                                                    • {room.status === 'playing' ? 'Đang chơi' : 'Đang chờ'}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setRoomId(room.id);
                                                if (room.isPrivate) {
                                                    const pwd = prompt('Nhập mật khẩu phòng:');
                                                    if (pwd) handleJoinRoom(room.id, pwd);
                                                } else {
                                                    handleJoinRoom(room.id);
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-800 hover:bg-blue-700 rounded-lg text-sm font-bold border border-blue-600"
                                        >
                                            {room.status === 'playing' ? 'Xem' : 'Tham gia'}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default function Lobby() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-blue-900 flex items-center justify-center text-white">Loading...</div>}>
      <LobbyContent />
    </Suspense>
  );
}
