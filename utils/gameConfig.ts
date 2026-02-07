export const CARD_TYPES = {
  EXPLODE: {
    count: 4,
    name: 'Mèo Nổ',
    description: 'Bùm! Bạn thua cuộc trừ khi có lá Gỡ Bom.',
    image: 'https://i.imgur.com/3YpXq4j.png', // Placeholder
    variants: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBZ5xsTYfH0jSrZBvl89twgyuDoDbeWasNLQZja9hIl8Brvf-j9cLeAkyyPPGxyWR88VsFKNHN-O646R-e56ZBs72Da9OfPirDgvIaDitsDCUhRnedXWjjLippqLvI-UkURLSysY03Icmahb7xhnY9qmvH4EIm-I5PmL0abRvY-wbw2gQDwEbjkf8t_kkKyeMcYulXujLKjWUpPT_vNlgN5cXvCEzzzm_H7s1pq23DUR-h5aiU9WxDdzN4C1kBQF8U7SM4l1TtC', // Stitch Explosion
    ]
  },
  DEFUSE: {
    count: 6,
    name: 'Gỡ Bom',
    description: 'Vô hiệu hóa Mèo Nổ. Bạn được đặt lại Mèo Nổ vào bộ bài.',
    image: 'https://i.imgur.com/8QjZ8Zq.png'
  },
  ATTACK: {
    count: 4,
    name: 'Tấn Công',
    description: 'Kết thúc lượt và buộc người chơi kế tiếp đi 2 lượt.',
    image: 'https://i.imgur.com/5J5J5J5.png'
  },
  SKIP: {
    count: 4,
    name: 'Qua Lượt',
    description: 'Kết thúc lượt của bạn mà không cần rút bài.',
    image: 'https://i.imgur.com/6K6K6K6.png'
  },
  FAVOR: {
    count: 4,
    name: 'Xin Xỏ',
    description: 'Buộc 1 người chơi khác phải đưa cho bạn 1 lá bài của họ.',
    image: 'https://i.imgur.com/7L7L7L7.png'
  },
  SHUFFLE: {
    count: 4,
    name: 'Xào Bài',
    description: 'Xào lại bộ bài rút.',
    image: 'https://i.imgur.com/8M8M8M8.png'
  },
  SEE_FUTURE: {
    count: 5,
    name: 'Tiên Tri',
    description: 'Xem trước 3 lá bài trên cùng của bộ bài rút.',
    image: 'https://i.imgur.com/9N9N9N9.png'
  },
  NOPE: {
    count: 5,
    name: 'Nope',
    description: 'Chặn hành động của người chơi khác (trừ Mèo Nổ và Gỡ Bom).',
    image: 'https://i.imgur.com/0O0O0O0.png'
  },
  // Simple cat cards for pairs/combos
  TACO_CAT: { count: 4, name: 'Taco Cat', image: 'https://i.imgur.com/1P1P1P1.png' },
  WATERMELON_CAT: { count: 4, name: 'Dưa Hấu Mèo', image: 'https://i.imgur.com/2Q2Q2Q2.png' },
  POTATO_CAT: { count: 4, name: 'Khoai Tây Mèo', image: 'https://i.imgur.com/3R3R3R3.png' },
  BEARD_CAT: { count: 4, name: 'Râu Mèo', image: 'https://i.imgur.com/4S4S4S4.png' },
  RAINBOW_RALPHING_CAT: { count: 4, name: 'Mèo Cầu Vồng', image: 'https://i.imgur.com/5T5T5T5.png' }
};

export const CARD_BACK_IMAGE = 'https://i.pinimg.com/originals/10/80/a4/1080a4bd1a33cec92019fab5efb3da95.png'; // Exploding Kittens Red Back
