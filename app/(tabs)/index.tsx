// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewToken,
} from 'react-native';
import { api } from '../api';
import { clearSession, getToken, getUser } from '../auth';

type PostType = 'image' | 'video' | 'inspire';

type Comment = {
  user: string;
  text: string;
};

type ApiPost = {
  id: string | number;
  user_id?: string | number | null;
  handle?: string | null;
  name?: string | null;
  text?: string | null;
  type?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  widescreen?: boolean | null;
  smile_count?: string | number | null;
  comment_count?: string | number | null;
  author_quote?: string | null;
  category?: string | null;
  created_at?: string | null;
  avatar_url?: string | null;
};

type Post = {
  id: string;
  user: string;
  name: string;
  text: string;
  type: PostType;
  image: string | null;
  video: string | null;
  widescreen: boolean;
  smiles: number;
  comments: Comment[];
  commentCount: number;
  author: string | null;
  category: string | null;
  createdAt: string;
  avatarUrl: string | null;
  userId: string;
};

const HEADER_HEIGHT = 75;
const PORTRAIT_CARD_HORIZONTAL_MARGIN = 12;
const MENU_WIDTH = 280;
const COMMENT_DRAWER_WIDTH_PERCENT = '82%';

function normalizePost(raw: ApiPost): Post {
  const type: PostType =
    raw.type === 'video' || raw.type === 'inspire' ? raw.type : 'image';

  return {
    id: String(raw.id),
    user: raw.handle ?? '',
    name: raw.name ?? '',
    text: raw.text ?? '',
    type,
    image: raw.image_url ?? null,
    video: raw.video_url ?? null,
    widescreen: Boolean(raw.widescreen),
    smiles: Number.parseInt(String(raw.smile_count ?? 0), 10) || 0,
    comments: [],
    commentCount: Number.parseInt(String(raw.comment_count ?? 0), 10) || 0,
    author: raw.author_quote ?? null,
    category: raw.category ?? null,
    createdAt: raw.created_at ?? '',
    avatarUrl: raw.avatar_url ?? null,
    userId: String(raw.user_id ?? ''),
  };
}

const SYSTEM_HANDLES = new Set(['happe', 'happ_e', 'happ-e', 'admin', 'system']);

function isSystemPost(post: Post): boolean {
  return post.type === 'inspire' || SYSTEM_HANDLES.has(post.user.toLowerCase());
}

function getDisplayName(post: Post): string {
  return post.name || post.user || 'User';
}

function getAvatarLetter(post: Post): string {
  return getDisplayName(post).charAt(0).toUpperCase() || 'U';
}

function SystemAvatar() {
  return (
    <View style={styles.systemAvatarRing}>
      <Image
        source={require('../../assets/images/Logo v_1.png')}
        style={styles.systemAvatarLogo}
        resizeMode="contain"
      />
    </View>
  );
}

