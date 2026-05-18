export type CategoryGroup = {
  label: string;
  emoji: string;
  items: string[];
};

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: 'Art & Crafts',
    emoji: '🎨',
    items: [
      'Architecture', 'Blacksmithing', 'Calligraphy', 'Candle Making', 'Ceramics',
      'Digital Art', 'Drawing', 'Embroidery', 'Glassblowing', 'Illustration',
      'Jewelry Making', 'Knitting', 'Leatherwork', 'Metalwork', 'Painting',
      'Photography', 'Pottery', 'Printmaking', 'Sculpting', 'Sewing',
      'Street Art', 'Videography', 'Weaving', 'Woodworking',
    ],
  },
  {
    label: 'Music',
    emoji: '🎵',
    items: [
      'Bass', 'Classical', 'Country', 'DJ', 'Drums', 'Electronic', 'Folk',
      'Guitar', 'Hip-Hop', 'Indie', 'Jazz', 'Metal', 'Piano', 'Pop',
      'R&B', 'Reggae', 'Rock', 'Singing', 'Songwriting', 'Trumpet',
      'Ukulele', 'Violin', 'Vinyl & Records',
    ],
  },
  {
    label: 'Sports & Outdoors',
    emoji: '⚽',
    items: [
      'Baseball', 'Basketball', 'Cycling', 'Fishing', 'Football', 'Formula 1', 'Golf',
      'Hiking', 'Hockey', 'Hunting', 'Kayaking', 'Mountain Biking', 'Rock Climbing',
      'Running', 'Sailing', 'Skateboarding', 'Skiing', 'Snowboarding', 'Soccer',
      'Surfing', 'Swimming', 'Tennis', 'Wrestling',
    ],
  },
  {
    label: 'Animals',
    emoji: '🐾',
    items: [
      'Birds', 'Cats', 'Dogs', 'Farm Animals', 'Fish', 'Goats', 'Horses',
      'Marine Life', 'Pigs', 'Rabbits', 'Reptiles', 'Wildlife',
    ],
  },
  {
    label: 'Food & Drink',
    emoji: '🍳',
    items: [
      'Baking', 'BBQ', 'Brewing', 'Cocktails', 'Coffee', 'Cooking',
      'Foraging', 'Smoking Meats', 'Wine',
    ],
  },
  {
    label: 'Lifestyle',
    emoji: '🌿',
    items: [
      'Astronomy', 'Bird Watching', 'Boating', 'Camping', 'Cars', 'Fitness',
      'Gardening', 'Home Improvement', 'Journaling', 'Meditation', 'Motorcycles',
      'Outdoors', 'Reading', 'Travel', 'Volunteering', 'Writing', 'Yoga',
    ],
  },
];

export const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap(g => g.items).sort();
