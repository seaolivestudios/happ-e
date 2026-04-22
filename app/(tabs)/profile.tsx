import { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const creativeCategories = [
  'Woodworking', 'Photography', 'Painting', 'Fishing', 'Outdoors',
  'Music', 'Cooking', 'Gardening', 'Pottery', 'Videography',
  'Cycling', 'Running', 'Baseball', 'Football', 'Hockey',
  'Sculpting', 'Knitting', 'Hiking', 'Surfing', 'Drawing',
];

export default function ProfileScreen() {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('Stephen');
  const [handle, setHandle] = useState('@stephen');
  const [bio, setBio] = useState('Passionate about craft, creativity, and real human connection. Welcome to Happ-E.');
  const [category, setCategory] = useState('Woodworking');
  const [location, setLocation] = useState('Florida, US');
  const [website, setWebsite] = useState('');
  const [categoryModal, setCategoryModal] = useState(false);

  const [editName, setEditName] = useState(name);
  const [editBio, setEditBio] = useState(bio);
  const [editLocation, setEditLocation] = useState(location);
  const [editWebsite, setEditWebsite] = useState(website);
  const [editCategory, setEditCategory] = useState(category);

  const startEdit = () => {
    setEditName(name);
    setEditBio(bio);
    setEditLocation(location);
    setEditWebsite(website);
    setEditCategory(category);
    setEditing(true);
  };

  const saveEdit = () => {
    setName(editName);
    setBio(editBio);
    setLocation(editLocation);
    setWebsite(editWebsite);
    setCategory(editCategory);
    setEditing(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const cancelEdit = () => {
    setEditing(false);
  };

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
            <TouchableOpacity onPress={cancelEdit}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveEdit} style={styles.saveBtn}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView style={styles.body}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name.charAt(0)}</Text>
          </View>
          {editing && (
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          )}
          {!editing && (
            <>
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.handle}>{handle}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{category}</Text>
              </View>
            </>
          )}
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholderTextColor="#888888"
                maxLength={50}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={editBio}
                onChangeText={setEditBio}
                placeholderTextColor="#888888"
                multiline
                maxLength={150}
              />
              <Text style={styles.charCount}>{150 - editBio.length} characters remaining</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholderTextColor="#888888"
                placeholder="City, State"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={editWebsite}
                onChangeText={setEditWebsite}
                placeholderTextColor="#888888"
                placeholder="yourwebsite.com"
                autoCapitalize="none"
                keyboardType="url"
              />
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
                <Text style={styles.statNum}>0</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>0</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNum}>0</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>About</Text>
              <Text style={styles.infoText}>{bio}</Text>
            </View>

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

            <View style={styles.verifiedCard}>
              <Text style={styles.verifiedText}>✦ Verified Real Person</Text>
              <Text style={styles.verifiedSub}>Identity confirmed · No bots here</Text>
            </View>

            <View style={styles.postsGrid}>
              <Text style={styles.postsGridLabel}>Posts</Text>
              <View style={styles.emptyPosts}>
                <Text style={styles.emptyPostsText}>No posts yet.</Text>
                <Text style={styles.emptyPostsSub}>Tap + to share your first creation.</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <Modal visible={categoryModal} transparent animationType="slide" onRequestClose={() => setCategoryModal(false)}>
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
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFC300' },
  editBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  editBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  editActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  cancelText: { fontSize: 14, color: '#888888' },
  saveBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  body: { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, borderBottomWidth: 0.5, borderBottomColor: '#1A1A1A' },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
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
  verifiedText: { fontSize: 14, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },
  verifiedSub: { fontSize: 12, color: '#888888', marginTop: 4 },
  postsGrid: { marginTop: 8 },
  postsGridLabel: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 16 },
  emptyPosts: { alignItems: 'center', paddingVertical: 40, borderWidth: 1, borderColor: '#222222', borderRadius: 16, borderStyle: 'dashed' },
  emptyPostsText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  emptyPostsSub: { fontSize: 13, color: '#888888', marginTop: 6 },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
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
});