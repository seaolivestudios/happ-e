import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

type Notification = {
  id: string;
  type: string;
  actor_id: string;
  actor_handle: string;
  actor_name: string;
  actor_avatar_url: string | null;
  post_id: string | null;
  read: boolean;
  created_at: string;
};

function getMessage(n: Notification): string {
  const name = n.actor_name || n.actor_handle || 'Someone';
  switch (n.type) {
    case 'smile': return `${name} smiled at your post 😊`;
    case 'comment': return `${name} commented on your post`;
    case 'follow': return `${name} started following you`;
    default: return `${name} interacted with you`;
  }
}

function getAccentColor(type: string): string {
  switch (type) {
    case 'smile': return '#FFC300';
    case 'comment': return '#00C2A8';
    case 'follow': return '#FFC300';
    default: return '#888888';
  }
}

function getTypeIcon(type: string): React.ComponentProps<typeof Ionicons>['name'] {
  switch (type) {
    case 'smile': return 'happy';
    case 'comment': return 'chatbubble';
    case 'follow': return 'person-add';
    default: return 'notifications';
  }
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void loadNotifications();
  }, []);

  const loadNotifications = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const token = await getToken();
      const result = await api.getNotifications(token ?? '');
      if (result.success) setNotifications(result.notifications);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const token = await getToken();
      await api.markAllNotificationsRead(token ?? '');
    } catch {}
  };

  const handlePress = (n: Notification) => {
    if ((n.type === 'smile' || n.type === 'comment') && n.post_id) {
      router.push(`/post/${n.post_id}` as any);
    } else if (n.type === 'follow' && n.actor_id) {
      router.push(`/user/${n.actor_id}` as any);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <Pressable onPress={markAllRead} hitSlop={8}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        )}
      </View>

      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={styles.unreadText}>{unreadCount} new notification{unreadCount > 1 ? 's' : ''}</Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FFC300" />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadNotifications(true)} tintColor="#FFC300" />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="happy-outline" size={48} color="#333333" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySub}>When someone smiles or comments on your posts, you'll see it here.</Text>
            </View>
          ) : (
            notifications.map(item => {
              const accent = getAccentColor(item.type);
              const tappable = (item.type === 'smile' || item.type === 'comment') && item.post_id
                || item.type === 'follow';
              return (
                <Pressable
                  key={item.id}
                  style={[styles.row, !item.read && styles.rowUnread]}
                  onPress={() => handlePress(item)}
                  disabled={!tappable}
                >
                  <View style={styles.avatarWrap}>
                    {item.actor_avatar_url ? (
                      <Image source={{ uri: item.actor_avatar_url }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatarFallback, { backgroundColor: accent + '33' }]}>
                        <Text style={[styles.avatarLetter, { color: accent }]}>
                          {(item.actor_name || item.actor_handle || '?').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={[styles.typeBadge, { backgroundColor: accent }]}>
                      <Ionicons name={getTypeIcon(item.type)} size={9} color="#000000" />
                    </View>
                  </View>

                  <View style={styles.rowContent}>
                    <Text style={styles.message}>{getMessage(item)}</Text>
                    <Text style={styles.rowTime}>{timeAgo(item.created_at)}</Text>
                  </View>

                  {!item.read && <View style={styles.unreadDot} />}
                  {tappable && <Ionicons name="chevron-forward" size={14} color="#444444" />}
                </Pressable>
              );
            })
          )}

          {notifications.length > 0 && (
            <View style={styles.endMessage}>
              <Text style={styles.endText}>✦ You're all caught up</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 2, borderBottomColor: '#FFC300',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#FFC300' },
  markAll: { fontSize: 13, color: '#888888' },
  unreadBanner: { backgroundColor: '#1A1400', paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#FFC300' },
  unreadText: { fontSize: 13, color: '#FFC300', fontWeight: '600' },
  list: { flex: 1 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A', gap: 12,
  },
  rowUnread: { backgroundColor: '#0D0D00' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  avatarFallback: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 19, fontWeight: '700' },
  typeBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#000000',
  },
  rowContent: { flex: 1 },
  message: { fontSize: 14, color: '#FFFFFF', lineHeight: 20 },
  rowTime: { fontSize: 12, color: '#888888', marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFC300', flexShrink: 0 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptySub: { fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 20 },
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 13, color: '#444444' },
});
