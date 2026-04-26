import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

const screen = Dimensions.get('window');
const cardWidth = screen.width - 24;
const imageHeight = cardWidth * (5 / 4);
const DRAWER_HIDDEN = screen.width * 2;
const SPARK_HEIGHT = 0;
const CARD_HEIGHT = imageHeight + 140;

export default function HomeScreen() {
  const [dimensions, setDimensions] = useState({ width: screen.width, height: screen.height });
  const [posts, setPosts] = useState<any[]>([]);
  const [smiledPosts, setSmiledPosts] = useState<Set<string>>(new Set());
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentPost, setCommentPost] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState('');
  const menuAnim = useRef(new Animated.Value(-300)).current;
  const commentAnim = useRef(new Animated.Value(DRAWER_HIDDEN)).current;
  const commentOpacity = useRef(new Animated.Value(0)).current;
  const landscapeScrollRef = useRef<ScrollView>(null);
  const portraitScrollRef = useRef<ScrollView>(null);
  const isLandscape = dimensions.width > dimensions.height;
  const widescreenPosts = posts.filter(p => p.widescreen);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const token = await getToken();
        const result = await api.getPosts(token || '');
        if (result.success && result.posts.length > 0) {
          const formatted = result.posts.map((p: any) => ({
            id: String(p.id),
            user: p.handle,
            name: p.name,
            text: p.text,
            type: p.type,
            image: p.image_url,
            video: p.video_url,
            widescreen: p.widescreen,
            smiles: parseInt(p.smile_count) || 0,
            comments: [],
            author: p.author_quote,
          }));
          setPosts(formatted);
          if (formatted.length > 0) setCurrentPostId(formatted[0].id);
        }
      } catch (err) {
        console.log('Could not load posts:', err);
      }
    };
    loadPosts();
  }, []);

  useEffect(() => {
    if (isLandscape) {
      const index = widescreenPosts.findIndex(p => p.id === currentPostId);
      const targetIndex = index >= 0 ? index : 0;
      setTimeout(() => {
        landscapeScrollRef.current?.scrollTo({ y: targetIndex * dimensions.height, animated: false });
      }, 50);
    } else {
      const index = posts.findIndex(p => p.id === currentPostId);
      const targetIndex = index >= 0 ? index : 0;
      const scrollY = SPARK_HEIGHT + (targetIndex * CARD_HEIGHT);
      setTimeout(() => {
        portraitScrollRef.current?.scrollTo({ y: scrollY, animated: false });
      }, 50);
    }
  }, [isLandscape]);

  const openMenu = () => {
    setMenuOpen(true);
    Animated.spring(menuAnim, { toValue: 0, useNativeDriver: true, tension: 65, friction: 11 }).start();
  };

  const closeMenu = () => {
    Animated.spring(menuAnim, { toValue: -300, useNativeDriver: true, tension: 65, friction: 11 }).start(() => setMenuOpen(false));
  };

  const openComments = (post: any) => {
    setCommentPost(post);
    commentAnim.setValue(DRAWER_HIDDEN);
    commentOpacity.setValue(0);
    setCommentVisible(true);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(commentAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(commentOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });
  };

  const closeComments = () => {
    Animated.parallel([
      Animated.timing(commentAnim, { toValue: DRAWER_HIDDEN, duration: 250, useNativeDriver: true }),
      Animated.timing(commentOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setCommentVisible(false);
      setCommentPost(null);
      setNewComment('');
    });
  };

  const handleSmile = async (id: string) => {
    const alreadySmiled = smiledPosts.has(id);
    if (alreadySmiled) {
      setSmiledPosts(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setPosts(prev => prev.map(p => p.id === id ? { ...p, smiles: Math.max(0, p.smiles - 1) } : p));
    } else {
      setSmiledPosts(prev => new Set([...prev, id]));
      setPosts(prev => prev.map(p => p.id === id ? { ...p, smiles: p.smiles + 1 } : p));
      try {
        const token = await getToken();
        await api.smilePost(id, token || '');
      } catch (err) {
        console.log('Smile sync error:', err);
      }
    }
  };

  const handleComment = async (id: string, text: string) => {
    if (!text || !text.trim()) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, { user: '@you', text }] } : p));
    setNewComment('');
    try {
      const token = await getToken();
      await api.commentPost(id, text, '@you', token || '');
    } catch (err) {
      console.log('Comment sync error:', err);
    }
  };

  const handlePortraitScroll = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const adjustedOffset = Math.max(0, offsetY - SPARK_HEIGHT);
    const index = Math.round(adjustedOffset / CARD_HEIGHT);
    const clampedIndex = Math.min(index, posts.length - 1);
    if (posts[clampedIndex]) setCurrentPostId(posts[clampedIndex].id);
  };

  const ImageCard = ({ item }: { item: any }) => {
    const [loaded, setLoaded] = useState(false);
    return (
      <View style={{ width: '100%', height: imageHeight, backgroundColor: '#F0F0F0' }}>
        {!loaded && (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator color="#FFC300" />
          </View>
        )}
        <Image
          source={{ uri: item.image }}
          style={[styles.cardImage, { opacity: loaded ? 1 : 0 }]}
          resizeMode="cover"
          onLoad={() => setLoaded(true)}
        />
      </View>
    );
  };

  const renderActions = (item: any, dark = false) => {
    const smiled = smiledPosts.has(item.id);
    return (
      <View style={[styles.actions, dark && styles.actionsDark]}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleSmile(item.id)}>
          <Ionicons
            name={smiled ? 'happy' : 'happy-outline'}
            size={22}
            color={smiled ? '#FFC300' : (dark ? '#FFFFFF' : '#333333')}
          />
          <Text style={[styles.actionCount, dark && styles.actionCountDark, smiled && styles.actionCountSmiled]}>
            {item.smiles}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openComments(item)}>
          <Ionicons name="chatbubble-outline" size={22} color={dark ? '#FFFFFF' : '#333333'} />
          <Text style={[styles.actionCount, dark && styles.actionCountDark]}>{item.comments.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Ionicons name="arrow-redo-outline" size={22} color={dark ? '#FFFFFF' : '#333333'} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderVerticalCard = (item: any) => {
    if (item.type === 'inspire') {
      return (
        <View key={item.id} style={styles.card}>
          <View style={styles.inspireInner}>
            <Text style={styles.inspireLabel}>✦ Inspire</Text>
            <Text style={styles.inspireText}>{item.text}</Text>
            {item.author && <Text style={styles.inspireAuthor}>— {item.author}</Text>}
          </View>
          {renderActions(item, true)}
        </View>
      );
    }
    if (item.type === 'video') {
      return (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(item.name || item.user || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.cardUser}>{item.name}</Text>
              <Text style={styles.cardHandle}>{item.user}</Text>
            </View>
            {item.widescreen && (
              <View style={styles.widescreenBadge}>
                <Image source={require('../../assets/images/arrows-left-right.png')} style={styles.widescreenIcon} />
              </View>
            )}
          </View>
          <Video
            source={{ uri: item.video }}
            style={styles.cardVideo}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping
            useNativeControls
          />
          <Text style={styles.cardText}>{item.text}</Text>
          {renderActions(item)}
        </View>
      );
    }
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(item.name || item.user || 'U').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.cardUser}>{item.name}</Text>
            <Text style={styles.cardHandle}>{item.user}</Text>
          </View>
          {item.widescreen && (
            <View style={styles.widescreenBadge}>
              <Image source={require('../../assets/images/arrows-left-right.png')} style={styles.widescreenIcon} />
            </View>
          )}
        </View>
        {item.image && <ImageCard item={item} />}
        <Text style={styles.cardText}>{item.text}</Text>
        {renderActions(item)}
      </View>
    );
  };

  const renderHorizontalCard = (item: any) => {
    const smiled = smiledPosts.has(item.id);
    return (
      <View key={item.id} style={[styles.horizontalCard, { width: dimensions.width, height: dimensions.height }]}>
        {item.type === 'video' ? (
          <Video
            source={{ uri: item.video }}
            style={styles.horizontalMedia}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping
            useNativeControls
          />
        ) : item.image ? (
          <Image source={{ uri: item.image }} style={styles.horizontalMedia} resizeMode="cover" />
        ) : (
          <View style={styles.horizontalInspire}>
            <Text style={styles.horizontalInspireLabel}>✦ Inspire</Text>
            <Text style={styles.horizontalInspireText}>{item.text}</Text>
            {item.author && <Text style={styles.horizontalInspireAuthor}>— {item.author}</Text>}
          </View>
        )}
        {(item.image || item.video) && (
          <View style={styles.horizontalBottom}>
            <Text style={styles.horizontalUser}>{item.name || item.user}</Text>
            <Text style={styles.horizontalText}>{item.text}</Text>
          </View>
        )}
        <View style={styles.sideActions}>
          <TouchableOpacity style={styles.sideBtn} onPress={() => handleSmile(item.id)}>
            <Ionicons name={smiled ? 'happy' : 'happy-outline'} size={28} color={smiled ? '#FFC300' : '#FFFFFF'} />
            <Text style={styles.sideCount}>{item.smiles}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={() => openComments(item)}>
            <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
            <Text style={styles.sideCount}>{item.comments.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn}>
            <Ionicons name="arrow-redo-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!isLandscape && (
        <View style={styles.header}>
          <TouchableOpacity onPress={openMenu} style={styles.hamburger}>
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
          <Image source={require('../../assets/images/Logo v_1.png')} style={styles.logoImage} resizeMode="contain" />
          <TouchableOpacity style={styles.smilesBtn} onPress={() => router.push('/(tabs)/notifications' as any)}>
            <Ionicons name="happy-outline" size={26} color="#FFC300" />
          </TouchableOpacity>
        </View>
      )}

      {isLandscape ? (
        <ScrollView
          ref={landscapeScrollRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={dimensions.height}
          snapToAlignment="start"
        >
          {widescreenPosts.map(item => renderHorizontalCard(item))}
        </ScrollView>
      ) : (
        <ScrollView
          ref={portraitScrollRef}
          style={styles.feed}
          onScroll={handlePortraitScroll}
          scrollEventThrottle={16}
        >
          {posts.map(renderVerticalCard)}
        </ScrollView>
      )}

      {menuOpen && (
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={closeMenu} />
      )}

      {menuOpen && (
<Animated.View style={[styles.menu, { transform: [{ translateX: menuAnim }] }]}>
        <View style={styles.menuHeader}>
          <Image source={require('../../assets/images/Logo v_1.png')} style={styles.menuLogo} resizeMode="contain" />
          <TouchableOpacity onPress={closeMenu}>
            <Ionicons name="close" size={24} color="#888888" />
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
          <Ionicons name="person-outline" size={22} color="#FFC300" />
          <Text style={styles.menuItemText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { closeMenu(); setTimeout(() => router.push('/(tabs)/settings' as any), 300); }}>
          <Ionicons name="settings-outline" size={22} color="#FFC300" />
          <Text style={styles.menuItemText}>Settings</Text>
        </TouchableOpacity>
        <View style={styles.menuDivider} />
        <TouchableOpacity style={styles.menuItem} onPress={async () => { closeMenu(); const { clearSession } = await import('../auth'); await clearSession(); setTimeout(() => router.replace('/login'), 300); }}>
          <Ionicons name="log-out-outline" size={22} color="#FF4444" />
          <Text style={[styles.menuItemText, styles.menuSignOut]}>Sign Out</Text>
        </TouchableOpacity>
        <View style={styles.menuFooter}>
          <Text style={styles.menuFooterText}>No ads · No bots · No noise</Text>
        </View>
      </Animated.View>)}

      {commentVisible && (
        <>
          <Animated.View style={[styles.commentOverlay, { opacity: commentOpacity }]} pointerEvents="auto">
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeComments} />
          </Animated.View>
          <Animated.View style={[styles.commentDrawer, { transform: [{ translateX: commentAnim }] }]}>
            <View style={styles.commentDrawerHeader}>
              <Text style={styles.commentDrawerTitle}>Comments</Text>
              <TouchableOpacity onPress={closeComments}>
                <Ionicons name="close" size={24} color="#888888" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.commentList}>
              {commentPost && posts.find(p => p.id === commentPost.id)?.comments.length === 0 && (
                <Text style={styles.noComments}>No comments yet. Be the first.</Text>
              )}
              {commentPost && posts.find(p => p.id === commentPost.id)?.comments.map((c: any, i: number) => (
                <View key={i} style={styles.commentRow}>
                  <Text style={styles.commentUser}>{c.user}</Text>
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))}
            </ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a kind comment..."
                  placeholderTextColor="#888888"
                  value={newComment}
                  onChangeText={setNewComment}
                  returnKeyType="send"
                  onSubmitEditing={() => { if (commentPost) handleComment(commentPost.id, newComment); }}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={() => { if (commentPost) handleComment(commentPost.id, newComment); }}>
                  <Ionicons name="send" size={18} color="#000000" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 60, paddingBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  hamburger: { width: 44, padding: 8, gap: 6, justifyContent: 'center', alignItems: 'flex-start' },
  hamburgerLine: { width: 26, height: 3, backgroundColor: '#FFC300', borderRadius: 3 },
  logoImage: { width: 120, height: 44 },
  smilesBtn: { width: 44, padding: 8, alignItems: 'flex-end' },
  feed: { backgroundColor: '#F7F7F7' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, marginBottom: 12, marginHorizontal: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  userInfo: { flex: 1 },
  cardUser: { fontSize: 13, fontWeight: '700', color: '#000000' },
  cardHandle: { fontSize: 11, color: '#888888', marginTop: 1 },
  widescreenBadge: { backgroundColor: '#000000', borderRadius: 6, padding: 6 },
  widescreenIcon: { width: 18, height: 18, tintColor: '#FFC300' },
  cardImage: { width: '100%', height: imageHeight },
  cardVideo: { width: '100%', height: imageHeight },
  imagePlaceholder: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F0F0' },
  cardText: { fontSize: 14, color: '#000000', lineHeight: 20, padding: 12, paddingBottom: 4 },
  inspireInner: { backgroundColor: '#000000', height: imageHeight, justifyContent: 'center', alignItems: 'center', padding: 30 },
  inspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', marginBottom: 16, letterSpacing: 2 },
  inspireText: { fontSize: 18, color: '#FFFFFF', lineHeight: 28, fontStyle: 'italic', textAlign: 'center' },
  inspireAuthor: { fontSize: 13, color: '#FFC300', marginTop: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 20, borderTopWidth: 0.5, borderTopColor: '#E0E0E0', backgroundColor: '#FFFFFF' },
  actionsDark: { backgroundColor: '#000000', borderTopColor: '#222222' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 13, color: '#888888' },
  actionCountDark: { color: '#FFFFFF' },
  actionCountSmiled: { color: '#FFC300' },
  horizontalCard: { backgroundColor: '#000000', justifyContent: 'flex-end', overflow: 'hidden' },
  horizontalMedia: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  horizontalBottom: { padding: 24, paddingBottom: 40, paddingRight: 90, backgroundColor: 'rgba(0,0,0,0.55)' },
  horizontalUser: { fontSize: 13, fontWeight: '700', color: '#FFC300', marginBottom: 6, letterSpacing: 1 },
  horizontalText: { fontSize: 20, lineHeight: 28, color: '#FFFFFF', fontWeight: '600' },
  horizontalInspire: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 60, backgroundColor: '#000000' },
  horizontalInspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', marginBottom: 20, letterSpacing: 2 },
  horizontalInspireText: { fontSize: 26, lineHeight: 38, color: '#FFFFFF', fontStyle: 'italic', textAlign: 'center' },
  horizontalInspireAuthor: { fontSize: 15, color: '#FFC300', marginTop: 20, fontWeight: '600' },
  sideActions: { position: 'absolute', right: 16, bottom: 60, alignItems: 'center', gap: 24 },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideCount: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
  menu: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 280, backgroundColor: '#111111', zIndex: 20, borderRightWidth: 2, borderRightColor: '#FFC300' },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  menuLogo: { width: 100, height: 40 },
  menuUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 20 },
  menuAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  menuAvatarText: { fontSize: 20, fontWeight: '700', color: '#000000' },
  menuName: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  menuHandle: { fontSize: 13, color: '#888888', marginTop: 2 },
  menuDivider: { height: 0.5, backgroundColor: '#333333', marginHorizontal: 20, marginVertical: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
  menuItemText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  menuSignOut: { color: '#FF4444' },
  menuFooter: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  menuFooterText: { fontSize: 11, color: '#444444' },
  commentOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 10 },
  commentDrawer: { position: 'absolute', top: 0, right: 0, bottom: 0, width: '82%', backgroundColor: 'rgba(15,15,15,0.97)', zIndex: 20, borderLeftWidth: 2, borderLeftColor: '#FFC300', padding: 20 },
  commentDrawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, marginBottom: 16 },
  commentDrawerTitle: { fontSize: 18, fontWeight: '700', color: '#FFC300' },
  commentList: { flex: 1 },
  noComments: { fontSize: 13, color: '#888888', fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
  commentRow: { flexDirection: 'row', gap: 8, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#222222' },
  commentUser: { fontSize: 12, fontWeight: '700', color: '#FFC300' },
  commentText: { fontSize: 13, color: '#FFFFFF', flex: 1, lineHeight: 18 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#333333', paddingBottom: 20 },
  commentInput: { flex: 1, backgroundColor: '#222222', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#FFFFFF', borderWidth: 0.5, borderColor: '#FFC300' },
  sendBtn: { backgroundColor: '#FFC300', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});