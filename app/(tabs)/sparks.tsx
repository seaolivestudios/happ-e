import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api } from '../api';
import { getToken } from '../auth';

type SparkResponse = {
  id: string;
  handle: string;
  name: string;
  image_url: string | null;
  text: string;
  smile_count: number;
  comment_count: number;
};

type Spark = {
  prompt: string;
  responses: number;
};

function hoursLeft(): string {
  const now = new Date();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const diff = Math.floor((endOfDay.getTime() - now.getTime()) / 3600000);
  return `${diff}h left`;
}

type SparkCardProps = {
  item: SparkResponse;
  rank: number;
  smiled: boolean;
  onSmile: () => void;
  onPress: () => void;
};

const SparkCard = ({ item, rank, smiled, onSmile, onPress }: SparkCardProps) => (
  <View style={styles.sparkCard}>
    <Pressable onPress={onPress}>
      <View style={styles.sparkCardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(item.name || item.handle || 'U').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || item.handle}</Text>
          <Text style={styles.userHandle}>{item.handle}</Text>
        </View>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      </View>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.sparkImage} resizeMode="cover" />
      ) : null}
      <View style={styles.sparkCardBody}>
        <Text style={styles.sparkCaption}>{item.text}</Text>
      </View>
    </Pressable>
    <View style={styles.sparkActions}>
      <Pressable style={styles.sparkActionBtn} onPress={onSmile} accessibilityRole="button" accessibilityLabel="Smile">
        <Ionicons name={smiled ? 'happy' : 'happy-outline'} size={20} color={smiled ? '#FFC300' : '#888888'} />
        <Text style={[styles.sparkActionCount, smiled && styles.sparkActionCountActive]}>
          {item.smile_count}
        </Text>
      </Pressable>
      <Pressable style={styles.sparkActionBtn} onPress={onPress} accessibilityRole="button" accessibilityLabel="View comments">
        <Ionicons name="chatbubble-outline" size={20} color="#888888" />
        <Text style={styles.sparkActionCount}>{item.comment_count}</Text>
      </Pressable>
      <Pressable style={styles.sparkActionBtn} accessibilityRole="button" accessibilityLabel="Share">
        <Ionicons name="arrow-redo-outline" size={20} color="#888888" />
      </Pressable>
    </View>
  </View>
);

