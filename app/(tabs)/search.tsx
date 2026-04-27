import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const screen = Dimensions.get('window');
const cardWidth = screen.width - 24;
const imageHeight = cardWidth * (5 / 4);

const categories = [
  { id: 'woodworking', label: 'Woodworking' },
  { id: 'photography', label: 'Photography' },
  { id: 'painting', label: 'Painting' },
  { id: 'outdoors', label: 'Outdoors' },
  { id: 'fishing', label: 'Fishing' },
  { id: 'music', label: 'Music' },
  { id: 'cooking', label: 'Cooking' },
  { id: 'pottery', label: 'Pottery' },
];

const sampleUsers = [
  { id: '1', name: 'Jake Miller', handle: '@jake_builds', category: 'Woodworking', verified: true },
  { id: '2', name: 'Maria Santos', handle: '@maria_lens', category: 'Photography', verified: true },
  { id: '3', name: 'Tom Harris', handle: '@outdoorlife', category: 'Outdoors', verified: false },
  { id: '4', name: 'Grace Liu', handle: '@potter_grace', category: 'Pottery', verified: true },
  { id: '5', name: 'Dale Reeves', handle: '@fishing_life', category: 'Fishing', verified: false },
  { id: '6', name: 'Mike Davis', handle: '@guitar_real', category: 'Music', verified: true },
];

const samplePosts = [
  { id: '1', image: 'https://picsum.photos/seed/wood1/600/750', user: '@jake', widescreen: true },
  { id: '2', image: 'https://picsum.photos/seed/sunset1/600/750', user: '@maria', widescreen: true },
  { id: '3', image: 'https://picsum.photos/seed/lake1/600/750', user: '@outdoors', widescreen: false },
  { id: '4', image: 'https://picsum.photos/seed/clay1/600/750', user: '@grace', widescreen: false },
  { id: '5', image: 'https://picsum.photos/seed/fish1/600/750', user: '@dale', widescreen: true },
  { id: '6', image: 'https://picsum.photos/seed/flower1/600/750', user: '@anne', widescreen: false },
  { id: '7', image: 'https://picsum.photos/seed/chair1/600/750', user: '@ray', widescreen: true },
  { id: '8', image: 'https://picsum.photos/seed/ocean1/600/750', user: '@chris', widescreen: true },
  { id: '9', image: 'https://picsum.photos/seed/bread1/600/750', user: '@lily', widescreen: false },
];

const widescreenPosts = samplePosts.filter(p => p.widescreen);
const gridPosts = samplePosts.filter(p => !p.widescreen);

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'people' | 'categories'>('discover');

  const filteredUsers = sampleUsers.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.handle.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color="#888888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search people, categories..."
            placeholderTextColor="#888888"
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color="#888888" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.tabRow}>
          {(['discover', 'people', 'categories'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={styles.body}>
        {activeTab === 'people' && (
          <View style={styles.peopleList}>
            {(query ? filteredUsers : sampleUsers).map(user => (
              <TouchableOpacity key={user.id} style={styles.userRow}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                </View>
                <View style={styles.userInfo}>
                  <View style={styles.userNameRow}>
                    <Text style={styles.userName}>{user.name}</Text>
                    {user.verified && <Text style={styles.verifiedBadge}>✦</Text>}
                  </View>
                  <Text style={styles.userHandle}>{user.handle} · {user.category}</Text>
                </View>
                <TouchableOpacity style={styles.followBtn}>
                  <Text style={styles.followBtnText}>Follow</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'categories' && (
          <View style={styles.categoriesGrid}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'discover' && (
          <View>
            <Text style={styles.sectionLabel}>Widescreen Posts</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.widescreenScroll}>
              {widescreenPosts.map(post => (
                <TouchableOpacity key={post.id} style={styles.widescreenCard}>
                  <Image source={{ uri: post.image }} style={styles.widescreenImage} resizeMode="cover" />
                  <View style={styles.widescreenOverlay}>
                    <Text style={styles.widescreenLabel}>⟷ Widescreen</Text>
                    <Text style={styles.widescreenUser}>{post.user}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Recent Posts</Text>
            <View style={styles.gridContainer}>
              {gridPosts.map(post => (
                <TouchableOpacity key={post.id} style={styles.gridCell}>
                  <Image source={{ uri: post.image }} style={styles.gridImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { backgroundColor: '#000000', paddingTop: 60, paddingBottom: 12, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  title: { fontSize: 26, fontWeight: '700', color: '#FFC300', paddingHorizontal: 20, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111', borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12, borderWidth: 1, borderColor: '#333333' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#FFFFFF' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333' },
  tabActive: { backgroundColor: '#FFC300', borderColor: '#FFC300' },
  tabText: { fontSize: 13, color: '#888888', fontWeight: '600' },
  tabTextActive: { color: '#000000' },
  body: { flex: 1 },
  peopleList: { padding: 16, gap: 12 },
  userRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 12, gap: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 18, fontWeight: '700', color: '#000000' },
  userInfo: { flex: 1 },
  userNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '700', color: '#000000' },
  verifiedBadge: { fontSize: 12, color: '#FFC300' },
  userHandle: { fontSize: 12, color: '#888888', marginTop: 2 },
  followBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  followBtnText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 10 },
  categoryCard: { width: (screen.width - 48) / 2, backgroundColor: '#000000', borderRadius: 14, padding: 20, borderWidth: 1, borderColor: '#FFC300', alignItems: 'center' },
  categoryLabel: { fontSize: 15, fontWeight: '700', color: '#FFC300' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#000000', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  widescreenScroll: { paddingLeft: 16, marginBottom: 8 },
  widescreenCard: { width: 200, height: 120, borderRadius: 12, overflow: 'hidden', marginRight: 10 },
  widescreenImage: { width: '100%', height: '100%' },
  widescreenOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8 },
  widescreenLabel: { fontSize: 10, color: '#FFC300', fontWeight: '700' },
  widescreenUser: { fontSize: 11, color: '#FFFFFF' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, paddingBottom: 20 },
  gridCell: { width: (screen.width - 48) / 3, height: (screen.width - 48) / 3, borderRadius: 8, overflow: 'hidden' },
  gridImage: { width: '100%', height: '100%' },
  noResults: { textAlign: 'center', color: '#888888', marginTop: 40, fontSize: 14 },
});