import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  {
    title: 'Who we are',
    body: 'Happ-E is a positivity-focused social platform for sharing hobbies, crafts, and creative moments. We are an independent company. Our backend is operated through Railway and our media storage through Cloudinary.',
  },
  {
    title: 'Information we collect',
    body: 'Account information: name, email address, and password (stored as a secure hash — never in plain text). Profile information: bio, location, website, creative category, and interests you choose to share. Content: photos, videos, text, and quotes you post. Device information: a push notification token, used only to deliver notifications you have opted into.',
  },
  {
    title: 'How we use your information',
    body: 'We use your information exclusively to operate Happ-E: to authenticate you, display your profile and posts, match your interests with relevant content, and deliver notifications. We do not use your information for advertising, profiling, or any purpose beyond running the platform.',
  },
  {
    title: 'What we do not do',
    body: 'We do not sell your data. We do not share your data with advertisers. We do not build behavioral profiles. We do not use your content to train artificial intelligence models. We do not use tracking pixels or third-party analytics SDKs.',
  },
  {
    title: 'Data sharing',
    body: 'We use Cloudinary (media hosting) and Railway (server hosting) as infrastructure providers. These providers access your data only to store and serve files on our behalf. We have no data-sharing arrangements with any other third parties.',
  },
  {
    title: 'Data retention',
    body: 'We retain your data for as long as your account is active. When you delete your account, all personal data — including your profile, posts, comments, and activity — is permanently deleted within 30 days.',
  },
  {
    title: 'Security',
    body: 'Passwords are hashed using bcrypt. Data in transit is encrypted via HTTPS/TLS. We do not store payment information — all billing is handled by Apple through the App Store.',
  },
  {
    title: 'Your rights',
    body: 'You may request a copy of your data, correction of inaccurate data, or deletion of your account at any time. To exercise these rights, email privacy@happe.com or use the Delete Account option in Settings.',
  },
  {
    title: 'Children',
    body: 'Happ-E is not directed at children under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, please contact us at help@happe.com.',
  },
  {
    title: 'Changes to this policy',
    body: 'We will notify you in the app when we make material changes to this Privacy Policy. Continued use of Happ-E after notification constitutes acceptance of the updated policy.',
  },
  {
    title: 'Contact',
    body: 'Privacy questions or data requests: privacy@happe.com\nGeneral support: help@happe.com',
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.lead}>
          Your privacy is not a feature — it is the foundation. This policy explains exactly how Happ-E handles your information.
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