export default function SparksScreen() {
  const [spark, setSpark] = useState<Spark | null>(null);
  const [responses, setResponses] = useState<SparkResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [smiledSparks, setSmiledSparks] = useState<Set<string>>(new Set());

  useEffect(() => {
    void loadSparks();
  }, []);

  const loadSparks = async () => {
    try {
      const [sparkResult, responsesResult] = await Promise.all([
        api.getCurrentSpark(),
        api.getSparkResponses(),
      ]);
      if (sparkResult.success) setSpark(sparkResult.spark);
      if (responsesResult.success) {
        setResponses(
          responsesResult.responses.map((r: any) => ({
            ...r,
            id: String(r.id),
            smile_count: parseInt(r.smile_count) || 0,
            comment_count: parseInt(r.comment_count) || 0,
          }))
        );
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const handleSmile = useCallback(async (id: string) => {
    const alreadySmiled = smiledSparks.has(id);
    setSmiledSparks(prev => {
      const next = new Set(prev);
      alreadySmiled ? next.delete(id) : next.add(id);
      return next;
    });
    setResponses(prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, smile_count: alreadySmiled ? Math.max(0, r.smile_count - 1) : r.smile_count + 1 }
          : r
      )
    );
    try {
      const token = await getToken();
      await api.smilePost(id, token ?? '');
    } catch {
      setSmiledSparks(prev => {
        const next = new Set(prev);
        alreadySmiled ? next.add(id) : next.delete(id);
        return next;
      });
      setResponses(prev =>
        prev.map(r =>
          r.id === id
            ? { ...r, smile_count: alreadySmiled ? r.smile_count + 1 : Math.max(0, r.smile_count - 1) }
            : r
        )
      );
    }
  }, [smiledSparks]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚡ Sparks</Text>
        <Text style={styles.subtitle}>A new creative challenge every day</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#FFC300" />
        </View>
      ) : (
        <ScrollView style={styles.body}>
          {spark && (
            <View style={styles.todayBanner}>
              <View style={styles.todayBannerTop}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.todayLabel}>⚡ Today's Spark</Text>
                  <Text style={styles.todayTime}>{hoursLeft()} · {spark.responses} responses</Text>
                </View>
                <Pressable
                  style={styles.respondBtn}
                  onPress={() => router.push({ pathname: '/spark-respond', params: { prompt: spark.prompt } } as any)}
                  accessibilityRole="button"
                  accessibilityLabel="Respond to today's spark"
                >
                  <Text style={styles.respondBtnText}>Respond</Text>
                </Pressable>
              </View>
              <Text style={styles.todayPrompt}>"{spark.prompt}"</Text>
            </View>
          )}

          {responses.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>🏆 Top Sparks Today</Text>
              <Text style={styles.sectionSub}>Voted by the community</Text>
              {responses.map((item, index) => (
                <SparkCard
                  key={item.id}
                  item={item}
                  rank={index + 1}
                  smiled={smiledSparks.has(item.id)}
                  onSmile={() => handleSmile(item.id)}
                  onPress={() => router.push(`/post/${item.id}` as any)}
                />
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No responses yet.</Text>
              <Text style={styles.emptySub}>Be the first to respond to today's Spark!</Text>
            </View>
          )}

          <View style={styles.endMessage}>
            <Text style={styles.endText}>⚡ You've seen all of today's Sparks</Text>
            <Text style={styles.endSub}>Come back tomorrow for a new challenge</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: '#000000', borderBottomWidth: 3, borderBottomColor: '#FFC300' },
  title: { fontSize: 26, fontWeight: '700', color: '#FFC300' },
  subtitle: { fontSize: 13, color: '#888888', marginTop: 2 },
  body: { flex: 1 },
  todayBanner: { backgroundColor: '#000000', margin: 12, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#FFC300' },
  todayBannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  todayLabel: { fontSize: 13, fontWeight: '700', color: '#FFC300', letterSpacing: 1 },
  todayTime: { fontSize: 11, color: '#888888', marginTop: 3 },
  todayPrompt: { fontSize: 17, color: '#FFFFFF', lineHeight: 26, fontStyle: 'italic' },
  respondBtn: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  respondBtnText: { fontSize: 13, fontWeight: '700', color: '#000000' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#000000', paddingHorizontal: 16, marginTop: 20, marginBottom: 4 },
  sectionSub: { fontSize: 12, color: '#888888', paddingHorizontal: 16, marginBottom: 12 },
  sparkCard: { backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  sparkCardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFC300', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700', color: '#000000' },
  userInfo: { flex: 1 },
  userName: { fontSize: 13, fontWeight: '700', color: '#000000' },
  userHandle: { fontSize: 11, color: '#888888', marginTop: 1 },
  rankBadge: { backgroundColor: '#FFC300', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  rankText: { fontSize: 12, fontWeight: '700', color: '#000000' },
  sparkImage: { width: '100%', height: 280 },
  sparkCardBody: { padding: 12, paddingTop: 8 },
  sparkCaption: { fontSize: 14, color: '#000000', lineHeight: 20 },
  sparkActions: { flexDirection: 'row', gap: 20, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 0.5, borderTopColor: '#E0E0E0' },
  sparkActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparkActionCount: { fontSize: 13, color: '#888888' },
  sparkActionCountActive: { color: '#FFC300' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#000000' },
  emptySub: { fontSize: 13, color: '#888888', marginTop: 6, textAlign: 'center' },
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  endSub: { fontSize: 12, color: '#888888', marginTop: 4 },
});
