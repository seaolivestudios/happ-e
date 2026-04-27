import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

const categories = ['Woodworking', 'Photography', 'Painting', 'Outdoors', 'Fishing', 'Baseball', 'Music', 'Other'];

export default function CreateScreen() {
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isWidescreen, setIsWidescreen] = useState(false);
  const [posting, setPosting] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePost = async () => {
    if (!caption.trim()) {
      Alert.alert('Add a caption', 'Please write something about your post.');
      return;
    }
    setPosting(true);
    try {
      const token = await getToken();
      const result = await api.createPost({
        type: 'post',
        text: caption,
        image_url: selectedImage || 'https://picsum.photos/seed/' + Date.now() + '/600/750',
        widescreen: isWidescreen,
      }, token || '');

      if (result.success) {
        Alert.alert('Posted!', 'Your post has been shared.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)' as any) }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Could not post. Please try again.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to Happ-E. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={posting}>
          {posting ? (
            <ActivityIndicator color="#FFC300" />
          ) : (
            <Text style={styles.share}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {selectedImage ? (
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image-outline" size={48} color="#FFC300" />
              <Text style={styles.imagePickerText}>Tap to add a photo</Text>
              <Text style={styles.imagePickerSub}>4:5 portrait or landscape widescreen</Text>
            </>
          )}
        </TouchableOpacity>

        {selectedImage && (
          <TouchableOpacity style={styles.removeImage} onPress={() => setSelectedImage(null)}>
            <Text style={styles.removeImageText}>Remove photo</Text>
          </TouchableOpacity>
        )}

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

        <TouchableOpacity style={styles.widescreenToggle} onPress={() => setIsWidescreen(!isWidescreen)}>
          <View style={styles.widescreenToggleLeft}>
            <Ionicons name="expand-outline" size={20} color="#FFC300" />
            <View>
              <Text style={styles.widescreenToggleTitle}>Widescreen / Landscape</Text>
              <Text style={styles.widescreenToggleSub}>Enable cinematic mode for this post</Text>
            </View>
          </View>
          <View style={[styles.toggleDot, isWidescreen && styles.toggleDotActive]}>
            <View style={[styles.toggleInner, isWidescreen && styles.toggleInnerActive]} />
          </View>
        </TouchableOpacity>

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
  imagePicker: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 2, borderColor: '#FFC300', borderStyle: 'dashed', height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  selectedImage: { width: '100%', height: '100%' },
  imagePickerText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600', marginTop: 12 },
  imagePickerSub: { fontSize: 12, color: '#888888', marginTop: 6 },
  removeImage: { alignItems: 'center', marginBottom: 16 },
  removeImageText: { fontSize: 13, color: '#FF4444' },
  captionRow: { flexDirection: 'row', gap: 12, marginBottom: 8, alignItems: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  captionInput: { flex: 1, fontSize: 15, color: '#FFFFFF', minHeight: 80, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#888888', textAlign: 'right', marginBottom: 20 },
  widescreenToggle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#111111', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#333333' },
  widescreenToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  widescreenToggleTitle: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  widescreenToggleSub: { fontSize: 11, color: '#888888' },
  toggleDot: { width: 44, height: 26, borderRadius: 13, backgroundColor: '#333333', justifyContent: 'center', paddingHorizontal: 3 },
  toggleDotActive: { backgroundColor: '#FFC300' },
  toggleInner: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#888888' },
  toggleInnerActive: { backgroundColor: '#000000', alignSelf: 'flex-end' },
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