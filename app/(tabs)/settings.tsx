import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api';
import { clearSession, getToken, getUser } from '../auth';

const NOTIF_PREFS_KEY = 'happe_notif_prefs';

type NotifPrefs = {
  push: boolean;
  inspire: boolean;
  comments: boolean;
  likes: boolean;
};

const DEFAULT_PREFS: NotifPrefs = { push: true, inspire: true, comments: true, likes: true };

export default function SettingsScreen() {
  const [user, setUser] = useState<{ name: string; email: string; handle: string } | null>(null);
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);

  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    getUser().then(u => { if (u) setUser(u); });
    SecureStore.getItemAsync(NOTIF_PREFS_KEY).then(raw => {
      if (raw) setPrefs(JSON.parse(raw));
    });
  }, []);

  const savePref = async (key: keyof NotifPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    SecureStore.setItemAsync(NOTIF_PREFS_KEY, JSON.stringify(next));
    try {
      const token = await getToken();
      await api.updateNotificationPrefs(next, token ?? '');
    } catch {
      // non-fatal — local state already updated
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await clearSession();
          router.replace('/login');
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!newPw || !currentPw) return;
    if (newPw !== confirmPw) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }
    if (newPw.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters.');
      return;
    }
    setPwLoading(true);
    try {
      const token = await getToken();
      const result = await api.changePassword(currentPw, newPw, token ?? '');
      if (result.success) {
        setPwModalVisible(false);
        setCurrentPw('');
        setNewPw('');
        setConfirmPw('');
        Alert.alert('Success', 'Your password has been updated.');
      } else {
        Alert.alert('Error', result.error ?? 'Could not update password.');
      }
    } catch {
      Alert.alert('Error', 'Something went wrong. Try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This is permanent and cannot be undone. All your posts and data will be deleted. Enter your password to confirm.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Confirm Password',
              'Enter your password to delete your account.',
              async (password) => {
                if (!password) return;
                try {
                  const token = await getToken();
                  const result = await api.deleteAccount(password, token ?? '');
                  if (result.success) {
                    await clearSession();
                    router.replace('/login');
                  } else {
                    Alert.alert('Error', result.error ?? 'Could not delete account.');
                  }
                } catch {
                  Alert.alert('Error', 'Something went wrong. Try again.');
                }
              },
              'secure-text'
            );
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.body}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.verifiedRow}>
              <View>
                <Text style={styles.rowLabel}>Identity Verification</Text>
                <Text style={styles.rowSub}>Verified · US Government ID</Text>
              </View>
              <Text style={styles.verifiedBadge}>✦ Verified</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Email Address</Text>
                <Text style={styles.rowSub}>{user?.email ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => setPwModalVisible(true)}>
              <View>
                <Text style={styles.rowLabel}>Change Password</Text>
                <Text style={styles.rowSub}>Update your login password</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => router.push('/subscription' as any)}>
              <View>
                <Text style={styles.rowLabel}>Subscription</Text>
                <Text style={styles.rowSub}>Happ-E Monthly · $4.99/mo</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <Text style={styles.rowSub}>All app notifications</Text>
              </View>
              <Switch
                value={prefs.push}
                onValueChange={v => savePref('push', v)}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.rowLabel}>Inspire Updates</Text>
                <Text style={styles.rowSub}>New quotes and clips</Text>
              </View>
              <Switch
                value={prefs.inspire}
                onValueChange={v => savePref('inspire', v)}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.rowLabel}>Comments</Text>
                <Text style={styles.rowSub}>When someone comments</Text>
              </View>
              <Switch
                value={prefs.comments}
                onValueChange={v => savePref('comments', v)}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.rowLabel}>Likes</Text>
                <Text style={styles.rowSub}>When someone smiles at your post</Text>
              </View>
              <Switch
                value={prefs.likes}
                onValueChange={v => savePref('likes', v)}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => router.push('/blocked-users' as any)}>
              <View>
                <Text style={styles.rowLabel}>Blocked Users</Text>
                <Text style={styles.rowSub}>Manage who you've blocked</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => router.push('/data-privacy' as any)}>
              <View>
                <Text style={styles.rowLabel}>Data & Privacy</Text>
                <Text style={styles.rowSub}>How we use your data</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => router.push('/terms' as any)}>
              <View>
                <Text style={styles.rowLabel}>Terms of Service</Text>
                <Text style={styles.rowSub}>Read our terms</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => router.push('/privacy-policy' as any)}>
              <View>
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <Text style={styles.rowSub}>Read our privacy policy</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('mailto:help@happe.com')}>
              <View>
                <Text style={styles.rowLabel}>Help Center</Text>
                <Text style={styles.rowSub}>Email help@happe.com</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => router.push('/report-problem' as any)}>
              <View>
                <Text style={styles.rowLabel}>Report a Problem</Text>
                <Text style={styles.rowSub}>Let us know what's wrong</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row} onPress={() => router.push('/community-guidelines' as any)}>
              <View>
                <Text style={styles.rowLabel}>Community Guidelines</Text>
                <Text style={styles.rowSub}>What we stand for</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Info</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0 (Beta)</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Happ-E · Real people. Real moments. · v1.0.0</Text>

      </ScrollView>

      {/* Password overlay */}
      {pwModalVisible && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor="#666666"
              secureTextEntry
              value={currentPw}
              onChangeText={setCurrentPw}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor="#666666"
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#666666"
              secureTextEntry
              value={confirmPw}
              onChangeText={setConfirmPw}
            />

            <TouchableOpacity
              style={[styles.modalSaveBtn, pwLoading && { opacity: 0.5 }]}
              onPress={handleChangePassword}
              disabled={pwLoading}
            >
              <Text style={styles.modalSaveBtnText}>{pwLoading ? 'Saving…' : 'Update Password'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => {
                setPwModalVisible(false);
                setCurrentPw('');
                setNewPw('');
                setConfirmPw('');
              }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  title: { fontSize: 24, fontWeight: '700', color: '#FFC300' },
  body: { flex: 1 },
  section: { padding: 16, paddingBottom: 0 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 10 },
  card: { backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#222222', overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  verifiedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowLabel: { fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  rowSub: { fontSize: 12, color: '#888888', marginTop: 2 },
  rowArrow: { fontSize: 20, color: '#FFC300' },
  rowValue: { fontSize: 14, color: '#888888' },
  verifiedBadge: { fontSize: 13, fontWeight: '700', color: '#FFC300' },
  divider: { height: 0.5, backgroundColor: '#222222', marginHorizontal: 16 },
  logoutBtn: { margin: 16, marginTop: 24, backgroundColor: '#111111', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333333' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  deleteBtn: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#111111', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#FF4444' },
  deleteText: { fontSize: 16, fontWeight: '700', color: '#FF4444' },
  footer: { fontSize: 11, color: '#333333', textAlign: 'center', padding: 20 },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', zIndex: 999 },
  modalCard: { backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, borderTopWidth: 2, borderTopColor: '#FFC300' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 20 },
  input: { backgroundColor: '#000000', borderRadius: 12, borderWidth: 1, borderColor: '#333333', padding: 14, color: '#FFFFFF', fontSize: 15, marginBottom: 12 },
  modalSaveBtn: { backgroundColor: '#FFC300', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  modalSaveBtnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  modalCancelBtn: { padding: 16, alignItems: 'center', marginTop: 4 },
  modalCancelText: { fontSize: 15, color: '#888888' },

});
