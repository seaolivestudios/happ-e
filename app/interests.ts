export type InterestItem = { id: string; label: string; emoji: string };
export type InterestSection = { heading: string; items: InterestItem[] };

export const INTEREST_CATEGORIES: InterestSection[] = [
  {
    heading: 'Sports',
    items: [
      { id: 's1', label: 'Baseball', emoji: '⚾' },
      { id: 's2', label: 'Basketball', emoji: '🏀' },
      { id: 's3', label: 'Football', emoji: '🏈' },
      { id: 's4', label: 'Hockey', emoji: '🏒' },
      { id: 's5', label: 'Soccer', emoji: '⚽' },
      { id: 's6', label: 'Golf', emoji: '⛳' },
      { id: 's7', label: 'Tennis', emoji: '🎾' },
      { id: 's8', label: 'Cycling', emoji: '🚴' },
      { id: 's9', label: 'Running', emoji: '🏃' },
      { id: 's10', label: 'Surfing', emoji: '🏄' },
      { id: 's11', label: 'Skiing', emoji: '⛷️' },
      { id: 's12', label: 'Wrestling', emoji: '🤼' },
      { id: 's13', label: 'Formula 1', emoji: '🏎️' },
    ],
  },
  {
    heading: 'Art',
    items: [
      { id: 'a1', label: 'Painting', emoji: '🎨' },
      { id: 'a2', label: 'Drawing', emoji: '✏️' },
      { id: 'a3', label: 'Sculpting', emoji: '🗿' },
      { id: 'a4', label: 'Photography', emoji: '📷' },
      { id: 'a5', label: 'Videography', emoji: '🎥' },
      { id: 'a6', label: 'Digital Art', emoji: '🖥️' },
      { id: 'a7', label: 'Illustration', emoji: '🖊️' },
      { id: 'a8', label: 'Printmaking', emoji: '🖨️' },
      { id: 'a9', label: 'Calligraphy', emoji: '✒️' },
      { id: 'a10', label: 'Street Art', emoji: '🏙️' },
    ],
  },
  {
    heading: 'Crafting',
    items: [
      { id: 'c1', label: 'Woodworking', emoji: '🪵' },
      { id: 'c2', label: 'Pottery', emoji: '🏺' },
      { id: 'c3', label: 'Knitting', emoji: '🧶' },
      { id: 'c4', label: 'Sewing', emoji: '🧵' },
      { id: 'c5', label: 'Leatherwork', emoji: '🧤' },
      { id: 'c6', label: 'Jewelry', emoji: '💍' },
      { id: 'c7', label: 'Candle Making', emoji: '🕯️' },
      { id: 'c8', label: 'Blacksmithing', emoji: '⚒️' },
      { id: 'c9', label: 'Glassblowing', emoji: '🫧' },
      { id: 'c10', label: 'Weaving', emoji: '🧺' },
    ],
  },
  {
    heading: 'Outdoors',
    items: [
      { id: 'o1', label: 'Fishing', emoji: '🎣' },
      { id: 'o2', label: 'Hiking', emoji: '🥾' },
      { id: 'o3', label: 'Camping', emoji: '🏕️' },
      { id: 'o4', label: 'Hunting', emoji: '🦌' },
      { id: 'o5', label: 'Gardening', emoji: '🌱' },
      { id: 'o6', label: 'Bird Watching', emoji: '🦅' },
      { id: 'o7', label: 'Rock Climbing', emoji: '🧗' },
      { id: 'o8', label: 'Kayaking', emoji: '🛶' },
      { id: 'o9', label: 'Mountain Biking', emoji: '🚵' },
      { id: 'o10', label: 'Foraging', emoji: '🍄' },
    ],
  },
  {
    heading: 'Music',
    items: [
      { id: 'mu1', label: 'Guitar', emoji: '🎸' },
      { id: 'mu2', label: 'Piano', emoji: '🎹' },
      { id: 'mu3', label: 'Drums', emoji: '🥁' },
      { id: 'mu4', label: 'Singing', emoji: '🎤' },
      { id: 'mu5', label: 'Violin', emoji: '🎻' },
      { id: 'mu6', label: 'DJ', emoji: '🎧' },
      { id: 'mu7', label: 'Songwriting', emoji: '🎼' },
      { id: 'mu8', label: 'Bass', emoji: '🎵' },
      { id: 'mu9', label: 'Trumpet', emoji: '🎺' },
      { id: 'mu10', label: 'Ukulele', emoji: '🪕' },
    ],
  },
  {
    heading: 'Music Genres',
    items: [
      { id: 'mg1', label: 'Rock', emoji: '🎸' },
      { id: 'mg2', label: 'Pop', emoji: '🎤' },
      { id: 'mg3', label: 'Hip-Hop', emoji: '🎧' },
      { id: 'mg4', label: 'Country', emoji: '🤠' },
      { id: 'mg5', label: 'Jazz', emoji: '🎷' },
      { id: 'mg6', label: 'Classical', emoji: '🎻' },
      { id: 'mg7', label: 'Electronic', emoji: '🎛️' },
      { id: 'mg8', label: 'R&B', emoji: '🎵' },
      { id: 'mg9', label: 'Folk', emoji: '🪕' },
      { id: 'mg10', label: 'Metal', emoji: '🤘' },
      { id: 'mg11', label: 'Reggae', emoji: '🌴' },
      { id: 'mg12', label: 'Indie', emoji: '🎼' },
    ],
  },
  {
    heading: 'Animals',
    items: [
      { id: 'an1', label: 'Dogs', emoji: '🐕' },
      { id: 'an2', label: 'Cats', emoji: '🐈' },
      { id: 'an3', label: 'Horses', emoji: '🐎' },
      { id: 'an4', label: 'Birds', emoji: '🦜' },
      { id: 'an5', label: 'Fish', emoji: '🐠' },
      { id: 'an6', label: 'Rabbits', emoji: '🐰' },
      { id: 'an7', label: 'Pigs', emoji: '🐷' },
      { id: 'an8', label: 'Goats', emoji: '🐐' },
      { id: 'an9', label: 'Farm Animals', emoji: '🐄' },
      { id: 'an10', label: 'Wildlife', emoji: '🦁' },
      { id: 'an11', label: 'Reptiles', emoji: '🦎' },
      { id: 'an12', label: 'Marine Life', emoji: '🐬' },
    ],
  },
  {
    heading: 'Food & Drink',
    items: [
      { id: 'f1', label: 'Cooking', emoji: '🍳' },
      { id: 'f2', label: 'Baking', emoji: '🥖' },
      { id: 'f3', label: 'BBQ', emoji: '🔥' },
      { id: 'f4', label: 'Brewing', emoji: '🍺' },
      { id: 'f5', label: 'Wine', emoji: '🍷' },
      { id: 'f6', label: 'Coffee', emoji: '☕' },
      { id: 'f7', label: 'Cocktails', emoji: '🍹' },
      { id: 'f8', label: 'Smoking Meats', emoji: '🥩' },
    ],
  },
  {
    heading: 'Lifestyle',
    items: [
      { id: 'l1', label: 'Yoga', emoji: '🧘' },
      { id: 'l2', label: 'Fitness', emoji: '💪' },
      { id: 'l3', label: 'Meditation', emoji: '🌿' },
      { id: 'l4', label: 'Travel', emoji: '✈️' },
      { id: 'l5', label: 'Journaling', emoji: '📓' },
      { id: 'l6', label: 'Reading', emoji: '📚' },
      { id: 'l7', label: 'Volunteering', emoji: '🤝' },
      { id: 'l8', label: 'Astronomy', emoji: '🔭' },
      { id: 'l9', label: 'Cars', emoji: '🚗' },
      { id: 'l10', label: 'Motorcycles', emoji: '🏍️' },
    ],
  },
];

export function getLabelById(id: string): string {
  for (const section of INTEREST_CATEGORIES) {
    const item = section.items.find(i => i.id === id);
    if (item) return item.label;
  }
  return id;
}

export function getEmojiByLabel(label: string): string {
  for (const section of INTEREST_CATEGORIES) {
    const item = section.items.find(i => i.label === label);
    if (item) return item.emoji;
  }
  return '✨';
}
