import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

type User = {
  id: string;
  name: string;
  handle: string;
  category: string;
  avatar_url?: string | null;
  verified: boolean;
  following?: boolean;
};

type DiscoverPost = {
  id: string;
  image_url: string | null;
  text: string | null;
  type: string;
  handle: string;
};

type TabKey = 'discover' | 'people' | 'categories';

const CATEGORIES = [
  { label: 'Woodworking', emoji: '🪵' },
  { label: 'Photography', emoji: '📷' },
  { label: 'Fishing', emoji: '🎣' },
  { label: 'Painting', emoji: '🎨' },
  { label: 'Outdoors', emoji: '🏕️' },
  { label: 'Music', emoji: '🎸' },
  { label: 'Cooking', emoji: '🍳' },
  { label: 'Gardening', emoji: '🌱' },
  { label: 'Pottery', emoji: '🏺' },
  { label: 'Videography', emoji: '🎬' },
  { label: 'Cycling', emoji: '🚴' },
  { label: 'Running', emoji: '🏃' },
  { label: 'Hiking', emoji: '⛰️' },
  { label: 'Surfing', emoji: '🏄' },
  { label: 'Drawing', emoji: '✏️' },
  { label: 'Knitting', emoji: '🧶' },
  { label: 'Sculpting', emoji: '🗿' },
];

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function UserRow({ user, onFollow }: { user: User; onFollow: (id: string) => void }) {
  return (
    <View style={styles.userRow}>
      <Pressable style={styles.userMain} onPress={() => router.push(`/user/${user.id}` as any)}>
        {user.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.userAvatarImg} />
        ) : (
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>{user.name}</Text>
            {user.verified ? <Text style={styles.verifiedBadge}>✦</Text> : null}
          </View>
          <Text style={styles.userHandle}>{user.handle}{user.category ? ` · ${user.category}` : ''}</Text>
        </View>
      </Pressable>
      <Pressable
        style={[styles.followBtn, user.following && styles.followingBtn]}
        onPress={() => onFollow(user.id)}
      >
        <Text style={[styles.followBtnText, user.following && styles.followingBtnText]}>
          {user.following ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [discoverPosts, setDiscoverPosts] = useState<DiscoverPost[]>([]);
  const [categoryPosts, setCategoryPosts] = useState<DiscoverPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const colWidth = (width - 32 - 8) / 3;
  const cardHeight = colWidth * (5 / 4);

  useEffect(() => {
    void loadSuggested();
    void loadDiscover();
  }, []);

  const loadSuggested = async () => {
    try {
      const result = await api.getSuggestedUsers();
      if (result.success) setSuggestedUsers(result.users.map((u: any) => ({ ...u, id: String(u.id) })));
    } catch {}
  };

  const loadDiscover = async () => {
    try {
      const result = await api.getPostsByCategory('');
      if (result.success) {
        setDiscoverPosts(result.posts.filter((p: any) => p.image_url).map((p: any) => ({
          id: String(p.id),
          image_url: p.image_url,
          text: p.text,
          type: p.type,
          handle: p.handle,
        })));
      }
    } catch {}
  };

  const handleCategoryPress = async (label: string) => {
    setSelectedCategory(label);
    setCategoryLoading(true);
    try {
      const result = await api.getPostsByCategory(label);
      if (result.success) {
        setCategoryPosts(result.posts.map((p: any) => ({
          id: String(p.id),
          image_url: p.image_url,
          text: p.text,
          type: p.type,
          handle: p.handle,
        })));
      }
    } catch {} finally {
      setCategoryLoading(false);
    }
  };

  const handleFollow = useCallback(async (id: string) => {
    const update = (prev: User[]) => prev.map(u => u.id === id ? { ...u, following: !u.following } : u);
    setSuggestedUsers(update);
    setSearchResults(update);
    try {
      const token = await getToken();
      const user = [...suggestedUsers, ...searchResults].find(u => u.id === id);
      if (user?.following) await api.unfollow(id, token ?? '');
      else await api.follow(id, token ?? '');
    } catch {}
  }, [suggestedUsers, searchResults]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    const q = query.trim();
    if (!q) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const result = await api.searchUsers(q);
        if (result.success) setSearchResults(result.users.map((u: any) => ({ ...u, id: String(u.id) })));
      } catch {}
    }, 300);
  }, [query]);

  const isSearching = query.trim().length > 0;

  const renderGrid = (posts: DiscoverPost[]) => {
    const rows: DiscoverPost[][] = [];
    for (let i = 0; i < posts.length; i += 3) rows.push(posts.slice(i, i + 3));
    return rows.map((row, i) => (
      <View key={i} style={styles.gridRow}>
        {row.map(post => (
          <Pressable
            key={post.id}
            style={[styles.gridCell, { width: colWidth, height: cardHeight }]}
            onPress={() => router.push(`/post/${post.id}` as any)}
          >
            {post.image_url ? (
              <Image source={{ uri: post.image_url }} style={styles.gridImage} resizeMode="cover" />
            ) : (
              <View style={styles.gridInspire}>
                <Text style={styles.gridInspireText} numberOfLines={4}>{post.text}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {selectedCategory ? (
          <View style={styles.headerBack}>
            <Pressable onPress={() => setSelectedCategory(null)} hitSlop={10} style={styles.backBtn}>
              <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <Text style={styles.title}>{selectedCategory}</Text>
          </View>
        ) : (
          <Text style={styles.title}>Discover</Text>
        )}
      </View>

      {!selectedCategory && (
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
          {isSearching && (
            <Pressable onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </Pressable>
          )}
        </View>
      )}

      {!isSearching && !selectedCategory && (
        <View style={styles.tabRow}>
          <TabButton label="Discover" active={activeTab === 'discover'} onPress={() => setActiveTab('discover')} />
          <TabButton label="People" active={activeTab === 'people'} onPress={() => setActiveTab('people')} />
          <TabButton label="Categories" active={activeTab === 'categories'} onPress={() => setActiveTab('categories')} />
        </View>
      )}

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Category posts view */}
        {selectedCategory ? (
          <View style={{ padding: 16 }}>
            {categoryLoading ? (
              <ActivityIndicator color="#FFC300" style={{ marginTop: 40 }} />
            ) : categoryPosts.length === 0 ? (
              <Text style={styles.noResults}>No posts in this category yet.</Text>
            ) : (
              renderGrid(categoryPosts)
            )}
          </View>
        ) : isSearching ? (
          <View style={styles.searchResults}>
            <Text style={styles.sectionLabel}>Results for "{query.trim()}"</Text>
            {searchResults.length === 0
              ? <Text style={styles.noResults}>No results found.</Text>
              : searchResults.map(u => <UserRow key={u.id} user={u} onFollow={handleFollow} />)
            }
          </View>
        ) : activeTab === 'discover' ? (
          <View style={{ paddingTop: 8 }}>
            {discoverPosts.length === 0
              ? <Text style={[styles.noResults, { marginTop: 60 }]}>No posts yet — be the first to share!</Text>
              : renderGrid(discoverPosts)
            }
            <View style={styles.endMessage}>
              <Text style={styles.endText}>✦ You've seen it all</Text>
            </View>
          </View>
        ) : activeTab === 'people' ? (
          <View style={styles.searchResults}>
            <Text style={styles.sectionLabel}>Suggested People</Text>
            {suggestedUsers.map(u => <UserRow key={u.id} user={u} onFollow={handleFollow} />)}
          </View>
        ) : (
          <View style={styles.searchResults}>
            <Text style={styles.sectionLabel}>Browse Categories</Text>
            {CATEGORIES.map(cat => (
              <Pressable key={cat.label} style={styles.categoryRow} onPress={() => handleCategoryPress(cat.label)}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
                <Text style={styles.categoryArrow}>›</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  headerBack: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backBtn: { paddingRight: 4 },
  backArrow: { fontSize: 28, color: '#FFC300', lineHeight: 32 },
  title: { fontSize: 24, fontWeight: '700', color: '#FFC300' },
  searchRow: { flexDirection: 'row', alignItems: 'center', margin: 16, backgroundColor: '#111111', borderRadius: 14, borderWidth: 1, borderColor: '#333333', paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 15, color: '#FFFFFF', paddingVertical: 12 },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 14, color: '#888888' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333333' },
  tabActive: { backgroundColor: '#FFC300', borderColor: '#FFC300' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#888888' },
  tabTextActive: { color: '#000000' },
  body: { flex: 1 },
  bodyContent: { paddingBottom: 20 },
  searchResults: { padding: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  noResults: { fontSize: 14, color: '#888888', textAlign: 'center', marginTop: 40 },
  gridRow: { flexDirection: 'row', gap: 4, marginBottom: 4, paddingHorizontal: 16 },
  gridCell: { borderRadius: 6, overflow: 'hidden', backgroundColor: '#111111' },
  gridImage: { width: '100%', height: '100%' },
  gridInspire: { flex: 1, backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center', padding: 6 },
  gridInspireText: { fontSize: 9, color: '#FFC300', textAlign: 'center', fontStyle: 'italic', lineHeight: 13 },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A', gap: 12 },
  userMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userAvatarImg: { width: 44, height: 44, borderRadius: 22, flexShrink: 0 },
  userAvatarText: { fontSize: 18, fontWeight: '700', color: '#000000' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  verifiedBadge: { fontSize: 12, color: '#FFC300' },
  userHandle: { fontSize: 12, color: '#888888', marginTop: 2 },
  followBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFC300' },
  followBtnText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  followingBtnText: { color: '#FFC300' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A', gap: 14 },
  categoryEmoji: { fontSize: 28 },
  categoryLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  categoryArrow: { fontSize: 20, color: '#FFC300' },
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 13, color: '#444444' },
});