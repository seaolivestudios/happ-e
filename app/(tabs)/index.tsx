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
import { useFeedMode } from './feedModeContext';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '../components/KeyboardDoneBar';
import { ALL_CATEGORIES } from '../categories';

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
  const { feedMode } = useFeedMode();
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const [trendingCategory, setTrendingCategory] = useState<string | null>(null);
  const [trendingFilterVisible, setTrendingFilterVisible] = useState(false);
  const [trendingCategorySearch, setTrendingCategorySearch] = useState('');
  const nextCursorRef = useRef<string | null>(null);
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
      const result = feedMode === 'foryou'
        ? await api.getPostsForYou(token || '')
        : feedMode === 'trending'
          ? (trendingCategory
              ? await api.getPostsByCategory(trendingCategory)
              : await api.getTrendingPosts(token || ''))
          : await api.getPosts(token || '');
      const nextPosts: Post[] = Array.isArray(result?.posts)
        ? result.posts.map((raw: ApiPost) => normalizePost(raw))
        : [];
      setPosts(nextPosts);
      setHasMore(result?.has_more ?? false);
      nextCursorRef.current = result?.next_cursor ?? null;
      if (nextPosts.length > 0) {
        setCurrentPostId((prev) => prev || nextPosts[0].id);
      }
    } catch {
      setFeedError(true);
    } finally {
      setIsLoadingPosts(false);
      setRefreshing(false);
    }
  }, [feedMode, trendingCategory]);

  const loadMorePosts = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursorRef.current || feedMode === 'trending') return;
    setLoadingMore(true);
    try {
      const token = await getToken();
      const cursor = nextCursorRef.current;
      const result = feedMode === 'foryou'
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

  useEffect(() => { void loadPosts(); }, [feedMode, trendingCategory]);

  useEffect(() => {
    if (feedMode !== 'trending') setTrendingCategory(null);
  }, [feedMode]);


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
                {post.widescreen && (
                  <Pressable
                    style={styles.cinemaBadge}
                    onPress={() => router.push({ pathname: '/(tabs)/cinema', params: { startId: post.id } } as any)}
                    hitSlop={8}
                  >
                    <Ionicons name="film" size={11} color="#000000" />
                    <Text style={styles.cinemaBadgeText}>Cinema</Text>
                  </Pressable>
                )}
              </View>
            ) : post.image ? (
              <View>
                <ImageCard uri={post.image} />
                {post.widescreen && (
                  <Pressable
                    style={styles.cinemaBadge}
                    onPress={() => router.push({ pathname: '/(tabs)/cinema', params: { startId: post.id } } as any)}
                    hitSlop={8}
                  >
                    <Ionicons name="film" size={11} color="#000000" />
                    <Text style={styles.cinemaBadgeText}>Cinema</Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            {post.text ? (
              <Text style={styles.cardText} numberOfLines={2}>{post.text}</Text>
            ) : null}
          </Pressable>
          {renderActions(post)}
        </View>
      );
    },
    [feedHeight, isMuted, currentPostId, renderActions, feedMode]
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

      {feedMode === 'trending' && (
        <View style={styles.trendingFilterRow}>
          {trendingCategory ? (
            <Pressable
              style={styles.activeCategoryChip}
              onPress={() => setTrendingCategory(null)}
              hitSlop={8}
            >
              <Text style={styles.activeCategoryChipText}>{trendingCategory}</Text>
              <Ionicons name="close-circle" size={14} color="#000000" />
            </Pressable>
          ) : (
            <Text style={styles.trendingFilterLabel}>All Categories</Text>
          )}
          <Pressable
            style={styles.filterBtn}
            onPress={() => setTrendingFilterVisible(true)}
            hitSlop={8}
          >
            <Ionicons name="options-outline" size={16} color="#FFC300" />
            <Text style={styles.filterBtnText}>Filter</Text>
          </Pressable>
        </View>
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
          <Text style={styles.errorStateSub}>Be the first to share something</Text>
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

            <Pressable
              style={styles.menuUserRow}
              onPress={() => navigateFromMenu('/(tabs)/profile' as any)}
              hitSlop={8}
            >
              {currentUser?.avatar_url ? (
                <Image source={{ uri: currentUser.avatar_url }} style={styles.menuAvatarImg} />
              ) : (
                <View style={styles.menuAvatar}>
                  <Text style={styles.menuAvatarText}>
                    {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
                  </Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.menuName}>{currentUser?.name ?? 'User'}</Text>
                <Text style={styles.menuHandle}>{currentUser?.handle ? `@${currentUser.handle}` : currentUser?.email ?? ''}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#444444" />
            </Pressable>

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
                  inputAccessoryViewID={KEYBOARD_DONE_ID}
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

      <KeyboardDoneBar />

      {/* Trending category filter modal */}
      {trendingFilterVisible && (
        <View style={styles.trendingModalContainer}>
          <Pressable style={styles.trendingModalBackdrop} onPress={() => { setTrendingFilterVisible(false); setTrendingCategorySearch(''); }} />
          <View style={styles.trendingModalSheet}>
            <View style={styles.trendingModalHeader}>
              <Text style={styles.trendingModalTitle}>Filter Trending</Text>
              <Pressable onPress={() => { setTrendingFilterVisible(false); setTrendingCategorySearch(''); }} hitSlop={10}>
                <Ionicons name="close" size={24} color="#888888" />
              </Pressable>
            </View>

            {trendingCategory && (
              <Pressable
                style={styles.clearFilterBtn}
                onPress={() => { setTrendingCategory(null); setTrendingFilterVisible(false); setTrendingCategorySearch(''); }}
              >
                <Ionicons name="close-circle-outline" size={16} color="#FFC300" />
                <Text style={styles.clearFilterText}>Clear filter — show all trending</Text>
              </Pressable>
            )}

            <View style={styles.trendingSearchRow}>
              <Ionicons name="search" size={16} color="#888888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.trendingSearchInput}
                placeholder="Search categories..."
                placeholderTextColor="#888888"
                value={trendingCategorySearch}
                onChangeText={setTrendingCategorySearch}
                autoCorrect={false}
                autoCapitalize="none"
                inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
              {trendingCategorySearch.length > 0 && (
                <Pressable onPress={() => setTrendingCategorySearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color="#888888" />
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.trendingCategoryList} keyboardShouldPersistTaps="handled">
              {ALL_CATEGORIES
                .filter(c => !trendingCategorySearch.trim() || c.toLowerCase().includes(trendingCategorySearch.trim().toLowerCase()))
                .map(cat => (
                  <Pressable
                    key={cat}
                    style={[styles.trendingCategoryOption, trendingCategory === cat && styles.trendingCategoryOptionActive]}
                    onPress={() => {
                      setTrendingCategory(cat);
                      setTrendingFilterVisible(false);
                      setTrendingCategorySearch('');
                    }}
                  >
                    <Text style={[styles.trendingCategoryOptionText, trendingCategory === cat && styles.trendingCategoryOptionTextActive]}>
                      {cat}
                    </Text>
                    {trendingCategory === cat && <Ionicons name="checkmark" size={18} color="#FFC300" />}
                  </Pressable>
                ))
              }
            </ScrollView>
          </View>
        </View>
      )}
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
  cinemaBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFC300',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cinemaBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
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

  // Trending category filter
  trendingFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
  },
  trendingFilterLabel: { fontSize: 13, color: '#888888' },
  activeCategoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFC300',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeCategoryChipText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#111111',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#FFC300',
  },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#FFC300' },

  // Trending category modal
  trendingModalContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 999 },
  trendingModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  trendingModalSheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderTopColor: '#FFC300',
    maxHeight: '80%',
  },
  trendingModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222222',
  },
  trendingModalTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFC300',
  },
  clearFilterText: { fontSize: 14, color: '#FFC300', fontWeight: '600' },
  trendingSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  trendingSearchInput: { flex: 1, fontSize: 15, color: '#FFFFFF' },
  trendingCategoryList: { paddingHorizontal: 16, paddingBottom: 40 },
  trendingCategoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  trendingCategoryOptionActive: {},
  trendingCategoryOptionText: { fontSize: 16, color: '#FFFFFF' },
  trendingCategoryOptionTextActive: { color: '#FFC300', fontWeight: '700' },
});
