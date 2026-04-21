import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <Text style={styles.name}>Stephen</Text>
        <Text style={styles.handle}>@stephen</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Woodworker</Text>
        </View>
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
        <View style={styles.bioCard}>
          <Text style={styles.bioLabel}>About</Text>
          <Text style={styles.bioText}>Passionate about craft, creativity, and real human connection. Welcome to Happ-E.</Text>
        </View>
        <View style={styles.verifiedCard}>
          <Text style={styles.verifiedText}>✦ Verified Real Person</Text>
          <Text style={styles.verifiedSub}>Identity confirmed · No bots here</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FF' },
  header: { paddingTop: 60, paddingBottom: 24, alignItems: 'center', backgroundColor: '#2D3047' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2EC4B6', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#F7F7FF' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#F7F7FF' },
  handle: { fontSize: 14, color: '#2EC4B6', marginTop: 2 },
  badge: { backgroundColor: '#FF7A59', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#F7F7FF' },
  body: { padding: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#E0E0E0' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#2D3047' },
  statLabel: { fontSize: 12, color: '#888888', marginTop: 2 },
  bioCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 0.5, borderColor: '#E0E0E0' },
  bioLabel: { fontSize: 12, fontWeight: '700', color: '#FF7A59', marginBottom: 6, letterSpacing: 1 },
  bioText: { fontSize: 15, color: '#2D3047', lineHeight: 22 },
  verifiedCard: { backgroundColor: '#2D3047', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center' },
  verifiedText: { fontSize: 14, fontWeight: '700', color: '#FFD84D', letterSpacing: 1 },
  verifiedSub: { fontSize: 12, color: '#2EC4B6', marginTop: 4 },
});