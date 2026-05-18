import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';
import { KeyboardDoneBar, KEYBOARD_DONE_ID } from '../components/KeyboardDoneBar';

// ─── Check-in flow data ───────────────────────────────────────────────────────

const flow: Record<string, { question: string; subtitle: string; options: { label: string; value: string; next: string }[] }> = {
  start: {
    question: "How are you feeling right now?",
    subtitle: "There's no wrong answer. This is just for you.",
    options: [
      { label: "😔 Struggling", value: "struggling", next: "struggling_what" },
      { label: "😞 Heavy", value: "heavy", next: "heavy_what" },
      { label: "😐 Okay", value: "okay", next: "okay_what" },
      { label: "🙂 Good", value: "good", next: "good_what" },
      { label: "😊 Grateful", value: "grateful", next: "grateful_what" },
    ],
  },
  struggling_what: {
    question: "What's weighing on you?",
    subtitle: "You're not alone in this.",
    options: [
      { label: "Work or career", value: "work", next: "result" },
      { label: "A relationship", value: "relationship", next: "result" },
      { label: "Feeling lonely", value: "lonely", next: "result" },
      { label: "Loss or grief", value: "grief", next: "result" },
      { label: "Motivation", value: "motivation", next: "result" },
      { label: "My health", value: "health", next: "result" },
    ],
  },
  heavy_what: {
    question: "What kind of heavy?",
    subtitle: "Sometimes naming it helps.",
    options: [
      { label: "Tired and burnt out", value: "burnout", next: "result" },
      { label: "Worried about the future", value: "anxiety", next: "result" },
      { label: "Feeling stuck", value: "stuck", next: "result" },
      { label: "Missing someone", value: "missing", next: "result" },
      { label: "Not sure, just heavy", value: "unsure", next: "result" },
    ],
  },
  okay_what: {
    question: "What would make today better?",
    subtitle: "Even okay days can use a little spark.",
    options: [
      { label: "Some motivation", value: "motivation", next: "result" },
      { label: "A good laugh", value: "joy", next: "result" },
      { label: "Feeling connected", value: "connection", next: "result" },
      { label: "A moment of calm", value: "calm", next: "result" },
      { label: "A creative push", value: "creative", next: "result" },
    ],
  },
  good_what: {
    question: "What's making today good?",
    subtitle: "Let's build on that.",
    options: [
      { label: "My work or craft", value: "craft", next: "result" },
      { label: "People around me", value: "people", next: "result" },
      { label: "I made progress on something", value: "progress", next: "result" },
      { label: "Just a good day", value: "general", next: "result" },
    ],
  },
  grateful_what: {
    question: "What are you grateful for?",
    subtitle: "Gratitude is worth sitting in.",
    options: [
      { label: "My health", value: "health", next: "result" },
      { label: "Someone in my life", value: "people", next: "result" },
      { label: "A creative gift or skill", value: "craft", next: "result" },
      { label: "Simply being here", value: "life", next: "result" },
    ],
  },
};

