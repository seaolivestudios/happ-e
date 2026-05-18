import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
import { api, uploadMedia } from '../api';
import { getToken } from '../auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '../components/KeyboardDoneBar';
import { INTEREST_CATEGORIES, getEmojiByLabel } from '../interests';

const API = 'https://happe-backend-production.up.railway.app';

const creativeCategories = [
  'Woodworking', 'Photography', 'Painting', 'Fishing', 'Outdoors',
  'Music', 'Cooking', 'Gardening', 'Pottery', 'Videography',
  'Cycling', 'Running', 'Baseball', 'Football', 'Hockey',
  'Sculpting', 'Knitting', 'Hiking', 'Surfing', 'Drawing',
];

type UserPost = {
  id: string;
  type: string;
  text: string;
  image_url: string | null;
  video_url: string | null;
  smile_count: number;
};

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [myPosts, setMyPosts] = useState<UserPost[]>([]);

  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState(0);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [editName, setEditName] = useState('');
  const [editHandle, setEditHandle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [categoryModal, setCategoryModal] = useState(false);

  const [interests, setInterests] = useState<string[]>([]);
  const [interestsOverlayVisible, setInterestsOverlayVisible] = useState(false);
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [interestsSaving, setInterestsSaving] = useState(false);
  const [interestsLoading, setInterestsLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    void loadProfile();
  }, []));

  const loadProfile = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      if (!isRefresh) setLoading(true);
      const token = await getToken();
      const [profileRes, postsRes] = await Promise.all([
        fetch(`${API}/profile/me`, { headers: { 'Authorization': `Bearer ${token}` } }),
        api.getMyPosts(token ?? ''),
      ]);
      const data = await profileRes.json();
      if (data.user) {
        setName(data.user.name || '');
        setHandle(data.user.handle || '');
        setBio(data.user.bio || '');
        setCategory(data.user.category || '');
        setLocation(data.user.location || '');
        setWebsite(data.user.website || '');
        setAvatarUrl(data.user.avatar_url || null);
        setVerified(data.user.verified ?? false);
        // load interests separately
        try {
          const token2 = await getToken();
          const iRes = await api.getMyInterests(token2 ?? '');
          if (Array.isArray(iRes.interests)) setInterests(iRes.interests);
        } catch { /* non-fatal */ }
        setPosts(data.user.posts || 0);
        setFollowers(data.user.followers || 0);
        setFollowing(data.user.following || 0);
      }
      if (postsRes.success) {
        setMyPosts(postsRes.posts.map((p: any) => ({ ...p, id: String(p.id), smile_count: parseInt(p.smile_count) || 0 })));
      }
    } catch (err) {
      // Backend not reachable — fall back to defaults
      setName('Stephen');
      setHandle('@stephen');
      setBio('Passionate about craft, creativity, and real human connection.');
      setCategory('Woodworking');
      setLocation('Florida, US');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    try {
      setAvatarUploading(true);
      const url = await uploadMedia(result.assets[0].uri, 'image');
      setAvatarUrl(url);
      const token = await getToken();
      await fetch(`${API}/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name, bio, category, location, website, avatar_url: url }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not update your profile photo.';
      Alert.alert('Upload failed', msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  const startEdit = () => {
    setEditName(name);
    setEditHandle(handle);
    setEditBio(bio);
    setEditLocation(location);
    setEditWebsite(website);
    setEditCategory(category);
    setEditing(true);
  };

  const saveEdit = async () => {
    try {
      setSaving(true);
      const token = await getToken();
      const payload: Record<string, string> = {
        name: editName,
        bio: editBio,
        location: editLocation,
        website: editWebsite,
        category: editCategory,
        avatar_url: avatarUrl ?? '',
      };
      const normalizedHandle = editHandle.startsWith('@') ? editHandle : `@${editHandle}`;
      if (normalizedHandle !== handle) payload.handle = normalizedHandle;
      const res = await api.updateProfile(payload as any, token ?? '');
      if (res.success) {
        setName(editName);
        if (payload.handle) setHandle(normalizedHandle);
        setBio(editBio);
        setLocation(editLocation);
        setWebsite(editWebsite);
        setCategory(editCategory);
        setEditing(false);
        Alert.alert('Saved', 'Your profile has been updated.');
      } else {
        Alert.alert('Error', res.error ?? 'Could not save profile.');
      }
    } catch {
      Alert.alert('Error', 'Could not connect to server.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => setEditing(false);

  const openInterestsEdit = () => {
    setEditInterests([...interests]);
    setInterestsOverlayVisible(true);
  };

  const toggleInterest = (label: string) => {
    setEditInterests(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const saveInterests = async () => {
    if (editInterests.length < 3) return;
    try {
      setInterestsSaving(true);
      const token = await getToken();
      await api.updateInterests(editInterests, token ?? '');
      setInterests(editInterests);
      setInterestsOverlayVisible(false);
    } catch {
      Alert.alert('Error', 'Could not save interests.');
    } finally {
      setInterestsSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC300" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {!editing ? (
          <TouchableOpacity onPress={startEdit} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editActions}>
            <TouchableOpacity onPress={cancelEdit} hitSlop={10}>
              <Ionicons name="close" size={24} color="#888888" />
            </TouchableOpacity>
            <TouchableOpacity onPress={saveEdit} disabled={saving} hitSlop={10} style={styles.saveIconBtn}>
              {saving
                ? <ActivityIndicator size="small" color="#000000" />
                : <Ionicons name="checkmark" size={22} color="#000000" />}
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadProfile(true)} tintColor="#FFC300" />}
      >
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={editing ? pickAvatar : undefined} activeOpacity={editing ? 0.7 : 1}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{name.charAt(0)}</Text>
              </View>
            )}
            {editing && (
              <View style={styles.avatarOverlay}>
                {avatarUploading
                  ? <ActivityIndicator color="#FFC300" size="small" />
                  : <Text style={styles.avatarOverlayText}>Edit</Text>}
              </View>
            )}
          </TouchableOpacity>
          {editing && (
            <TouchableOpacity style={styles.changePhotoBtn} onPress={pickAvatar} disabled={avatarUploading}>
              <Text style={styles.changePhotoText}>{avatarUploading ? 'Uploading...' : 'Change Photo'}</Text>
            </TouchableOpacity>
          )}
          {!editing && (
            <>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.handle}>{handle}</Text>
              {category.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{category}</Text>
                </View>
              )}
            </>
          )}
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholderTextColor="#888888" maxLength={50} inputAccessoryViewID={KEYBOARD_DONE_ID} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Handle</Text>
              <TextInput
                style={styles.input}
                value={editHandle}
                onChangeText={v => setEditHandle(v.startsWith('@') ? v : `@${v}`)}
                placeholderTextColor="#888888"
                placeholder="@yourhandle"
                autoCapitalize="none"
                maxLength={30}
                inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput style={[styles.input, styles.bioInput]} value={editBio} onChangeText={setEditBio} placeholderTextColor="#888888" multiline maxLength={150} inputAccessoryViewID={KEYBOARD_DONE_ID} />
              <Text style={styles.charCount}>{150 - editBio.length} characters remaining</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation} placeholderTextColor="#888888" placeholder="City, State" inputAccessoryViewID={KEYBOARD_DONE_ID} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput style={styles.input} value={editWebsite} onChangeText={setEditWebsite} placeholderTextColor="#888888" placeholder="yourwebsite.com" autoCapitalize="none" keyboardType="url" inputAccessoryViewID={KEYBOARD_DONE_ID} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Creative Category</Text>
              <TouchableOpacity style={styles.categorySelector} onPress={() => setCategoryModal(true)}>
                <Text style={styles.categorySelectorText}>{editCategory}</Text>
                <Text style={styles.categorySelectorArrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>{followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>

            {bio.length > 0 && (
              <View style={styles.infoCard}>
                <Text style={styles.infoLabel}>About</Text>
                <Text style={styles.infoText}>{bio}</Text>
              </View>
            )}

            {location.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowIcon}>📍</Text>
                <Text style={styles.infoRowText}>{location}</Text>
              </View>
            )}

            {website.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowIcon}>🔗</Text>
                <Text style={styles.infoRowText}>{website}</Text>
              </View>
            )}

            {verified && (
              <View style={styles.verifiedCard}>
                <Text style={styles.verifiedText}>✦ Verified Real Person</Text>
                <Text style={styles.verifiedSub}>Identity confirmed · No bots here</Text>
              </View>
            )}

            {(!avatarUrl || !bio || !category) && (
              <TouchableOpacity style={styles.completionNudge} onPress={startEdit}>
                <View style={styles.completionNudgeLeft}>
                  <Text style={styles.completionNudgeTitle}>Complete your profile</Text>
                  <Text style={styles.completionNudgeSub}>
                    {[!avatarUrl && 'Add a photo', !bio && 'Write a bio', !category && 'Pick a category'].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Text style={styles.completionNudgeArrow}>›</Text>
              </TouchableOpacity>
            )}

            <View style={styles.interestsSect}>
              <View style={styles.interestsSectHeader}>
                <Text style={styles.interestsSectTitle}>My Interests</Text>
                <TouchableOpacity onPress={openInterestsEdit}>
                  <Text style={styles.interestsEditLink}>Edit</Text>
                </TouchableOpacity>
              </View>
              {interests.length > 0 ? (
                <View style={styles.interestsChips}>
                  {interests.map(label => (
                    <View key={label} style={styles.interestPill}>
                      <Text style={styles.interestPillEmoji}>{getEmojiByLabel(label)}</Text>
                      <Text style={styles.interestPillLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <TouchableOpacity onPress={openInterestsEdit} style={styles.interestsEmpty}>
                  <Text style={styles.interestsEmptyText}>+ Add your interests</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.postsGrid}>
              <Text style={styles.postsGridLabel}>Posts</Text>
              {myPosts.length === 0 ? (
                <View style={styles.emptyPosts}>
                  <Text style={styles.emptyPostsText}>No posts yet.</Text>
                  <Text style={styles.emptyPostsSub}>Tap + to share your first creation.</Text>
                </View>
              ) : (
                <View style={styles.grid}>
                  {myPosts.map(post => {
                    const cellSize = (width - 32 - 4) / 3;
                    return (
                      <View key={post.id} style={[styles.gridCell, { width: cellSize, height: cellSize }]}>
                        {post.image_url ? (
                          <Image source={{ uri: post.image_url }} style={styles.gridImage} resizeMode="cover" />
                        ) : (
                          <View style={styles.gridInspire}>
                            <Text style={styles.gridInspireText} numberOfLines={3}>{post.text}</Text>
                          </View>
                        )}
                        <View style={styles.gridSmiles}>
                          <Text style={styles.gridSmilesText}>♡ {post.smile_count}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {categoryModal && (
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalOverlay} onPress={() => setCategoryModal(false)} />
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Creative Category</Text>
              <TouchableOpacity onPress={() => setCategoryModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {creativeCategories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, editCategory === cat && styles.categoryOptionActive]}
                  onPress={() => { setEditCategory(cat); setCategoryModal(false); }}
                >
                  <Text style={[styles.categoryOptionText, editCategory === cat && styles.categoryOptionTextActive]}>{cat}</Text>
                  {editCategory === cat && <Text style={styles.categoryCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {interestsOverlayVisible && (
        <View style={styles.interestsOverlay}>
          <View style={styles.interestsOverlayHeader}>
            <TouchableOpacity onPress={() => setInterestsOverlayVisible(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color="#888888" />
            </TouchableOpacity>
            <Text style={styles.interestsOverlayTitle}>My Interests</Text>
            <TouchableOpacity
              onPress={saveInterests}
              disabled={interestsSaving || editInterests.length < 3}
              hitSlop={10}
            >
              {interestsSaving
                ? <ActivityIndicator size="small" color="#FFC300" />
                : <Ionicons name="checkmark" size={24} color={editInterests.length < 3 ? '#444444' : '#FFC300'} />}
            </TouchableOpacity>
          </View>
          <Text style={styles.interestsOverlaySubtitle}>
            {editInterests.length} selected{editInterests.length < 3 ? ` — pick ${3 - editInterests.length} more` : ''}
          </Text>
          <ScrollView contentContainerStyle={styles.interestsOverlayScroll}>
            {INTEREST_CATEGORIES.map(section => (
              <View key={section.heading}>
                <Text style={styles.interestsOverlaySectionHeading}>{section.heading}</Text>
                <View style={styles.interestsOverlayGrid}>
                  {section.items.map(item => {
                    const active = editInterests.includes(item.label);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[styles.interestsOverlayChip, active && styles.interestsOverlayChipActive]}
                        onPress={() => toggleInterest(item.label)}
                      >
                        <Text style={styles.interestsOverlayChipEmoji}>{item.emoji}</Text>
                        <Text style={[styles.interestsOverlayChipLabel, active && styles.interestsOverlayChipLabelActive]}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      )}
      <KeyboardDoneBar />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#888888', marginTop: 12, fontSize: 14 },
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFC300' },
  editBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  editActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  saveIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarImg: { width: 88, height: 88, borderRadius: 44, marginBottom: 12, borderWidth: 2, borderColor: '#FFC300' },
  avatarOverlay: { position: 'absolute', bottom: 12, left: 0, right: 0, height: 28, backgroundColor: 'rgba(0,0,0,0.55)', borderBottomLeftRadius: 44, borderBottomRightRadius: 44, alignItems: 'center', justifyContent: 'center' },
  avatarOverlayText: { fontSize: 11, color: '#FFC300', fontWeight: '700' },
  avatarText: { fontSize: 38, fontWeight: 'bold', color: '#000000' },
  changePhotoBtn: { marginTop: 4 },
  changePhotoText: { fontSize: 14, color: '#FFC300', fontWeight: '600' },
  name: { fontSize: 22, fontWeight: '700', color: '#FFFFFF' },
  handle: { fontSize: 14, color: '#FFC300', marginTop: 2 },
  badge: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, marginTop: 10 },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  editForm: { padding: 20, gap: 4 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 8 },
  input: { backgroundColor: '#111111', borderRadius: 12, padding: 14, fontSize: 15, color: '#FFFFFF', borderWidth: 1, borderColor: '#333333' },
  bioInput: { minHeight: 90, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#888888', textAlign: 'right', marginTop: 4 },
  categorySelector: { backgroundColor: '#111111', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#333333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categorySelectorText: { fontSize: 15, color: '#FFFFFF' },
  categorySelectorArrow: { fontSize: 20, color: '#FFC300' },
  profileInfo: { padding: 16 },
  statsRow: { flexDirection: 'row', backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222222' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold', color: '#FFC300' },
  statLabel: { fontSize: 12, color: '#888888', marginTop: 2 },
  infoCard: { backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#222222' },
  infoLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', marginBottom: 6, letterSpacing: 1 },
  infoText: { fontSize: 15, color: '#FFFFFF', lineHeight: 22 },
  infoRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 8 },
  infoRowIcon: { fontSize: 16 },
  infoRowText: { fontSize: 14, color: '#888888' },
  verifiedCard: { backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FFC300' },
  completionNudge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1100', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#FFC300' },
  completionNudgeLeft: { flex: 1 },
  completionNudgeTitle: { fontSize: 14, fontWeight: '700', color: '#FFC300', marginBottom: 4 },
  completionNudgeSub: { fontSize: 12, color: '#888888' },
  completionNudgeArrow: { fontSize: 22, color: '#FFC300', marginLeft: 8 },
  verifiedText: { fontSize: 14, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },
  verifiedSub: { fontSize: 12, color: '#888888', marginTop: 4 },
  postsGrid: { marginTop: 8 },
  postsGridLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 16 },
  emptyPosts: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#222222', borderRadius: 16, borderStyle: 'dashed' },
  emptyPostsText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  emptyPostsSub: { fontSize: 13, color: '#888888', marginTop: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridCell: { borderRadius: 4, overflow: 'hidden', backgroundColor: '#111111', position: 'relative' },
  gridImage: { width: '100%', height: '100%' },
  gridInspire: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', padding: 6 },
  gridInspireText: { fontSize: 9, color: '#FFC300', textAlign: 'center', fontStyle: 'italic', lineHeight: 13 },
  gridSmiles: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2 },
  gridSmilesText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  modalContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end', zIndex: 999 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox: { backgroundColor: '#111111', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 2, borderTopColor: '#FFC300', padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#FFC300' },
  modalClose: { fontSize: 18, color: '#FFFFFF' },
  categoryOption: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: '#222222', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryOptionActive: { backgroundColor: '#1A1400' },
  categoryOptionText: { fontSize: 15, color: '#FFFFFF' },
  categoryOptionTextActive: { color: '#FFC300', fontWeight: '700' },
  categoryCheck: { fontSize: 16, color: '#FFC300' },

  // Interests section (profile view)
  interestsSect: { backgroundColor: '#111111', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#222222' },
  interestsSectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  interestsSectTitle: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },
  interestsEditLink: { fontSize: 13, color: '#FFC300', fontWeight: '600' },
  interestsChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#333333' },
  interestPillEmoji: { fontSize: 14 },
  interestPillLabel: { fontSize: 12, color: '#FFFFFF', fontWeight: '500' },
  interestsEmpty: { paddingVertical: 12, alignItems: 'center' },
  interestsEmptyText: { fontSize: 14, color: '#FFC300', fontWeight: '600' },

  // Interests overlay
  interestsOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000000', zIndex: 999 },
  interestsOverlayHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  interestsOverlayTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  interestsOverlaySubtitle: { fontSize: 13, color: '#888888', textAlign: 'center', paddingVertical: 12 },
  interestsOverlayScroll: { paddingHorizontal: 16, paddingTop: 8 },
  interestsOverlaySectionHeading: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 12, marginTop: 20 },
  interestsOverlayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  interestsOverlayChip: { backgroundColor: '#111111', borderRadius: 16, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#333333', width: (screenWidth - 52) / 3 },
  interestsOverlayChipActive: { backgroundColor: '#FFC300', borderColor: '#FFC300' },
  interestsOverlayChipEmoji: { fontSize: 22, marginBottom: 4 },
  interestsOverlayChipLabel: { fontSize: 11, color: '#888888', fontWeight: '600', textAlign: 'center' },
  interestsOverlayChipLabelActive: { color: '#000000' },
});