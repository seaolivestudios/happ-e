import { useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const flow = {
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

const results: any = {
  work: {
    tag: 'Work & Career',
    quote: '"The secret of getting ahead is getting started. Every expert was once a beginner who kept going."',
    author: '— Mark Twain',
    story: { user: '@jake_builds', name: 'Jake Miller', category: 'Woodworking', text: 'I lost my job of 12 years and had no idea what was next. I started woodworking in my garage just to have something to do with my hands. Three years later it\'s my full time work and I\'ve never been happier. The darkest career moment led me to my real purpose.' },
  },
  relationship: {
    tag: 'Relationships',
    quote: '"The most important thing in the world is family and love. Never forget that."',
    author: '— John Wooden',
    story: { user: '@maria_lens', name: 'Maria Santos', category: 'Photography', text: 'Going through a painful breakup, I picked up a camera for the first time. Photography taught me to see beauty again when everything felt grey. Some of my best work came from my hardest season.' },
  },
  lonely: {
    tag: 'Loneliness',
    quote: '"The soul that sees beauty may sometimes walk alone."',
    author: '— Goethe',
    story: { user: '@outdoorlife_real', name: 'Tom Harris', category: 'Outdoors', text: 'I moved to a new city knowing nobody. Started hiking alone every weekend. Those solo trails became where I found myself. And eventually I found a whole community of people who loved the same things I did.' },
  },
  grief: {
    tag: 'Loss & Grief',
    quote: '"Grief is the price we pay for love. And love is always worth it."',
    author: '— Queen Elizabeth II',
    story: { user: '@sarah_paints', name: 'Sarah Creates', category: 'Painting', text: 'After losing my mom I couldn\'t speak for weeks. I painted instead. Every canvas held something I couldn\'t say out loud. Art became my way through grief. It still is.' },
  },
  motivation: {
    tag: 'Motivation',
    quote: '"It does not matter how slowly you go as long as you do not stop."',
    author: '— Confucius',
    story: { user: '@craftsman_real', name: 'Joe Briggs', category: 'Woodworking', text: 'I went six months without finishing a single project. Just started things and stopped. One day I forced myself to finish one small thing — a tiny wooden box. That one finished box broke the spell. Start small. Finish something.' },
  },
  burnout: {
    tag: 'Burnout',
    quote: '"Almost everything will work again if you unplug it for a few minutes — including you."',
    author: '— Anne Lamott',
    story: { user: '@fishing_life', name: 'Dale Reeves', category: 'Fishing', text: 'I was running on empty for two years straight. Took a week off and went fishing alone. No phone. No meetings. Just water and quiet. I came back a different person. Rest isn\'t weakness. It\'s how you keep going.' },
  },
  anxiety: {
    tag: 'Anxiety',
    quote: '"You don\'t have to see the whole staircase, just take the first step."',
    author: '— Martin Luther King Jr.',
    story: { user: '@potter_grace', name: 'Grace Liu', category: 'Pottery', text: 'Anxiety used to paralyze me before every new project. My therapist said: just touch the clay. Don\'t make anything. Just touch it. That small permission changed everything. I stopped needing to know the outcome before I could start.' },
  },
  stuck: {
    tag: 'Feeling Stuck',
    quote: '"The cave you fear to enter holds the treasure you seek."',
    author: '— Joseph Campbell',
    story: { user: '@hiker_real', name: 'Ben Torres', category: 'Hiking', text: 'I was stuck in the same job, same routine, same everything for four years. One weekend I just drove to a trailhead I\'d never been to. That hike changed my life. Sometimes the only way out of stuck is to physically move your body somewhere new.' },
  },
  missing: {
    tag: 'Missing Someone',
    quote: '"How lucky I am to have something that makes saying goodbye so hard."',
    author: '— A.A. Milne',
    story: { user: '@woodcraft_real', name: 'Ray Santos', category: 'Woodworking', text: 'My dad taught me woodworking. When he passed I couldn\'t go in the shop for a year. Eventually I went in just to smell the sawdust. It smelled like him. I built something that day just for him. I still talk to him while I work.' },
  },
  unsure: {
    tag: 'Just Heavy',
    quote: '"Not all those who wander are lost."',
    author: '— J.R.R. Tolkien',
    story: { user: '@nature_lens', name: 'Chris Park', category: 'Photography', text: 'Sometimes I don\'t know why I feel the way I feel. I\'ve learned to just go outside with my camera. I don\'t have to name it. I just have to move through it. The images I make on those days are always the most honest.' },
  },
  joy: {
    tag: 'Finding Joy',
    quote: '"Joy is not in things; it is in us."',
    author: '— Richard Wagner',
    story: { user: '@baker_real', name: 'Lily Chen', category: 'Cooking', text: 'I started baking bread during a really hard season. There\'s something about kneading dough that is deeply satisfying. The smell, the warmth, sharing a loaf with a neighbor. Simple things are the best things.' },
  },
  connection: {
    tag: 'Connection',
    quote: '"We are all different, which is great because we are all unique. Without diversity, life would be very boring."',
    author: '— Catherine Pulsifer',
    story: { user: '@guitar_real', name: 'Mike Davis', category: 'Music', text: 'I started a front porch jam session during a rough time. Just me and a guitar. One neighbor heard it and came over. Then another. Now we have twelve people every Friday. Community doesn\'t always find you. Sometimes you have to make the first sound.' },
  },
  calm: {
    tag: 'Finding Calm',
    quote: '"Within you, there is a stillness and a sanctuary to which you can retreat at any time."',
    author: '— Hermann Hesse',
    story: { user: '@garden_real', name: 'Anne Walsh', category: 'Gardening', text: 'My anxiety was at an all time high. A friend suggested I just put my hands in soil. I thought it was silly. It wasn\'t. Something about gardening — the patience it requires, the life it produces — quieted something in me that nothing else could.' },
  },
  creative: {
    tag: 'Creative Push',
    quote: '"Creativity is intelligence having fun."',
    author: '— Albert Einstein',
    story: { user: '@sketch_real', name: 'Dana Fox', category: 'Drawing', text: 'I hadn\'t made art in three years. I told myself I\'d lost it. One night I just picked up a pencil and drew whatever came out. It was messy. It was honest. It was mine. You don\'t lose creativity. You just stop giving it permission.' },
  },
  craft: {
    tag: 'Your Craft',
    quote: '"The only way to do great work is to love what you do."',
    author: '— Steve Jobs',
    story: { user: '@jake_builds', name: 'Jake Miller', category: 'Woodworking', text: 'Some days I walk into my shop and everything flows. The wood cooperates, the joints are tight, the finish goes on smooth. I\'ve learned to be grateful for those days without taking them for granted. This is the work. This is the gift.' },
  },
  people: {
    tag: 'People & Community',
    quote: '"Surround yourself with people who make you hungry for life, touch your heart, and nourish your soul."',
    author: '— Unknown',
    story: { user: '@outdoorlife_real', name: 'Tom Harris', category: 'Outdoors', text: 'The best thing about finding your people is that you stop pretending. I found mine on a trail. We don\'t talk about work or politics. We talk about the light on the water and what we want to build next. That\'s enough. That\'s everything.' },
  },
  progress: {
    tag: 'Progress',
    quote: '"Progress is not achieved by luck or accident, but by working on yourself daily."',
    author: '— Epictetus',
    story: { user: '@runner_real', name: 'Sam Lee', category: 'Running', text: 'I couldn\'t run a mile two years ago. Today I ran 10. Not because of talent. Because I showed up every single day, even when I didn\'t want to. Progress is just showing up compounded over time.' },
  },
  general: {
    tag: 'Good Days',
    quote: '"This is a wonderful day. I\'ve never seen this one before."',
    author: '— Maya Angelou',
    story: { user: '@potter_grace', name: 'Grace Liu', category: 'Pottery', text: 'I used to wait for big moments to feel grateful. Now I notice the small ones. The way clay feels this morning. The light through the studio window. A good cup of coffee. Good days are made of small things noticed.' },
  },
  health: {
    tag: 'Health',
    quote: '"Take care of your body. It\'s the only place you have to live."',
    author: '— Jim Rohn',
    story: { user: '@yoga_real', name: 'Rita Patel', category: 'Fitness', text: 'I was diagnosed with something scary two years ago. I decided that whatever happened, I would treat my body with love every single day. That decision changed how I live completely. Health is not a destination. It\'s a daily practice.' },
  },
  life: {
    tag: 'Simply Being Here',
    quote: '"The present moment is the only moment available to us, and it is the door to all moments."',
    author: '— Thich Nhat Hanh',
    story: { user: '@fishing_life', name: 'Dale Reeves', category: 'Fishing', text: 'I almost didn\'t make it through a hard year. But I did. Now every morning I sit by the water before anyone else is awake and I just breathe. Being alive is enough. The rest is bonus.' },
  },
};

export default function InspireScreen() {
  const [step, setStep] = useState<string>('start');
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentStep = (flow as any)[step];

  const handleOption = (option: any) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setBreadcrumbs(prev => [...prev, option.label]);

    if (option.next === 'result') {
      setResult(results[option.value] || results['general']);
      setStep('result');
    } else {
      setStep(option.next);
    }
  };

  const handleReset = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setStep('start');
      setBreadcrumbs([]);
      setResult(null);
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect</Text>
<Text style={styles.subtitle}>Meet yourself where you are.</Text>
      </View>

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

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {step !== 'result' ? (
            <View style={styles.questionCard}>
              <Text style={styles.question}>{currentStep.question}</Text>
              <Text style={styles.questionSub}>{currentStep.subtitle}</Text>
              <View style={styles.optionsGrid}>
                {currentStep.options.map((option: any, i: number) => (
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
          ) : (
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
                  <TouchableOpacity style={styles.storyActionBtn}>
                    <Text style={styles.storyActionIcon}>🙂</Text>
                    <Text style={styles.storyActionText}>This helped</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.storyActionBtn}>
                    <Text style={styles.storyActionIcon}>↗</Text>
                    <Text style={styles.storyActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Text style={styles.resetBtnText}>Check in again</Text>
              </TouchableOpacity>

              <View style={styles.ugcPrompt}>
                <Text style={styles.ugcTitle}>Have you been through something similar?</Text>
                <Text style={styles.ugcText}>Your story could be exactly what someone else needs to hear today.</Text>
                <TouchableOpacity style={styles.ugcBtn}>
                  <Text style={styles.ugcBtnText}>Share your story</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, borderBottomWidth: 2, borderBottomColor: '#FFC300' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFC300' },
  subtitle: { fontSize: 14, color: '#888888', marginTop: 4 },
  breadcrumbRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, paddingVertical: 10, gap: 4, borderBottomWidth: 0.5, borderBottomColor: '#222222' },
  breadcrumbItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  breadcrumbText: { fontSize: 12, color: '#FFC300', fontWeight: '600' },
  breadcrumbArrow: { fontSize: 12, color: '#444444' },
  body: { flex: 1 },
  bodyContent: { padding: 20, paddingBottom: 60 },
  questionCard: { paddingTop: 10 },
  question: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', lineHeight: 32, marginBottom: 8 },
  questionSub: { fontSize: 14, color: '#888888', marginBottom: 28, lineHeight: 20 },
  optionsGrid: { gap: 10 },
  optionBtn: { backgroundColor: '#111111', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#333333' },
  optionText: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  tagRow: { marginBottom: 16 },
  tag: { fontSize: 12, fontWeight: '700', color: '#FFC300', letterSpacing: 2 },
  quoteCard: { backgroundColor: '#111111', borderRadius: 16, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: '#FFC300' },
  quoteText: { fontSize: 18, color: '#FFFFFF', lineHeight: 28, fontStyle: 'italic' },
  quoteAuthor: { fontSize: 13, color: '#FFC300', marginTop: 12, fontWeight: '600' },
  storyLabel: { fontSize: 12, fontWeight: '700', color: '#888888', letterSpacing: 1, marginBottom: 12 },
  storyCard: { backgroundColor: '#111111', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#222222' },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  storyAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  storyAvatarText: { fontSize: 18, fontWeight: '700', color: '#000000' },
  storyNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyName: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  storyVerified: { fontSize: 12, color: '#FFC300' },
  storyHandle: { fontSize: 12, color: '#888888', marginTop: 2 },
  storyText: { fontSize: 15, color: '#FFFFFF', lineHeight: 24 },
  storyActions: { flexDirection: 'row', gap: 20, marginTop: 16, paddingTop: 14, borderTopWidth: 0.5, borderTopColor: '#222222' },
  storyActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  storyActionIcon: { fontSize: 18 },
  storyActionText: { fontSize: 13, color: '#888888' },
  resetBtn: { backgroundColor: '#111111', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#333333', marginBottom: 20 },
  resetBtnText: { fontSize: 15, color: '#FFFFFF', fontWeight: '600' },
  ugcPrompt: { backgroundColor: '#1A1400', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#FFC300' },
  ugcTitle: { fontSize: 16, fontWeight: '700', color: '#FFC300', marginBottom: 8 },
  ugcText: { fontSize: 14, color: '#FFFFFF', lineHeight: 20, opacity: 0.85, marginBottom: 16 },
  ugcBtn: { backgroundColor: '#FFC300', borderRadius: 12, padding: 14, alignItems: 'center' },
  ugcBtnText: { fontSize: 14, fontWeight: '700', color: '#000000' },
});