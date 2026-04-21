import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const categories = ['All', 'Outdoors', 'Baseball', 'Woodworking', 'Photography', 'Painting', 'Music', 'Fishing'];

const quotes = [
  { id: '1', category: 'Outdoors', text: '"Fishing is much more than fish. It is the great occasion when we may return to the fine simplicity of our forefathers."', author: '— Herbert Hoover' },
  { id: '2', category: 'Baseball', text: '"It is not the size of a man but the size of his heart that matters."', author: '— Hank Aaron' },
  { id: '3', category: 'Woodworking', text: '"Measure twice, cut once. In craft and in life."', author: '— Old Proverb' },
  { id: '4', category: 'Photography', text: '"Which of my photographs is my favorite? The one I\'m going to take tomorrow."', author: '— Imogen Cunningham' },
  { id: '5', category: 'Painting', text: '"Every artist dips his brush in his own soul, and paints his own nature into his pictures."', author: '— Henry Ward Beecher' },
  { id: '6', category: 'Music', text: '"Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything."', author: '— Plato' },
  { id: '7', category: 'Fishing', text: '"Many men go fishing all of their lives without knowing that it is not fish they are after."', author: '— Henry David Thoreau' },
  { id: '8', category: 'Outdoors', text: '"In every walk with nature, one receives far more than he seeks."', author: '— John Muir' },
  { id: '9', category: 'Baseball', text: '"Every strike brings me closer to the next home run."', author: '— Babe Ruth' },
  { id: '10', category: 'Woodworking', text: '"The details are not the details. They make the design."', author: '— Charles Eames' },
];

export default function InspireScreen() {
  const [selected, setSelected] = useState('All');

  const filtered = selected === 'All' ? quotes : quotes.filter(q => q.category === selected);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inspire</Text>
        <Text style={styles.subtitle}>Curated for you</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterBtn, selected === cat && styles.filterBtnActive]}
            onPress={() => setSelected(cat)}>
            <Text style={[styles.filterText, selected === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={styles.feed}>
        {filtered.map(item => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.quote}>{item.text}</Text>
            <Text style={styles.author}>{item.author}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { paddingTop: 60, paddingBottom: 20, alignItems: 'center', backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFC300' },
  subtitle: { fontSize: 14, color: '#FFFFFF', marginTop: 4 },
  filterRow: { maxHeight: 52, backgroundColor: '#000000' },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#888888' },
  filterBtnActive: { backgroundColor: '#FFC300', borderColor: '#FFC300' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#888888' },
  filterTextActive: { color: '#000000' },
  feed: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  category: { fontSize: 11, fontWeight: '700', color: '#FFC300', letterSpacing: 2, marginBottom: 12 },
  quote: { fontSize: 16, color: '#000000', lineHeight: 26, fontStyle: 'italic' },
  author: { fontSize: 13, color: '#888888', marginTop: 12, fontWeight: '600' },
});