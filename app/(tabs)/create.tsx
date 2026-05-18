import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ResizeMode, Video } from 'expo-av';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, uploadMedia } from '../api';
import { getToken, getUser } from '../auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '../components/KeyboardDoneBar';
import { ALL_CATEGORIES } from '../categories';

type Step = 'pick' | 'compose';

export default function CreateScreen() {
  const [step, setStep] = useState<Step>('pick');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  type UploadPhase = 'idle' | 'uploading' | 'posting';
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const loading = uploadPhase !== 'idle';
  const [isWidescreen, setIsWidescreen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; handle?: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await getUser();
      if (user) setCurrentUser(user);
    }
    void loadUser();
  }, []);

  // Reset state when tab is focused fresh
  const resetAll = () => {
    setStep('pick');
    setMediaUri(null);
    setMediaType('image');
    setCaption('');
    setSelectedCategory('');
    setCategorySearch('');
    setUploadPhase('idle');
    setIsWidescreen(false);
  };

  const pickFromLibrary = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      quality: 0.9,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      setStep('compose');
    }
  };

  const takePhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('image');
      setStep('compose');
    }
  };

  const recordVideo = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      videoMaxDuration: 60,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setMediaUri(result.assets[0].uri);
      setMediaType('video');
      setStep('compose');
    }
  };

  const pickCinemaFromLibrary = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow photo library access in Settings.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.9,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]) {
      setIsWidescreen(true);
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      setStep('compose');
    }
  };

  const takeCinemaPhoto = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.9,
      videoMaxDuration: 60,
    });
    if (!result.canceled && result.assets[0]) {
      setIsWidescreen(true);
      setMediaUri(result.assets[0].uri);
      setMediaType(result.assets[0].type === 'video' ? 'video' : 'image');
      setStep('compose');
    }
  };

  const handleCinemaPress = () => {
    Alert.alert('Cinema Mode', 'Capture in widescreen (16:9) for the Cinema feed', [
      { text: 'Camera Roll', onPress: () => void pickCinemaFromLibrary() },
      { text: 'Take Photo / Video', onPress: () => void takeCinemaPhoto() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handlePost = async () => {
    if (!mediaUri) {
      Alert.alert('Add media', 'Please select a photo or video.');
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

    const token = await getToken();
    if (!token) {
      Alert.alert('Session expired', 'Please sign in again.');
      router.replace('/login' as any);
      return;
    }

    setUploadPhase('uploading');
    try {
      const mediaUrl = await uploadMedia(mediaUri, mediaType);
      setUploadPhase('posting');
      const payload = {
        type: mediaType,
        text: caption.trim(),
        image_url: mediaType === 'image' ? mediaUrl : undefined,
        video_url: mediaType === 'video' ? mediaUrl : undefined,
        category: selectedCategory,
        widescreen: isWidescreen,
      };
      const result = await api.createPost(payload, token);
      if (result.success || result.post) {
        // Brief pause so the backend finishes indexing before the feed reloads
        await new Promise(resolve => setTimeout(resolve, 1500));
        resetAll();
        router.replace('/');
      } else {
        Alert.alert('Error', result.error || 'Something went wrong.');
        setUploadPhase('idle');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not upload your post.';
      Alert.alert('Upload error', msg);
      setUploadPhase('idle');
    }
  };

  const filteredCategories = useMemo(() => {
    const q = categorySearch.trim().toLowerCase();
    return q ? ALL_CATEGORIES.filter(c => c.toLowerCase().includes(q)) : ALL_CATEGORIES;
  }, [categorySearch]);

  // ─── Step 1: Pick media ───────────────────────────────────────────────────

  if (step === 'pick') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={{ width: 60 }} />
          <Text style={styles.headerTitle}>New Post</Text>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>

        <View style={styles.pickBody}>
          <Text style={styles.pickPrompt}>How do you want to share?</Text>

          <Pressable style={styles.pickOption} onPress={takePhoto}>
            <View style={styles.pickIconCircle}>
              <Ionicons name="camera" size={32} color="#000000" />
            </View>
            <View style={styles.pickOptionText}>
              <Text style={styles.pickOptionTitle}>Take a Photo</Text>
              <Text style={styles.pickOptionSub}>Open your camera and capture a moment</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#444444" />
          </Pressable>

          <Pressable style={styles.pickOption} onPress={recordVideo}>
            <View style={styles.pickIconCircle}>
              <Ionicons name="videocam" size={32} color="#000000" />
            </View>
            <View style={styles.pickOptionText}>
              <Text style={styles.pickOptionTitle}>Record a Video</Text>
              <Text style={styles.pickOptionSub}>Up to 60 seconds</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#444444" />
          </Pressable>

          <Pressable style={styles.pickOption} onPress={pickFromLibrary}>
            <View style={styles.pickIconCircle}>
              <Ionicons name="images" size={32} color="#000000" />
            </View>
            <View style={styles.pickOptionText}>
              <Text style={styles.pickOptionTitle}>Camera Roll</Text>
              <Text style={styles.pickOptionSub}>Choose a photo or video you've already taken</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#444444" />
          </Pressable>

          <Pressable style={[styles.pickOption, styles.pickOptionCinema]} onPress={handleCinemaPress}>
            <View style={[styles.pickIconCircle, styles.pickIconCircleCinema]}>
              <Ionicons name="film" size={32} color="#FFC300" />
            </View>
            <View style={styles.pickOptionText}>
              <Text style={styles.pickOptionTitle}>Cinema Mode</Text>
              <Text style={styles.pickOptionSub}>Widescreen 16:9 — appears in the Cinema feed</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FFC300" />
          </Pressable>
        </View>
      </View>
    );
  }

  // ─── Step 2: Compose ─────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={resetAll} style={styles.cancelBtn} disabled={loading}>
          <Ionicons name="arrow-back" size={22} color="#888888" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Post</Text>
          {isWidescreen && (
            <View style={styles.cinemaHeaderBadge}>
              <Ionicons name="film" size={11} color="#000000" />
              <Text style={styles.cinemaHeaderBadgeText}>Cinema</Text>
            </View>
          )}
        </View>
        <Pressable onPress={handlePost} disabled={loading} style={styles.shareBtn}>
          {loading
            ? <ActivityIndicator color="#000000" size="small" />
            : <Ionicons name="send" size={18} color="#000000" />}
        </Pressable>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">

        {/* Media preview */}
        <Pressable
          style={[styles.preview, isWidescreen ? styles.previewWide : styles.previewPortrait]}
          onPress={resetAll}
          disabled={loading}
        >
          {mediaType === 'video' && mediaUri ? (
            <Video
              source={{ uri: mediaUri }}
              style={styles.previewMedia}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isMuted
              isLooping
            />
          ) : mediaUri ? (
            <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="cover" />
          ) : null}
          <View style={styles.previewChangeOverlay}>
            <Ionicons name="swap-horizontal" size={16} color="#FFFFFF" />
            <Text style={styles.previewChangeText}>Change</Text>
          </View>
        </Pressable>

        {/* Caption */}
        <View style={styles.captionRow}>
          {currentUser?.avatar_url ? (
            <Image source={{ uri: currentUser.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarText}>{currentUser?.name?.charAt(0).toUpperCase() ?? 'U'}</Text>
            </View>
          )}
          <TextInput
            style={styles.captionInput}
            placeholder="Share what you created..."
            placeholderTextColor="#888888"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={300}
            editable={!loading}
            inputAccessoryViewID={KEYBOARD_DONE_ID}
          />
        </View>
        <Text style={styles.charCount}>{300 - caption.length} remaining</Text>

        {/* Category picker */}
        <Text style={styles.sectionLabel}>CATEGORY</Text>
        <Pressable
          style={styles.categorySelector}
          onPress={() => setCategoryModalVisible(true)}
          disabled={loading}
        >
          <Text style={[styles.categorySelectorText, !selectedCategory && styles.categorySelectorPlaceholder]}>
            {selectedCategory || 'Choose a category...'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#FFC300" />
        </Pressable>

        {/* Guidelines */}
        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesTitle}>✦ Happ-E Community Guidelines</Text>
          <Text style={styles.guidelinesText}>Share your craft and creativity. No political content, no negativity, no memes. Keep it real and keep it kind.</Text>
        </View>

      </ScrollView>

      {/* Category overlay */}
      {categoryModalVisible && (
        <View style={styles.modalContainer}>
          <Pressable style={styles.modalBackdrop} onPress={() => setCategoryModalVisible(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose a Category</Text>
              <Pressable onPress={() => setCategoryModalVisible(false)} hitSlop={10}>
                <Ionicons name="close" size={24} color="#888888" />
              </Pressable>
            </View>

            <View style={styles.categorySearchRow}>
              <Ionicons name="search" size={16} color="#888888" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.categorySearchInput}
                placeholder="Search categories..."
                placeholderTextColor="#888888"
                value={categorySearch}
                onChangeText={setCategorySearch}
                autoCorrect={false}
                autoCapitalize="none"
                inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
              {categorySearch.length > 0 && (
                <Pressable onPress={() => setCategorySearch('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={16} color="#888888" />
                </Pressable>
              )}
            </View>

            <ScrollView style={styles.categoryList} keyboardShouldPersistTaps="handled">
              {filteredCategories.map(cat => (
                <Pressable
                  key={cat}
                  style={[styles.categoryOption, selectedCategory === cat && styles.categoryOptionActive]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setCategorySearch('');
                    setCategoryModalVisible(false);
                  }}
                >
                  <Text style={[styles.categoryOptionText, selectedCategory === cat && styles.categoryOptionTextActive]}>
                    {cat}
                  </Text>
                  {selectedCategory === cat && (
                    <Ionicons name="checkmark" size={18} color="#FFC300" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      <KeyboardDoneBar />

      {/* Upload/post progress overlay */}
      {uploadPhase !== 'idle' && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <ActivityIndicator size="large" color="#FFC300" />
            <Text style={styles.uploadPhaseText}>
              {uploadPhase === 'uploading' ? `Uploading ${mediaType}...` : 'Posting...'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20,
    borderBottomWidth: 2, borderBottomColor: '#FFC300',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  headerCenter: { alignItems: 'center', gap: 4 },
  cinemaHeaderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFC300', borderRadius: 8,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  cinemaHeaderBadgeText: { fontSize: 10, fontWeight: '700', color: '#000000' },
  cancelBtn: { width: 60 },
  cancelText: { fontSize: 16, color: '#888888' },
  shareBtn: {
    backgroundColor: '#FFC300', borderRadius: 20,
    paddingHorizontal: 18, paddingVertical: 7, width: 60, alignItems: 'center',
  },
  // Pick step
  pickBody: { flex: 1, padding: 24, justifyContent: 'center', gap: 16 },
  pickPrompt: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  pickOption: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: '#111111', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#222222',
  },
  pickIconCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  pickOptionText: { flex: 1 },
  pickOptionTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  pickOptionSub: { fontSize: 13, color: '#888888', marginTop: 3 },

  // Compose step
  body: { flex: 1 },
  bodyContent: { padding: 16, paddingBottom: 60 },

  preview: { borderRadius: 14, overflow: 'hidden', marginBottom: 4, position: 'relative', backgroundColor: '#111111' },
  previewPortrait: { aspectRatio: 4 / 5 },
  previewWide: { aspectRatio: 16 / 9 },
  pickOptionCinema: { borderColor: '#FFC300', borderWidth: 1 },
  pickIconCircleCinema: { backgroundColor: '#1A1A1A' },
  previewMedia: { width: '100%', height: '100%' },
  previewChangeOverlay: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  previewChangeText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },



  captionRow: { flexDirection: 'row', gap: 12, marginBottom: 4, alignItems: 'flex-start' },
  avatar: { width: 36, height: 36, borderRadius: 18, flexShrink: 0 },
  avatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  captionInput: { flex: 1, fontSize: 15, color: '#FFFFFF', minHeight: 80, lineHeight: 22 },
  charCount: { fontSize: 11, color: '#888888', textAlign: 'right', marginBottom: 20 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#FFC300', letterSpacing: 1.5, marginBottom: 8 },
  categorySelector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#111111', borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#333333',
  },
  categorySelectorText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  categorySelectorPlaceholder: { color: '#888888', fontWeight: '400' },

  guidelinesBox: { backgroundColor: '#111111', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFC300' },
  guidelinesTitle: { fontSize: 13, fontWeight: '700', color: '#FFC300', marginBottom: 8 },
  guidelinesText: { fontSize: 13, color: '#FFFFFF', lineHeight: 20, opacity: 0.85 },

  // Category modal
  modalContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 999 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    borderTopWidth: 2, borderTopColor: '#FFC300',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, borderBottomWidth: 0.5, borderBottomColor: '#222222',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  categorySearchRow: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, backgroundColor: '#1A1A1A', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#333333',
  },
  categorySearchInput: { flex: 1, fontSize: 15, color: '#FFFFFF' },
  categoryList: { paddingHorizontal: 16, paddingBottom: 40 },

  uploadOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  uploadCard: {
    backgroundColor: '#111111', borderRadius: 20, padding: 32,
    alignItems: 'center', gap: 16,
    borderWidth: 2, borderColor: '#FFC300', minWidth: 200,
  },
  uploadPhaseText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  categoryOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A',
  },
  categoryOptionActive: { },
  categoryOptionText: { fontSize: 16, color: '#FFFFFF' },
  categoryOptionTextActive: { color: '#FFC300', fontWeight: '700' },
});
