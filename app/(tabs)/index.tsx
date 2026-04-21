import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const screen = Dimensions.get('window');
const cardWidth = screen.width - 24;
const imageHeight = cardWidth * (5 / 4);

const initialPosts = [
  { id: '1', user: '@stephen', text: 'Welcome to Happ-E.', type: 'post', image: 'https://picsum.photos/seed/workshop/600/750', widescreen: true, likes: 12, comments: [] },
  { id: '2', user: '✦ Inspire', text: '"The secret of getting ahead is getting started."', author: '— Mark Twain', type: 'inspire', likes: 34, comments: [] },
  { id: '3', user: '@creative', text: 'Made this today.', type: 'post', image: 'https://picsum.photos/seed/woodwork/600/750', widescreen: true, likes: 8, comments: [] },
  { id: '4', user: '✦ Inspire', text: '"In the middle of every difficulty lies opportunity."', author: '— Albert Einstein', type: 'inspire', likes: 21, comments: [] },
  { id: '5', user: '@outdoors', text: 'Sunrise on the water.', type: 'post', image: 'https://picsum.photos/seed/nature/600/750', widescreen: true, likes: 19, comments: [] },
];

export default function HomeScreen() {
  const [dimensions, setDimensions] = useState({ width: screen.width, height: screen.height });
  const [posts, setPosts] = useState(initialPosts);
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({});
  const isLandscape = dimensions.width > dimensions.height;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription.remove();
  }, []);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleComment = (id: string) => {
    const text = commentInputs[id];
    if (!text || !text.trim()) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { user: '@you', text }] } : p));
    setCommentInputs(prev => ({ ...prev, [id]: '' }));
  };

  const renderActions = (item: any) => (
    <View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
          <Text style={styles.actionIcon}>♡</Text>
          <Text style={styles.actionCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>◻ Comment</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>↗ Share</Text>
        </TouchableOpacity>
      </View>
      {item.comments.length > 0 && (
        <View style={styles.commentsList}>
          {item.comments.map((c: any, i: number) => (
            <View key={i} style={styles.commentRow}>
              <Text style={styles.commentUser}>{c.user}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          ))}
        </View>
      )}
      <View style={styles.commentInputRow}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a kind comment..."
          placeholderTextColor="#AAAAAA"
          value={commentInputs[item.id] || ''}
          onChangeText={text => setCommentInputs(prev => ({ ...prev, [item.id]: text }))}
          onSubmitEditing={() => handleComment(item.id)}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleComment(item.id)}>
          <Text style={styles.sendText}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderVerticalCard = (item: any) => {
    if (item.type === 'inspire') {
      return (
        <View key={item.id} style={styles.card}>
          <View style={styles.inspireInner}>
            <Text style={styles.inspireLabel}>✦ Inspire</Text>
            <Text style={styles.inspireText}>{item.text}</Text>
            {item.author && <Text style={styles.inspireAuthor}>{item.author}</Text>}
          </View>
          {renderActions(item)}
        </View>
      );
    }
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user.charAt(1).toUpperCase()}</Text>
          </View>
          <Text style={styles.cardUser}>{item.user}</Text>
          {item.widescreen && (
            <View style={styles.widescreenBadge}>
              <Image
                source={require('../../assets/images/arrows-left-right.png')}
                style={styles.widescreenIcon}
              />
            </View>
          )}
        </View>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
        )}
        <Text style={styles.cardText}>{item.text}</Text>
        {renderActions(item)}
      </View>
    );
  };

  const renderHorizontalCard = ({ item }: { item: any }) => (
    <View style={[styles.horizontalCard, { width: dimensions.width, height: dimensions.height - 60 }]}>
      {item.image ? (
        <>
          <Image source={{ uri: item.image }} style={styles.horizontalImage} resizeMode="cover" />
          <View style={styles.horizontalBottom}>
            <Text style={styles.horizontalUser}>{item.user}</Text>
            <Text style={styles.horizontalText}>{item.text}</Text>
          </View>
        </>
      ) : (
        <View style={styles.horizontalInspire}>
          <Text style={styles.horizontalInspireLabel}>✦ Inspire</Text>
          <Text style={styles.horizontalInspireText}>{item.text}</Text>
          {item.author && <Text style={styles.horizontalInspireAuthor}>{item.author}</Text>}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {!isLandscape && (
        <View style={styles.header}>
          <Text style={styles.logo}>Happ-E</Text>
          <Text style={styles.tagline}>Real people. Real moments.</Text>
        </View>
      )}
      {isLandscape ? (
        <FlatList
          data={posts}
          renderItem={renderHorizontalCard}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <ScrollView style={styles.feed}>
          {posts.map(renderVerticalCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FF' },
  header: { paddingTop: 60, paddingBottom: 16, alignItems: 'center', backgroundColor: '#2D3047' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#2EC4B6' },
  tagline: { fontSize: 13, color: '#F7F7FF', marginTop: 4, opacity: 0.8 },
  feed: { padding: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 14, borderWidth: 0.5, borderColor: '#E0E0E0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#2EC4B6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#F7F7FF' },
  cardUser: { fontSize: 13, fontWeight: '700', color: '#2D3047', flex: 1 },
  widescreenBadge: { backgroundColor: '#2D3047', borderRadius: 6, padding: 6 },
  widescreenIcon: { width: 18, height: 18, tintColor: '#FFD84D' },
  cardImage: { width: '100%', height: imageHeight },
  cardText: { fontSize: 14, color: '#2D3047', lineHeight: 20, padding: 12, paddingBottom: 4 },
  inspireInner: { backgroundColor: '#2D3047', height: imageHeight, justifyContent: 'center', alignItems: 'center', padding: 30 },
  inspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFD84D', marginBottom: 16, letterSpacing: 2 },
  inspireText: { fontSize: 18, color: '#F7F7FF', lineHeight: 28, fontStyle: 'italic', textAlign: 'center' },
  inspireAuthor: { fontSize: 13, color: '#2EC4B6', marginTop: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 20, borderTopWidth: 0.5, borderTopColor: '#E0E0E0' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 14, color: '#2D3047' },
  actionCount: { fontSize: 13, color: '#888888' },
  commentsList: { paddingHorizontal: 12, paddingBottom: 6 },
  commentRow: { flexDirection: 'row', gap: 6, paddingVertical: 3 },
  commentUser: { fontSize: 12, fontWeight: '700', color: '#FF7A59' },
  commentText: { fontSize: 12, color: '#2D3047', flex: 1 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  commentInput: { flex: 1, backgroundColor: '#F7F7FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, color: '#2D3047', borderWidth: 0.5, borderColor: '#E0E0E0' },
  sendBtn: { backgroundColor: '#2EC4B6', borderRadius: 20, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 14, color: '#F7F7FF', fontWeight: '700' },
  horizontalCard: { backgroundColor: '#2D3047', justifyContent: 'flex-end' },
  horizontalImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  horizontalBottom: { padding: 30, paddingBottom: 50 },
  horizontalUser: { fontSize: 13, fontWeight: '700', color: '#FFD84D', marginBottom: 8, letterSpacing: 1 },
  horizontalText: { fontSize: 22, lineHeight: 32, color: '#F7F7FF', fontWeight: '600' },
  horizontalInspire: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, backgroundColor: '#2D3047' },
  horizontalInspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFD84D', marginBottom: 20, letterSpacing: 2 },
  horizontalInspireText: { fontSize: 26, lineHeight: 38, color: '#F7F7FF', fontStyle: 'italic', textAlign: 'center' },
  horizontalInspireAuthor: { fontSize: 15, color: '#2EC4B6', marginTop: 20, fontWeight: '600' },
});