import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { api } from '../api';
import { getToken, getUser } from '../auth';

type UserPost = {
  id: string;
  type: string;
  text: string;
  image_url: string | null;
  video_url: string | null;
  smile_count: number;
};

type PublicUser = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  category: string;
  location: string;
  avatar_url: string | null;
  verified: boolean;
  posts: number;
  followers: number;
  following: number;
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    void load();
  }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const [profileRes, me, token] = await Promise.all([
        api.getUser(id),
        getUser(),
        getToken(),
      ]);
      if (profileRes.success) {
        setUser(profileRes.user);
        setPosts(
          (profileRes.userPosts ?? []).map((p: any) => ({
            ...p,
            id: String(p.id),
            smile_count: parseInt(p.smile_count) || 0,
          }))
        );
        if (me && String(me.id) === String(profileRes.user.id)) {
          setIsOwnProfile(true);
        } else if (token) {
          const followRes = await api.checkFollow(id, token);
          setIsFollowing(followRes.following ?? false);
        }
      }
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    const token = await getToken();
    if (!token || !user) return;
    setFollowLoading(true);
    const wasFollowing = isFollowing;
    setIsFollowing(!wasFollowing);
    try {
      if (wasFollowing) {
        await api.unfollow(user.id, token);
        setUser(u => u ? { ...u, followers: Math.max(0, u.followers - 1) } : u);
      } else {
        await api.follow(user.id, token);
        setUser(u => u ? { ...u, followers: u.followers + 1 } : u);
      }
    } catch {
      setIsFollowing(wasFollowing);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC300" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  const cellSize = (width - 32 - 4) / 3;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerHandle}>{user.handle}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.avatarSection}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.handle}>{user.handle}</Text>
          {user.category ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user.category}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.posts}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.followers}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{user.following}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        {!isOwnProfile && (
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.followBtn, isFollowing && styles.followBtnActive]}
              onPress={handleFollow}
              disabled={followLoading}
            >
              <Text style={[styles.followBtnText, isFollowing && styles.followBtnTextActive]}>
                {followLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.messageBtn}
              onPress={() => router.push({ pathname: '/chat', params: { userId: user.id, name: user.name, handle: user.handle, avatar: user.avatar_url ?? '' } } as any)}
            >
              <Ionicons name="chatbubble-outline" size={18} color="#FFC300" />
              <Text style={styles.messageBtnText}>Message</Text>
            </Pressable>
          </View>
        )}

        {user.bio ? (
          <View style={styles.bioCard}>
            <Text style={styles.bioText}>{user.bio}</Text>
          </View>
        ) : null}

        {user.location ? (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#888888" />
            <Text style={styles.infoText}>{user.location}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionLabel}>POSTS</Text>
        {posts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Text style={styles.emptyText}>No posts yet</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {posts.map(post => (
              <Pressable
                key={post.id}
                style={[styles.gridCell, { width: cellSize, height: cellSize }]}
                onPress={() => router.push(`/post/${post.id}` as any)}
              >
                {post.image_url ? (
                  <Image source={{ uri: post.image_url }} style={styles.gridImage} resizeMode="cover" />
                ) : (
                  <View style={styles.gridInspire}>
                    <Text style={styles.gridText} numberOfLines={3}>{post.text}</Text>
                  </View>
                )}
                <View style={styles.gridSmiles}>
                  <Text style={styles.gridSmilesText}>♡ {post.smile_count}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#888888', fontSize: 16 },
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 2, borderBottomColor: '#FFC300',
  },
  backBtn: { width: 40 },
  headerHandle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  body: { padding: 16, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarImg: { width: 88, height: 88, borderRadius: 44, marginBottom: 12, borderWidth: 2, borderColor: '#FFC300' },
  avatarText: { fontSize: 38, fontWeight: 'bold', color: '#000000' },
  name: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  handle: { fontSize: 14, color: '#FFC300' },
  badge: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  statsRow: { flexDirection: 'row', backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222222' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#FFC300' },
  statLabel: { fontSize: 12, color: '#888888', marginTop: 2 },
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  followBtn: { flex: 1, backgroundColor: '#FFC300', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  followBtnActive: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#FFC300' },
  followBtnText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  followBtnTextActive: { color: '#FFC300' },
  messageBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1.5, borderColor: '#FFC300' },
  messageBtnText: { fontSize: 15, fontWeight: '600', color: '#FFC300' },
  bioCard: { backgroundColor: '#111111', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#222222' },
  bioText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  infoText: { fontSize: 13, color: '#888888' },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', letterSpacing: 1.5, marginBottom: 12, marginTop: 8 },
  emptyPosts: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: '#888888', fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridCell: { borderRadius: 4, overflow: 'hidden', backgroundColor: '#111111', position: 'relative' },
  gridImage: { width: '100%', height: '100%' },
  gridInspire: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 6 },
  gridText: { fontSize: 9, color: '#FFC300', textAlign: 'center', fontStyle: 'italic', lineHeight: 13 },
  gridSmiles: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  gridSmilesText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
});
