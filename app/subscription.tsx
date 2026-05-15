import { Ionicons } from '@expo/vector-icons';
import {
  ErrorCode,
  finishTransaction,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  fetchProducts,
  getAvailablePurchases,
  type ProductSubscription,
  type Purchase,
} from 'expo-iap';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const PRODUCT_ID = 'com.seaolivestudios.happe.monthly';

const PERKS = [
  { icon: 'ban-outline' as const,               text: 'Zero ads. Ever.' },
  { icon: 'shield-checkmark-outline' as const,  text: 'Verified real people only' },
  { icon: 'happy-outline' as const,             text: 'Positive-only community' },
  { icon: 'flash-outline' as const,             text: 'Daily Sparks creative challenges' },
  { icon: 'heart-outline' as const,             text: 'Support an indie social platform' },
  { icon: 'star-outline' as const,              text: 'Early access to new features' },
];

export default function SubscriptionScreen() {
  const [product, setProduct] = useState<ProductSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [connected, setConnected] = useState(false);
  const purchaseListenerRef = useRef<ReturnType<typeof purchaseUpdatedListener> | null>(null);
  const errorListenerRef = useRef<ReturnType<typeof purchaseErrorListener> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios') { setLoading(false); return; }

    const setup = async () => {
      try {
        await initConnection();
        setConnected(true);

        purchaseListenerRef.current = purchaseUpdatedListener(async (purchase: Purchase) => {
          if (purchase) {
            try {
              await finishTransaction({ purchase, isConsumable: false });
              setPurchasing(false);
              Alert.alert('Welcome to Happ-E!', 'Your subscription is now active. Thank you for your support!', [
                { text: 'Get Started', onPress: () => router.back() },
              ]);
            } catch {
              setPurchasing(false);
            }
          }
        });

        errorListenerRef.current = purchaseErrorListener((error) => {
          setPurchasing(false);
          if (error.code !== ErrorCode.UserCancelled) {
            Alert.alert('Purchase Error', error.message ?? 'Something went wrong. Please try again.');
          }
        });

        const products = await fetchProducts({ skus: [PRODUCT_ID], type: 'subs' });
        if (products && products.length > 0) setProduct(products[0] as ProductSubscription);
      } catch {
        // product not yet configured in App Store — show fallback UI
      } finally {
        setLoading(false);
      }
    };

    void setup();

    return () => {
      purchaseListenerRef.current?.remove();
      errorListenerRef.current?.remove();
    };
  }, []);

  const handleSubscribe = async () => {
    if (!connected || !product) {
      Alert.alert(
        'Coming Soon',
        'In-app subscription will be available in the next update. Thank you for your support!',
        [{ text: 'Got it' }]
      );
      return;
    }
    try {
      setPurchasing(true);
      await requestPurchase({
        request: { apple: { sku: PRODUCT_ID } },
        type: 'subs',
      });
    } catch {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!connected) return;
    setRestoring(true);
    try {
      const purchases = await getAvailablePurchases();
      const active = purchases.find(p => p.productId === PRODUCT_ID);
      if (active) {
        await finishTransaction({ purchase: active, isConsumable: false });
        Alert.alert('Subscription Restored', 'Your Happ-E subscription has been restored.', [
          { text: 'Thanks', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('No Subscription Found', 'No active Happ-E subscription was found on this Apple ID.');
      }
    } catch {
      Alert.alert('Restore Failed', 'Could not restore purchases. Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const displayPrice = product
    ? (product as any).localizedPrice ?? (product as any).price ?? '$4.99'
    : '$4.99';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFC300" />
        </Pressable>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.badge}>✦ Happ-E Monthly</Text>
          {loading ? (
            <ActivityIndicator color="#FFC300" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <Text style={styles.price}>{displayPrice}</Text>
              <Text style={styles.priceSub}>per month · cancel any time</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What's included</Text>
          {PERKS.map((perk) => (
            <View key={perk.text} style={styles.perkRow}>
              <Ionicons name={perk.icon} size={20} color="#FFC300" style={styles.perkIcon} />
              <Text style={styles.perkText}>{perk.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Our promise</Text>
          <Text style={styles.bodyText}>
            Happ-E will never sell your data, show you targeted ads, or use your content to train AI models. Your subscription directly funds the people building this platform.
          </Text>
        </View>

        <Pressable
          style={[styles.subscribeBtn, (purchasing || loading) && styles.subscribeBtnDisabled]}
          onPress={handleSubscribe}
          disabled={purchasing || loading}
        >
          {purchasing ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.subscribeBtnText}>Subscribe for {displayPrice} / month</Text>
          )}
        </Pressable>

        <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={restoring || !connected}>
          {restoring ? (
            <ActivityIndicator color="#888888" size="small" />
          ) : (
            <Text style={styles.restoreBtnText}>Restore Purchases</Text>
          )}
        </Pressable>

        <Text style={styles.fine}>
          Subscription renews monthly. Manage or cancel at any time in your App Store account settings.
          Payment will be charged to your Apple ID account at the confirmation of purchase.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 14, paddingHorizontal: 20,
    borderBottomWidth: 2, borderBottomColor: '#FFC300',
  },
  backBtn: { width: 36 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#FFC300' },
  headerRight: { width: 36 },
  body: { padding: 20, paddingBottom: 48 },
  hero: { alignItems: 'center', paddingVertical: 32 },
  badge: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1.5, marginBottom: 16 },
  price: { fontSize: 56, fontWeight: '800', color: '#FFFFFF', lineHeight: 60 },
  priceSub: { fontSize: 14, color: '#888888', marginTop: 6 },
  card: {
    backgroundColor: '#111111', borderRadius: 16, borderWidth: 1, borderColor: '#222222',
    padding: 20, marginBottom: 16,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1, marginBottom: 16 },
  perkRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  perkIcon: { marginRight: 12 },
  perkText: { fontSize: 15, color: '#FFFFFF', flex: 1 },
  bodyText: { fontSize: 14, color: '#CCCCCC', lineHeight: 22 },
  subscribeBtn: {
    backgroundColor: '#FFC300', borderRadius: 16, padding: 18,
    alignItems: 'center', marginTop: 8, minHeight: 56, justifyContent: 'center',
  },
  subscribeBtnDisabled: { opacity: 0.6 },
  subscribeBtnText: { fontSize: 16, fontWeight: '700', color: '#000000' },
  restoreBtn: { alignItems: 'center', paddingVertical: 16 },
  restoreBtnText: { fontSize: 14, color: '#888888' },
  fine: { fontSize: 11, color: '#555555', textAlign: 'center', marginTop: 8, lineHeight: 16 },
});
