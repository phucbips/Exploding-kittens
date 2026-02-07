export const CARD_TYPES = {
  // --- 1. LÁ TẤN CÔNG (ATTACK) ---
  ATTACK: {
    id: 'attack',
    name: 'Tấn Công (2x)',
    count: 4,
    description: "Kết thúc lượt và bắt người sau đi 2 lượt.",
    action: 'attack',
    image: 'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Bear-o-Dactyl.jpg', // Ảnh mặc định
    variants: [
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Bear-o-Dactyl.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Catterwocky.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Crab-a-Pult.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Grow-a-Magnifient-Squid-Arm-and-Start-Slapping-Fat-Babies.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Penguin-Diarrhea.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Rubber-Duck-Collection.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Thousand-Year-Back-Hair.jpg',
      'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Torture-Bunnies.jpg'
    ]
  },

  // --- 2. LÁ GỠ BOM (DEFUSE) ---
  DEFUSE: {
    id: 'defuse',
    name: 'Gỡ Bom',
    count: 6,
    description: "Hóa giải Mèo Nổ. Giúp bạn sống sót.",
    action: 'defuse',
    image: 'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Laser-Pointer.jpg',
    variants: [
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-3AM-Flatulence.jpg',
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Belly-Rubs.jpg',
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Catnip-Sandwiches.jpg',
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Excessive-Ball-Cleaning.jpg',
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Laser-Pointer.jpg',
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Kitten-Therapy.jpg',
      'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-Nature-Documentaries.jpg'
    ]
  },

  // --- 3. LÁ TIÊN TRI (SEE THE FUTURE) ---
  SEE_FUTURE: {
    id: 'see_future',
    name: 'Tiên Tri (3x)',
    count: 5,
    description: "Xem trộm 3 lá bài đầu tiên.",
    action: 'see_future',
    image: 'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Ask-the-All-Seeing-Goat-Wizard.jpg',
    variants: [
      'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Ask-the-All-Seeing-Goat-Wizard.jpg',
      'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Attach-a-Butterfly-to-Your-Genitals.jpg',
      'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Crawl-Inside-a-Goat-Butt.jpg',
      'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Discover-a-Boob-Wizard.jpg',
      'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Drink-an-Entire-Bottle-of-Bald-Eagle-Tears.jpg',
      'https://explodi.ng/images/cards/see-the-future-3x/artworks/See-the-Future-Weave-an-Infinity-Boner.jpg'
    ]
  },

  // --- 4. LÁ CHẶN (NOPE) ---
  NOPE: {
    id: 'nope',
    name: 'Chặn Đứng (Nope)',
    count: 5,
    description: "Chặn hành động của người khác.",
    action: 'nope',
    image: 'https://explodi.ng/images/cards/nope/artworks/Nope-A-Jackanope-Bounds-into-the-Room.jpg',
    variants: [
      'https://explodi.ng/images/cards/nope/artworks/Nope-A-Jackanope-Bounds-into-the-Room.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Deliver-some-Nope-on-Your-Jump-Rope.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Feed-your-Apponent-Some-Cantanope.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Feed-your-Opponent-a-Nope-Sandwich.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Nopestradamus-Speaks-the-Truth.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Put-on-Your-Necktie-of-Nope.jpg'
    ]
  },

  // --- 5. LÁ QUA LƯỢT (SKIP) ---
  SKIP: {
    id: 'skip',
    name: 'Chuồn Lẹ (Skip)',
    count: 4,
    description: "Kết thúc lượt mà không cần rút bài.",
    action: 'skip',
    image: 'https://explodi.ng/images/cards/skip/artworks/Skip-Commandeer-a-Bunnyraptor.jpg',
    variants: [
      'https://explodi.ng/images/cards/skip/artworks/Skip-Commandeer-a-Bunnyraptor.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Crab-Walk-with-Some-Crabs.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Don-a-Portable-Cheetah-Butt.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Sail-Away-on-Your-Penis-Balloon.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Play-a-Game-of-Whale-Boner-Tetherball.jpg'
    ]
  },

  // --- 6. LÁ XÀO BÀI (SHUFFLE) ---
  SHUFFLE: {
    id: 'shuffle',
    name: 'Xào Bài',
    count: 4,
    description: "Tráo đổi thứ tự bộ bài rút.",
    action: 'shuffle',
    image: 'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-A-Kraken-Emerges-and-Hes-Super-Upset.jpg',
    variants: [
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-A-Kraken-Emerges-and-Hes-Super-Upset.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-A-Plague-of-Bat-Farts.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-An-Electromagnetic-Pomeranian-Storm.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-Smoke-Some-Crack-with-a-Baby-Owl.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-Discover-You-Have-a-Toilet-Werewolf.jpg'
    ]
  },

  // --- 7. LÁ MÈO NỔ ---
  EXPLODE: {
    id: 'explode',
    name: 'Mèo Nổ',
    count: 4,
    description: "Nổ tung! Bạn thua cuộc nếu không có lá Gỡ Bom.",
    action: 'die',
    image: 'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-Warp-Core.jpg'
  },

  // --- 8. LÁ FAVOR (CẬP NHẬT ẢNH MỚI) ---
  FAVOR: {
    id: 'favor',
    name: 'Xin Xỏ',
    image: 'https://explodi.ng/images/cards/favor/artworks/Favor-Beard-Sailing.jpg',
    count: 4,
    description: 'Bắt người chơi khác cho bạn 1 lá bài.',
    action: 'favor',
    variants: [
        'https://explodi.ng/images/cards/favor/artworks/Favor-Fall-So-Deeply-in-Love.jpg',
        'https://explodi.ng/images/cards/favor/artworks/Favor-Get-Enslaved-by-Party-Squirrels.jpg',
        'https://explodi.ng/images/cards/favor/artworks/Favor-Rub-Peanut-Butter-on-Your-Belly-Button.jpg',
        'https://explodi.ng/images/cards/favor/artworks/Favor-Take-Your-Friends-Beard-Sailing.jpg'
    ]
  }
};

export const BACK_CARD_IMAGE = 'https://i.ibb.co/60d9pXQ/card-back.png';
