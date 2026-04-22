import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const initialNotifications = [
  { id: '1', type: 'like', user: '@maria', message: 'liked your photo', time: '2m ago', read: false },
  { id: '2', type: 'comment', user: '@jake', message: 'commented: "This is incredible work!"', time: '15m ago', read: false },
  { id: '3', type: 'follow', user: '@outdoorlife', message: 'started following you', time: '1h ago', read: false },
  { id: '4', type: 'inspire', user: '✦ Inspire', message: 'New quote added to your Woodworking feed', time: '2h ago', read: false },
  { id: '5', type: 'like', user: '@craftsman_joe', message: 'liked your photo', time: '3h ago', read: true },
  { id: '6', type: 'comment', user: '@sarah_creates', message: 'commented: "How long did this take you?"', time: '5h ago', read: true },
  { id: '7', type: 'follow', user: '@fishinglife', message: 'started following you', time: '8h ago', read: true },
  { id: '8', type: 'inspire', user: '✦ Inspire', message: 'New quote added to your Outdoors feed', time: '1d ago', read: true },
  { id: '9', type: 'like', user: '@woodcraft', message: 'liked your photo', time: '1d ago', read: true },
  { id: '10', type: 'comment', user: '@nature_lens', message: 'commented: "Beautiful shot!"', time: '2d ago', read: true },
];

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
  const [notifications, setNotifications] = useState(initialNotifications);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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

      <ScrollView style={styles.list}>
        {notifications.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, !item.read && styles.rowUnread]}
            onPress={() => markRead(item.id)}
          >
            <View style={[styles.iconCircle, { backgroundColor: getIconColor(item.type) + '22' }]}>
              <Text style={[styles.icon, { color: getIconColor(item.type) }]}>{getIcon(item.type)}</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowUser}>{item.user} <Text style={styles.rowMessage}>{item.message}</Text></Text>
              <Text style={styles.rowTime}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}

        <View style={styles.endMessage}>
          <Text style={styles.endText}>✦ You're all caught up</Text>
        </View>
      </ScrollView>
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
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 13, color: '#444444' },
});