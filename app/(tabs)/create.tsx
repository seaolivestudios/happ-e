import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from '../api';
import { getToken, getUser } from '../auth';

const categories = ['Woodworking', 'Photography', 'Painting', 'Outdoors', 'Fishing', 'Baseball', 'Music', 'Other'];

export default function CreateScreen() {
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; handle?: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getUser();
      if (user) setCurrentUser(user);
    }
    void loadUser();
  }, []);

  const pickFromLibrary = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
    }
  };

  const handlePickMedia = () => {
    Alert.alert('Add Media', 'Choose how to add your photo or video', [
      { text: 'Camera Roll', onPress: pickFromLibrary },
      { text: 'Take Photo / Video', onPress: takePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePost = async () => {
    if (!mediaUri) {
      Alert.alert('Add a photo or video', 'Please select something to share.');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Add a caption', 'Please write something about your post.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Choose a category', 'Please select a category for your post.');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('text', caption.trim());
      formData.append('category', selectedCategory);
      formData.append('type', mediaType ?? 'image');

      const filename = mediaUri.split('/').pop() ?? 'upload.jpg';
      const mimeType = mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

      formData.append('file', {
        uri: mediaUri,
        name: filename,
        type: mimeType,
      } as any);

      const result = await api.createPost(formData, token ?? '');

      if (result.success || result.id) {
        Alert.alert('Posted!', 'Your post has been shared.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/index') }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not upload your post. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Post</Text>
        <TouchableOpacity onPress={handlePost} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFC300" />
          ) : (
            <Text style={styles.share}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickMedia} disabled={loading}>
          {mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <>
              <Text style={styles.imagePickerIcon}>+</Text>
              <Text style={styles.imagePickerText}>Tap to add a photo or video</Text>
              <Text style={styles.imagePickerSub}>4:5 portrait or landscape widescreen</Text>
            </>
          )}
        </TouchableOpacity>

        {mediaUri && (
          <TouchableOpacity style={styles.changeMediaBtn} onPress={handlePickMedia} disabled={loading}>
            <Text style={styles.changeMediaText}>Change photo / video</Text>
          </TouchableOpacity>
        )}

        <View style={styles.captionRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </View>
          <TextInput
            style={styles.captionInput}
            placeholder="Share what you created..."
            placeholderTextColor="#888888"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
            editable={!loading}
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
              disabled={loading}
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
  previewImage: { width: '100%', height: '100%', borderRadius: 14 },
  imagePickerIcon: { fontSize: 48, color: '#FFC300', marginBottom: 8 },
  imagePickerText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  imagePickerSub: { fontSize: 12, color: '#888888', marginTop: 6 },
  changeMediaBtn: { alignItems: 'center', marginBottom: 16 },
  changeMediaText: { fontSize: 13, color: '#FFC300', fontWeight: '600' },
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