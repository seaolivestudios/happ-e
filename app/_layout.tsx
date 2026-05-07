import { ThemeProvider } from '@react-navigation/native';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { registerForPushNotifications, setupNotificationResponseListener } from './push-service';

function handleDeepLink(url: string) {
  const postMatch = url.match(/post\/(\w+)/);
  const userMatch = url.match(/user\/(\w+)/);
  if (postMatch) router.push(`/post/${postMatch[1]}` as any);
  else if (userMatch) router.push(`/user/${userMatch[1]}` as any);
}

const HappETheme = {
  dark: true,
  colors: {
    primary: '#FFC300',
    background: '#000000',
    card: '#000000',
    text: '#FFFFFF',
    border: '#FFC300',
    notification: '#FFC300',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export default function RootLayout() {
  useEffect(() => {
    void registerForPushNotifications();
    const unsub = setupNotificationResponseListener();

    // Handle deep links while app is open
    const linkingSub = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    // Handle cold-start deep link
    void Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });

    return () => {
      unsub();
      linkingSub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={HappETheme}>
        <Stack initialRouteName="login">
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="post/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="user/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="spark-respond" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}