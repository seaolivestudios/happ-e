// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFC300',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size ?? 24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color, size }) => <Ionicons name="heart" size={size ?? 24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.postButton}>
              <Text style={styles.postButtonText}>+</Text>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size ?? 24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="sparks"
        options={{
          title: 'Sparks',
          tabBarIcon: ({ color, size }) => <Ionicons name="flash" size={size ?? 24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 2,
    borderTopColor: '#FFC300',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  postButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  postButtonText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    color: '#000000',
  },
});