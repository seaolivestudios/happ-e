import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

type Notification = {
  id: string;
  type: string;
  actor_handle: string;
  actor_name: string;
  post_id: string | null;
  read: boolean;
  created_at: string;
};

function getMessage(n: Notification): string {
  switch (n.type) {
    case 'smile': return 'smiled at your post';
    case 'comment': return 'commented on your post';
    case 'follow': return 'started following you';
    default: return 'interacted with you';
  }
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'like': return '♡';
    case 'comment': return '◻';
    case 'follow': return '+';
    case 'inspire': return '✦';
    default: return '•';
  }
};

const getIconColor = (type: string) => {
  switch (type) {
    case 'like': return '#FF4F81';
    case 'comment': return '#00C2A8';
    case 'follow': return '#FFC300';
    case 'inspire': return '#FFC300';
    default: return '#888888';
  }
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const token = await getToken();
      const result = await api.getNotifications(token ?? '');
      if (result.success) setNotifications(result.notifications);
    } catch {
      // silently fail — empty list is fine
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      const token = await getToken();
      await api.markAllNotificationsRead(token ?? '');
    } catch {}
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
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
        <ScrollView style={styles.list}>
          {notifications.length === 0 ? (
            <View style={styles.endMessage}>
              <Text style={styles.endText}>✦ No notifications yet</Text>
            </View>
          ) : (
            notifications.map(item => (
              <View
                key={item.id}
                style={[styles.row, !item.read && styles.rowUnread]}
              >
                <View style={[styles.iconCircle, { backgroundColor: getIconColor(item.type) + '22' }]}>
                  <Text style={[styles.icon, { color: getIconColor(item.type) }]}>{getIcon(item.type)}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowUser}>
                    {item.actor_handle} <Text style={styles.rowMessage}>{getMessage(item)}</Text>
                  </Text>
                  <Text style={styles.rowTime}>{timeAgo(item.created_at)}</Text>
                </View>
                {!item.read && <View style={styles.unreadDot} />}
              </View>
            ))
          )}
          <View style={styles.endMessage}>
            <Text style={styles.endText}>✦ You're all caught up</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  title: { fontSize: 24, fontWeight: '700', color: '#FFC300' },
  markAll: { fontSize: 13, color: '#888888' },
  unreadBanner: { backgroundColor: '#1A1400', paddingVertical: 8, paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#FFC300' },
  unreadText: { fontSize: 13, color: '#FFC300', fontWeight: '600' },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A', gap: 12 },
  rowUnread: { backgroundColor: '#0D0D00' },
  iconCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  icon: { fontSize: 18, fontWeight: '700' },
  rowContent: { flex: 1 },
  rowUser: { fontSize: 14, color: '#FFC300', fontWeight: '700', lineHeight: 20 },
  rowMessage: { fontSize: 14, color: '#FFFFFF', fontWeight: '400' },
  rowTime: { fontSize: 12, color: '#888888', marginTop: 3 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFC300', flexShrink: 0 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 13, color: '#444444' },
});