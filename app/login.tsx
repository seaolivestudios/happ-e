import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { api } from './api';
import { saveSession } from './auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from './components/KeyboardDoneBar';
import { resetTour } from './components/AppTour';

type ForgotStep = 'idle' | 'email' | 'code';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>('idle');
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    if (!isLogin && !name) {
      Alert.alert('Missing fields', 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      const result = isLogin
        ? await api.login(email, password)
        : await api.register(name, email, password);

      if (result.success && result.token) {
        await saveSession(result.token, result.user);
        if (!isLogin) {
          // New account — ensure the tour shows after onboarding
          await resetTour();
        }
        if (!isLogin || !result.user?.onboarded) {
          router.replace('/onboarding' as any);
        } else {
          router.replace('/(tabs)' as any);
        }
      } else {
        Alert.alert('Error', result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Could not connect to Happ-E servers. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Image source={require('../assets/images/Logo v_1.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.tagline}>Real people. Real moments.</Text>
          <View style={styles.pillRow}>
            <View style={styles.pill}><Text style={styles.pillText}>No ads</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>No bots</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>No noise</Text></View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Your real name"
                placeholderTextColor="#888888"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="#888888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#888888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {!isLogin && (
            <View style={styles.verifyBox}>
              <Text style={styles.verifyIcon}>✦</Text>
              <Text style={styles.verifyText}>You'll verify your identity with a US government ID after signing up. This keeps Happ-E real.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={styles.btnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
            )}
          </TouchableOpacity>

          {isLogin && forgotStep === 'idle' && (
            <TouchableOpacity style={styles.forgotBtn} onPress={() => setForgotStep('email')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          {isLogin && forgotStep === 'email' && (
            <View style={styles.resetBox}>
              <Text style={styles.resetTitle}>Reset Password</Text>
              <Text style={styles.resetSub}>Enter your email and we'll send a code.</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor="#888888"
                value={resetEmail}
                onChangeText={setResetEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
              <TouchableOpacity
                style={[styles.btn, { marginTop: 12 }, resetLoading && styles.btnDisabled]}
                disabled={resetLoading}
                onPress={async () => {
                  if (!resetEmail) return;
                  setResetLoading(true);
                  try {
                    const res = await api.forgotPassword(resetEmail);
                    if (res.success) {
                      setForgotStep('code');
                    } else {
                      Alert.alert('Error', res.error ?? 'Could not send code.');
                    }
                  } finally {
                    setResetLoading(false);
                  }
                }}
              >
                <Text style={styles.btnText}>{resetLoading ? 'Sending...' : 'Send Code'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotBtn} onPress={() => setForgotStep('idle')}>
                <Text style={styles.forgotText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLogin && forgotStep === 'code' && (
            <View style={styles.resetBox}>
              <Text style={styles.resetTitle}>Enter Code</Text>
              <Text style={styles.resetSub}>Check your email for the 6-digit code.</Text>
              <TextInput
                style={[styles.input, { marginBottom: 10 }]}
                placeholder="Code"
                placeholderTextColor="#888888"
                value={resetCode}
                onChangeText={setResetCode}
                keyboardType="number-pad"
                inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#888888"
                value={resetPassword}
                onChangeText={setResetPassword}
                secureTextEntry
              inputAccessoryViewID={KEYBOARD_DONE_ID}
              />
              <TouchableOpacity
                style={[styles.btn, { marginTop: 12 }, resetLoading && styles.btnDisabled]}
                disabled={resetLoading}
                onPress={async () => {
                  if (!resetCode || !resetPassword) return;
                  setResetLoading(true);
                  try {
                    const res = await api.resetPassword(resetEmail, resetCode, resetPassword);
                    if (res.success) {
                      Alert.alert('Done', 'Password updated. You can now sign in.');
                      setForgotStep('idle');
                      setResetCode('');
                      setResetPassword('');
                    } else {
                      Alert.alert('Error', res.error ?? 'Invalid code or expired.');
                    }
                  } finally {
                    setResetLoading(false);
                  }
                }}
              >
                <Text style={styles.btnText}>{resetLoading ? 'Updating...' : 'Update Password'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotBtn} onPress={() => setForgotStep('email')}>
                <Text style={styles.forgotText}>Resend code</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.footer}>By continuing you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
      <KeyboardDoneBar />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: 36 },
  logoImage: { width: 220, height: 88, marginBottom: 12 },
  tagline: { fontSize: 15, color: '#FFFFFF', opacity: 0.8 },
  pillRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  pill: { backgroundColor: '#1A1A1A', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: '#FFC300' },
  pillText: { fontSize: 12, color: '#FFC300', fontWeight: '600' },
  card: { backgroundColor: '#111111', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#FFC300' },
  tabRow: { flexDirection: 'row', marginBottom: 24, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#FFC300' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888888' },
  tabTextActive: { color: '#000000' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: '#FFC300', marginBottom: 6, letterSpacing: 1 },
  input: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, fontSize: 15, color: '#FFFFFF', borderWidth: 1, borderColor: '#333333' },
  verifyBox: { flexDirection: 'row', gap: 10, backgroundColor: '#1A1A1A', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FFC300', alignItems: 'flex-start' },
  verifyIcon: { fontSize: 14, color: '#FFC300', marginTop: 2 },
  verifyText: { fontSize: 13, color: '#FFFFFF', lineHeight: 20, flex: 1, opacity: 0.85 },
  btn: { backgroundColor: '#FFC300', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  forgotBtn: { alignItems: 'center', marginTop: 14 },
  forgotText: { fontSize: 13, color: '#888888' },
  resetBox: { marginTop: 16, gap: 8 },
  resetTitle: { fontSize: 15, fontWeight: '700', color: '#FFC300', marginBottom: 2 },
  resetSub: { fontSize: 13, color: '#888888', marginBottom: 8 },
  footer: { fontSize: 11, color: '#444444', textAlign: 'center', marginTop: 24, lineHeight: 16 },
});