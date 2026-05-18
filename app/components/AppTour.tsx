import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOUR_KEY = 'happe_tour_v1';

type TargetArea =
  | 'center'
  | 'feed'
  | 'home-tab'
  | 'connect-tab'
  | 'create-tab'
  | 'cinema-tab'
  | 'sparks-tab';

type Step = {
  title: string;
  body: string;
  target: TargetArea;
  tooltipPos: 'above' | 'below' | 'center';
};

const STEPS: Step[] = [
  {
    title: 'Welcome to Happ-E 👋',
    body: 'A quick 30-second tour to help you get the most out of the app.',
    target: 'center',
    tooltipPos: 'center',
  },
  {
    title: 'Your Feed',
    body: 'Positive content from the community. Pull down to refresh anytime.',
    target: 'feed',
    tooltipPos: 'below',
  },
  {
    title: 'Switch Feed Modes',
    body: 'Long-press the Home tab to switch between Home, For You, and Trending.',
    target: 'home-tab',
    tooltipPos: 'above',
  },
  {
    title: 'Share Your Creativity',
    body: 'Tap + to post a photo, video, or quote. Tags it to your creative category.',
    target: 'create-tab',
    tooltipPos: 'above',
  },
  {
    title: 'Cinema Mode',
    body: 'Full widescreen landscape content. Look for the Cinema badge on posts to jump in.',
    target: 'cinema-tab',
    tooltipPos: 'above',
  },
  {
    title: 'Daily Sparks ⚡',
    body: 'A new creative prompt every day. Respond with a photo, video, or quote.',
    target: 'sparks-tab',
    tooltipPos: 'above',
  },
  {
    title: 'Connect',
    body: 'Check in on how you\'re feeling. We\'ll connect you with people who understand.',
    target: 'connect-tab',
    tooltipPos: 'above',
  },
];

const TAB_BAR_HEIGHT = 68;
const HIGHLIGHT_PAD = 10;

export function AppTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    SecureStore.getItemAsync(TOUR_KEY).then((val) => {
      if (!val) setVisible(true);
    });
  }, []);

  useEffect(() => {
    if (!visible) return;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [visible, step]);

  const dismiss = async () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setVisible(false));
    await SecureStore.setItemAsync(TOUR_KEY, 'done');
  };

  const next = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      void dismiss();
    }
  };

  if (!visible) return null;

  const tabBarBottom = insets.bottom + TAB_BAR_HEIGHT;
  const tabW = width / 5;

  // Tab center X positions for each of the 5 tabs
  const tabCenters = [0, 1, 2, 3, 4].map(i => tabW * i + tabW / 2);
  const tabNames: TargetArea[] = ['home-tab', 'connect-tab', 'create-tab', 'cinema-tab', 'sparks-tab'];

  const current = STEPS[step];

  // Compute highlight rect
  type Rect = { x: number; y: number; w: number; h: number } | null;
  let highlight: Rect = null;

  if (current.target === 'feed') {
    highlight = { x: 16, y: insets.top + 70, w: width - 32, h: height * 0.35 };
  } else if (current.target !== 'center') {
    const tabIdx = tabNames.indexOf(current.target);
    if (tabIdx >= 0) {
      const cx = tabCenters[tabIdx];
      const tabItemH = TAB_BAR_HEIGHT;
      const tabY = height - tabBarBottom;
      highlight = {
        x: cx - tabW / 2 + HIGHLIGHT_PAD,
        y: tabY + HIGHLIGHT_PAD / 2,
        w: tabW - HIGHLIGHT_PAD * 2,
        h: tabItemH - HIGHLIGHT_PAD,
      };
    }
  }

  // Tooltip position
  const tooltipW = Math.min(width - 48, 340);
  const tooltipX = (width - tooltipW) / 2;
  let tooltipY = height / 2 - 80;

  if (current.tooltipPos === 'above' && highlight) {
    tooltipY = highlight.y - 180;
  } else if (current.tooltipPos === 'below' && highlight) {
    tooltipY = highlight.y + highlight.h + 20;
  }

  // Arrow pointing down to highlight (when tooltip is above)
  const showArrowDown = current.tooltipPos === 'above' && !!highlight;
  const showArrowUp = current.tooltipPos === 'below' && !!highlight;

  return (
    <Animated.View style={[StyleSheet.absoluteFillObject, styles.overlay, { opacity: fadeAnim }]} pointerEvents="box-none">
      {/* Dark backdrop */}
      <Pressable style={StyleSheet.absoluteFillObject} onPress={next} />

      {/* Highlight ring */}
      {highlight && (
        <Animated.View
          style={[
            styles.highlight,
            {
              left: highlight.x - 6,
              top: highlight.y - 6,
              width: highlight.w + 12,
              height: highlight.h + 12,
              borderRadius: current.target.includes('tab') ? 16 : 18,
              transform: [{ scale: pulseAnim }],
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* Tooltip card */}
      <View style={[styles.tooltip, { left: tooltipX, top: tooltipY, width: tooltipW }]}>
        {showArrowUp && (
          <View style={styles.arrowUp} />
        )}

        <View style={styles.tooltipInner}>
          <View style={styles.tooltipHeader}>
            <Text style={styles.tooltipTitle}>{current.title}</Text>
            <Pressable onPress={dismiss} hitSlop={12}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          <Text style={styles.tooltipBody}>{current.body}</Text>

          <View style={styles.tooltipFooter}>
            {/* Step dots */}
            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
              ))}
            </View>

            <Pressable style={styles.nextBtn} onPress={next}>
              <Text style={styles.nextBtnText}>{step === STEPS.length - 1 ? 'Done' : 'Next'}</Text>
              {step < STEPS.length - 1 && (
                <Ionicons name="chevron-forward" size={14} color="#000000" />
              )}
            </Pressable>
          </View>
        </View>

        {showArrowDown && (
          <View style={styles.arrowDown} />
        )}
      </View>
    </Animated.View>
  );
}

// Call this after successful registration to ensure tour shows
export async function resetTour() {
  await SecureStore.deleteItemAsync(TOUR_KEY);
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 999,
    backgroundColor: 'rgba(0,0,0,0.78)',
  },
  highlight: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#FFC300',
    backgroundColor: 'rgba(255,195,0,0.08)',
    shadowColor: '#FFC300',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    ...(Platform.OS === 'android' ? { elevation: 8 } : {}),
  },
  tooltip: {
    position: 'absolute',
  },
  tooltipInner: {
    backgroundColor: '#111111',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFC300',
    padding: 20,
  },
  tooltipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  tooltipTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFC300',
    flex: 1,
    marginRight: 12,
  },
  skipText: {
    fontSize: 13,
    color: '#555555',
    paddingTop: 2,
  },
  tooltipBody: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 21,
    marginBottom: 16,
  },
  tooltipFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333333',
  },
  dotActive: {
    backgroundColor: '#FFC300',
    width: 18,
    borderRadius: 3,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFC300',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  arrowDown: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFC300',
    marginTop: -1,
  },
  arrowUp: {
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFC300',
    marginBottom: -1,
  },
});
