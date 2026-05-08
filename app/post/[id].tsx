import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api';
import { getToken, getUser } from '../auth';

type DetailComment = {
  name: string;
  handle: string;
  text: string;
  created_at: string;
};

type DetailPost = {
  id: string;
  type: 'image' | 'video' | 'inspire';
  user_id: string | null;
  name: string;
  handle: string;
  avatar_url: string | null;
  text: string;
  image_url: string | null;
  video_url: string | null;
  widescreen: boolean;
  author_quote: string | null;
  category: string | null;
  smile_count: number;
  created_at: string;
  comments: DetailComment[];
};

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<DetailPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [smiled, setSmiled] = useState(false);
  const [smileCount, setSmileCount] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string } | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    getUser().then(u => setCurrentUser(u));
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    try {
      const result = await api.getPost(id);
      if (result.success && result.post) {
        const p = result.post;
        setPost({
          id: String(p.id),
          type: p.type === 'video' || p.type === 'inspire' ? p.type : 'image',
          user_id: p.user_id ? String(p.user_id) : null,
          name: p.name ?? '',
          handle: p.handle ?? '',
          avatar_url: p.avatar_url ?? null,
          text: p.text ?? '',
          image_url: p.image_url ?? null,
          video_url: p.video_url ?? null,
          widescreen: p.widescreen === true,
          author_quote: p.author_quote ?? null,
          category: p.category ?? null,
          smile_count: parseInt(String(p.smile_count ?? 0), 10) || 0,
          created_at: p.created_at ?? '',
          comments: Array.isArray(p.comments) ? p.comments : [],
        });
        setSmileCount(parseInt(String(p.smile_count ?? 0), 10) || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleSmile = useCallback(async () => {
    if (!post) return;
    setSmiled(prev => !prev);
    setSmileCount(prev => smiled ? Math.max(0, prev - 1) : prev + 1);
    try {
      const token = await getToken();
      await api.smilePost(post.id, token ?? '');
    } catch {
      setSmiled(prev => !prev);
      setSmileCount(prev => smiled ? prev + 1 : Math.max(0, prev - 1));
    }
  }, [post, smiled]);

  const handleSendComment = useCallback(async () => {
    if (!post || !comment.trim()) return;
    const text = comment.trim();
    setSending(true);
    const optimistic: DetailComment = {
      name: currentUser?.name ?? 'You',
      handle: '',
      text,
      created_at: new Date().toISOString(),
    };
    setPost(prev => prev ? { ...prev, comments: [...prev.comments, optimistic] } : prev);
    setComment('');
    try {
      const token = await getToken();
      await api.commentPost(post.id, text, currentUser?.name ?? 'You', token ?? '');
    } catch {
      setPost(prev => prev
        ? { ...prev, comments: prev.comments.filter(c => c !== optimistic) }
        : prev);
      setComment(text);
    } finally {
      setSending(false);
    }
  }, [post, comment, currentUser]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC300" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Post not found.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtnCenter}>
          <Text style={styles.backBtnCenterText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const avatarLetter = (post.name || 'U').charAt(0).toUpperCase();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={12}
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>

        {/* Author row */}
        <Pressable
          style={styles.authorRow}
          onPress={() => post.user_id && router.push(`/user/${post.user_id}` as any)}
        >
          {post.avatar_url ? (
            <Image source={{ uri: post.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.name}</Text>
            <Text style={styles.authorHandle}>{post.handle}</Text>
          </View>
          {post.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{post.category}</Text>
            </View>
          ) : null}
        </Pressable>

        {/* Media */}
        {post.type === 'inspire' ? (
          <View style={styles.inspireCard}>
            <Text style={styles.inspireLabel}>✦ Inspire</Text>
            <Text style={styles.inspireText}>{post.text}</Text>
            {post.author_quote ? (
              <Text style={styles.inspireAuthor}>— {post.author_quote}</Text>
            ) : null}
          </View>
        ) : post.type === 'video' && post.video_url ? (
          <Video
            source={{ uri: post.video_url }}
            style={[styles.media, styles.mediaPortrait]}
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isMuted={false}
            isLooping
          />
        ) : post.image_url ? (
          <Image
            source={{ uri: post.image_url }}
            style={[styles.media, styles.mediaPortrait]}
            resizeMode="cover"
          />
        ) : null}

        {/* Caption */}
        {post.type !== 'inspire' && post.text ? (
          <Text style={styles.caption}>{post.text}</Text>
        ) : null}

        {/* Date */}
        <Text style={styles.date}>{formatDate(post.created_at)}</Text>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.actionBtn} onPress={handleSmile} accessibilityRole="button" accessibilityLabel="Smile">
            <Ionicons name={smiled ? 'happy' : 'happy-outline'} size={24} color={smiled ? '#FFC300' : '#888888'} />
            <Text style={[styles.actionCount, smiled && styles.actionCountActive]}>{smileCount}</Text>
          </Pressable>
          <Pressable style={styles.actionBtn} onPress={() => inputRef.current?.focus()} accessibilityRole="button" accessibilityLabel="Add comment">
            <Ionicons name="chatbubble-outline" size={24} color="#888888" />
            <Text style={styles.actionCount}>{post.comments.length}</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        {/* Comments */}
        <Text style={styles.commentsHeading}>Comments</Text>
        {post.comments.length === 0 ? (
          <Text style={styles.noComments}>No comments yet. Be the first.</Text>
        ) : null}
        {post.comments.map((c, i) => (
          <View key={i} style={styles.commentRow}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>{(c.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.commentBody}>
              <Text style={styles.commentName}>{c.name}</Text>
              <Text style={styles.commentText}>{c.text}</Text>
            </View>
          </View>
        ))}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Comment input */}
      <View style={styles.inputBar}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Add a kind comment..."
          placeholderTextColor="#666666"
          value={comment}
          onChangeText={setComment}
          returnKeyType="send"
          onSubmitEditing={handleSendComment}
          editable={!sending}
        />
        <Pressable
          style={[styles.sendBtn, (!comment.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSendComment}
          disabled={!comment.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send comment"
        >
          <Ionicons name="send" size={18} color="#000000" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  loadingContainer: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#888888', fontSize: 15, marginBottom: 16 },
  backBtnCenter: { backgroundColor: '#FFC300', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnCenterText: { color: '#000000', fontWeight: '700', fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  backBtn: { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  headerRight: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#000000' },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  authorHandle: { fontSize: 13, color: '#888888', marginTop: 1 },
  categoryBadge: { backgroundColor: '#111111', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: '#333333' },
  categoryText: { fontSize: 12, color: '#FFC300', fontWeight: '600' },
  media: { width: '100%' },
  mediaPortrait: { aspectRatio: 4 / 5 },
  inspireCard: { backgroundColor: '#111111', padding: 32, alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222222' },
  inspireLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', letterSpacing: 2, marginBottom: 16 },
  inspireText: { fontSize: 20, color: '#FFFFFF', lineHeight: 30, fontStyle: 'italic', textAlign: 'center' },
  inspireAuthor: { fontSize: 14, color: '#FFC300', marginTop: 16, fontWeight: '600' },
  caption: { fontSize: 15, color: '#FFFFFF', lineHeight: 22, paddingHorizontal: 16, paddingTop: 14 },
  date: { fontSize: 12, color: '#555555', paddingHorizontal: 16, marginTop: 8 },
  actions: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 14, gap: 24 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionCount: { fontSize: 15, color: '#888888', fontWeight: '600' },
  actionCountActive: { color: '#FFC300' },
  divider: { height: 1, backgroundColor: '#1A1A1A', marginHorizontal: 16 },
  commentsHeading: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  noComments: { fontSize: 14, color: '#555555', paddingHorizontal: 16 },
  commentRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 10 },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  commentAvatarText: { fontSize: 13, fontWeight: '700', color: '#FFC300' },
  commentBody: { flex: 1 },
  commentName: { fontSize: 13, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  commentText: { fontSize: 14, color: '#CCCCCC', lineHeight: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1A1A1A', gap: 10, backgroundColor: '#000000' },
  input: { flex: 1, backgroundColor: '#111111', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#222222' },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
});
