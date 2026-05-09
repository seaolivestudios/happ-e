import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PERKS = [
  { icon: 'ban-outline' as const,        text: 'Zero ads. Ever.' },
  { icon: 'shield-checkmark-outline' as const, text: 'Verified real people only' },
  { icon: 'happy-outline' as const,      text: 'Positive-only community' },
  { icon: 'flash-outline' as const,      text: 'Daily Sparks creative challenges' },
  { icon: 'heart-outline' as const,      text: 'Support an indie social platform' },
  { icon: 'star-outline' as const,       text: 'Early access to new features' },
];

export default function SubscriptionScreen() {
  const handleSubscribe = () => {
    Alert.alert(
      'Coming Soon',
      'In-app subscription will be available in the next update. Thank you for your support!',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.badge}>✦ Happ-E Monthly</Text>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.priceSub}>per month · cancel any time</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's included</Text>
          {PERKS.map((perk) => (
            <View key={perk.text} style={styles.perkRow}>
              <Ionicons name={perk.icon} size={20} color="#FFC300" style={styles.perkIcon} />
              <Text style={styles.perkText}>{perk.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our promise</Text>
          <Text style={styles.bodyText}>
            Happ-E will never sell your data, show you targeted ads, or use your content to train AI models. Your subscription directly funds the people building this platform.
          </Text>
        </View>

        <Pressable style={styles.subscribeBtn} onPress={handleSubscribe}>
          <Text style={styles.subscribeBtnText}>Subscribe for $4.99 / month</Text>
        </Pressable>

        <Text style={styles.fine}>
          Subscription renews monthly. Manage or cancel at any time in your App Store account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  backBtn: { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  headerRight: { width: 36 },
  body: { padding: 20, paddingBottom: 48 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  badge: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1.5, marginBottom: 16 },
  price: { fontSize: 56, fontWeight: '800', color: '#FFFFFF', lineHeight: 60 },
  priceSub: { fontSize: 14, color: '#888888', marginTop: 6 },
  card: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#222222', padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 16 },
  perkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  perkIcon: { marginRight: 12 },
  perkText: { fontSize: 15, color: '#FFFFFF', flex: 1 },
  bodyText: { fontSize: 14, color: '#CCCCCC', lineHeight: 22 },
  subscribeBtn: { backgroundColor: '#FFC300', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  subscribeBtnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  fine: { fontSize: 11, color: '#555555', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
