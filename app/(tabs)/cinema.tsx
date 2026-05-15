import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { useFocusEffect, useLocalSearchParams, router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

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

function normalizePosts(raw: any[]): CinemaPost[] {
  return raw
    .filter((p) => p.image_url || p.video_url)
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
  const flatListRef = useRef<FlatList<CinemaPost>>(null);

  useFocusEffect(
    useCallback(() => {
      setOriented(false);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).then(() => {
        setOriented(true);
      });
      return () => {
        setOriented(false);
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      };
    }, [])
  );

  useEffect(() => {
    void loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await api.getTrendingPosts(token ?? '');
      if (res.posts) {
        const normalized = normalizePosts(res.posts);
        setPosts(normalized);
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
      }
    },
    []
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  // In landscape, width > height. Each card fills the screen exactly.
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
        <Pressable style={styles.backBtn} onPress={() => router.navigate('/(tabs)')}>
          <Ionicons name="arrow-back" size={22} color="#FFC300" />
        </Pressable>
        <Ionicons name="film-outline" size={48} color="#FFC300" />
        <Text style={styles.emptyText}>No Cinema posts yet</Text>
        <Text style={styles.emptySub}>Posts with photos and videos will appear here</Text>
      </View>
    );
  }

  return (
    <View style={{ width: cardWidth, height: cardHeight, backgroundColor: '#000000' }}>
      <FlatList
        ref={flatListRef}
        data={posts}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: cardWidth,
          offset: cardWidth * index,
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

              {/* Dark gradient overlay at bottom */}
              <View style={styles.overlay} pointerEvents="none" />

              {/* Post info */}
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
                <Pressable style={styles.actionBtn} onPress={() => router.push(`/post/${item.id}` as any)} hitSlop={10}>
                  <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
                  <Text style={styles.actionCount}>{item.commentCount}</Text>
                </Pressable>
                {item.type === 'video' && (
                  <Pressable style={styles.actionBtn} onPress={() => setIsMuted(m => !m)} hitSlop={10}>
                    <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={24} color="#FFFFFF" />
                  </Pressable>
                )}
              </View>

              {/* Back / close button */}
              <Pressable
                style={styles.closeBtn}
                onPress={() => router.navigate('/(tabs)')}
                hitSlop={12}
              >
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              </Pressable>

              {/* Swipe hint for first card */}
              {index === 0 && posts.length > 1 && (
                <View style={styles.swipeHint} pointerEvents="none">
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.swipeHintText}>Swipe for next</Text>
                </View>
              )}
            </View>
          );
        }}
      />
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
  emptySub: { fontSize: 13, color: '#888888', textAlign: 'center', paddingHorizontal: 32 },
  backBtn: { position: 'absolute', top: 20, left: 20 },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: 'transparent',
    // simulate gradient with layered opacity
    shadowColor: '#000000',
    shadowOpacity: 1,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: -20 },
  },
  postInfo: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 80,
    gap: 4,
  },
  postName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  postHandle: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  postText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18, marginTop: 4 },
  actions: {
    position: 'absolute',
    right: 16,
    bottom: 24,
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: { alignItems: 'center', gap: 4 },
  actionCount: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  closeBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20,
    padding: 8,
  },
  swipeHint: {
    position: 'absolute',
    right: 20,
    top: '50%',
    alignItems: 'center',
    gap: 4,
  },
  swipeHintText: { fontSize: 11, color: 'rgba(255,255,255,0.5)' },
});
