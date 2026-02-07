export const CARD_TYPES = {
  EXPLODE: {
    count: 4,
    name: 'Mèo Nổ',
    description: 'Bùm! Bạn thua cuộc trừ khi có lá Gỡ Bom.',
    image: 'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-C4.jpg',
    variants: [
      'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-C4.jpg',
      'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-Car-Off-Cliff.jpg',
      'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-House-Grenade.jpg',
      'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-Nuclear-Bombs.jpg',
      'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-Playground.jpg',
      'https://explodi.ng/images/cards/exploding-kitten/artworks/Exploding-Kitten-Science.jpg'
    ]
  },
  DEFUSE: {
    count: 6,
    name: 'Gỡ Bom',
    description: 'Vô hiệu hóa Mèo Nổ. Bạn được đặt lại Mèo Nổ vào bộ bài.',
    image: 'https://explodi.ng/images/cards/defuse/artworks/Defuse-Via-3AM-Flatulence.jpg',
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
  ATTACK: {
    count: 4,
    name: 'Tấn Công',
    description: 'Kết thúc lượt và buộc người chơi kế tiếp đi 2 lượt.',
    image: 'https://explodi.ng/images/cards/attack-2x/artworks/Attack-Bear-o-Dactyl.jpg',
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
  SKIP: {
    count: 4,
    name: 'Qua Lượt',
    description: 'Kết thúc lượt của bạn mà không cần rút bài.',
    image: 'https://explodi.ng/images/cards/skip/artworks/Skip-Commandeer-a-Bunnyraptor.jpg',
    variants: [
      'https://explodi.ng/images/cards/skip/artworks/Skip-Commandeer-a-Bunnyraptor.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Crab-Walk-with-Some-Crabs.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Don-a-Portable-Cheetah-Butt.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Sail-Away-on-Your-Penis-Balloon.jpg',
      'https://explodi.ng/images/cards/skip/artworks/Skip-Play-a-Game-of-Whale-Boner-Tetherball.jpg'
    ]
  },
  FAVOR: {
    count: 4,
    name: 'Xin Xỏ',
    description: 'Buộc 1 người chơi khác phải đưa cho bạn 1 lá bài của họ.',
    image: 'https://i.imgur.com/7L7L7L7.png', // No new links provided for Favor, keeping old (might break if domain blocked, but I whitelisted imgur still)
    variants: []
  },
  SHUFFLE: {
    count: 4,
    name: 'Xào Bài',
    description: 'Xào lại bộ bài rút.',
    image: 'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-A-Kraken-Emerges-and-Hes-Super-Upset.jpg',
    variants: [
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-A-Kraken-Emerges-and-Hes-Super-Upset.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-A-Plague-of-Bat-Farts.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-An-Electromagnetic-Pomeranian-Storm.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-Smoke-Some-Crack-with-a-Baby-Owl.jpg',
      'https://explodi.ng/images/cards/shuffle/artworks/Shuffle-Discover-You-Have-a-Toilet-Werewolf.jpg'
    ]
  },
  SEE_FUTURE: {
    count: 5,
    name: 'Tiên Tri',
    description: 'Xem trước 3 lá bài trên cùng của bộ bài rút.',
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
  NOPE: {
    count: 5,
    name: 'Nope',
    description: 'Chặn hành động của người chơi khác (trừ Mèo Nổ và Gỡ Bom).',
    image: 'https://explodi.ng/images/cards/nope/artworks/Nope-A-Jackanope-Bounds-into-the-Room.jpg',
    variants: [
      'https://explodi.ng/images/cards/nope/artworks/Nope-A-Jackanope-Bounds-into-the-Room.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Deliver-some-Nope-on-Your-Jump-Rope.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Feed-your-Apponent-Some-Cantanope.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Feed-your-Apponent-a-Nope-Sandwich.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Nopestradamus-Speaks-the-Truth.jpg',
      'https://explodi.ng/images/cards/nope/artworks/Nope-Put-on-Your-Necktie-of-Nope.jpg'
    ]
  },
  TACO_CAT: { count: 4, name: 'Taco Cat', image: 'https://i.imgur.com/1P1P1P1.png' },
  WATERMELON_CAT: { count: 4, name: 'Dưa Hấu Mèo', image: 'https://i.imgur.com/2Q2Q2Q2.png' },
  POTATO_CAT: { count: 4, name: 'Khoai Tây Mèo', image: 'https://i.imgur.com/3R3R3R3.png' },
  BEARD_CAT: { count: 4, name: 'Râu Mèo', image: 'https://i.imgur.com/4S4S4S4.png' },
  RAINBOW_RALPHING_CAT: { count: 4, name: 'Mèo Cầu Vồng', image: 'https://i.imgur.com/5T5T5T5.png' }
};

export const CARD_BACK_IMAGE = 'https://i.pinimg.com/originals/10/80/a4/1080a4bd1a33cec92019fab5efb3da95.png';
