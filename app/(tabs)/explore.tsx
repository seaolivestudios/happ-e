import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function InspireScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspire</Text>
        <Text style={styles.subtitle}>Curated for you</Text>
      </View>
      <ScrollView style={styles.feed}>
        <View style={styles.card}>
          <Text style={styles.category}>Outdoors</Text>
          <Text style={styles.quote}>"Fishing is much more than fish. It is the great occasion when we may return to the fine simplicity of our forefathers."</Text>
          <Text style={styles.author}>— Herbert Hoover</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.category}>Baseball</Text>
          <Text style={styles.quote}>"It is not the size of a man but the size of his heart that matters."</Text>
          <Text style={styles.author}>— Hank Aaron</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.category}>Woodworking</Text>
          <Text style={styles.quote}>"Measure twice, cut once. In craft and in life."</Text>
          <Text style={styles.author}>— Old Proverb</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7FF' },
  header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center', backgroundColor: '#2D3047' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFD84D' },
  subtitle: { fontSize: 14, color: '#F7F7FF', marginTop: 4, opacity: 0.8 },
  feed: { padding: 16 },
  card: { backgroundColor: '#2D3047', borderRadius: 16, padding: 20, marginBottom: 14 },
  category: { fontSize: 11, fontWeight: '700', color: '#FFD84D', letterSpacing: 1, marginBottom: 10 },
  quote: { fontSize: 16, color: '#F7F7FF', lineHeight: 26, fontStyle: 'italic' },
  author: { fontSize: 13, color: '#2EC4B6', marginTop: 10, fontWeight: '600' },
});