const results: Record<string, { tag: string; quote: string; author: string; story: { user: string; name: string; category: string; text: string } }> = {
  work: { tag: 'Work & Career', quote: '"The secret of getting ahead is getting started. Every expert was once a beginner who kept going."', author: '— Mark Twain', story: { user: '@jake_builds', name: 'Jake Miller', category: 'Woodworking', text: 'I lost my job of 12 years and had no idea what was next. I started woodworking in my garage just to have something to do with my hands. Three years later it\'s my full time work and I\'ve never been happier. The darkest career moment led me to my real purpose.' } },
  relationship: { tag: 'Relationships', quote: '"The most important thing in the world is family and love. Never forget that."', author: '— John Wooden', story: { user: '@maria_lens', name: 'Maria Santos', category: 'Photography', text: 'Going through a painful breakup, I picked up a camera for the first time. Photography taught me to see beauty again when everything felt grey. Some of my best work came from my hardest season.' } },
  lonely: { tag: 'Loneliness', quote: '"The soul that sees beauty may sometimes walk alone."', author: '— Goethe', story: { user: '@outdoorlife_real', name: 'Tom Harris', category: 'Outdoors', text: 'I moved to a new city knowing nobody. Started hiking alone every weekend. Those solo trails became where I found myself. And eventually I found a whole community of people who loved the same things I did.' } },
  grief: { tag: 'Loss & Grief', quote: '"Grief is the price we pay for love. And love is always worth it."', author: '— Queen Elizabeth II', story: { user: '@sarah_paints', name: 'Sarah Creates', category: 'Painting', text: 'After losing my mom I couldn\'t speak for weeks. I painted instead. Every canvas held something I couldn\'t say out loud. Art became my way through grief. It still is.' } },
  motivation: { tag: 'Motivation', quote: '"It does not matter how slowly you go as long as you do not stop."', author: '— Confucius', story: { user: '@craftsman_real', name: 'Joe Briggs', category: 'Woodworking', text: 'I went six months without finishing a single project. Just started things and stopped. One day I forced myself to finish one small thing — a tiny wooden box. That one finished box broke the spell. Start small. Finish something.' } },
  burnout: { tag: 'Burnout', quote: '"Almost everything will work again if you unplug it for a few minutes — including you."', author: '— Anne Lamott', story: { user: '@fishing_life', name: 'Dale Reeves', category: 'Fishing', text: 'I was running on empty for two years straight. Took a week off and went fishing alone. No phone. No meetings. Just water and quiet. I came back a different person. Rest isn\'t weakness. It\'s how you keep going.' } },
  anxiety: { tag: 'Anxiety', quote: '"You don\'t have to see the whole staircase, just take the first step."', author: '— Martin Luther King Jr.', story: { user: '@potter_grace', name: 'Grace Liu', category: 'Pottery', text: 'Anxiety used to paralyze me before every new project. My therapist said: just touch the clay. Don\'t make anything. Just touch it. That small permission changed everything. I stopped needing to know the outcome before I could start.' } },
  stuck: { tag: 'Feeling Stuck', quote: '"The cave you fear to enter holds the treasure you seek."', author: '— Joseph Campbell', story: { user: '@hiker_real', name: 'Ben Torres', category: 'Hiking', text: 'I was stuck in the same job, same routine, same everything for four years. One weekend I just drove to a trailhead I\'d never been to. That hike changed my life. Sometimes the only way out of stuck is to physically move your body somewhere new.' } },
  missing: { tag: 'Missing Someone', quote: '"How lucky I am to have something that makes saying goodbye so hard."', author: '— A.A. Milne', story: { user: '@woodcraft_real', name: 'Ray Santos', category: 'Woodworking', text: 'My dad taught me woodworking. When he passed I couldn\'t go in the shop for a year. Eventually I went in just to smell the sawdust. It smelled like him. I built something that day just for him. I still talk to him while I work.' } },
  unsure: { tag: 'Just Heavy', quote: '"Not all those who wander are lost."', author: '— J.R.R. Tolkien', story: { user: '@nature_lens', name: 'Chris Park', category: 'Photography', text: 'Sometimes I don\'t know why I feel the way I feel. I\'ve learned to just go outside with my camera. I don\'t have to name it. I just have to move through it. The images I make on those days are always the most honest.' } },
  joy: { tag: 'Finding Joy', quote: '"Joy is not in things; it is in us."', author: '— Richard Wagner', story: { user: '@baker_real', name: 'Lily Chen', category: 'Cooking', text: 'I started baking bread during a really hard season. There\'s something about kneading dough that is deeply satisfying. The smell, the warmth, sharing a loaf with a neighbor. Simple things are the best things.' } },
  connection: { tag: 'Connection', quote: '"We are all different, which is great because we are all unique. Without diversity, life would be very boring."', author: '— Catherine Pulsifer', story: { user: '@guitar_real', name: 'Mike Davis', category: 'Music', text: 'I started a front porch jam session during a rough time. Just me and a guitar. One neighbor heard it and came over. Then another. Now we have twelve people every Friday. Community doesn\'t always find you. Sometimes you have to make the first sound.' } },
  calm: { tag: 'Finding Calm', quote: '"Within you, there is a stillness and a sanctuary to which you can retreat at any time."', author: '— Hermann Hesse', story: { user: '@garden_real', name: 'Anne Walsh', category: 'Gardening', text: 'My anxiety was at an all time high. A friend suggested I just put my hands in soil. I thought it was silly. It wasn\'t. Something about gardening — the patience it requires, the life it produces — quieted something in me that nothing else could.' } },
  creative: { tag: 'Creative Push', quote: '"Creativity is intelligence having fun."', author: '— Albert Einstein', story: { user: '@sketch_real', name: 'Dana Fox', category: 'Drawing', text: 'I hadn\'t made art in three years. I told myself I\'d lost it. One night I just picked up a pencil and drew whatever came out. It was messy. It was honest. It was mine. You don\'t lose creativity. You just stop giving it permission.' } },
  craft: { tag: 'Your Craft', quote: '"The only way to do great work is to love what you do."', author: '— Steve Jobs', story: { user: '@jake_builds', name: 'Jake Miller', category: 'Woodworking', text: 'Some days I walk into my shop and everything flows. The wood cooperates, the joints are tight, the finish goes on smooth. I\'ve learned to be grateful for those days without taking them for granted. This is the work. This is the gift.' } },
  people: { tag: 'People & Community', quote: '"Surround yourself with people who make you hungry for life, touch your heart, and nourish your soul."', author: '— Unknown', story: { user: '@outdoorlife_real', name: 'Tom Harris', category: 'Outdoors', text: 'The best thing about finding your people is that you stop pretending. I found mine on a trail. We don\'t talk about work or politics. We talk about the light on the water and what we want to build next. That\'s enough. That\'s everything.' } },
  progress: { tag: 'Progress', quote: '"Progress is not achieved by luck or accident, but by working on yourself daily."', author: '— Epictetus', story: { user: '@runner_real', name: 'Sam Lee', category: 'Running', text: 'I couldn\'t run a mile two years ago. Today I ran 10. Not because of talent. Because I showed up every single day, even when I didn\'t want to. Progress is just showing up compounded over time.' } },
  general: { tag: 'Good Days', quote: '"This is a wonderful day. I\'ve never seen this one before."', author: '— Maya Angelou', story: { user: '@potter_grace', name: 'Grace Liu', category: 'Pottery', text: 'I used to wait for big moments to feel grateful. Now I notice the small ones. The way clay feels this morning. The light through the studio window. A good cup of coffee. Good days are made of small things noticed.' } },
  health: { tag: 'Health', quote: '"Take care of your body. It\'s the only place you have to live."', author: '— Jim Rohn', story: { user: '@yoga_real', name: 'Rita Patel', category: 'Fitness', text: 'I was diagnosed with something scary two years ago. I decided that whatever happened, I would treat my body with love every single day. That decision changed how I live completely. Health is not a destination. It\'s a daily practice.' } },
  life: { tag: 'Simply Being Here', quote: '"The present moment is the only moment available to us, and it is the door to all moments."', author: '— Thich Nhat Hanh', story: { user: '@fishing_life', name: 'Dale Reeves', category: 'Fishing', text: 'I almost didn\'t make it through a hard year. But I did. Now every morning I sit by the water before anyone else is awake and I just breathe. Being alive is enough. The rest is bonus.' } },
};

