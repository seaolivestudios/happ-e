import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const screen = Dimensions.get('window');
const cardWidth = screen.width - 24;
const imageHeight = cardWidth * (5 / 4);

const initialPosts = [
  { id: '1', user: '@stephen', text: 'Welcome to Happ-E.', type: 'post', image: 'https://picsum.photos/seed/workshop/600/750', widescreen: true, smiles: 12, comments: [] },
  { id: '2', user: '✦ Inspire', text: '"The secret of getting ahead is getting started."', author: '— Mark Twain', type: 'inspire', smiles: 34, comments: [] },
  { id: '3', user: '@creative', text: 'Made this today.', type: 'post', image: 'https://picsum.photos/seed/woodwork/600/750', widescreen: true, smiles: 8, comments: [] },
  { id: '4', user: '✦ Inspire', text: '"In the middle of every difficulty lies opportunity."', author: '— Albert Einstein', type: 'inspire', smiles: 21, comments: [] },
  { id: '5', user: '@outdoors', text: 'Sunrise on the water.', type: 'post', image: 'https://picsum.photos/seed/nature/600/750', widescreen: true, smiles: 19, comments: [] },
];

export default function HomeScreen() {
  const [dimensions, setDimensions] = useState({ width: screen.width, height: screen.height });
  const [posts, setPosts] = useState(initialPosts);
  const [activeIndex, setActiveIndex] = useState(0);
  const [commentModal, setCommentModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(-300)).current;
  const flatListRef = useRef<FlatList>(null);
  const isLandscape = dimensions.width > dimensions.height;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription.remove();
  }, []);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeMenu = () => {
    Animated.spring(menuAnim, { toValue: -300, useNativeDriver: true, tension: 65, friction: 11 }).start(() => setMenuOpen(false));
  };

  const handleSmile = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, smiles: p.smiles + 1 } : p));
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
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleSmile(item.id)}>
          <Text style={styles.actionIcon}>🙂</Text>
          <Text style={styles.actionCount}>{item.smiles}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => { setActiveIndex(posts.findIndex(p => p.id === item.id)); setCommentModal(true); }}>
          <Text style={styles.actionIcon}>💬 Comment</Text>
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
        <TouchableOpacity style={styles.sideBtn} onPress={() => handleSmile(item.id)}>
          <Text style={styles.sideIcon}>🙂</Text>
          <Text style={styles.sideCount}>{item.smiles}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} onPress={() => { setActiveIndex(index); setCommentModal(true); }}>
          <Text style={styles.sideIcon}>💬</Text>
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
          <Image source={require('../../assets/images/Logo v_1.png')} style={styles.logoImage} resizeMode="contain" />
          <TouchableOpacity onPress={openMenu} style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
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

      {menuOpen && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />
      )}

      <Animated.View style={[styles.menu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.menuHeader}>
          <Image source={require('../../assets/images/Logo v_1.png')} style={styles.menuLogo} resizeMode="contain" />
          <TouchableOpacity onPress={closeMenu}>
            <Text style={styles.menuClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuUserRow}>
          <View style={styles.menuAvatar}>
            <Text style={styles.menuAvatarText}>S</Text>
          </View>
          <View>
            <Text style={styles.menuName}>Stephen</Text>
            <Text style={styles.menuHandle}>@stephen</Text>
          </View>
        </View>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(tabs)/profile' as any), 300); }}>
          <Text style={styles.menuItemIcon}>◉</Text>
          <Text style={styles.menuItemText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(tabs)/settings' as any), 300); }}>
          <Text style={styles.menuItemIcon}>⚙</Text>
          <Text style={styles.menuItemText}>Settings</Text>
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.replace('/login'), 300); }}>
          <Text style={[styles.menuItemIcon, styles.menuSignOut]}>↩</Text>
          <Text style={[styles.menuItemText, styles.menuSignOut]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.menuFooter}>
          <Text style={styles.menuFooterText}>No ads · No bots · No noise</Text>
        </View>
      </Animated.View>

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
  header: { paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  logoImage: { width: 120, height: 44 },
  hamburger: { padding: 8, gap: 6, justifyContent: 'center', alignItems: 'flex-end' },
  hamburgerLine: { width: 26, height: 3, backgroundColor: '#FFC300', borderRadius: 3 },
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
  sideIcon: { fontSize: 26 },
  sideCount: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  progressDots: { position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  progressDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  progressDotActive: { backgroundColor: '#FFC300', width: 18 },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  menu: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, backgroundColor: '#111111', zIndex: 20, borderRightWidth: 2, borderRightColor: '#FFC300' },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  menuLogo: { width: 100, height: 40 },
  menuClose: { fontSize: 20, color: '#888888' },
  menuUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 20 },
  menuAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { fontSize: 20, fontWeight: '700', color: '#000000' },
  menuName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  menuHandle: { fontSize: 13, color: '#888888', marginTop: 2 },
  menuDivider: { height: 0.5, backgroundColor: '#333333', marginHorizontal: 20, marginVertical: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  menuItemIcon: { fontSize: 20, color: '#FFC300', width: 24, textAlign: 'center' },
  menuItemText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  menuSignOut: { color: '#FF4444' },
  menuFooter: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  menuFooterText: { fontSize: 11, color: '#444444' },
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