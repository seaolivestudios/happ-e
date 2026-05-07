import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { api } from '../api';

type SparkResponse = {
  id: string;
  handle: string;
  name: string;
  image_url: string | null;
  text: string;
  smile_count: number;
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

const SparkCard = ({ item, rank }: { item: SparkResponse; rank?: number }) => (
  <View style={styles.sparkCard}>
    <View style={styles.sparkCardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(item.name || item.handle).charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name || item.handle}</Text>
        <Text style={styles.userHandle}>{item.handle}</Text>
      </View>
      {rank != null && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
    </View>
    {item.image_url ? (
      <Image source={{ uri: item.image_url }} style={styles.sparkImage} resizeMode="cover" />
    ) : null}
    <View style={styles.sparkCardFooter}>
      <Text style={styles.sparkCaption}>{item.text}</Text>
      <View style={styles.sparkActions}>
        <TouchableOpacity style={styles.sparkActionBtn}>
          <Ionicons name="happy-outline" size={20} color="#333333" />
          <Text style={styles.sparkActionCount}>{item.smile_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkActionBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#333333" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sparkActionBtn}>
          <Ionicons name="arrow-redo-outline" size={20} color="#333333" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function SparksScreen() {
  const [spark, setSpark] = useState<Spark | null>(null);
  const [responses, setResponses] = useState<SparkResponse[]>([]);
  const [loading, setLoading] = useState(true);

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
        setResponses(responsesResult.responses.map((r: any) => ({
          ...r,
          id: String(r.id),
          smile_count: parseInt(r.smile_count) || 0,
        })));
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

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
                <View>
                  <Text style={styles.todayLabel}>⚡ Today's Spark</Text>
                  <Text style={styles.todayTime}>{hoursLeft()} · {spark.responses} responses</Text>
                </View>
                <TouchableOpacity style={styles.respondBtn}>
                  <Text style={styles.respondBtnText}>Respond</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.todayPrompt}>{spark.prompt}</Text>
            </View>
          )}

          {responses.length > 0 ? (
            <>
              <Text style={styles.sectionLabel}>🏆 Top Sparks Today</Text>
              <Text style={styles.sectionSub}>Voted by the community</Text>
              {responses.map((item, index) => (
                <SparkCard key={item.id} item={item} rank={index + 1} />
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
  todayPrompt: { fontSize: 18, color: '#FFFFFF', lineHeight: 26, fontStyle: 'italic' },
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
  sparkCardFooter: { padding: 12 },
  sparkCaption: { fontSize: 14, color: '#000000', lineHeight: 20, marginBottom: 10 },
  sparkActions: { flexDirection: 'row', gap: 20, borderTopWidth: 0.5, borderTopColor: '#E0E0E0', paddingTop: 10 },
  sparkActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sparkActionCount: { fontSize: 13, color: '#888888' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, fontWeight: '600', color: '#000000' },
  emptySub: { fontSize: 13, color: '#888888', marginTop: 6, textAlign: 'center' },
  endMessage: { padding: 30, alignItems: 'center' },
  endText: { fontSize: 14, fontWeight: '600', color: '#000000' },
  endSub: { fontSize: 12, color: '#888888', marginTop: 4 },
});