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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 60, paddingBottom: 24, alignItems: 'center', backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#000000' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  handle: { fontSize: 14, color: '#FFC300', marginTop: 2 },
  badge: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  body: { padding: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  statLabel: { fontSize: 12, color: '#888888', marginTop: 2 },
  bioCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  bioLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', marginBottom: 6, letterSpacing: 1 },
  bioText: { fontSize: 15, color: '#000000', lineHeight: 22 },
  verifiedCard: { backgroundColor: '#000000', borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center' },
  verifiedText: { fontSize: 14, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },
  verifiedSub: { fontSize: 12, color: '#FFFFFF', marginTop: 4 },
});