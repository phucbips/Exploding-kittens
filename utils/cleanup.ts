export const cleanOldRooms = async (db: any) => {
    try {
        const roomsRef = (await import('firebase/database')).ref(db, 'rooms');
        const publicRoomsRef = (await import('firebase/database')).ref(db, 'public_rooms');
        const get = (await import('firebase/database')).get;
        const remove = (await import('firebase/database')).remove;

        const snapshot = await get(roomsRef);
        if (!snapshot.exists()) return;

        const rooms = snapshot.val();
        const now = Date.now();
        const MAX_AGE = 2 * 60 * 60 * 1000; // 2 hours

        const promises = Object.entries(rooms).map(async ([roomId, roomData]: [string, any]) => {
            const createdAt = roomData.createdAt || 0;
            const lastActive = roomData.lastActive || createdAt;

            // Delete if older than MAX_AGE or empty for a long time
            if (now - lastActive > MAX_AGE) {
                await remove((await import('firebase/database')).ref(db, `rooms/${roomId}`));
                await remove((await import('firebase/database')).ref(db, `public_rooms/${roomId}`));
                console.log(`Cleaned up room ${roomId}`);
            }
        });

        await Promise.all(promises);
    } catch (err) {
        console.error("Cleanup error:", err);
    }
};