// Maps each result key to the most relevant community category
const RESULT_CATEGORY: Record<string, string> = {
  work: 'Woodworking', relationship: 'Photography', lonely: 'Outdoors',
  grief: 'Painting', motivation: 'Woodworking', burnout: 'Fishing',
  anxiety: 'Pottery', stuck: 'Hiking', missing: 'Woodworking',
  unsure: 'Photography', joy: 'Cooking', connection: 'Music',
  calm: 'Gardening', creative: 'Drawing', craft: 'Woodworking',
  people: 'Outdoors', progress: 'Running', general: 'Art',
  health: 'Fitness', life: 'Fishing',
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectUser = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string | null;
  bio: string;
  category: string;
};

type CommunityPost = {
  id: string;
  name: string;
  image: string | null;
  text: string;
  category: string;
};

function normalizeUser(raw: any): ConnectUser {
  return {
    id: String(raw.id),
    name: raw.name ?? 'Unknown',
    handle: raw.handle ? `@${String(raw.handle).replace(/^@+/, '')}` : '@user',
    avatarUrl: raw.avatar_url ?? null,
    bio: raw.bio ?? '',
    category: raw.category ?? '',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function UserCard({
  user,
  following,
  onFollowToggle,
  compact = false,
}: {
  user: ConnectUser;
  following: boolean;
  onFollowToggle: (id: string, next: boolean) => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={[styles.userCard, compact && styles.userCardCompact]}
      onPress={() => router.push(`/user/${user.id}` as any)}
    >
      <View style={styles.userCardLeft}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={compact ? styles.avatarSm : styles.avatar} />
        ) : (
          <View style={[compact ? styles.avatarSm : styles.avatar, styles.avatarFallback]}>
            <Text style={[styles.avatarLetter, compact && { fontSize: 16 }]}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.userCardBody}>
        <View style={styles.nameRow}>
          <Text style={styles.userName} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.verifiedBadge}>✦</Text>
        </View>
        <Text style={styles.userHandle} numberOfLines={1}>{user.handle}</Text>
        {user.category ? (
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{user.category}</Text>
          </View>
        ) : null}
        {!compact && user.bio ? (
          <Text style={styles.userBio} numberOfLines={2}>{user.bio}</Text>
        ) : null}
      </View>
      <Pressable
        style={[styles.followBtn, following && styles.followingBtn]}
        onPress={(e) => {
          e.stopPropagation();
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onFollowToggle(user.id, !following);
        }}
        hitSlop={8}
      >
        <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
          {following ? 'Following' : 'Follow'}
        </Text>
      </Pressable>
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ConnectScreen() {
  const [activeTab, setActiveTab] = useState<'checkin' | 'people'>('checkin');

  // Check-in state
  const [step, setStep] = useState('start');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [result, setResult] = useState<typeof results[string] | null>(null);
  const [resultKey, setResultKey] = useState('');
  const [helped, setHelped] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Community content (loaded after check-in result)
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityUsers, setCommunityUsers] = useState<ConnectUser[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
  const [token, setToken] = useState<string | null>(null);

  // People tab state
  const [suggested, setSuggested] = useState<ConnectUser[]>([]);
  const [searchResults, setSearchResults] = useState<ConnectUser[]>([]);
  const [query, setQuery] = useState('');
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [peopleLoaded, setPeopleLoaded] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getToken().then(t => setToken(t));
  }, []);

  // Load community content when a check-in result arrives
  useEffect(() => {
    if (!resultKey) return;
    const category = RESULT_CATEGORY[resultKey] ?? 'Art';
    void loadCommunityContent(category);
  }, [resultKey]);

  const loadCommunityContent = async (category: string) => {
    setLoadingCommunity(true);
    setCommunityPosts([]);
    setCommunityUsers([]);
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.getPostsByCategory(category),
        api.getSuggestedUsers(),
      ]);
      if (postsRes.posts) {
        setCommunityPosts(
          postsRes.posts.slice(0, 6).map((p: any) => ({
            id: String(p.id),
            name: p.name ?? 'Unknown',
            image: p.image_url ?? null,
            text: p.text ?? '',
            category: p.category ?? category,
          }))
        );
      }
      if (usersRes.users) {
        const users = usersRes.users.slice(0, 3).map(normalizeUser);
        setCommunityUsers(users);
        const already = new Set<string>(
          usersRes.users.filter((u: any) => u.following).map((u: any) => String(u.id))
        );
        setFollowedIds(prev => new Set([...prev, ...already]));
      }
    } catch {
      // non-fatal
    } finally {
      setLoadingCommunity(false);
    }
  };

  // Load suggested users when People tab is first opened
  const loadSuggested = async () => {
    setLoadingSuggested(true);
    try {
      const res = await api.getSuggestedUsers();
      if (res.users) {
        setSuggested(res.users.map(normalizeUser));
        const already = new Set<string>(
          res.users.filter((u: any) => u.following).map((u: any) => String(u.id))
        );
        setFollowedIds(prev => new Set([...prev, ...already]));
      }
    } catch {
      // non-fatal
    } finally {
      setLoadingSuggested(false);
      setPeopleLoaded(true);
    }
  };

  const handleTabSwitch = (tab: 'checkin' | 'people') => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    if (tab === 'people' && !peopleLoaded) void loadSuggested();
  };

  const handleFollowToggle = useCallback(async (userId: string, shouldFollow: boolean) => {
    setFollowedIds(prev => {
      const next = new Set(prev);
      shouldFollow ? next.add(userId) : next.delete(userId);
      return next;
    });
    try {
      if (shouldFollow) await api.follow(userId, token ?? '');
      else await api.unfollow(userId, token ?? '');
    } catch {
      setFollowedIds(prev => {
        const next = new Set(prev);
        shouldFollow ? next.delete(userId) : next.add(userId);
        return next;
      });
    }
  }, [token]);

  // Check-in handlers
  const handleOption = (option: { label: string; value: string; next: string }) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    setBreadcrumbs(prev => [...prev, option.label]);
    if (option.next === 'result') {
      setResultKey(option.value);
      setResult(results[option.value] ?? results['general']);
      setStep('result');
    } else {
      setStep(option.next);
    }
  };

  const handleReset = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setStep('start');
      setBreadcrumbs([]);
      setResult(null);
      setResultKey('');
      setHelped(false);
      setCommunityPosts([]);
      setCommunityUsers([]);
      Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    });
  };

  // People search
  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!text.trim()) { setSearchResults([]); return; }
    setLoadingSearch(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await api.searchUsers(text.trim());
        setSearchResults(res.users ? res.users.map(normalizeUser) : []);
      } catch {
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    }, 350);
  }, []);

  const currentStep = flow[step];
  const isSearching = query.trim().length > 0;
  const displayUsers = isSearching ? searchResults : suggested;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Connect</Text>
        <Text style={styles.subtitle}>Real people. Real support.</Text>
      </View>

      {/* Tab switcher */}
      <View style={styles.tabSwitcher}>
        <Pressable
          style={[styles.tabSwitchBtn, activeTab === 'checkin' && styles.tabSwitchBtnActive]}
          onPress={() => handleTabSwitch('checkin')}
        >
          <Ionicons name="heart-outline" size={15} color={activeTab === 'checkin' ? '#000000' : '#888888'} />
          <Text style={[styles.tabSwitchText, activeTab === 'checkin' && styles.tabSwitchTextActive]}>
            Check In
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabSwitchBtn, activeTab === 'people' && styles.tabSwitchBtnActive]}
          onPress={() => handleTabSwitch('people')}
        >
          <Ionicons name="people-outline" size={15} color={activeTab === 'people' ? '#000000' : '#888888'} />
          <Text style={[styles.tabSwitchText, activeTab === 'people' && styles.tabSwitchTextActive]}>
            People
          </Text>
        </Pressable>
      </View>

      {/* ── Check In tab ── */}
      {activeTab === 'checkin' && (
        <>
          {breadcrumbs.length > 0 && (
            <View style={styles.breadcrumbRow}>
              {breadcrumbs.map((crumb, i) => (
                <View key={i} style={styles.breadcrumbItem}>
                  <Text style={styles.breadcrumbText}>{crumb}</Text>
                  {i < breadcrumbs.length - 1 && <Text style={styles.breadcrumbArrow}>›</Text>}
                </View>
              ))}
            </View>
          )}

          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={{ opacity: fadeAnim }}>

              {/* Question step */}
              {step !== 'result' && currentStep && (
                <View style={styles.questionCard}>
                  <Text style={styles.question}>{currentStep.question}</Text>
                  <Text style={styles.questionSub}>{currentStep.subtitle}</Text>
                  <View style={styles.optionsGrid}>
                    {currentStep.options.map((option, i) => (
                      <TouchableOpacity
                        key={i}
                        style={styles.optionBtn}
                        onPress={() => handleOption(option)}
                      >
                        <Text style={styles.optionText}>{option.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Result step */}
              {step === 'result' && result && (
                <View>
                  <View style={styles.tagRow}>
                    <Text style={styles.tag}>✦ {result.tag}</Text>
                  </View>

                  <View style={styles.quoteCard}>
                    <Text style={styles.quoteText}>{result.quote}</Text>
                    <Text style={styles.quoteAuthor}>{result.author}</Text>
                  </View>

                  <Text style={styles.storyLabel}>A real story from someone who's been there</Text>

                  <View style={styles.storyCard}>
                    <View style={styles.storyHeader}>
                      <View style={styles.storyAvatar}>
                        <Text style={styles.storyAvatarText}>{result.story.name.charAt(0)}</Text>
                      </View>
                      <View>
                        <View style={styles.storyNameRow}>
                          <Text style={styles.storyName}>{result.story.name}</Text>
                          <Text style={styles.storyVerified}>✦</Text>
                        </View>
                        <Text style={styles.storyHandle}>{result.story.user} · {result.story.category}</Text>
                      </View>
                    </View>
                    <Text style={styles.storyText}>{result.story.text}</Text>
                    <View style={styles.storyActions}>
                      <TouchableOpacity style={styles.storyActionBtn} onPress={() => setHelped(h => !h)}>
                        <Text style={styles.storyActionIcon}>{helped ? '😊' : '🙂'}</Text>
                        <Text style={[styles.storyActionText, helped && styles.storyActionTextActive]}>
                          {helped ? 'This helped me' : 'This helped'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* ── Community section ── */}
                  <View style={styles.communitySection}>
                    <Text style={styles.communitySectionTitle}>
                      Connect with people who get it
                    </Text>
                    <Text style={styles.communitySectionSub}>
                      Real people in the Happ-E community sharing their {result.tag.toLowerCase()} journey
                    </Text>

                    {loadingCommunity ? (
                      <ActivityIndicator color="#FFC300" style={{ marginVertical: 24 }} />
                    ) : (
                      <>
                        {/* Community posts grid */}
                        {communityPosts.length > 0 && (
                          <>
                            <Text style={styles.communitySubLabel}>FROM THE COMMUNITY</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.postsScroll}>
                              {communityPosts.map(post => (
                                <Pressable
                                  key={post.id}
                                  style={styles.communityPostCard}
                                  onPress={() => router.push(`/post/${post.id}` as any)}
                                >
                                  {post.image ? (
                                    <Image source={{ uri: post.image }} style={styles.communityPostImage} resizeMode="cover" />
                                  ) : (
                                    <View style={[styles.communityPostImage, styles.communityPostImagePlaceholder]}>
                                      <Ionicons name="image-outline" size={24} color="#333333" />
                                    </View>
                                  )}
                                  <View style={styles.communityPostOverlay}>
                                    <Text style={styles.communityPostName} numberOfLines={1}>{post.name}</Text>
                                    {post.text ? (
                                      <Text style={styles.communityPostText} numberOfLines={2}>{post.text}</Text>
                                    ) : null}
                                  </View>
                                </Pressable>
                              ))}
                            </ScrollView>
                          </>
                        )}

                        {/* Community users */}
                        {communityUsers.length > 0 && (
                          <>
                            <Text style={styles.communitySubLabel}>PEOPLE TO FOLLOW</Text>
                            {communityUsers.map(user => (
                              <UserCard
                                key={user.id}
                                user={user}
                                following={followedIds.has(user.id)}
                                onFollowToggle={handleFollowToggle}
                                compact
                              />
                            ))}
                          </>
                        )}

                        {communityPosts.length === 0 && communityUsers.length === 0 && (
                          <View style={styles.communityEmpty}>
                            <Text style={styles.communityEmptyText}>
                              Be among the first to share your {result.tag.toLowerCase()} story
                            </Text>
                          </View>
                        )}

                        <Pressable
                          style={styles.findMoreBtn}
                          onPress={() => handleTabSwitch('people')}
                        >
                          <Ionicons name="people-outline" size={16} color="#000000" />
                          <Text style={styles.findMoreBtnText}>Find more people</Text>
                        </Pressable>
                      </>
                    )}
                  </View>

                  <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Text style={styles.resetBtnText}>Check in again</Text>
                  </TouchableOpacity>

                  <View style={styles.ugcPrompt}>
                    <Text style={styles.ugcTitle}>Have you been through something similar?</Text>
                    <Text style={styles.ugcText}>Your story could be exactly what someone else needs to hear today.</Text>
                    <TouchableOpacity style={styles.ugcBtn} onPress={() => router.push('/(tabs)/create')}>
                      <Text style={styles.ugcBtnText}>Share your story</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </Animated.View>
          </ScrollView>
        </>
      )}

      {/* ── People tab ── */}
      {activeTab === 'people' && (
        <>
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#888888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or @handle..."
              placeholderTextColor="#555555"
              value={query}
              onChangeText={handleSearch}
              autoCorrect={false}
              autoCapitalize="none"
              returnKeyType="search"
              inputAccessoryViewID={KEYBOARD_DONE_ID}
            />
            {query.length > 0 && (
              <Pressable onPress={() => { setQuery(''); setSearchResults([]); }} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color="#888888" />
              </Pressable>
            )}
          </View>

          <View style={styles.sectionHeader}>
            {isSearching ? (
              <Text style={styles.sectionTitle}>
                {loadingSearch ? 'Searching…' : `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
              </Text>
            ) : (
              <>
                <Text style={styles.sectionTitle}>People You May Know</Text>
                <Pressable onPress={() => void loadSuggested()} hitSlop={10}>
                  <Ionicons name="refresh" size={16} color="#888888" />
                </Pressable>
              </>
            )}
          </View>

          {(loadingSuggested && !isSearching) || (loadingSearch && isSearching) ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size="large" color="#FFC300" />
            </View>
          ) : displayUsers.length === 0 ? (
            <ScrollView contentContainerStyle={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#333333" />
              <Text style={styles.emptyText}>
                {isSearching ? 'No users found' : 'No suggestions right now'}
              </Text>
              <Text style={styles.emptySub}>
                {isSearching ? 'Try a different name or handle' : 'Check back soon as more people join'}
              </Text>
            </ScrollView>
          ) : (
            <FlatList
              data={displayUsers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <UserCard
                  user={item}
                  following={followedIds.has(item.id)}
                  onFollowToggle={handleFollowToggle}
                />
              )}
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListFooterComponent={<View style={{ height: 32 }} />}
            />
          )}
        </>
      )}

      <KeyboardDoneBar />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFC300',
  },
  title: { fontSize: 28, fontWeight: '700', color: '#FFC300' },
  subtitle: { fontSize: 13, color: '#888888', marginTop: 3 },

  // Tab switcher
  tabSwitcher: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 4,
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabSwitchBtnActive: { backgroundColor: '#FFC300' },
  tabSwitchText: { fontSize: 14, fontWeight: '600', color: '#888888' },
  tabSwitchTextActive: { color: '#000000' },

  // Check-in
  breadcrumbRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A1A1A',
  },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbText: { fontSize: 12, color: '#FFC300', fontWeight: '600' },
  breadcrumbArrow: { fontSize: 12, color: '#444444' },

  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 60 },

  questionCard: { paddingTop: 8 },
  question: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', lineHeight: 32, marginBottom: 8 },
  questionSub: { fontSize: 14, color: '#888888', marginBottom: 28, lineHeight: 20 },
  optionsGrid: { gap: 10 },
  optionBtn: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#333333',
  },
  optionText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },

  tagRow: { marginBottom: 16 },
  tag: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 2 },
  quoteCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC300',
  },
  quoteText: { fontSize: 18, color: '#FFFFFF', lineHeight: 28, fontStyle: 'italic' },
  quoteAuthor: { fontSize: 13, color: '#FFC300', marginTop: 12, fontWeight: '600' },

  storyLabel: { fontSize: 12, fontWeight: '700', color: '#888888', letterSpacing: 1, marginBottom: 12 },
  storyCard: {
    backgroundColor: '#111111',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  storyAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  storyAvatarText: { fontSize: 18, fontWeight: '700', color: '#000000' },
  storyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  storyVerified: { fontSize: 12, color: '#FFC300' },
  storyHandle: { fontSize: 12, color: '#888888', marginTop: 2 },
  storyText: { fontSize: 15, color: '#FFFFFF', lineHeight: 24 },
  storyActions: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: '#222222',
  },
  storyActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyActionIcon: { fontSize: 18 },
  storyActionText: { fontSize: 13, color: '#888888' },
  storyActionTextActive: { color: '#FFC300', fontWeight: '600' },

  // Community section
  communitySection: {
    backgroundColor: '#0D0D0D',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFC300',
  },
  communitySectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFC300', marginBottom: 6 },
  communitySectionSub: { fontSize: 13, color: '#888888', lineHeight: 18, marginBottom: 20 },
  communitySubLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#555555',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  postsScroll: { marginBottom: 20 },
  communityPostCard: {
    width: 160,
    height: 200,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#111111',
  },
  communityPostImage: { width: '100%', height: '100%' },
  communityPostImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
  },
  communityPostOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  communityPostName: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  communityPostText: { fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 15, marginTop: 2 },
  communityEmpty: { alignItems: 'center', paddingVertical: 20 },
  communityEmptyText: { fontSize: 13, color: '#555555', textAlign: 'center', lineHeight: 18 },
  findMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFC300',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
  },
  findMoreBtnText: { fontSize: 15, fontWeight: '700', color: '#000000' },

  resetBtn: {
    backgroundColor: '#111111',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  resetBtnText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },

  ugcPrompt: {
    backgroundColor: '#1A1400',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFC300',
    marginBottom: 20,
  },
  ugcTitle: { fontSize: 16, fontWeight: '700', color: '#FFC300', marginBottom: 8 },
  ugcText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, opacity: 0.85, marginBottom: 16 },
  ugcBtn: { backgroundColor: '#FFC300', borderRadius: 12, padding: 14, alignItems: 'center' },
  ugcBtnText: { fontSize: 14, fontWeight: '700', color: '#000000' },

  // People tab
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: 16,
    backgroundColor: '#111111',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#FFFFFF' },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyState: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptySub: { fontSize: 14, color: '#888888', textAlign: 'center', lineHeight: 20 },

  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  separator: { height: 1, backgroundColor: '#111111', marginHorizontal: 4 },

  // User cards
  userCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    gap: 12,
  },
  userCardCompact: { paddingVertical: 10 },
  userCardLeft: { flexShrink: 0 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarSm: { width: 40, height: 40, borderRadius: 20 },
  avatarFallback: { backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontSize: 22, fontWeight: '700', color: '#000000' },
  userCardBody: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  userName: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', flexShrink: 1 },
  verifiedBadge: { fontSize: 12, color: '#FFC300', flexShrink: 0 },
  userHandle: { fontSize: 13, color: '#888888' },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#333333',
    marginTop: 3,
  },
  categoryPillText: { fontSize: 11, color: '#FFC300', fontWeight: '600' },
  userBio: { fontSize: 13, color: '#AAAAAA', lineHeight: 18, marginTop: 3 },
  followBtn: {
    flexShrink: 0,
    backgroundColor: '#FFC300',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  followingBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#444444' },
  followBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  followingBtnText: { color: '#888888' },
});
