export const CARD_TYPES = {
  EXPLODE: {
    id: 'explode',
    name: 'Mèo Nổ (Stitch Badness High)',
    image: 'https://placehold.co/400x600/e74c3c/ffffff?text=Exploding+Stitch',
    count: 4,
    description: 'Nổ tung! Bạn thua cuộc nếu không có lá Gỡ.',
    action: 'die'
  },
  DEFUSE: {
    id: 'defuse',
    name: 'Gỡ Bom (Lilo & Stitch)',
    image: 'https://placehold.co/400x600/2ecc71/ffffff?text=Defuse',
    count: 6,
    description: 'Hóa giải mèo nổ.',
    action: 'defuse'
  },
  ATTACK: {
    id: 'attack',
    name: 'Tấn Công (Stitch Spaceship)',
    image: 'https://placehold.co/400x600/f39c12/ffffff?text=Attack',
    count: 4,
    description: 'Kết thúc lượt và bắt người sau đi 2 lượt.',
    action: 'attack'
  },
  SKIP: {
    id: 'skip',
    name: 'Qua Lượt (Stitch Surfing)',
    image: 'https://placehold.co/400x600/3498db/ffffff?text=Skip',
    count: 4,
    description: 'Kết thúc lượt mà không cần rút bài.',
    action: 'skip'
  },
  SEE_FUTURE: {
    id: 'see_future',
    name: 'Tiên Tri (Jumba)',
    image: 'https://placehold.co/400x600/9b59b6/ffffff?text=See+Future',
    count: 5,
    description: 'Xem 3 lá đầu tiên của bộ bài.',
    action: 'see_future'
  },
  NOPE: {
    id: 'nope',
    name: 'Chặn (Pleakley)',
    image: 'https://placehold.co/400x600/c0392b/ffffff?text=NOPE',
    count: 5,
    description: 'Chặn lá bài vừa đánh.',
    action: 'nope'
  },
  SHUFFLE: {
    id: 'shuffle',
    name: 'Xào Bài',
    image: 'https://placehold.co/400x600/7f8c8d/ffffff?text=Shuffle',
    count: 4,
    description: 'Xào lại bộ bài.',
    action: 'shuffle'
  },
  FAVOR: {
    id: 'favor',
    name: 'Xin Xỏ',
    image: 'https://placehold.co/400x600/e67e22/ffffff?text=Favor',
    count: 4,
    description: 'Bắt người chơi khác cho bạn 1 lá bài.',
    action: 'favor'
  }
};

export const BACK_CARD_IMAGE = 'https://placehold.co/400x600/2c3e50/ffffff?text=Card+Back';
