import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { api } from './api';
import { getToken } from './auth';

const PROJECT_ID = '1505094b-19d4-42b2-98a1-35eda829c077';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<void> {
  if (!Device.isDevice) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Happ-E',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFC300',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return;

  try {
    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId: PROJECT_ID });
    const authToken = await getToken();
    if (authToken) {
      await api.registerPushToken(expoPushToken, authToken);
    }
  } catch {
    // non-fatal — app works fine without push
  }
}

export function setupNotificationResponseListener(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data as Record<string, string> | undefined;
    if (!data) return;
    if ((data.type === 'smile' || data.type === 'comment') && data.postId) {
      router.push(`/post/${data.postId}` as any);
    }
  });
  return () => sub.remove();
}
