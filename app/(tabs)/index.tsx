import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentModal, setCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const flatListRef = useRef<FlatList>(null);
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

  const handleComment = (id: string, text: string) => {
    if (!text || !text.trim()) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { user: '@you', text }] } : p));
    setNewComment('');
    setCommentModal(false);
  };

  const activePost = posts[activeIndex];

  const renderActions = (item: any) => (
    <View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
          <Text style={styles.actionIcon}>♡</Text>
          <Text style={styles.actionCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setActiveIndex(posts.findIndex(p => p.id === item.id)); setCommentModal(true); }}>
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
              <Image source={require('../../assets/images/arrows-left-right.png')} style={styles.widescreenIcon} />
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

  const renderHorizontalCard = ({ item, index }: { item: any, index: number }) => (
    <View style={[styles.horizontalCard, { width: dimensions.width, height: dimensions.height }]}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.horizontalImage} resizeMode="cover" />
      ) : (
        <View style={styles.horizontalInspire}>
          <Text style={styles.horizontalInspireLabel}>✦ Inspire</Text>
          <Text style={styles.horizontalInspireText}>{item.text}</Text>
          {item.author && <Text style={styles.horizontalInspireAuthor}>{item.author}</Text>}
        </View>
      )}
      {item.image && (
        <View style={styles.horizontalBottom}>
          <Text style={styles.horizontalUser}>{item.user}</Text>
          <Text style={styles.horizontalText}>{item.text}</Text>
        </View>
      )}
      <View style={styles.sideActions}>
        <TouchableOpacity style={styles.sideBtn} onPress={() => handleLike(item.id)}>
          <Text style={styles.sideIcon}>♡</Text>
          <Text style={styles.sideCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} onPress={() => { setActiveIndex(index); setCommentModal(true); }}>
          <Text style={styles.sideIcon}>◻</Text>
          <Text style={styles.sideCount}>{item.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn}>
          <Text style={styles.sideIcon}>↗</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.progressDots}>
        {posts.map((_, i) => (
          <View key={i} style={[styles.progressDot, i === index && styles.progressDotActive]} />
        ))}
      </View>
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
          ref={flatListRef}
          data={posts}
          renderItem={renderHorizontalCard}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
          }}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        />
      ) : (
        <ScrollView style={styles.feed}>
          {posts.map(renderVerticalCard)}
        </ScrollView>
      )}

      <Modal
        visible={commentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setCommentModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCommentModal(false)}
          />
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalComments}>
              {activePost?.comments.length === 0 && (
                <Text style={styles.noComments}>No comments yet. Be the first.</Text>
              )}
              {activePost?.comments.map((c: any, i: number) => (
                <View key={i} style={styles.modalCommentRow}>
                  <Text style={styles.modalCommentUser}>{c.user}</Text>
                  <Text style={styles.modalCommentText}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                placeholder="Add a kind comment..."
                placeholderTextColor="#888888"
                value={newComment}
                onChangeText={setNewComment}
                autoFocus
                returnKeyType="send"
                onSubmitEditing={() => handleComment(activePost?.id, newComment)}
              />
              <TouchableOpacity
                style={styles.sendBtn}
                onPress={() => handleComment(activePost?.id, newComment)}
              >
                <Text style={styles.sendText}>↗</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 60, paddingBottom: 16, alignItems: 'center', backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  logo: { fontSize: 32, fontWeight: 'bold', color: '#FFC300' },
  tagline: { fontSize: 13, color: '#FFFFFF', marginTop: 4 },
  feed: { padding: 12 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#000000' },
  cardUser: { fontSize: 13, fontWeight: '700', color: '#000000', flex: 1 },
  widescreenBadge: { backgroundColor: '#000000', borderRadius: 6, padding: 6 },
  widescreenIcon: { width: 18, height: 18, tintColor: '#FFC300' },
  cardImage: { width: '100%', height: imageHeight },
  cardText: { fontSize: 14, color: '#000000', lineHeight: 20, padding: 12, paddingBottom: 4 },
  inspireInner: { backgroundColor: '#000000', height: imageHeight, justifyContent: 'center', alignItems: 'center', padding: 30 },
  inspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', marginBottom: 16, letterSpacing: 2 },
  inspireText: { fontSize: 18, color: '#FFFFFF', lineHeight: 28, fontStyle: 'italic', textAlign: 'center' },
  inspireAuthor: { fontSize: 13, color: '#FFC300', marginTop: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 20, borderTopWidth: 0.5, borderTopColor: '#E0E0E0' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionIcon: { fontSize: 14, color: '#000000' },
  actionCount: { fontSize: 13, color: '#888888' },
  commentsList: { paddingHorizontal: 12, paddingBottom: 12 },
  commentRow: { flexDirection: 'row', gap: 6, paddingVertical: 3 },
  commentUser: { fontSize: 12, fontWeight: '700', color: '#FFC300' },
  commentText: { fontSize: 12, color: '#000000', flex: 1 },
  sendBtn: { backgroundColor: '#FFC300', borderRadius: 20, width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 14, color: '#000000', fontWeight: '700' },
  horizontalCard: { backgroundColor: '#000000', justifyContent: 'flex-end' },
  horizontalImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  horizontalBottom: { padding: 24, paddingBottom: 40, paddingRight: 80, backgroundColor: 'rgba(0,0,0,0.55)' },
  horizontalUser: { fontSize: 13, fontWeight: '700', color: '#FFC300', marginBottom: 6, letterSpacing: 1 },
  horizontalText: { fontSize: 20, lineHeight: 28, color: '#FFFFFF', fontWeight: '600' },
  horizontalInspire: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60, backgroundColor: '#000000' },
  horizontalInspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', marginBottom: 20, letterSpacing: 2 },
  horizontalInspireText: { fontSize: 26, lineHeight: 38, color: '#FFFFFF', fontStyle: 'italic', textAlign: 'center' },
  horizontalInspireAuthor: { fontSize: 15, color: '#FFC300', marginTop: 20, fontWeight: '600' },
  sideActions: { position: 'absolute', right: 16, bottom: 60, alignItems: 'center', gap: 20 },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideIcon: { fontSize: 26, color: '#FFFFFF' },
  sideCount: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  progressDots: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  progressDotActive: { backgroundColor: '#FFC300', width: 18 },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 2, borderTopColor: '#FFC300', padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#FFC300' },
  modalClose: { fontSize: 18, color: '#FFFFFF' },
  modalComments: { maxHeight: 300, marginBottom: 12 },
  noComments: { fontSize: 13, color: '#888888', fontStyle: 'italic', textAlign: 'center', marginTop: 20, marginBottom: 20 },
  modalCommentRow: { marginBottom: 14 },
  modalCommentUser: { fontSize: 12, fontWeight: '700', color: '#FFC300', marginBottom: 2 },
  modalCommentText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20 },
  modalInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalInput: { flex: 1, backgroundColor: '#222222', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#FFFFFF', borderWidth: 0.5, borderColor: '#FFC300' },
});