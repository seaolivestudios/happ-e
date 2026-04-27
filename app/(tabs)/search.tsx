// app/(tabs)/search.tsx
import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

type User = {
  id: string;
  name: string;
  handle: string;
  category: string;
  verified: boolean;
};

type TrendingCategory = {
  id: string;
  label: string;
  emoji: string;
  posts: string;
};

type GridPost = {
  id: string;
  user: string;
  image: string;
  widescreen: boolean;
};

type WidescreenPost = {
  id: string;
  user: string;
  image: string;
  label: string;
};

type Section =
  | { type: 'grid'; posts: GridPost[] }
  | { type: 'widescreen'; post: WidescreenPost };

type TabKey = 'discover' | 'people' | 'categories';

const ALL_USERS: User[] = [
  { id: 'u1', name: 'Maria Santos', handle: '@maria', category: 'Photography', verified: true },
  { id: 'u2', name: 'Jake Miller', handle: '@jake', category: 'Woodworking', verified: true },
  { id: 'u3', name: 'Sarah Creates', handle: '@sarah_creates', category: 'Painting', verified: true },
  { id: 'u4', name: 'Outdoor Life', handle: '@outdoorlife', category: 'Outdoors', verified: true },
  { id: 'u5', name: 'Craftsman Joe', handle: '@craftsman_joe', category: 'Woodworking', verified: true },
  { id: 'u6', name: 'Nature Lens', handle: '@nature_lens', category: 'Photography', verified: true },
  { id: 'u7', name: 'Fishing Life', handle: '@fishinglife', category: 'Fishing', verified: true },
  { id: 'u8', name: 'Wood Craft', handle: '@woodcraft', category: 'Woodworking', verified: true },
];

const TRENDING_CATEGORIES: TrendingCategory[] = [
  { id: 'c1', label: 'Woodworking', emoji: '🪵', posts: '2.4k' },
  { id: 'c2', label: 'Photography', emoji: '📷', posts: '5.1k' },
  { id: 'c3', label: 'Fishing', emoji: '🎣', posts: '1.8k' },
  { id: 'c4', label: 'Painting', emoji: '🎨', posts: '3.2k' },
  { id: 'c5', label: 'Outdoors', emoji: '🏕️', posts: '4.7k' },
  { id: 'c6', label: 'Music', emoji: '🎸', posts: '2.9k' },
];

const GRID_POSTS: GridPost[] = [
  { id: 'p1', user: '@jake', image: 'https://picsum.photos/seed/g1/300/375', widescreen: true },
  { id: 'p2', user: '@maria', image: 'https://picsum.photos/seed/g2/300/375', widescreen: false },
  { id: 'p3', user: '@sarah', image: 'https://picsum.photos/seed/g3/300/375', widescreen: true },
  { id: 'p4', user: '@outdoors', image: 'https://picsum.photos/seed/g4/300/375', widescreen: false },
  { id: 'p5', user: '@craftsman', image: 'https://picsum.photos/seed/g5/300/375', widescreen: true },
  { id: 'p6', user: '@nature', image: 'https://picsum.photos/seed/g6/300/375', widescreen: false },
  { id: 'p7', user: '@fishing', image: 'https://picsum.photos/seed/g7/300/375', widescreen: true },
  { id: 'p8', user: '@woodcraft', image: 'https://picsum.photos/seed/g8/300/375', widescreen: false },
  { id: 'p9', user: '@painter', image: 'https://picsum.photos/seed/g9/300/375', widescreen: true },
  { id: 'p10', user: '@hiker', image: 'https://picsum.photos/seed/g10/300/375', widescreen: false },
  { id: 'p11', user: '@guitarist', image: 'https://picsum.photos/seed/g11/300/375', widescreen: true },
  { id: 'p12', user: '@potter', image: 'https://picsum.photos/seed/g12/300/375', widescreen: false },
  { id: 'p13', user: '@baker', image: 'https://picsum.photos/seed/g13/300/375', widescreen: true },
  { id: 'p14', user: '@runner', image: 'https://picsum.photos/seed/g14/300/375', widescreen: false },
  { id: 'p15', user: '@cyclist', image: 'https://picsum.photos/seed/g15/300/375', widescreen: true },
  { id: 'p16', user: '@knitter', image: 'https://picsum.photos/seed/g16/300/375', widescreen: false },
  { id: 'p17', user: '@surfer', image: 'https://picsum.photos/seed/g17/300/375', widescreen: true },
  { id: 'p18', user: '@chef', image: 'https://picsum.photos/seed/g18/300/375', widescreen: false },
  { id: 'p19', user: '@climber', image: 'https://picsum.photos/seed/g19/300/375', widescreen: true },
  { id: 'p20', user: '@sculptor', image: 'https://picsum.photos/seed/g20/300/375', widescreen: false },
  { id: 'p21', user: '@brewer', image: 'https://picsum.photos/seed/g21/300/375', widescreen: true },
  { id: 'p22', user: '@kayaker', image: 'https://picsum.photos/seed/g22/300/375', widescreen: false },
  { id: 'p23', user: '@weaver', image: 'https://picsum.photos/seed/g23/300/375', widescreen: true },
  { id: 'p24', user: '@birder', image: 'https://picsum.photos/seed/g24/300/375', widescreen: false },
  { id: 'p25', user: '@jeweler', image: 'https://picsum.photos/seed/g25/300/375', widescreen: true },
  { id: 'p26', user: '@forager', image: 'https://picsum.photos/seed/g26/300/375', widescreen: false },
  { id: 'p27', user: '@drummer', image: 'https://picsum.photos/seed/g27/300/375', widescreen: true },
  { id: 'p28', user: '@glassblower', image: 'https://picsum.photos/seed/g28/300/375', widescreen: false },
  { id: 'p29', user: '@leathersmith', image: 'https://picsum.photos/seed/g29/300/375', widescreen: true },
  { id: 'p30', user: '@candlemaker', image: 'https://picsum.photos/seed/g30/300/375', widescreen: false },
];

