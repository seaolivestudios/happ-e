import { router } from 'expo-router';
import { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from './api';
import { getToken } from './auth';
import { INTEREST_CATEGORIES, getLabelById } from './interests';

const { width } = Dimensions.get('window');

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
      const labels = selected.map(getLabelById);
      getToken().then(token => {
        api.completeOnboarding(labels, token ?? '').catch(() => {});
      }).catch(() => {});
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
        <Text style={styles.stepText}>Step 1 of 2</Text>
      </View>
      <Text style={styles.title}>What are you into?</Text>
      <Text style={styles.subtitle}>Pick at least 3 interests. We'll personalize your Inspire feed around what matters to you.</Text>
      <ScrollView style={styles.grid} contentContainerStyle={styles.gridContent}>
        {INTEREST_CATEGORIES.map(section => (
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