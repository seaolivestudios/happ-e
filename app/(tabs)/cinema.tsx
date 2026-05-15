import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { api } from '../api';
import { getToken, getUser } from '../auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '../components/KeyboardDoneBar';

type CinemaPost = {
  id: string;
  user: string;
  name: string;
  text: string;
  type: 'image' | 'video';
  image: string | null;
  video: string | null;
  avatarUrl: string | null;
  smiles: number;
  commentCount: number;
};

type CinemaComment = {
  id?: string;
  user_id?: string;
  name: string;
  handle: string;
  text: string;
  created_at: string;
};

function normalizePosts(raw: any[]): CinemaPost[] {
  return raw
    .filter((p) => (p.image_url || p.video_url) && p.widescreen === true)
    .map((p) => ({
      id: String(p.id),
      user: p.handle ? `@${p.handle}` : '@user',
      name: p.name ?? 'Unknown',
      text: p.text ?? '',
      type: p.type === 'video' ? 'video' : 'image',
      image: p.image_url ?? null,
      video: p.video_url ?? null,
      avatarUrl: p.avatar_url ?? null,
      smiles: Number(p.smile_count ?? 0),
      commentCount: Number(p.comment_count ?? 0),
    }));
}

export default function CinemaScreen() {
  const { startId } = useLocalSearchParams<{ startId?: string }>();
  const { width, height } = useWindowDimensions();

  const [posts, setPosts] = useState<CinemaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [oriented, setOriented] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Comment drawer
  const [commentVisible, setCommentVisible] = useState(false);
  const [comments, setComments] = useState<CinemaComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; id?: string | number } | null>(null);

  const commentAnim = useRef(new Animated.Value(width)).current;
  const commentOpacity = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<CinemaPost>>(null);

  useFocusEffect(
    useCallback(() => {
      setOriented(false);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).then(() => {
        setOriented(true);
      });
      return () => {
        setOriented(false);
        setCommentVisible(false);
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  useEffect(() => {
    getUser().then(u => { if (u) setCurrentUser(u); });
    void loadPosts();
  }, []);

  // Reset comment anim when closed
  useEffect(() => {
    if (!commentVisible) {
      commentAnim.setValue(width);
      commentOpacity.setValue(0);
    }
  }, [commentVisible, commentAnim, commentOpacity, width]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await api.getTrendingPosts(token ?? '');
      if (res.posts) {
        setPosts(normalizePosts(res.posts));
      }
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  };

  // Scroll to startId after posts load
  useEffect(() => {
    if (!startId || posts.length === 0) return;
    const idx = posts.findIndex((p) => p.id === startId);
    if (idx > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ index: idx, animated: false });
        setCurrentIndex(idx);
      }, 100);
    }
  }, [startId, posts]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems[0]?.index != null) {
        setCurrentIndex(viewableItems[0].index);
        // Close comment drawer when swiping to a new post
        if (commentVisible) closeComments();
      }
    },
    [commentVisible]
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const openComments = useCallback(async (postId: string) => {
    setCommentsLoading(true);
    setComments([]);
    commentAnim.setValue(width);
    commentOpacity.setValue(0);
    setCommentVisible(true);
    requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(commentAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(commentOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    });
    try {
      const result = await api.getPost(postId);
      if (result.success && result.post?.comments) {
        setComments(
          result.post.comments.map((c: any) => ({
            id: c.id ? String(c.id) : undefined,
            user_id: c.user_id ? String(c.user_id) : undefined,
            name: c.name ?? 'User',
            handle: c.handle ?? '',
            text: c.text ?? '',
            created_at: c.created_at ?? '',
          }))
        );
      }
    } catch {
      // non-fatal
    } finally {
      setCommentsLoading(false);
    }
  }, [commentAnim, commentOpacity, width]);

  const closeComments = useCallback(() => {
    Animated.parallel([
      Animated.timing(commentAnim, { toValue: width, duration: 220, useNativeDriver: true }),
      Animated.timing(commentOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setCommentVisible(false));
  }, [commentAnim, commentOpacity, width]);

  const handleSendComment = async () => {
    const currentPost = posts[currentIndex];
    if (!currentPost || !commentText.trim()) return;
    const text = commentText.trim();
    setSending(true);
    const optimistic: CinemaComment = {
      name: currentUser?.name ?? 'You',
      handle: '',
      text,
      created_at: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimistic]);
    setCommentText('');
    try {
      const token = await getToken();
      await api.commentPost(currentPost.id, text, currentUser?.name ?? '', token ?? '');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setComments(prev => prev.filter(c => c !== optimistic));
    } finally {
      setSending(false);
    }
  };

  const cardWidth = width;
  const cardHeight = height;

  if (!oriented || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC300" />
        <Text style={styles.loadingText}>
          {oriented ? 'Loading Cinema…' : 'Preparing Cinema…'}
        </Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={[styles.loadingContainer, { width: cardWidth, height: cardHeight }]}>
        <Pressable style={styles.closeBtn} onPress={() => router.navigate('/(tabs)')}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Ionicons name="film-outline" size={48} color="#FFC300" />
        <Text style={styles.emptyText}>No Cinema posts yet</Text>
        <Text style={styles.emptySub}>
          Widescreen (16:9) photos and videos created with the Cinema option will appear here
        </Text>
      </View>
    );
  }

  return (
    <View style={{ width: cardWidth, height: cardHeight, backgroundColor: '#000000' }}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: cardHeight,
          offset: cardHeight * index,
          index,
        })}
        renderItem={({ item, index }) => {
          const isActive = index === currentIndex;
          return (
            <View style={{ width: cardWidth, height: cardHeight }}>
              {item.type === 'video' && item.video ? (
                <Video
                  source={{ uri: item.video }}
                  style={StyleSheet.absoluteFill}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={isActive}
                  isMuted={isMuted}
                  isLooping
                />
              ) : item.image ? (
                <Image
                  source={{ uri: item.image }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="contain"
                />
              ) : null}

              {/* Gradient overlay */}
              <View style={styles.gradientOverlay} pointerEvents="none" />

              {/* Post info bottom-left */}
              <View style={styles.postInfo} pointerEvents="none">
                <Text style={styles.postName}>{item.name}</Text>
                <Text style={styles.postHandle}>{item.user}</Text>
                {item.text ? (
                  <Text style={styles.postText} numberOfLines={2}>{item.text}</Text>
                ) : null}
              </View>

              {/* Right-side actions */}
              <View style={styles.actions}>
                <Pressable style={styles.actionBtn} hitSlop={10}>
                  <Ionicons name="happy-outline" size={28} color="#FFFFFF" />
                  <Text style={styles.actionCount}>{item.smiles}</Text>
                </Pressable>
                <Pressable
                  style={styles.actionBtn}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    void openComments(item.id);
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
                  <Text style={styles.actionCount}>{item.commentCount}</Text>
                </Pressable>
                {item.type === 'video' && (
                  <Pressable style={styles.actionBtn} onPress={() => setIsMuted(m => !m)} hitSlop={10}>
                    <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={24} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>

              {/* Back button */}
              <Pressable
                style={styles.closeBtn}
                onPress={() => router.navigate('/(tabs)')}
                hitSlop={12}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </Pressable>

              {/* Swipe hint on first card */}
              {index === 0 && posts.length > 1 && (
                <View style={styles.swipeHint} pointerEvents="none">
                  <Ionicons name="chevron-up" size={18} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.swipeHintText}>Swipe up for next</Text>
                </View>
              )}
            </View>
          );
        }}
      />

      {/* Comment drawer — slides in from right */}
      {commentVisible && (
        <Animated.View
          style={[
            styles.drawerContainer,
            { transform: [{ translateX: commentAnim }], opacity: commentOpacity },
          ]}
        >
          {/* Backdrop tap to close */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={closeComments}
          />

          <View style={[styles.drawer, { width: cardWidth * 0.62, height: cardHeight }]}>
            {/* Drawer header */}
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Comments</Text>
              <Pressable onPress={closeComments} hitSlop={12}>
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            {/* Comments list */}
            {commentsLoading ? (
              <View style={styles.commentsLoading}>
                <ActivityIndicator color="#FFC300" />
              </View>
            ) : (
              <ScrollView
                style={styles.commentsList}
                contentContainerStyle={styles.commentsListContent}
                keyboardShouldPersistTaps="handled"
              >
                {comments.length === 0 ? (
                  <Text style={styles.noComments}>No comments yet. Be the first!</Text>
                ) : (
                  comments.map((c, i) => (
                    <View key={c.id ?? i} style={styles.commentRow}>
                      <View style={styles.commentAvatar}>
                        <Text style={styles.commentAvatarText}>
                          {c.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.commentBody}>
                        <Text style={styles.commentName}>{c.name}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            {/* Comment input */}
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment…"
                  placeholderTextColor="#555555"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={300}
                  inputAccessoryViewID={KEYBOARD_DONE_ID}
                />
                <Pressable
                  style={[styles.sendBtn, (!commentText.trim() || sending) && styles.sendBtnDisabled]}
                  onPress={() => void handleSendComment()}
                  disabled={!commentText.trim() || sending}
                  hitSlop={8}
                >
                  <Ionicons name="send" size={18} color="#000000" />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Animated.View>
      )}

      <KeyboardDoneBar />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { fontSize: 14, color: '#888888' },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginTop: 16 },
  emptySub: { fontSize: 13, color: '#888888', textAlign: 'center', paddingHorizontal: 48, marginTop: 8, lineHeight: 20 },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    shadowColor: '#000000',
    shadowOpacity: 1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -20 },
  },
  postInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 72,
    gap: 3,
  },
  postName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  postHandle: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
  postText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 17, marginTop: 3 },
  actions: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    alignItems: 'center',
    gap: 18,
  },
  actionBtn: { alignItems: 'center', gap: 3 },
  actionCount: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 56,
    alignSelf: 'center',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },

  // Comment drawer
  drawerContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 20,
  },
  drawer: {
    backgroundColor: '#0D0D0D',
    borderLeftWidth: 2,
    borderLeftColor: '#FFC300',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  drawerTitle: { fontSize: 15, fontWeight: '700', color: '#FFC300' },
  commentsLoading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  commentsList: { flex: 1 },
  commentsListContent: { padding: 12, gap: 14 },
  noComments: { fontSize: 13, color: '#555555', textAlign: 'center', marginTop: 24 },
  commentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  commentAvatarText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  commentBody: { flex: 1, gap: 2 },
  commentName: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  commentText: { fontSize: 13, color: '#CCCCCC', lineHeight: 18 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 80,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
