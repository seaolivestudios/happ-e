import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedModeContext, FeedMode } from './feedModeContext';

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

const FEED_MODES: { mode: FeedMode; icon: string; label: string }[] = [
  { mode: 'all',       icon: 'home',   label: 'Home'      },
  { mode: 'following', icon: 'people', label: 'Following' },
  { mode: 'foryou',    icon: 'star',   label: 'For You'   },
  { mode: 'trending',  icon: 'flame',  label: 'Trending'  },
];

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const { feedMode, setMenuVisible } = useContext(FeedModeContext);
  const homeMeta = FEED_MODES.find(f => f.mode === feedMode) ?? FEED_MODES[0];

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

        if (tab.name === 'index') {
          return (
            <Pressable
              key="index"
              style={styles.tabItem}
              onPress={onPress}
              onLongPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (!focused) navigation.navigate('index');
                setMenuVisible(true);
              }}
              delayLongPress={350}
              hitSlop={8}
            >
              <Ionicons name={homeMeta.icon as any} size={24} color={color} />
              <Text style={[styles.label, { color }]}>{homeMeta.label}</Text>
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
  const [feedMode, setFeedMode] = useState<FeedMode>('all');
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const tabBarHeight = Math.max(insets.bottom, 8) + 68;

  return (
    <FeedModeContext.Provider value={{ feedMode, setFeedMode, menuVisible, setMenuVisible }}>
      <View style={{ flex: 1 }}>
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

        {menuVisible && (
          <View style={[StyleSheet.absoluteFillObject, styles.menuOverlay]}>
            <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)} />
            <View style={[styles.feedMenu, { bottom: tabBarHeight }]}>
              {FEED_MODES.map(({ mode, icon, label }) => (
                <Pressable
                  key={mode}
                  style={[styles.feedMenuItem, feedMode === mode && styles.feedMenuItemActive]}
                  onPress={() => {
                    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFeedMode(mode);
                    setMenuVisible(false);
                  }}
                >
                  <Ionicons name={icon as any} size={20} color={feedMode === mode ? '#000000' : '#FFFFFF'} />
                  <Text style={[styles.feedMenuLabel, feedMode === mode && styles.feedMenuLabelActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </FeedModeContext.Provider>
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
  menuOverlay: {
    zIndex: 100,
  },
  feedMenu: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFC300',
    flexDirection: 'row',
    padding: 8,
    gap: 6,
  },
  feedMenuItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 12,
    borderRadius: 14,
  },
  feedMenuItemActive: {
    backgroundColor: '#FFC300',
  },
  feedMenuLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedMenuLabelActive: {
    color: '#000000',
  },
});
