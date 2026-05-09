import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabBarProps = {
  state: { routes: { key: string; name: string }[]; index: number };
  navigation: {
    emit: (args: { type: string; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const TABS = [
  { name: 'index',   icon: 'home'   as const, label: 'Home'     },
  { name: 'explore', icon: 'heart'  as const, label: 'Connect'  },
  { name: 'create',  icon: null,              label: ''          },
  { name: 'search',  icon: 'search' as const, label: 'Discover' },
  { name: 'sparks',  icon: 'flash'  as const, label: 'Sparks'   },
];

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map((tab) => {
        const route = state.routes.find(r => r.name === tab.name);
        if (!route) return null;
        const focused = state.routes[state.index].name === tab.name;
        const color = focused ? '#FFC300' : '#888888';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(tab.name);
          }
        };

        if (tab.name === 'create') {
          return (
            <Pressable key="create" style={styles.tabItem} onPress={onPress} hitSlop={8}>
              <View style={styles.createBtn}>
                <Text style={styles.createBtnText}>+</Text>
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable key={tab.name} style={styles.tabItem} onPress={onPress} hitSlop={8}>
            <Ionicons name={tab.icon!} size={24} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index"   options={{ unmountOnBlur: true } as object} />
      <Tabs.Screen name="explore" options={{ unmountOnBlur: true } as object} />
      <Tabs.Screen name="create"  options={{ unmountOnBlur: true } as object} />
      <Tabs.Screen name="search"  options={{ unmountOnBlur: true } as object} />
      <Tabs.Screen name="sparks"  options={{ unmountOnBlur: true } as object} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="profile"       options={{ href: null }} />
      <Tabs.Screen name="settings"      options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderTopWidth: 2,
    borderTopColor: '#FFC300',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC300',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  createBtnText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    color: '#000000',
  },
});
