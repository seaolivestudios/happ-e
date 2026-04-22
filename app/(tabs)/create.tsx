import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const categories = ['Woodworking', 'Photography', 'Painting', 'Outdoors', 'Fishing', 'Baseball', 'Music', 'Other'];

export default function CreateScreen() {
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const handlePost = () => {
    if (!caption.trim()) {
      Alert.alert('Add a caption', 'Please write something about your post.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Choose a category', 'Please select a category for your post.');
      return;
    }
    Alert.alert('Posted!', 'Your post has been shared.', [
      { text: 'OK', onPress: () => router.replace('/(tabs)/index') }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity onPress={handlePost}>
          <Text style={styles.share}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        <TouchableOpacity style={styles.imagePicker}>
          <Text style={styles.imagePickerIcon}>+</Text>
          <Text style={styles.imagePickerText}>Tap to add a photo or video</Text>
          <Text style={styles.imagePickerSub}>4:5 portrait or landscape widescreen</Text>
        </TouchableOpacity>

        <View style={styles.captionRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <TextInput
            style={styles.captionInput}
            placeholder="Share what you created..."
            placeholderTextColor="#888888"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
          />
        </View>

        <Text style={styles.charCount}>{300 - caption.length} characters remaining</Text>

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.categoryGrid}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesTitle}>✦ Happ-E Community Guidelines</Text>
          <Text style={styles.guidelinesText}>Share your craft and creativity. No political content, no negativity, no memes. Keep it real and keep it kind.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  cancel: { fontSize: 16, color: '#888888' },
  title: { fontSize: 16, fontWeight: '700', color: '#FFC300' },
  share: { fontSize: 16, fontWeight: '700', color: '#FFC300' },
  body: { padding: 16 },
  imagePicker: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 2, borderColor: '#FFC300', borderStyle: 'dashed', height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  imagePickerIcon: { fontSize: 48, color: '#FFC300', marginBottom: 8 },
  imagePickerText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  imagePickerSub: { fontSize: 12, color: '#888888', marginTop: 6 },
  captionRow: { flexDirection: 'row', gap: 12, marginBottom: 8, alignItems: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  captionInput: { flex: 1, fontSize: 15, color: '#FFFFFF', minHeight: 80, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#888888', textAlign: 'right', marginBottom: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 12 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  categoryBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#333333', backgroundColor: '#111111' },
  categoryBtnActive: { backgroundColor: '#FFC300', borderColor: '#FFC300' },
  categoryText: { fontSize: 13, color: '#888888', fontWeight: '600' },
  categoryTextActive: { color: '#000000' },
  guidelinesBox: { backgroundColor: '#111111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFC300', marginBottom: 40 },
  guidelinesTitle: { fontSize: 13, fontWeight: '700', color: '#FFC300', marginBottom: 8 },
  guidelinesText: { fontSize: 13, color: '#FFFFFF', lineHeight: 20, opacity: 0.85 },
});