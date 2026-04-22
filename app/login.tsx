import { Link } from 'expo-router';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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

          <Link href="/onboarding" asChild>
            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>{isLogin ? 'Sign In' : 'Create Account'}</Text>
            </TouchableOpacity>
          </Link>

          {isLogin && (
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footer}>By continuing you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
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
  btnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  forgotBtn: { alignItems: 'center', marginTop: 14 },
  forgotText: { fontSize: 13, color: '#888888' },
  footer: { fontSize: 11, color: '#444444', textAlign: 'center', marginTop: 24, lineHeight: 16 },
});