import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api, uploadMedia } from './api';
import { getToken, getUser } from './auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from './components/KeyboardDoneBar';

export default function SparkRespondScreen() {
  const { prompt } = useLocalSearchParams<{ prompt: string }>();
  const [caption, setCaption] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string } | null>(null);

  useEffect(() => {
    getUser().then(u => { if (u) setCurrentUser(u); });
  }, []);

  const handlePickMedia = () => {
    Alert.alert('Add Media', 'Choose how to add your photo or video', [
      { text: 'Camera Roll', onPress: pickFromLibrary },
      { text: 'Take Photo / Video', onPress: takePhoto },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

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

  const handleSubmit = async () => {
    if (!mediaUri) {
      Alert.alert('Add a photo or video', 'Show us your response to today\'s Spark.');
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Add a caption', 'Share a little about what you made or did.');
      return;
    }
    setLoading(true);
    try {
      const token = await getToken();
      const type = mediaType ?? 'image';
      const mediaUrl = await uploadMedia(mediaUri, type);
      const payload = {
        type,
        text: caption.trim(),
        image_url: type === 'image' ? mediaUrl : undefined,
        video_url: type === 'video' ? mediaUrl : undefined,
      };
      const result = await api.respondToSpark(payload, token ?? '');
      if (result.success || result.post) {
        Alert.alert('Spark submitted! ⚡', 'Your response has been shared with the community.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/sparks') },
        ]);
      } else {
        Alert.alert('Error', result.error ?? 'Something went wrong. Try again.');
      }
    } catch {
      Alert.alert('Error', 'Could not upload your response. Check your connection.');
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
        <Text style={styles.title}>⚡ Respond</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFC300" />
          ) : (
            <Text style={styles.share}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

        {/* Prompt banner */}
        <View style={styles.promptBanner}>
          <Text style={styles.promptLabel}>⚡ Today's Spark</Text>
          <Text style={styles.promptText}>"{prompt}"</Text>
        </View>

        {/* Media picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={handlePickMedia} disabled={loading}>
          {mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.previewImage} resizeMode="cover" />
          ) : (
            <>
              <Text style={styles.imagePickerIcon}>+</Text>
              <Text style={styles.imagePickerText}>Tap to add a photo or video</Text>
              <Text style={styles.imagePickerSub}>Show your response to today's Spark</Text>
            </>
          )}
        </TouchableOpacity>

        {mediaUri ? (
          <TouchableOpacity style={styles.changeMediaBtn} onPress={handlePickMedia} disabled={loading}>
            <Text style={styles.changeMediaText}>Change photo / video</Text>
          </TouchableOpacity>
        ) : null}

        {/* Caption */}
        <View style={styles.captionRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}
            </Text>
          </View>
          <TextInput
            style={styles.captionInput}
            placeholder="Tell us about your response..."
            placeholderTextColor="#888888"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
            editable={!loading}
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
        </View>
        <Text style={styles.charCount}>{300 - caption.length} characters remaining</Text>

      </ScrollView>
      <KeyboardDoneBar />
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
  promptBanner: { backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FFC300' },
  promptLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', letterSpacing: 1.5, marginBottom: 8 },
  promptText: { fontSize: 16, color: '#FFFFFF', lineHeight: 24, fontStyle: 'italic' },
  imagePicker: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 2, borderColor: '#FFC300', borderStyle: 'dashed', height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', borderRadius: 14 },
  imagePickerIcon: { fontSize: 48, color: '#FFC300', marginBottom: 8 },
  imagePickerText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  imagePickerSub: { fontSize: 12, color: '#888888', marginTop: 6, textAlign: 'center', paddingHorizontal: 24 },
  changeMediaBtn: { alignItems: 'center', marginBottom: 16 },
  changeMediaText: { fontSize: 13, color: '#FFC300', fontWeight: '600' },
  captionRow: { flexDirection: 'row', gap: 12, marginBottom: 8, alignItems: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  captionInput: { flex: 1, fontSize: 15, color: '#FFFFFF', minHeight: 80, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#888888', textAlign: 'right', marginBottom: 40 },
});
