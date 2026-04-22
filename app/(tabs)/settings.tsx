import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [inspireNotifications, setInspireNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [widescreenHint, setWidescreenHint] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/login') },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This is permanent and cannot be undone. All your posts and data will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your account has been deleted.') },
      ]
    );
  };

  const handleManageSubscription = () => {
    Alert.alert('Subscription', 'You are on the Happ-E monthly plan at $4.99/month. Manage your subscription in your App Store settings.');
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
            <TouchableOpacity style={styles.row} onPress={handleManageSubscription}>
              <View>
                <Text style={styles.rowLabel}>Subscription</Text>
                <Text style={styles.rowSub}>Happ-E Monthly · $4.99/mo</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Change Password</Text>
                <Text style={styles.rowSub}>Update your login password</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Email Address</Text>
                <Text style={styles.rowSub}>stephen@email.com</Text>
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
                value={pushNotifications}
                onValueChange={setPushNotifications}
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
                value={inspireNotifications}
                onValueChange={setInspireNotifications}
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
                value={commentNotifications}
                onValueChange={setCommentNotifications}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.rowLabel}>Likes</Text>
                <Text style={styles.rowSub}>When someone likes your post</Text>
              </View>
              <Switch
                value={likeNotifications}
                onValueChange={setLikeNotifications}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View>
                <Text style={styles.rowLabel}>Widescreen Hint</Text>
                <Text style={styles.rowSub}>Show rotate hint on eligible posts</Text>
              </View>
              <Switch
                value={widescreenHint}
                onValueChange={setWidescreenHint}
                trackColor={{ false: '#333333', true: '#FFC300' }}
                thumbColor="#000000"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Blocked Users</Text>
                <Text style={styles.rowSub}>Manage who you've blocked</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Data & Privacy</Text>
                <Text style={styles.rowSub}>How we use your data</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Terms of Service</Text>
                <Text style={styles.rowSub}>Read our terms</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
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
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Help Center</Text>
                <Text style={styles.rowSub}>Get help with Happ-E</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
              <View>
                <Text style={styles.rowLabel}>Report a Problem</Text>
                <Text style={styles.rowSub}>Let us know what's wrong</Text>
              </View>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.row}>
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
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Build</Text>
              <Text style={styles.rowValue}>2026.04.21</Text>
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
});