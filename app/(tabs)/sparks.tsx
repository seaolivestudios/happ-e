import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const todaysSpark = {
  prompt: 'Show us your workspace right now — messy or not.',
  timeLeft: '31h left',
  responses: 847,
};

const topSparks = [
  { id: 't1', user: '@jake', name: 'Jake Miller', image: 'https://picsum.photos/seed/spark1/600/750', caption: 'My shop at 6am. Coffee mandatory.', smiles: 412, category: 'Woodworking' },
  { id: 't2', user: '@maria', name: 'Maria Santos', image: 'https://picsum.photos/seed/spark2/600/750', caption: 'Chaos is part of the process.', smiles: 389, category: 'Photography' },
  { id: 't3', user: '@sarah', name: 'Sarah Creates', image: 'https://picsum.photos/seed/spark3/600/750', caption: 'Paint everywhere. No regrets.', smiles: 301, category: 'Painting' },
  { id: 't4', user: '@outdoors', name: 'Tom Harris', image: 'https://picsum.photos/seed/spark4/600/750', caption: 'Office view today. Not bad.', smiles: 278, category: 'Outdoors' },
  { id: 't5', user: '@craftsman', name: 'Joe Briggs', image: 'https://picsum.photos/seed/spark5/600/750', caption: 'Tools of the trade. Always ready.', smiles: 245, category: 'Woodworking' },
];

const moreSparks = [
  { id: 'm1', user: '@potter', name: 'Grace Liu', image: 'https://picsum.photos/seed/spark6/600/750', caption: 'Clay everywhere. Just how I like it.', smiles: 198, category: 'Pottery' },
  { id: 'm2', user: '@guitar', name: 'Mike Davis', image: 'https://picsum.photos/seed/spark7/600/750', caption: 'Three guitars, one notebook, zero excuses.', smiles: 176, category: 'Music' },
  { id: 'm3', user: '@garden', name: 'Anne Walsh', image: 'https://picsum.photos/seed/spark8/600/750', caption: 'Dirt under my nails is a good sign.', smiles: 154, category: 'Gardening' },
  { id: 'm4', user: '@fishing', name: 'Dale Reeves', image: 'https://picsum.photos/seed/spark9/600/750', caption: 'Tackle box organized. Almost.', smiles: 143, category: 'Fishing' },
  { id: 'm5', user: '@baker', name: 'Lily Chen', image: 'https://picsum.photos/seed/spark10/600/750', caption: 'Flour on everything. Worth it.', smiles: 132, category: 'Cooking' },
  { id: 'm6', user: '@hiker', name: 'Ben Torres', image: 'https://picsum.photos/seed/spark11/600/750', caption: 'Pack ready. Sunrise in 4 hours.', smiles: 121, category: 'Outdoors' },
  { id: 'm7', user: '@woodcraft', name: 'Ray Santos', image: 'https://picsum.photos/seed/spark12/600/750', caption: 'Sawdust is my perfume.', smiles: 118, category: 'Woodworking' },
  { id: 'm8', user: '@sculptor', name: 'Rita Patel', image: 'https://picsum.photos/seed/spark13/600/750', caption: 'Mid-project chaos is the best chaos.', smiles: 109, category: 'Sculpting' },
];

const SparkCard = ({ item, rank }: { item: any, rank?: number }) => (
  <View style={styles.sparkCard}>
    <View style={styles.sparkCardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userHandle}>{item.user} · {item.category}</Text>
      </View>
      {rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
    </View>
    <Image source={{ uri: item.image }} style={styles.sparkImage} resizeMode="cover" />
    <View style={styles.sparkCardFooter}>
      <Text style={styles.sparkCaption}>{item.caption}</Text>
      <View style={styles.sparkActions}>
        <TouchableOpacity style={styles.sparkActionBtn}>
          <Ionicons name="happy-outline" size={20} color="#333333" />
          <Text style={styles.sparkActionCount}>{item.smiles}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkActionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#333333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkActionBtn}>
          <Ionicons name="arrow-redo-outline" size={20} color="#333333" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function SparksScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Sparks</Text>
        <Text style={styles.subtitle}>A new creative challenge every 48 hours</Text>
      </View>
      <ScrollView style={styles.body}>
        <View style={styles.todayBanner}>
          <View style={styles.todayBannerTop}>
            <View>
              <Text style={styles.todayLabel}>⚡ Today's Spark</Text>
              <Text style={styles.todayTime}>{todaysSpark.timeLeft} · {todaysSpark.responses} responses</Text>
            </View>
            <TouchableOpacity style={styles.respondBtn}>
              <Text style={styles.respondBtnText}>Respond</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.todayPrompt}>{todaysSpark.prompt}</Text>
        </View>

        <Text style={styles.sectionLabel}>🏆 Top Sparks Today</Text>
        <Text style={styles.sectionSub}>Voted by the community</Text>

        {topSparks.map((item, index) => (
          <SparkCard key={item.id} item={item} rank={index + 1} />
        ))}

        <Text style={styles.sectionLabel}>More Sparks</Text>

        {moreSparks.map(item => (
          <SparkCard key={item.id} item={item} />
        ))}

        <View style={styles.endMessage}>
          <Text style={styles.endText}>⚡ You've seen all of today's Sparks</Text>
          <Text style={styles.endSub}>Come back tomorrow for a new challenge</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  title: { fontSize: 26, fontWeight: '700', color: '#FFC300' },
  subtitle: { fontSize: 13, color: '#888888', marginTop: 2 },
  body: { flex: 1 },
  todayBanner: { backgroundColor: '#000000', margin: 12, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#FFC300' },
  todayBannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  todayLabel: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },
  todayTime: { fontSize: 11, color: '#888888', marginTop: 3 },
  todayPrompt: { fontSize: 18, color: '#FFFFFF', lineHeight: 26, fontStyle: 'italic' },
  respondBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  respondBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#000000', paddingHorizontal: 16, marginTop: 20, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#888888', paddingHorizontal: 16, marginBottom: 12 },
  sparkCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  sparkCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '700', color: '#000000' },
  userHandle: { fontSize: 11, color: '#888888', marginTop: 1 },
  rankBadge: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rankText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  sparkImage: { width: '100%', height: 280 },
  sparkCardFooter: { padding: 12 },
  sparkCaption: { fontSize: 14, color: '#000000', lineHeight: 20, marginBottom: 10 },
  sparkActions: { flexDirection: 'row', gap: 20, borderTopWidth: 0.5, borderTopColor: '#E0E0E0', paddingTop: 10 },
  sparkActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparkActionCount: { fontSize: 13, color: '#888888' },
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  endSub: { fontSize: 12, color: '#888888', marginTop: 4 },
});