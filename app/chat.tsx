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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from './api';
import { getToken, getUser } from './auth';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
  read: boolean;
  sender_name: string;
  sender_handle: string;
  sender_avatar: string | null;
};

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
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [myId, setMyId] = useState<string>('');
  const listRef = useRef<FlatList<Message>>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
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
      if (!silent) setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    getUser().then(u => { if (u?.id) setMyId(String(u.id)); });
    void load();

    pollRef.current = setInterval(() => { void load(true); }, 10_000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [load]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setText('');
    setSending(true);

    const optimistic: Message = {
      id: `opt_${Date.now()}`,
      sender_id: myId,
      receiver_id: userId,
      text: trimmed,
      created_at: new Date().toISOString(),
      read: false,
      sender_name: '',
      sender_handle: '',
      sender_avatar: null,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const token = await getToken();
      const result = await api.sendMessage(userId, trimmed, token ?? '');
      if (result.success) {
        setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...optimistic, id: String(result.message.id) } : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        setText(trimmed);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
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
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.text}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <View style={styles.inputBar}>
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
});
