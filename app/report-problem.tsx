import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getUser } from './auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from './components/KeyboardDoneBar';

const CATEGORIES = ['Bug or crash', 'Inappropriate content', 'Account issue', 'Feature request', 'Other'];

export default function ReportProblemScreen() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    getUser().then(u => { if (u?.email) setEmail(u.email); });
  }, []);

  const canSubmit = subject.trim().length > 0 && description.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const emailSubject = `[${category}] ${subject.trim()}`;
    const emailBody = [
      `Category: ${category}`,
      `From: ${email || 'not provided'}`,
      '',
      description.trim(),
    ].join('\n');

    const mailto = `mailto:oops@happe.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    Linking.openURL(mailto).catch(() => {
      Alert.alert('Could not open email', 'Please send your report directly to oops@happe.com');
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <KeyboardDoneBar />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Report a Problem</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          We review every report. Your feedback helps make Happ-E better for everyone.
        </Text>

        <Text style={styles.label}>Category</Text>
        <Pressable style={styles.categoryBtn} onPress={() => setCategoryOpen(v => !v)}>
          <Text style={styles.categoryBtnText}>{category}</Text>
          <Ionicons name={categoryOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#888888" />
        </Pressable>
        {categoryOpen && (
          <View style={styles.categoryList}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                style={[styles.categoryOption, c === category && styles.categoryOptionActive]}
                onPress={() => { setCategory(c); setCategoryOpen(false); }}
              >
                <Text style={[styles.categoryOptionText, c === category && styles.categoryOptionTextActive]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <Text style={styles.label}>Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="Brief summary of the issue"
          placeholderTextColor="#555555"
          value={subject}
          onChangeText={setSubject}
          maxLength={120}
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.inputMulti]}
          placeholder="Please describe what happened, what you expected, and any steps to reproduce..."
          placeholderTextColor="#555555"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />

        <Text style={styles.label}>Your email (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="So we can follow up with you"
          placeholderTextColor="#555555"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          inputAccessoryViewID={KEYBOARD_DONE_ID}
        />

        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>Send Report</Text>
        </Pressable>

        <Text style={styles.fine}>
          Tapping Send Report will open your email app with the form pre-filled. Send it from there to complete your report.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  backBtn: { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  headerRight: { width: 36 },
  body: { padding: 20, paddingBottom: 48 },
  intro: { fontSize: 14, color: '#888888', lineHeight: 22, marginBottom: 24 },
  label: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 0.8, marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#111111', borderRadius: 12, borderWidth: 1, borderColor: '#333333', padding: 14, color: '#FFFFFF', fontSize: 15 },
  inputMulti: { height: 140, paddingTop: 14 },
  categoryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111111', borderRadius: 12, borderWidth: 1, borderColor: '#333333', padding: 14 },
  categoryBtnText: { fontSize: 15, color: '#FFFFFF' },
  categoryList: { backgroundColor: '#111111', borderRadius: 12, borderWidth: 1, borderColor: '#333333', marginTop: 4, overflow: 'hidden' },
  categoryOption: { padding: 14, borderBottomWidth: 0.5, borderBottomColor: '#222222' },
  categoryOptionActive: { backgroundColor: '#1A1A1A' },
  categoryOptionText: { fontSize: 15, color: '#CCCCCC' },
  categoryOptionTextActive: { color: '#FFC300', fontWeight: '600' },
  submitBtn: { backgroundColor: '#FFC300', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 28 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  fine: { fontSize: 12, color: '#555555', textAlign: 'center', marginTop: 14, lineHeight: 18 },
});