function ImageCard({ uri }: { uri: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={styles.imageCardContainer}>
      {!loaded && (
        <View style={styles.imagePlaceholder}>
          <ActivityIndicator color="#FFC300" />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[styles.cardImage, { opacity: loaded ? 1 : 0 }]}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const commentDrawerHiddenX = width;
  const [feedHeight, setFeedHeight] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [smiledPosts, setSmiledPosts] = useState<Set<string>>(new Set());
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const [currentPostId, setCurrentPostId] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ name?: string; handle?: string; email?: string; avatar_url?: string } | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [feedMode, setFeedMode] = useState<'all' | 'following' | 'foryou' | 'trending'>('all');
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const newestCreatedAtRef = useRef<string>('');
  const nextCursorRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const commentAnim = useRef(new Animated.Value(commentDrawerHiddenX)).current;
  const commentOpacity = useRef(new Animated.Value(0)).current;
  const portraitScrollRef = useRef<FlatList<Post>>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  const commentPost = useMemo(
    () => posts.find((post) => post.id === commentPostId) ?? null,
    [posts, commentPostId]
  );

  useEffect(() => {
    if (!commentVisible) {
      commentAnim.setValue(commentDrawerHiddenX);
    }
  }, [commentVisible, commentAnim, commentDrawerHiddenX]);

  useEffect(() => {
    const pollUnread = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await api.getUnreadMessageCount(token);
        if (res.success) setUnreadMessages(res.count ?? 0);
      } catch {
        // non-fatal
      }
    };
    void pollUnread();
    const interval = setInterval(() => { void pollUnread(); }, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadUser() {
      const user = await getUser();
      if (user) setCurrentUser(user);
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch('https://happe-backend-production.up.railway.app/profile/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.user) {
          setCurrentUser(prev => ({ ...prev, ...data.user }));
        }
      } catch {
        // non-fatal
      }
    }
    void loadUser();
  }, []);

  const loadPosts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoadingPosts(true);
    setFeedError(false);
    nextCursorRef.current = null;
    try {
      const token = await getToken();
      const result = feedMode === 'following'
        ? await api.getFollowingPosts(token || '')
        : feedMode === 'foryou'
          ? await api.getPostsForYou(token || '')
          : feedMode === 'trending'
            ? await api.getTrendingPosts(token || '')
            : await api.getPosts(token || '');
      const nextPosts: Post[] = Array.isArray(result?.posts)
        ? result.posts.map((raw: ApiPost) => normalizePost(raw))
        : [];
      setPosts(nextPosts);
      setHasMore(result?.has_more ?? false);
      nextCursorRef.current = result?.next_cursor ?? null;
      if (nextPosts.length > 0) {
        setCurrentPostId((prev) => prev || nextPosts[0].id);
        newestCreatedAtRef.current = nextPosts[0].createdAt;
      }
      if (isRefresh) setPendingPosts([]);
    } catch {
      setFeedError(true);
    } finally {
      setIsLoadingPosts(false);
      setRefreshing(false);
    }
  }, [feedMode]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursorRef.current || feedMode === 'trending') return;
    setLoadingMore(true);
    try {
      const token = await getToken();
      const cursor = nextCursorRef.current;
      const result = feedMode === 'following'
        ? await api.getFollowingPosts(token || '', cursor)
        : feedMode === 'foryou'
          ? await api.getPostsForYou(token || '', cursor)
          : await api.getPosts(token || '', cursor);
      const morePosts: Post[] = Array.isArray(result?.posts)
        ? result.posts.map((raw: ApiPost) => normalizePost(raw))
        : [];
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        return [...prev, ...morePosts.filter(p => !existingIds.has(p.id))];
      });
      setHasMore(result?.has_more ?? false);
      nextCursorRef.current = result?.next_cursor ?? null;
    } catch {
      // non-fatal
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, feedMode]);

  useEffect(() => { void loadPosts(); }, [feedMode]);

  useEffect(() => {
    if (isLoadingPosts) return;

    const poll = async () => {
      const since = newestCreatedAtRef.current;
      if (!since) return;
      try {
        const token = await getToken();
        const result = await api.getNewPosts(token || '', since);
        const fresh: Post[] = Array.isArray(result?.posts)
          ? result.posts.map((raw: ApiPost) => normalizePost(raw))
          : [];
        if (fresh.length > 0) {
          newestCreatedAtRef.current = fresh[0].createdAt;
          setPendingPosts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const unique = fresh.filter(p => !existingIds.has(p.id));
            return unique.length > 0 ? [...unique, ...prev] : prev;
          });
        }
      } catch {
        // silent — polling failure is non-fatal
      }
    };

    pollIntervalRef.current = setInterval(() => { void poll(); }, 30_000);
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isLoadingPosts]);

  const openMenu = useCallback(() => {
    menuAnim.setValue(-MENU_WIDTH);
    setMenuMounted(true);
    setMenuOpen(true);
    requestAnimationFrame(() => {
      Animated.spring(menuAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    });
  }, [menuAnim]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    Animated.spring(menuAnim, {
      toValue: -MENU_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start(() => setMenuMounted(false));
  }, [menuAnim]);

  const navigateFromMenu = useCallback((path: Parameters<typeof router.push>[0]) => {
    closeMenu();
    requestAnimationFrame(() => {
      router.push(path);
    });
  }, [closeMenu]);

  const handleSignOut = useCallback(async () => {
    try {
      closeMenu();
      await clearSession();
      router.replace('/login');
    } catch (error) {
      console.log('Sign out error:', error);
    }
  }, []);

  const openComments = useCallback(
    (postId: string) => {
      setCommentPostId(postId);
      setCommentVisible(true);
      commentAnim.setValue(commentDrawerHiddenX);
      commentOpacity.setValue(0);

      // Load real comments from API
      void api.getPost(postId).then(result => {
        if (result?.post?.comments) {
          setPosts(prev => prev.map(p =>
            p.id === postId
              ? { ...p, comments: result.post.comments.map((c: any) => ({ user: c.handle || c.name, text: c.text })) }
              : p
          ));
        }
      });

      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(commentAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(commentOpacity, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]).start();
      });
    },
    [commentAnim, commentDrawerHiddenX, commentOpacity]
  );

  const closeComments = useCallback(() => {
    Animated.parallel([
      Animated.timing(commentAnim, {
        toValue: commentDrawerHiddenX,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(commentOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCommentVisible(false);
      setCommentPostId(null);
      setNewComment('');
    });
  }, [commentAnim, commentDrawerHiddenX, commentOpacity]);

  const handleSmile = useCallback(
    async (id: string) => {
      const alreadySmiled = smiledPosts.has(id);

      if (alreadySmiled) {
        setSmiledPosts((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        setPosts((prev) =>
          prev.map((post) =>
            post.id === id
              ? { ...post, smiles: Math.max(0, post.smiles - 1) }
              : post
          )
        );

        return;
      }

      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSmiledPosts((prev) => new Set(prev).add(id));
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, smiles: post.smiles + 1 } : post
        )
      );

      try {
        const token = await getToken();
        await api.smilePost(id, token || '');
      } catch (error) {
        console.log('Smile sync error:', error);

        setSmiledPosts((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });

        setPosts((prev) =>
          prev.map((post) =>
            post.id === id
              ? { ...post, smiles: Math.max(0, post.smiles - 1) }
              : post
          )
        );
      }
    },
    [smiledPosts]
  );

  const handleComment = useCallback(
    async (id: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const myHandle = currentUser?.handle || '@me';
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                comments: [...post.comments, { user: myHandle, text: trimmed }],
              }
            : post
        )
      );
      setNewComment('');

      try {
        const token = await getToken();
        await api.commentPost(id, trimmed, myHandle, token || '');
      } catch (error) {
        console.log('Comment sync error:', error);

        setPosts((prev) =>
          prev.map((post) =>
            post.id === id
              ? {
                  ...post,
                  comments: post.comments.filter(
                    (comment, index, arr) =>
                      !(
                        index === arr.length - 1 &&
                        comment.user === myHandle &&
                        comment.text === trimmed
                      )
                  ),
                }
              : post
          )
        );
      }
    },
    []
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].item) {
        setCurrentPostId((viewableItems[0].item as Post).id);
      }
    },
    []
  );

  const renderActions = useCallback(
    (post: Post, dark = false) => {
      const smiled = smiledPosts.has(post.id);

      return (
        <View style={[styles.actions, dark && styles.actionsDark]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Smile post from ${getDisplayName(post)}`}
            hitSlop={10}
            style={styles.actionBtn}
            onPress={() => {
              void handleSmile(post.id);
            }}
          >
            <Ionicons
              name={smiled ? 'happy' : 'happy-outline'}
              size={22}
              color={smiled ? '#FFC300' : dark ? '#FFFFFF' : '#333333'}
            />
            <Text
              style={[
                styles.actionCount,
                dark && styles.actionCountDark,
                smiled && styles.actionCountSmiled,
              ]}
            >
              {post.smiles}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open comments for ${getDisplayName(post)}`}
            hitSlop={10}
            style={styles.actionBtn}
            onPress={() => openComments(post.id)}
          >
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={dark ? '#FFFFFF' : '#333333'}
            />
            <Text style={[styles.actionCount, dark && styles.actionCountDark]}>
              {post.commentCount + post.comments.length}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Share post from ${getDisplayName(post)}`}
            hitSlop={10}
            style={styles.actionBtn}
            onPress={() => {
              void Share.share({
                message: `Check out this post on Happ-E!`,
                url: `happyapp://post/${post.id}`,
              });
            }}
          >
            <Ionicons
              name="share-outline"
              size={22}
              color={dark ? '#FFFFFF' : '#333333'}
            />
          </Pressable>
        </View>
      );
    },
    [handleSmile, openComments, smiledPosts]
  );

  const renderVerticalCard = useCallback(
    (post: Post) => {
      const cardHeight = feedHeight > 0 ? { height: feedHeight } : { flex: 1 };

      if (post.type === 'inspire') {
        return (
          <View key={post.id} style={[styles.card, cardHeight]}>
            <Pressable style={styles.cardPressable} onPress={() => router.push(`/post/${post.id}` as any)}>
              <View style={[styles.cardHeader, styles.cardHeaderSystem]}>
                <SystemAvatar />
                <View style={styles.userInfo}>
                  <View style={styles.systemNameRow}>
                    <Text style={styles.systemName}>Happ-E</Text>
                    <View style={styles.systemBadge}>
                      <Text style={styles.systemBadgeText}>✦ Official</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.inspireInner}>
                <Text style={styles.inspireText}>{post.text}</Text>
                {post.author ? (
                  <Text style={styles.inspireAuthor}>— {post.author}</Text>
                ) : null}
              </View>
            </Pressable>
            {renderActions(post, true)}
          </View>
        );
      }

      const system = isSystemPost(post);

      return (
        <View key={post.id} style={[styles.card, cardHeight]}>
          <Pressable style={styles.cardPressable} onPress={() => router.push(`/post/${post.id}` as any)}>
            <View style={[styles.cardHeader, system && styles.cardHeaderSystem]}>
              <Pressable onPress={() => !system && post.userId && router.push(`/user/${post.userId}` as any)}>
                {system ? (
                  <SystemAvatar />
                ) : post.avatarUrl ? (
                  <Image source={{ uri: post.avatarUrl }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getAvatarLetter(post)}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={styles.userInfo} onPress={() => !system && post.userId && router.push(`/user/${post.userId}` as any)}>
                {system ? (
                  <View style={styles.systemNameRow}>
                    <Text style={styles.systemName}>Happ-E</Text>
                    <View style={styles.systemBadge}>
                      <Text style={styles.systemBadgeText}>✦ Official</Text>
                    </View>
                  </View>
                ) : (
                  <>
                    <Text style={styles.cardUser}>{post.name || 'Unknown'}</Text>
                    <Text style={styles.cardHandle}>{post.user}</Text>
                  </>
                )}
              </Pressable>
            </View>

            {post.type === 'video' && post.video ? (
              <View style={styles.videoContainer}>
                {currentPostId === post.id ? (
                  <Video
                    source={{ uri: post.video }}
                    style={styles.cardMedia}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isMuted={isMuted}
                    isLooping
                  />
                ) : (
                  <View style={[styles.cardMedia, styles.videoPlaceholder]}>
                    <Ionicons name="play-circle-outline" size={44} color="rgba(255,255,255,0.4)" />
                  </View>
                )}
                {currentPostId === post.id && (
                  <Pressable
                    style={styles.muteBtn}
                    onPress={() => setIsMuted(m => !m)}
                    hitSlop={10}
                  >
                    <Ionicons
                      name={isMuted ? 'volume-mute' : 'volume-high'}
                      size={16}
                      color="#FFFFFF"
                    />
                  </Pressable>
                )}
              </View>
            ) : post.image ? (
              <ImageCard uri={post.image} />
            ) : null}

            {post.text ? (
              <Text style={styles.cardText} numberOfLines={2}>{post.text}</Text>
            ) : null}
          </Pressable>
          {renderActions(post)}
        </View>
      );
    },
    [feedHeight, isMuted, currentPostId, renderActions]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open menu"
            hitSlop={10}
            onPress={openMenu}
            style={styles.hamburger}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            {unreadMessages > 0 && (
              <View style={styles.hamburgerBadge}>
                <Text style={styles.hamburgerBadgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
              </View>
            )}
          </Pressable>

          <Image
            source={require('../../assets/images/Logo v_1.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            hitSlop={10}
            style={styles.smilesBtn}
            onPress={() => router.push('/(tabs)/notifications')}
          >
            <Ionicons name="happy-outline" size={26} color="#FFC300" />
          </Pressable>
        </View>

      <View style={styles.feedTabs}>
        {(['all', 'following', 'foryou', 'trending'] as const).map((mode) => (
          <Pressable
            key={mode}
            style={[styles.feedTab, feedMode === mode && styles.feedTabActive]}
            onPress={() => { if (feedMode !== mode) { setPosts([]); setPendingPosts([]); setHasMore(true); setFeedMode(mode); } }}
          >
            <Text style={[styles.feedTabText, feedMode === mode && styles.feedTabTextActive]}>
              {mode === 'all' ? 'All' : mode === 'following' ? 'Following' : mode === 'foryou' ? 'For You' : '✦ Trending'}
            </Text>
          </Pressable>
        ))}
      </View>

      {pendingPosts.length > 0 && (
        <Pressable
          style={styles.newPostsBanner}
          onPress={() => {
            setPosts(prev => [...pendingPosts, ...prev]);
            setPendingPosts([]);
            portraitScrollRef.current?.scrollToIndex({ index: 0, animated: true });
          }}
        >
          <Text style={styles.newPostsBannerText}>
            {pendingPosts.length === 1 ? '1 new post — tap to view' : `${pendingPosts.length} new posts — tap to view`}
          </Text>
        </Pressable>
      )}

      {isLoadingPosts ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#FFC300" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : feedError ? (
        <View style={styles.errorState}>
          <Text style={styles.errorStateIcon}>⚡</Text>
          <Text style={styles.errorStateText}>Couldn't load posts</Text>
          <Text style={styles.errorStateSub}>Check your connection and try again</Text>
          <Pressable style={styles.retryBtn} onPress={() => void loadPosts()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.errorState}>
          <Text style={styles.errorStateIcon}>✦</Text>
          <Text style={styles.errorStateText}>Nothing here yet</Text>
          <Text style={styles.errorStateSub}>{feedMode === 'following' ? 'Follow people to see their posts here' : 'Be the first to share something'}</Text>
        </View>
      ) : (
        <FlatList
          ref={portraitScrollRef}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderVerticalCard(item)}
          style={styles.feed}
          contentContainerStyle={styles.feedContent}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadPosts(true)}
              tintColor="#FFC300"
            />
          }
          onEndReached={() => void loadMorePosts()}
          onEndReachedThreshold={0.3}
          ListFooterComponent={loadingMore ? (
            <View style={styles.loadMoreFooter}>
              <ActivityIndicator color="#FFC300" />
            </View>
          ) : null}
          onLayout={e => {
            const h = e.nativeEvent.layout.height;
            if (h > 0) setFeedHeight(h);
          }}
        />
      )}

      {menuMounted ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            style={styles.menuOverlay}
            onPress={closeMenu}
          />

          <Animated.View
            style={[styles.menu, { transform: [{ translateX: menuAnim }] }]}
          >
            <View style={styles.menuHeader}>
              <Image
                source={require('../../assets/images/Logo v_1.png')}
                style={styles.menuLogo}
                resizeMode="contain"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close menu"
                hitSlop={10}
                onPress={closeMenu}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </Pressable>
            </View>

            <View style={styles.menuUserRow}>
              {currentUser?.avatar_url ? (
                <Image source={{ uri: currentUser.avatar_url }} style={styles.menuAvatarImg} />
              ) : (
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>
                    {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
                  </Text>
                </View>
              )}
              <View>
                <Text style={styles.menuName}>{currentUser?.name ?? 'User'}</Text>
                <Text style={styles.menuHandle}>{currentUser?.handle ? `@${currentUser.handle}` : currentUser?.email ?? ''}</Text>
              </View>
            </View>

            <View style={styles.menuDivider} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open messages"
              style={styles.menuItem}
              onPress={() => { setUnreadMessages(0); navigateFromMenu('/messages' as any); }}
            >
              <Ionicons name="chatbubble-outline" size={22} color="#FFC300" />
              <Text style={styles.menuItemText}>Messages</Text>
              {unreadMessages > 0 && (
                <View style={styles.menuBadge}>
                  <Text style={styles.menuBadgeText}>{unreadMessages > 9 ? '9+' : unreadMessages}</Text>
                </View>
              )}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open profile"
              style={styles.menuItem}
              onPress={() => navigateFromMenu('/(tabs)/profile')}
            >
              <Ionicons name="person-outline" size={22} color="#FFC300" />
              <Text style={styles.menuItemText}>Profile</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              style={styles.menuItem}
              onPress={() => navigateFromMenu('/(tabs)/settings')}
            >
              <Ionicons name="settings-outline" size={22} color="#FFC300" />
              <Text style={styles.menuItemText}>Settings</Text>
            </Pressable>

            <View style={styles.menuDivider} />

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              style={styles.menuItem}
              onPress={() => {
                void handleSignOut();
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF4444" />
              <Text style={[styles.menuItemText, styles.menuSignOut]}>Sign Out</Text>
            </Pressable>

            <View style={styles.menuFooter}>
              <Text style={styles.menuFooterText}>No ads · No bots · No noise</Text>
            </View>
          </Animated.View>
        </>
      ) : null}

      {commentVisible ? (
        <>
          <Animated.View
            style={[styles.commentOverlay, { opacity: commentOpacity, pointerEvents: 'auto' }]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close comments"
              style={StyleSheet.absoluteFill}
              onPress={closeComments}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.commentDrawer,
              { transform: [{ translateX: commentAnim }] },
            ]}
          >
            <View style={styles.commentDrawerHeader}>
              <Text style={styles.commentDrawerTitle}>Comments</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close comments"
                hitSlop={10}
                onPress={closeComments}
              >
                <Ionicons name="close" size={24} color="#888888" />
              </Pressable>
            </View>

            <ScrollView style={styles.commentList}>
              {commentPost && commentPost.comments.length === 0 ? (
                <Text style={styles.noComments}>No comments yet. Be the first.</Text>
              ) : null}

              {commentPost?.comments.map((comment, index) => (
                <View
                  key={`${comment.user}-${comment.text}-${index}`}
                  style={styles.commentRow}
                >
                  <Text style={styles.commentUser}>{comment.user}</Text>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a kind comment..."
                  placeholderTextColor="#888888"
                  value={newComment}
                  onChangeText={setNewComment}
                  returnKeyType="send"
                  onSubmitEditing={() => {
                    if (commentPostId) {
                      void handleComment(commentPostId, newComment);
                    }
                  }}
                />

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Send comment"
                  hitSlop={10}
                  style={styles.sendBtn}
                  onPress={() => {
                    if (commentPostId) {
                      void handleComment(commentPostId, newComment);
                    }
                  }}
                >
                  <Ionicons name="send" size={18} color="#000000" />
                </Pressable>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 12,
    paddingHorizontal: 20,
    minHeight: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#000000',
    borderBottomWidth: 3,
    borderBottomColor: '#FFC300',
  },
  hamburger: {
    width: 44,
    padding: 8,
    gap: 6,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  hamburgerLine: {
    width: 26,
    height: 3,
    backgroundColor: '#FFC300',
    borderRadius: 3,
  },
  hamburgerBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  hamburgerBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  menuBadge: {
    marginLeft: 'auto',
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  logoImage: {
    width: 120,
    height: 44,
  },
  smilesBtn: {
    width: 44,
    padding: 8,
    alignItems: 'flex-end',
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 40, backgroundColor: '#000000' },
  errorStateIcon: { fontSize: 36, marginBottom: 4 },
  errorStateText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF', textAlign: 'center' },
  errorStateSub: { fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 20 },
  retryBtn: { marginTop: 12, backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 28, paddingVertical: 12 },
  retryBtnText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  loadMoreFooter: { height: 60, alignItems: 'center', justifyContent: 'center' },
  feed: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  feedContent: {},
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: PORTRAIT_CARD_HORIZONTAL_MARGIN,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    borderRadius: 16,
  },
  cardPressable: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  cardHeaderSystem: {
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#FFC300',
  },
  systemAvatarRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    borderWidth: 1.5,
    borderColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  systemAvatarLogo: {
    width: 28,
    height: 28,
  },
  systemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  systemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFC300',
  },
  systemBadge: {
    backgroundColor: '#FFC300',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  systemBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: 0.5,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
  },
  userInfo: {
    flex: 1,
  },
  cardUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000000',
  },
  cardHandle: {
    fontSize: 11,
    color: '#888888',
    marginTop: 1,
  },
  imageCardContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  cardImage: {
    flex: 1,
    width: '100%',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
  },
  videoPlaceholder: {
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMedia: {
    flex: 1,
    width: '100%',
  },
  muteBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    zIndex: 1,
  },
  cardText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
    padding: 12,
    paddingBottom: 4,
  },
  inspireInner: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  inspireLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC300',
    marginBottom: 16,
    letterSpacing: 2,
  },
  inspireText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  inspireAuthor: {
    fontSize: 13,
    color: '#FFC300',
    marginTop: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 20,
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  actionsDark: {
    backgroundColor: '#000000',
    borderTopColor: '#222222',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionCount: {
    fontSize: 13,
    color: '#888888',
  },
  actionCountDark: {
    color: '#FFFFFF',
  },
  actionCountSmiled: {
    color: '#FFC300',
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: MENU_WIDTH,
    backgroundColor: '#111111',
    zIndex: 20,
    borderRightWidth: 2,
    borderRightColor: '#FFC300',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuLogo: {
    width: 100,
    height: 40,
  },
  menuUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FFC300',
  },
  menuAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  menuName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuHandle: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  menuDivider: {
    height: 0.5,
    backgroundColor: '#333333',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  menuSignOut: {
    color: '#FF4444',
  },
  menuFooter: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuFooterText: {
    fontSize: 11,
    color: '#444444',
  },
  commentOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
  },
  commentDrawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: COMMENT_DRAWER_WIDTH_PERCENT,
    backgroundColor: 'rgba(15,15,15,0.97)',
    zIndex: 20,
    borderLeftWidth: 2,
    borderLeftColor: '#FFC300',
    padding: 20,
  },
  commentDrawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    marginBottom: 16,
  },
  commentDrawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFC300',
  },
  commentList: {
    flex: 1,
  },
  noComments: {
    fontSize: 13,
    color: '#888888',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 40,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
  },
  commentUser: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFC300',
  },
  commentText: {
    fontSize: 13,
    color: '#FFFFFF',
    flex: 1,
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: '#FFC300',
  },
  sendBtn: {
    backgroundColor: '#FFC300',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#000000',
  },
  feedTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#333333',
  },
  feedTabActive: {
    backgroundColor: '#FFC300',
    borderColor: '#FFC300',
  },
  feedTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888888',
  },
  feedTabTextActive: {
    color: '#000000',
  },
  newPostsBanner: {
    position: 'absolute',
    top: HEADER_HEIGHT + 52,
    left: 20,
    right: 20,
    zIndex: 5,
    backgroundColor: '#FFC300',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  newPostsBannerText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 13,
  },
});
