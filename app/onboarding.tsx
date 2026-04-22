import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const interestCategories = [
  {
    heading: 'Sports',
    items: [
      { id: 's1', label: 'Baseball', emoji: '⚾' },
      { id: 's2', label: 'Basketball', emoji: '🏀' },
      { id: 's3', label: 'Football', emoji: '🏈' },
      { id: 's4', label: 'Hockey', emoji: '🏒' },
      { id: 's5', label: 'Soccer', emoji: '⚽' },
      { id: 's6', label: 'Golf', emoji: '⛳' },
      { id: 's7', label: 'Tennis', emoji: '🎾' },
      { id: 's8', label: 'Cycling', emoji: '🚴' },
      { id: 's9', label: 'Running', emoji: '🏃' },
      { id: 's10', label: 'Surfing', emoji: '🏄' },
      { id: 's11', label: 'Skiing', emoji: '⛷️' },
      { id: 's12', label: 'Wrestling', emoji: '🤼' },
    ],
  },
  {
    heading: 'Art',
    items: [
      { id: 'a1', label: 'Painting', emoji: '🎨' },
      { id: 'a2', label: 'Drawing', emoji: '✏️' },
      { id: 'a3', label: 'Sculpting', emoji: '🗿' },
      { id: 'a4', label: 'Photography', emoji: '📷' },
      { id: 'a5', label: 'Videography', emoji: '🎥' },
      { id: 'a6', label: 'Digital Art', emoji: '🖥️' },
      { id: 'a7', label: 'Illustration', emoji: '🖊️' },
      { id: 'a8', label: 'Printmaking', emoji: '🖨️' },
      { id: 'a9', label: 'Calligraphy', emoji: '✒️' },
      { id: 'a10', label: 'Street Art', emoji: '🏙️' },
    ],
  },
  {
    heading: 'Crafting',
    items: [
      { id: 'c1', label: 'Woodworking', emoji: '🪵' },
      { id: 'c2', label: 'Pottery', emoji: '🏺' },
      { id: 'c3', label: 'Knitting', emoji: '🧶' },
      { id: 'c4', label: 'Sewing', emoji: '🧵' },
      { id: 'c5', label: 'Leatherwork', emoji: '🧤' },
      { id: 'c6', label: 'Jewelry', emoji: '💍' },
      { id: 'c7', label: 'Candle Making', emoji: '🕯️' },
      { id: 'c8', label: 'Blacksmithing', emoji: '⚒️' },
      { id: 'c9', label: 'Glassblowing', emoji: '🫧' },
      { id: 'c10', label: 'Weaving', emoji: '🧺' },
    ],
  },
  {
    heading: 'Outdoors',
    items: [
      { id: 'o1', label: 'Fishing', emoji: '🎣' },
      { id: 'o2', label: 'Hiking', emoji: '🥾' },
      { id: 'o3', label: 'Camping', emoji: '🏕️' },
      { id: 'o4', label: 'Hunting', emoji: '🦌' },
      { id: 'o5', label: 'Gardening', emoji: '🌱' },
      { id: 'o6', label: 'Bird Watching', emoji: '🦅' },
      { id: 'o7', label: 'Rock Climbing', emoji: '🧗' },
      { id: 'o8', label: 'Kayaking', emoji: '🛶' },
      { id: 'o9', label: 'Mountain Biking', emoji: '🚵' },
      { id: 'o10', label: 'Foraging', emoji: '🍄' },
    ],
  },
  {
    heading: 'Music',
    items: [
      { id: 'm1', label: 'Guitar', emoji: '🎸' },
      { id: 'm2', label: 'Piano', emoji: '🎹' },
      { id: 'm3', label: 'Drums', emoji: '🥁' },
      { id: 'm4', label: 'Singing', emoji: '🎤' },
      { id: 'm5', label: 'Violin', emoji: '🎻' },
      { id: 'm6', label: 'DJ', emoji: '🎧' },
      { id: 'm7', label: 'Songwriting', emoji: '🎼' },
      { id: 'm8', label: 'Bass', emoji: '🎵' },
      { id: 'm9', label: 'Trumpet', emoji: '🎺' },
      { id: 'm10', label: 'Ukulele', emoji: '🪕' },
    ],
  },
  {
    heading: 'Food & Drink',
    items: [
      { id: 'f1', label: 'Cooking', emoji: '🍳' },
      { id: 'f2', label: 'Baking', emoji: '🥖' },
      { id: 'f3', label: 'BBQ', emoji: '🔥' },
      { id: 'f4', label: 'Brewing', emoji: '🍺' },
      { id: 'f5', label: 'Wine', emoji: '🍷' },
      { id: 'f6', label: 'Coffee', emoji: '☕' },
      { id: 'f7', label: 'Cocktails', emoji: '🍹' },
      { id: 'f8', label: 'Smoking Meats', emoji: '🥩' },
    ],
  },
  {
    heading: 'Lifestyle',
    items: [
      { id: 'l1', label: 'Yoga', emoji: '🧘' },
      { id: 'l2', label: 'Fitness', emoji: '💪' },
      { id: 'l3', label: 'Meditation', emoji: '🌿' },
      { id: 'l4', label: 'Travel', emoji: '✈️' },
      { id: 'l5', label: 'Journaling', emoji: '📓' },
      { id: 'l6', label: 'Reading', emoji: '📚' },
      { id: 'l7', label: 'Volunteering', emoji: '🤝' },
      { id: 'l8', label: 'Astronomy', emoji: '🔭' },
      { id: 'l9', label: 'Cars', emoji: '🚗' },
      { id: 'l10', label: 'Motorcycles', emoji: '🏍️' },
    ],
  },
];

