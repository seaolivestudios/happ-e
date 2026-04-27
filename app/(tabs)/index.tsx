// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { api } from '../api';
import { clearSession, getToken } from '../auth';

type PostType = 'image' | 'video' | 'inspire';

type Comment = {
  user: string;
  text: string;
};

type ApiPost = {
  id: string | number;
  handle?: string | null;
  name?: string | null;
  text?: string | null;
  type?: string | null;
  image_url?: string | null;
  video_url?: string | null;
  widescreen?: boolean | null;
  smile_count?: string | number | null;
  author_quote?: string | null;
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
  author: string | null;
};

const HEADER_HEIGHT = 75;
const PORTRAIT_CARD_MARGIN_BOTTOM = 12;
const PORTRAIT_CARD_HORIZONTAL_MARGIN = 12;
const PORTRAIT_CARD_EXTRA_HEIGHT = 140;
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
    author: raw.author_quote ?? null,
  };
}

function getDisplayName(post: Post): string {
  return post.name || post.user || 'User';
}

function getAvatarLetter(post: Post): string {
  return getDisplayName(post).charAt(0).toUpperCase() || 'U';
}

function ImageCard({
  uri,
  height,
}: {
  uri: string;
  height: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View style={[styles.imageCardContainer, { height }]}>
      {!loaded && (
        <View style={styles.imagePlaceholder}>
          <ActivityIndicator color="#FFC300" />
        </View>
      )}
      <Image
        source={{ uri }}
        style={[styles.cardImage, { height, opacity: loaded ? 1 : 0 }]}
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
    </View>
  );
}

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const cardWidth = width - PORTRAIT_CARD_HORIZONTAL_MARGIN * 2;
  const imageHeight = cardWidth * (5 / 4);
  const portraitCardEstimatedHeight = imageHeight + PORTRAIT_CARD_EXTRA_HEIGHT;
  const commentDrawerHiddenX = width;
  const [posts, setPosts] = useState<Post[]>([]);
  const [smiledPosts, setSmiledPosts] = useState<Set<string>>(new Set());
  const [commentVisible, setCommentVisible] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState('');
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  const menuAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const commentAnim = useRef(new Animated.Value(commentDrawerHiddenX)).current;
  const commentOpacity = useRef(new Animated.Value(0)).current;
  const landscapeScrollRef = useRef<ScrollView>(null);
  const portraitScrollRef = useRef<ScrollView>(null);

  const widescreenPosts = useMemo(
    () => posts.filter((post) => post.widescreen),
    [posts]
  );

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
    let active = true;

    async function loadPosts() {
      setIsLoadingPosts(true);

      try {
        const token = await getToken();
        const result = await api.getPosts(token || '');

        if (!active) return;

        const nextPosts: Post[] = Array.isArray(result?.posts)
          ? result.posts.map((raw: ApiPost) => normalizePost(raw))
          : [];

        setPosts(nextPosts);

        if (nextPosts.length > 0) {
          setCurrentPostId((prev) => prev || nextPosts[0].id);
        }
      } catch (error) {
        console.log('Could not load posts:', error);
      } finally {
        if (active) {
          setIsLoadingPosts(false);
        }
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (menuOpen) {
      Animated.spring(menuAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
      return;
    }

    Animated.spring(menuAnim, {
      toValue: -MENU_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [menuAnim, menuOpen]);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const navigateFromMenu = useCallback((path: Parameters<typeof router.push>[0]) => {
    setMenuOpen(false);
    requestAnimationFrame(() => {
      router.push(path);
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setMenuOpen(false);
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

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                comments: [...post.comments, { user: '@you', text: trimmed }],
              }
            : post
        )
      );
      setNewComment('');

      try {
        const token = await getToken();
        await api.commentPost(id, trimmed, '@you', token || '');
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
                        comment.user === '@you' &&
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

  const handlePortraitScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
      const index = Math.round(
        offsetY / (portraitCardEstimatedHeight + PORTRAIT_CARD_MARGIN_BOTTOM)
      );
      const clampedIndex = Math.min(Math.max(index, 0), posts.length - 1);

      if (posts[clampedIndex]) {
        setCurrentPostId(posts[clampedIndex].id);
      }
    },
    [portraitCardEstimatedHeight, posts]
  );

  const handleLandscapeMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = Math.max(0, event.nativeEvent.contentOffset.y);
      const index = Math.round(offsetY / height);
      const clampedIndex = Math.min(Math.max(index, 0), widescreenPosts.length - 1);

      if (widescreenPosts[clampedIndex]) {
        setCurrentPostId(widescreenPosts[clampedIndex].id);
      }
    },
    [height, widescreenPosts]
  );

  useEffect(() => {
    if (!currentPostId) return;

    if (isLandscape) {
      const index = widescreenPosts.findIndex((post) => post.id === currentPostId);
      const targetIndex = index >= 0 ? index : 0;

      const frame = requestAnimationFrame(() => {
        landscapeScrollRef.current?.scrollTo({
          y: targetIndex * height,
          animated: false,
        });
      });

      return () => cancelAnimationFrame(frame);
    }

    const index = posts.findIndex((post) => post.id === currentPostId);
    const targetIndex = index >= 0 ? index : 0;
    const targetY = targetIndex * (portraitCardEstimatedHeight + PORTRAIT_CARD_MARGIN_BOTTOM);

    const frame = requestAnimationFrame(() => {
      portraitScrollRef.current?.scrollTo({
        y: targetY,
        animated: false,
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [
    currentPostId,
    height,
    isLandscape,
    portraitCardEstimatedHeight,
    posts,
    widescreenPosts,
  ]);

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
              {post.comments.length}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Share post from ${getDisplayName(post)}`}
            hitSlop={10}
            style={styles.actionBtn}
          >
            <Ionicons
              name="arrow-redo-outline"
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
      if (post.type === 'inspire') {
        return (
          <View key={post.id} style={styles.card}>
            <View style={[styles.inspireInner, { height: imageHeight }]}>
              <Text style={styles.inspireLabel}>✦ Inspire</Text>
              <Text style={styles.inspireText}>{post.text}</Text>
              {post.author ? (
                <Text style={styles.inspireAuthor}>— {post.author}</Text>
              ) : null}
            </View>
            {renderActions(post, true)}
          </View>
        );
      }

      return (
        <View key={post.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getAvatarLetter(post)}</Text>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.cardUser}>{post.name || 'Unknown'}</Text>
              <Text style={styles.cardHandle}>{post.user}</Text>
            </View>

            {post.widescreen ? (
              <View style={styles.widescreenBadge}>
                <Image
                  source={require('../../assets/images/arrows-left-right.png')}
                  style={styles.widescreenIcon}
                />
              </View>
            ) : null}
          </View>

          {post.type === 'video' && post.video ? (
            <Video
              source={{ uri: post.video }}
              style={[styles.cardVideo, { height: imageHeight }]}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping
              useNativeControls
            />
          ) : post.image ? (
            <ImageCard uri={post.image} height={imageHeight} />
          ) : null}

          <Text style={styles.cardText}>{post.text}</Text>
          {renderActions(post)}
        </View>
      );
    },
    [imageHeight, renderActions]
  );

  const renderHorizontalCard = useCallback(
    (post: Post) => {
      const smiled = smiledPosts.has(post.id);

      return (
        <View
          key={post.id}
          style={[styles.horizontalCard, { width, height }]}
        >
          {post.type === 'video' && post.video ? (
            <Video
              source={{ uri: post.video }}
              style={styles.horizontalMedia}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping
              useNativeControls
            />
          ) : post.image ? (
            <Image
              source={{ uri: post.image }}
              style={styles.horizontalMedia}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.horizontalInspire}>
              <Text style={styles.horizontalInspireLabel}>✦ Inspire</Text>
              <Text style={styles.horizontalInspireText}>{post.text}</Text>
              {post.author ? (
                <Text style={styles.horizontalInspireAuthor}>— {post.author}</Text>
              ) : null}
            </View>
          )}

          {(post.image || post.video) ? (
            <View style={styles.horizontalBottom}>
              <Text style={styles.horizontalUser}>{getDisplayName(post)}</Text>
              <Text style={styles.horizontalText}>{post.text}</Text>
            </View>
          ) : null}

          <View style={styles.sideActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Smile post from ${getDisplayName(post)}`}
              hitSlop={10}
              style={styles.sideBtn}
              onPress={() => {
                void handleSmile(post.id);
              }}
            >
              <Ionicons
                name={smiled ? 'happy' : 'happy-outline'}
                size={28}
                color={smiled ? '#FFC300' : '#FFFFFF'}
              />
              <Text style={styles.sideCount}>{post.smiles}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open comments for ${getDisplayName(post)}`}
              hitSlop={10}
              style={styles.sideBtn}
              onPress={() => openComments(post.id)}
            >
              <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
              <Text style={styles.sideCount}>{post.comments.length}</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Share post from ${getDisplayName(post)}`}
              hitSlop={10}
              style={styles.sideBtn}
            >
              <Ionicons name="arrow-redo-outline" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      );
    },
    [handleSmile, height, openComments, smiledPosts, width]
  );

  return (
    <View style={styles.container}>
      {!isLandscape ? (
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
      ) : null}

      {isLoadingPosts ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#FFC300" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : isLandscape ? (
        <ScrollView
          ref={landscapeScrollRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={height}
          snapToAlignment="start"
          onMomentumScrollEnd={handleLandscapeMomentumEnd}
        >
          {widescreenPosts.map(renderHorizontalCard)}
        </ScrollView>
      ) : (
        <ScrollView
          ref={portraitScrollRef}
          style={styles.feed}
          onScroll={handlePortraitScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.feedContent}
        >
          {posts.map(renderVerticalCard)}
        </ScrollView>
      )}

      {menuOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={styles.menuOverlay}
          onPress={closeMenu}
        />
      ) : null}

      <Animated.View
        pointerEvents={menuOpen ? 'auto' : 'none'}
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
          <View style={styles.menuAvatar}>
            <Text style={styles.menuAvatarText}>S</Text>
          </View>
          <View>
            <Text style={styles.menuName}>Stephen</Text>
            <Text style={styles.menuHandle}>@stephen</Text>
          </View>
        </View>

        <View style={styles.menuDivider} />

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

      {commentVisible ? (
        <>
          <Animated.View
            pointerEvents="auto"
            style={[styles.commentOverlay, { opacity: commentOpacity }]}
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
  feed: {
    backgroundColor: '#F7F7F7',
  },
  feedContent: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: PORTRAIT_CARD_MARGIN_BOTTOM,
    marginHorizontal: PORTRAIT_CARD_HORIZONTAL_MARGIN,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
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
  widescreenBadge: {
    backgroundColor: '#000000',
    borderRadius: 6,
    padding: 6,
  },
  widescreenIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFC300',
  },
  imageCardContainer: {
    width: '100%',
    backgroundColor: '#F0F0F0',
  },
  cardImage: {
    width: '100%',
  },
  cardVideo: {
    width: '100%',
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
  horizontalCard: {
    backgroundColor: '#000000',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  horizontalMedia: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  horizontalBottom: {
    padding: 24,
    paddingBottom: 40,
    paddingRight: 90,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  horizontalUser: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFC300',
    marginBottom: 6,
    letterSpacing: 1,
  },
  horizontalText: {
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  horizontalInspire: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: '#000000',
  },
  horizontalInspireLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFC300',
    marginBottom: 20,
    letterSpacing: 2,
  },
  horizontalInspireText: {
    fontSize: 26,
    lineHeight: 38,
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  horizontalInspireAuthor: {
    fontSize: 15,
    color: '#FFC300',
    marginTop: 20,
    fontWeight: '600',
  },
  sideActions: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    alignItems: 'center',
    gap: 24,
  },
  sideBtn: {
    alignItems: 'center',
    gap: 4,
  },
  sideCount: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
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
});