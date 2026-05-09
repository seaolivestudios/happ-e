import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api } from './api';
import { getToken } from './auth';

type Conversation = {
  partner_id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
  last_message: string;
  last_at: string;
  unread: number;
  sender_id: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function MessagesScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const token = await getToken();
      const result = await api.getConversations(token ?? '');
      if (result.success) setConversations(result.conversations ?? []);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC300" />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-outline" size={48} color="#333333" />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySub}>Visit someone's profile to start a conversation</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.partner_id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#FFC300" />}
          renderItem={({ item }) => (
            <Pressable
              style={styles.row}
              onPress={() => router.push({ pathname: '/chat', params: { userId: item.partner_id, name: item.name, handle: item.handle, avatar: item.avatar_url ?? '' } } as any)}
            >
              {item.avatar_url ? (
                <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarLetter}>{(item.name || 'U').charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.rowBody}>
                <View style={styles.rowTop}>
                  <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.time}>{timeAgo(item.last_at)}</Text>
                </View>
                <Text style={[styles.preview, item.unread > 0 && styles.previewUnread]} numberOfLines={1}>
                  {item.last_message}
                </Text>
              </View>
              {item.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.unread}</Text>
                </View>
              )}
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  backBtn: { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  headerRight: { width: 36 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#888888' },
  emptySub: { fontSize: 13, color: '#555555', textAlign: 'center', paddingHorizontal: 40 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 20, fontWeight: '700', color: '#000000' },
  rowBody: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  name: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flex: 1, marginRight: 8 },
  time: { fontSize: 12, color: '#666666' },
  preview: { fontSize: 14, color: '#666666' },
  previewUnread: { color: '#CCCCCC', fontWeight: '500' },
  badge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#000000' },
  sep: { height: 0.5, backgroundColor: '#1A1A1A', marginLeft: 78 },
});
