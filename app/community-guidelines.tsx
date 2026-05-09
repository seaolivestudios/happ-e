import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const RULES = [
  {
    icon: 'megaphone-outline' as const,
    title: 'No politics',
    body: 'Happ-E is a place to create, share, and connect over things that bring you joy. Political content, debates, and divisive commentary don\'t belong here — not because we don\'t care about the world, but because this space exists for something different.',
  },
  {
    icon: 'eye-off-outline' as const,
    title: 'No nudity',
    body: 'Keep all content appropriate for a general audience. This includes photos, videos, and text. Sexual content of any kind will be removed and may result in account termination.',
  },
  {
    icon: 'pricetag-outline' as const,
    title: 'No selling',
    body: 'Happ-E is not a marketplace. Selling products, promoting affiliate links, advertising services, or soliciting business through posts or comments is not allowed. Share your craft because you love it — not to monetize it here.',
  },
  {
    icon: 'alert-circle-outline' as const,
    title: 'No cruelty',
    body: 'Content that depicts, celebrates, or encourages harm to people, animals, or any living being is strictly prohibited. This includes graphic violence, animal abuse, and content that normalizes or glorifies suffering.',
  },
  {
    icon: 'hand-left-outline' as const,
    title: 'No bullying',
    body: 'Everyone on Happ-E is a real person. Targeted harassment, personal attacks, hate speech, threats, or any behavior designed to make someone feel unsafe or unwelcome will result in immediate removal and account suspension.',
  },
];

const SPIRIT = [
  'Celebrate what you make, not what you buy.',
  'Lift others up. A kind comment costs nothing.',
  'Be genuine. Real moments are what make this place worth being.',
  'Disagree with grace, or not at all.',
  'If you wouldn\'t say it face to face, don\'t post it.',
];

export default function CommunityGuidelinesScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Community Guidelines</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.lead}>
          Happ-E exists to be the opposite of the internet you're tired of. These rules aren't a legal document — they're a promise we all make to each other.
        </Text>

        {RULES.map((rule) => (
          <View key={rule.title} style={styles.ruleCard}>
            <View style={styles.ruleHeader}>
              <View style={styles.iconWrap}>
                <Ionicons name={rule.icon} size={22} color="#FFC300" />
              </View>
              <Text style={styles.ruleTitle}>{rule.title}</Text>
            </View>
            <Text style={styles.ruleBody}>{rule.body}</Text>
          </View>
        ))}

        <View style={styles.spiritCard}>
          <Text style={styles.spiritHeading}>✦ The spirit of Happ-E</Text>
          {SPIRIT.map((line) => (
            <View key={line} style={styles.spiritRow}>
              <Text style={styles.spiritBullet}>—</Text>
              <Text style={styles.spiritText}>{line}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Report content that violates these guidelines using the Report a Problem option in Settings. We review every report.
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
  lead: { fontSize: 15, color: '#CCCCCC', lineHeight: 24, marginBottom: 24, fontStyle: 'italic' },
  ruleCard: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#222222', padding: 18, marginBottom: 14 },
  ruleHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  ruleTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  ruleBody: { fontSize: 14, color: '#AAAAAA', lineHeight: 22 },
  spiritCard: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#FFC300', padding: 20, marginTop: 8, marginBottom: 24 },
  spiritHeading: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 16 },
  spiritRow: { flexDirection: 'row', marginBottom: 10 },
  spiritBullet: { fontSize: 14, color: '#FFC300', marginRight: 10, marginTop: 1 },
  spiritText: { fontSize: 14, color: '#CCCCCC', lineHeight: 22, flex: 1 },
  footer: { fontSize: 13, color: '#666666', textAlign: 'center', lineHeight: 20 },
});
