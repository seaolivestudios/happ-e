import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from './api';
import { getToken, getUser } from './auth';

const GIPHY_KEY = 'dc6zaTOxFJmzC';

async function searchGifs(query: string) {
  const url = query.trim()
    ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(query)}&limit=24&rating=g`
    : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_KEY}&limit=24&rating=g`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.data ?? []).map((g: any) => ({
    id: g.id,
    preview: g.images?.fixed_height_small?.url ?? g.images?.fixed_height?.url,
    url: g.images?.fixed_height?.url ?? g.images?.original?.url,
  }));
}

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  gif_url: string | null;
  created_at: string;
  read: boolean;
  sender_name: string;
  sender_handle: string;
  sender_avatar: string | null;
};

type GifResult = { id: string; preview: string; url: string };

function timeLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function ChatScreen() {
  const { userId, name, handle, avatar } = useLocalSearchParams<{
    userId: string;
    name: string;
    handle: string;
    avatar: string;
  }>();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string>('');
  const [gifOpen, setGifOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState<GifResult[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const gifDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<FlatList<Message>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (mode: 'init' | 'silent' | 'refresh' = 'init') => {
    if (mode === 'refresh') setRefreshing(true);
    try {
      const token = await getToken();
      const result = await api.getMessages(userId, token ?? '');
      if (result.success) {
        setMessages(result.messages ?? []);
        await api.markMessagesRead(userId, token ?? '');
      }
    } catch {
      // silent
    } finally {
      if (mode === 'init') setLoading(false);
      if (mode === 'refresh') setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    getUser().then(u => { if (u?.id) setMyId(String(u.id)); });
    void load('init');

    pollRef.current = setInterval(() => { void load('silent'); }, 10_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages.length]);

  useEffect(() => {
    if (!gifOpen) return;
    if (gifDebounce.current) clearTimeout(gifDebounce.current);
    gifDebounce.current = setTimeout(async () => {
      setGifLoading(true);
      try {
        const results = await searchGifs(gifQuery);
        setGifs(results);
      } catch {
        setGifs([]);
      } finally {
        setGifLoading(false);
      }
    }, 300);
  }, [gifQuery, gifOpen]);

  const sendMessage = async (msgText: string, gifUrl?: string) => {
    setSending(true);
    const optimistic: Message = {
      id: `opt_${Date.now()}`,
      sender_id: myId,
      receiver_id: userId,
      text: msgText,
      gif_url: gifUrl ?? null,
      created_at: new Date().toISOString(),
      read: false,
      sender_name: '',
      sender_handle: '',
      sender_avatar: null,
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      const token = await getToken();
      const result = await api.sendMessage(userId, msgText, token ?? '', gifUrl);
      if (result.success) {
        setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...optimistic, id: String(result.message.id) } : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        if (!gifUrl) setText(msgText);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      if (!gifUrl) setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    await sendMessage(trimmed);
  };

  const handleSendGif = async (gif: GifResult) => {
    setGifOpen(false);
    setGifQuery('');
    await sendMessage('', gif.url);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Pressable style={styles.headerCenter} onPress={() => router.push(`/user/${userId}` as any)}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarFallback}>
              <Text style={styles.headerAvatarLetter}>{(name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View>
            <Text style={styles.headerName}>{name}</Text>
            {handle ? <Text style={styles.headerHandle}>{handle}</Text> : null}
          </View>
        </Pressable>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC300" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load('refresh')} tintColor="#FFC300" />}
          renderItem={({ item, index }) => {
            const isMe = item.sender_id === myId;
            const prev = index > 0 ? messages[index - 1] : null;
            const showTime = !prev || (new Date(item.created_at).getTime() - new Date(prev.created_at).getTime()) > 300_000;
            return (
              <View>
                {showTime && (
                  <Text style={styles.timeLabel}>{timeLabel(item.created_at)}</Text>
                )}
                <View style={[styles.bubbleRow, isMe && styles.bubbleRowMe]}>
                  {item.gif_url ? (
                    <Image source={{ uri: item.gif_url }} style={styles.gifBubble} resizeMode="cover" />
                  ) : (
                    <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                      <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* GIF picker */}
      {gifOpen && (
        <View style={styles.gifPanel}>
          <View style={styles.gifSearchRow}>
            <TextInput
              style={styles.gifSearchInput}
              placeholder="Search GIFs..."
              placeholderTextColor="#555555"
              value={gifQuery}
              onChangeText={setGifQuery}
              autoFocus
              autoCapitalize="none"
            />
            <Pressable onPress={() => { setGifOpen(false); setGifQuery(''); }} hitSlop={8}>
              <Ionicons name="close" size={22} color="#888888" />
            </Pressable>
          </View>
          {gifLoading ? (
            <ActivityIndicator color="#FFC300" style={{ marginTop: 20 }} />
          ) : (
            <FlatList
              data={gifs}
              keyExtractor={g => g.id}
              numColumns={3}
              contentContainerStyle={styles.gifGrid}
              renderItem={({ item }) => (
                <Pressable onPress={() => handleSendGif(item)} style={styles.gifCell}>
                  <Image source={{ uri: item.preview }} style={styles.gifThumb} resizeMode="cover" />
                </Pressable>
              )}
            />
          )}
        </View>
      )}

      <View style={styles.inputBar}>
        <Pressable onPress={() => setGifOpen(v => !v)} style={styles.gifBtn}>
          <Text style={styles.gifBtnText}>GIF</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor="#555555"
          value={text}
          onChangeText={setText}
          multiline
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <Pressable
          style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || sending}
        >
          <Ionicons name="send" size={18} color="#000000" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  backBtn: { width: 36 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerAvatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  headerAvatarLetter: { fontSize: 15, fontWeight: '700', color: '#000000' },
  headerName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  headerHandle: { fontSize: 12, color: '#888888' },
  headerRight: { width: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 8 },
  timeLabel: { fontSize: 11, color: '#555555', textAlign: 'center', marginVertical: 12 },
  bubbleRow: { flexDirection: 'row', marginBottom: 4 },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe: { backgroundColor: '#FFC300', borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: '#1A1A1A', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 15, color: '#FFFFFF', lineHeight: 21 },
  bubbleTextMe: { color: '#000000' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#1A1A1A', gap: 10, backgroundColor: '#000000' },
  input: { flex: 1, backgroundColor: '#111111', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#222222', maxHeight: 120 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  gifBubble: { width: 200, height: 150, borderRadius: 12 },
  gifBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  gifBtnText: { fontSize: 11, fontWeight: '800', color: '#FFC300', letterSpacing: 0.5 },
  gifPanel: { backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: '#1A1A1A', height: 320 },
  gifSearchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, gap: 8, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' },
  gifSearchInput: { flex: 1, backgroundColor: '#111111', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, color: '#FFFFFF', fontSize: 14, borderWidth: 1, borderColor: '#222222' },
  gifGrid: { padding: 4 },
  gifCell: { flex: 1, margin: 2, aspectRatio: 1, borderRadius: 6, overflow: 'hidden', backgroundColor: '#111111' },
  gifThumb: { width: '100%', height: '100%' },
});