export default function OnboardingScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    if (step === 1) {
      if (selected.length < 3) return;
      setStep(2);
    } else {
      router.replace('/(tabs)' as any);
    }
  };

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.logo}>Happ-E</Text>
          <Text style={styles.welcomeTitle}>You're all set.</Text>
          <Text style={styles.welcomeSub}>Your feed is ready. Your inspire cards are personalized. Welcome to a better kind of social.</Text>
        </View>
        <View style={styles.featuresBox}>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>✦</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>No ads. Ever.</Text>
              <Text style={styles.featureDesc}>Your experience is never sold to the highest bidder.</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>✦</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Real people only.</Text>
              <Text style={styles.featureDesc}>Every account is verified with a real government ID.</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>✦</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Kindness required.</Text>
              <Text style={styles.featureDesc}>Negativity, politics, and memes have no place here.</Text>
            </View>
          </View>
          <View style={styles.featureRow}>
            <Text style={styles.featureIcon}>✦</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Rotate to go widescreen.</Text>
              <Text style={styles.featureDesc}>Turn your phone sideways to see content the way it was meant to be seen.</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Enter Happ-E</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>Happ-E</Text>
        <Text style={styles.stepText}>Step 2 of 2</Text>
      </View>
      <Text style={styles.title}>What are you into?</Text>
      <Text style={styles.subtitle}>Pick at least 3 interests. We'll personalize your Inspire feed around what matters to you.</Text>
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        {interestCategories.map(section => (
          <View key={section.heading}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            <View style={styles.interestGrid}>
              {section.items.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.interestBtn, selected.includes(item.id) && styles.interestBtnActive]}
                  onPress={() => toggle(item.id)}
                >
                  <Text style={styles.interestEmoji}>{item.emoji}</Text>
                  <Text style={[styles.interestLabel, selected.includes(item.id) && styles.interestLabelActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>{selected.length} selected {selected.length < 3 ? `— pick ${3 - selected.length} more` : '— looking good!'}</Text>
        <TouchableOpacity
          style={[styles.continueBtn, selected.length < 3 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={selected.length < 3}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#FFC300' },
  stepText: { fontSize: 13, color: '#888888' },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', paddingHorizontal: 24, marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888888', paddingHorizontal: 24, marginBottom: 20, lineHeight: 20 },
  grid: { flex: 1 },
  gridContent: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionHeading: { fontSize: 14, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 12, marginTop: 20 },
  interestGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  interestBtn: { backgroundColor: '#111111', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333', width: (width - 52) / 3 },
  interestBtnActive: { backgroundColor: '#FFC300', borderColor: '#FFC300' },
  interestEmoji: { fontSize: 22, marginBottom: 4 },
  interestLabel: { fontSize: 11, color: '#888888', fontWeight: '600', textAlign: 'center' },
  interestLabelActive: { color: '#000000' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: '#222222' },
  selectedCount: { fontSize: 13, color: '#888888', marginBottom: 12, textAlign: 'center' },
  continueBtn: { backgroundColor: '#FFC300', borderRadius: 14, padding: 16, alignItems: 'center' },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  welcomeTitle: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', marginTop: 16, marginBottom: 12, textAlign: 'center' },
  welcomeSub: { fontSize: 15, color: '#888888', textAlign: 'center', lineHeight: 24 },
  featuresBox: { padding: 24, gap: 20 },
  featureRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  featureIcon: { fontSize: 16, color: '#FFC300', marginTop: 2 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  featureDesc: { fontSize: 13, color: '#888888', lineHeight: 18 },
});