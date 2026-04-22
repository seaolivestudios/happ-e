import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  const dim = Dimensions.get('window');
  const [isLandscape, setIsLandscape] = useState(dim.width > dim.height);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => {
      setIsLandscape(window.width > window.height);
    });
    return () => sub.remove();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFC300',
        tabBarInactiveTintColor: '#888888',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: isLandscape
          ? { display: 'none', height: 0, position: 'absolute' }
          : {
              backgroundColor: '#000000',
              borderTopWidth: 2,
              borderTopColor: '#FFC300',
              height: 60,
              paddingBottom: 8,
              ...Platform.select({
                ios: { backgroundColor: '#000000' },
                android: { backgroundColor: '#000000' },
              }),
            },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Inspire',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="star.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.postBtn}>
              <Text style={styles.postBtnText}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="magnifyingglass" color={color} />,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="bell.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  postBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  postBtnText: { fontSize: 28, fontWeight: '700', color: '#000000', lineHeight: 32 },
});