const WIDESCREEN_POSTS: WidescreenPost[] = [
  { id: 'w1', user: '@jake', image: 'https://picsum.photos/seed/wide1/800/450', label: 'Widescreen' },
  { id: 'w2', user: '@maria', image: 'https://picsum.photos/seed/wide2/800/450', label: 'Widescreen' },
  { id: 'w3', user: '@outdoorlife', image: 'https://picsum.photos/seed/wide3/800/450', label: 'Widescreen' },
  { id: 'w4', user: '@nature_lens', image: 'https://picsum.photos/seed/wide4/800/450', label: 'Widescreen' },
  { id: 'w5', user: '@craftsman_joe', image: 'https://picsum.photos/seed/wide5/800/450', label: 'Widescreen' },
];

function buildSections(gridPosts: GridPost[], widescreenPosts: WidescreenPost[]): Section[] {
  const sections: Section[] = [];
  let postIndex = 0;
  let widescreenIndex = 0;

  while (postIndex < gridPosts.length) {
    const chunk = gridPosts.slice(postIndex, postIndex + 6);
    sections.push({ type: 'grid', posts: chunk });
    postIndex += 6;

    if (widescreenIndex < widescreenPosts.length) {
      sections.push({
        type: 'widescreen',
        post: widescreenPosts[widescreenIndex],
      });
      widescreenIndex += 1;
    }
  }

  return sections;
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} tab`}
      onPress={onPress}
      style={[styles.tab, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function UserRow({ user }: { user: User }) {
  return (
    <View style={styles.userRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${user.name}`}
        style={styles.userMain}
      >
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.verified ? <Text style={styles.verifiedBadge}>✦</Text> : null}
          </View>
          <Text style={styles.userHandle}>
            {user.handle} · {user.category}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Follow ${user.name}`}
        style={styles.followBtn}
      >
        <Text style={styles.followBtnText}>Follow</Text>
      </Pressable>
    </View>
  );
}

function CategoryRow({ category }: { category: TrendingCategory }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Browse ${category.label}`}
      style={styles.categoryRow}
    >
      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryLabel}>{category.label}</Text>
        <Text style={styles.categoryPosts}>{category.posts} posts</Text>
      </View>
      <Text style={styles.categoryArrow}>›</Text>
    </Pressable>
  );
}

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('discover');

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const horizontalPadding = 32;
  const gridGap = 4;
  const totalGapWidth = gridGap * 2;
  const colWidth = (width - horizontalPadding - totalGapWidth) / 3;
  const cardHeight = colWidth * (5 / 4);
  const widescreenHeight = (width - 32) * (9 / 16);

  const sections = useMemo(
    () => buildSections(GRID_POSTS, WIDESCREEN_POSTS),
    []
  );

  const filteredUsers = useMemo(() => {
    if (!normalizedQuery) return [];

    return ALL_USERS.filter((user) => {
      const name = user.name.toLowerCase();
      const handle = user.handle.toLowerCase();
      const category = user.category.toLowerCase();

      return (
        name.includes(normalizedQuery) ||
        handle.includes(normalizedQuery) ||
        category.includes(normalizedQuery)
      );
    });
  }, [normalizedQuery]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search people, crafts, interests..."
          placeholderTextColor="#888888"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {isSearching ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery('')}
            style={styles.clearBtn}
          >
            <Text style={styles.clearText}>✕</Text>
          </Pressable>
        ) : null}
      </View>

      {!isSearching ? (
        <View style={styles.tabRow}>
          <TabButton
            label="Discover"
            active={activeTab === 'discover'}
            onPress={() => setActiveTab('discover')}
          />
          <TabButton
            label="People"
            active={activeTab === 'people'}
            onPress={() => setActiveTab('people')}
          />
          <TabButton
            label="Categories"
            active={activeTab === 'categories'}
            onPress={() => setActiveTab('categories')}
          />
        </View>
      ) : null}

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          <View style={styles.searchResults}>
            <Text style={styles.sectionLabel}>Results for "{query.trim()}"</Text>

            {filteredUsers.length === 0 ? (
              <Text style={styles.noResults}>No results found.</Text>
            ) : (
              filteredUsers.map((user) => <UserRow key={user.id} user={user} />)
            )}
          </View>
        ) : activeTab === 'discover' ? (
          <View>
            {sections.map((section, sectionIndex) => {
              if (section.type === 'grid') {
                const rows = [
                  section.posts.slice(0, 3),
                  section.posts.slice(3, 6),
                ];

                return (
                  <View key={`grid-${sectionIndex}`}>
                    {rows.map((row, rowIndex) => (
                      <View key={`row-${sectionIndex}-${rowIndex}`} style={styles.gridRow}>
                        {row.map((post) => (
                          <Pressable
                            key={post.id}
                            accessibilityRole="button"
                            accessibilityLabel={`Open post from ${post.user}`}
                            style={[styles.gridCell, { width: colWidth, height: cardHeight }]}
                          >
                            <Image
                              source={{ uri: post.image }}
                              style={styles.gridImage}
                              resizeMode="cover"
                            />
                            {post.widescreen ? (
                              <View style={styles.widescreenBadge}>
                                <Text style={styles.widescreenBadgeText}>⇔</Text>
                              </View>
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ))}
                  </View>
                );
              }

              return (
                <Pressable
                  key={`wide-${section.post.id}`}
                  accessibilityRole="button"
                  accessibilityLabel={`Open widescreen post from ${section.post.user}`}
                  style={[styles.widescreenCard, { height: widescreenHeight }]}
                >
                  <Image
                    source={{ uri: section.post.image }}
                    style={styles.widescreenImage}
                    resizeMode="cover"
                  />
                  <View style={styles.widescreenOverlay}>
                    <Text style={styles.widescreenLabel}>⇔ {section.post.label}</Text>
                    <Text style={styles.widescreenUser}>{section.post.user}</Text>
                  </View>
                </Pressable>
              );
            })}

            <View style={styles.endMessage}>
              <Text style={styles.endText}>✦ You've seen it all — check back soon</Text>
            </View>
          </View>
        ) : activeTab === 'people' ? (
          <View style={styles.searchResults}>
            <Text style={styles.sectionLabel}>Suggested People</Text>
            {ALL_USERS.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </View>
        ) : (
          <View style={styles.searchResults}>
            <Text style={styles.sectionLabel}>Browse Categories</Text>
            {TRENDING_CATEGORIES.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFC300',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFC300',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#111111',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 12,
  },
  clearBtn: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#888888',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tabActive: {
    backgroundColor: '#FFC300',
    borderColor: '#FFC300',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  tabTextActive: {
    color: '#000000',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingBottom: 20,
  },
  searchResults: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFC300',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  noResults: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    marginTop: 40,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
    paddingHorizontal: 16,
  },
  gridCell: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#111111',
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  widescreenBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  widescreenBadgeText: {
    fontSize: 10,
    color: '#FFC300',
  },
  widescreenCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#111111',
  },
  widescreenImage: {
    width: '100%',
    height: '100%',
  },
  widescreenOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  widescreenLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC300',
    letterSpacing: 1,
  },
  widescreenUser: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
    gap: 12,
  },
  userMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#FFC300',
  },
  userHandle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  followBtn: {
    backgroundColor: '#FFC300',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
    gap: 14,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  categoryPosts: {
    fontSize: 12,
    color: '#888888',
    marginTop: 2,
  },
  categoryArrow: {
    fontSize: 20,
    color: '#FFC300',
  },
  endMessage: {
    padding: 30,
    alignItems: 'center',
  },
  endText: {
    fontSize: 13,
    color: '#444444',
  },
});