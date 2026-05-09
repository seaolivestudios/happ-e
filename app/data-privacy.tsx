import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const SECTIONS = [
  {
    title: 'We never sell your data',
    body: 'Your personal information, usage patterns, interests, and content are yours. Happ-E does not sell, rent, trade, or license your data to third parties — ever. This is not a policy that changes with business conditions. It is a founding principle.',
  },
  {
    title: 'No targeted advertising',
    body: 'Because we do not sell your data, we have no advertising infrastructure. There are no ad networks, tracking pixels, or behavioral profiles built on your activity. The only reason your data exists in our system is to make the product work for you.',
  },
  {
    title: 'What we collect and why',
    body: 'We collect your name, email address, and the content you choose to post. We use this only to operate your account and deliver the service. We collect device push tokens solely to send you notifications you have opted into. We do not collect location data, contacts, or device identifiers beyond what is required for authentication.',
  },
  {
    title: 'Your content',
    body: 'Photos, videos, and text you post are hosted on secure cloud infrastructure. You retain full ownership of your content. We do not use your posts to train AI models, create advertising profiles, or derive commercial value beyond running the platform.',
  },
  {
    title: 'Data deletion',
    body: 'When you delete your account, all of your data — profile, posts, comments, and smiles — is permanently removed from our systems within 30 days. There are no backup archives or shadow profiles.',
  },
  {
    title: 'Third-party services',
    body: 'We use Cloudinary to store media files and Railway to host our servers. Both are industry-standard providers operating under their own privacy commitments. We do not share your personal information with these services beyond what is technically required to store your files.',
  },
  {
    title: 'Contact',
    body: 'Questions about your data? Email us at privacy@happe.com and we will respond within 5 business days.',
  },
];

export default function DataPrivacyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Data & Privacy</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.lead}>
          Happ-E is built on a simple belief: your data is yours. Here is exactly what we do — and don't do — with it.
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
