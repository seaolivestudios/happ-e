import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  {
    title: '1. Acceptance',
    body: 'By creating an account or using Happ-E, you agree to these Terms of Service. If you do not agree, do not use the platform. We may update these terms from time to time and will notify you of material changes via the app.',
  },
  {
    title: '2. Eligibility',
    body: 'You must be at least 18 years old to use Happ-E. By registering, you confirm that you meet this requirement and that all information you provide is accurate.',
  },
  {
    title: '3. Your account',
    body: 'You are responsible for maintaining the security of your account and password. You may not share your account or transfer it to another person. Notify us immediately at help@happe.com if you suspect unauthorized access.',
  },
  {
    title: '4. Content you post',
    body: 'You retain ownership of all content you post. By posting, you grant Happ-E a limited, non-exclusive license to store, display, and distribute your content within the platform solely for the purpose of operating the service. We do not claim ownership of your work.',
  },
  {
    title: '5. Prohibited conduct',
    body: 'You may not post or engage in: political content, nudity or sexual material, commercial solicitation or selling, animal cruelty or violent content, bullying, harassment, or targeted abuse, impersonation, spam, or automated bot activity. Violations may result in immediate account suspension.',
  },
  {
    title: '6. Content removal',
    body: 'We reserve the right to remove content that violates these terms or our Community Guidelines at any time without notice. Repeat violations will result in permanent account termination.',
  },
  {
    title: '7. Subscription',
    body: 'Happ-E is a subscription-based service at $4.99 per month. Subscriptions are billed through the App Store and are subject to Apple\'s terms. You can cancel at any time through your App Store account settings. Refunds are handled by Apple in accordance with their standard policies.',
  },
  {
    title: '8. Disclaimer of warranties',
    body: 'Happ-E is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service or that the platform will be error-free. Your use of the platform is at your own risk.',
  },
  {
    title: '9. Limitation of liability',
    body: 'To the maximum extent permitted by law, Happ-E and its founders shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
  },
  {
    title: '10. Governing law',
    body: 'These terms are governed by the laws of the State of Florida, USA. Any disputes shall be resolved in the courts of Palm Beach County, Florida.',
  },
  {
    title: '11. Contact',
    body: 'Questions about these terms? Email us at help@happe.com.',
  },
];

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.lead}>
          These terms govern your use of Happ-E. Please read them carefully.
        </Text>

        {SECTIONS.map((s) => (
          <View key={s.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{s.title}</Text>
            <Text style={styles.sectionBody}>{s.body}</Text>
          </View>
        ))}

        <Text style={styles.updated}>Last updated May 2026</Text>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#FFC300', marginBottom: 8 },
  sectionBody: { fontSize: 14, color: '#CCCCCC', lineHeight: 22 },
  updated: { fontSize: 12, color: '#555555', marginTop: 8, textAlign: 'center' },
});
