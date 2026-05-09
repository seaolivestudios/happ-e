import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from './api';
import { getToken } from './auth';

type BlockedUser = {
  id: string;
  name: string;
  handle: string;
  avatar_url: string | null;
};

export default function BlockedUsersScreen() {
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      const token = await getToken();
      const res = await api.getBlockedUsers(token ?? '');
      if (res.success) {
        setBlocked((res.blocked ?? []).map((u: any) => ({ ...u, id: String(u.id) })));
      }
    } catch {
      // non-fatal
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert('Unblock', `Unblock ${user.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        onPress: async () => {
          try {
            const token = await getToken();
            await api.unblockUser(user.id, token ?? '');
            setBlocked(prev => prev.filter(u => u.id !== user.id));
          } catch {
            Alert.alert('Error', 'Could not unblock user.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable hitSlop={12} onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Blocked Users</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FFC300" />
        </View>
      ) : blocked.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No blocked users</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {blocked.map(user => (
            <View key={user.id} style={styles.row}>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarLetter}>{user.name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.handle}>{user.handle}</Text>
              </View>
              <Pressable style={styles.unblockBtn} onPress={() => handleUnblock(user)}>
                <Text style={styles.unblockText}>Unblock</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  backBtn: { width: 40 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888888', fontSize: 15 },
  list: { padding: 16, gap: 12 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#111111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#222222' },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#333333', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 18, fontWeight: '700', color: '#FFC300' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  handle: { fontSize: 13, color: '#888888', marginTop: 2 },
  unblockBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#FFC300', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  unblockText: { fontSize: 13, fontWeight: '600', color: '#FFC300' },
});
