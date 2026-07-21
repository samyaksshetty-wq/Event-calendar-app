import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { getEventById } from '../api/api';
import { COLORS, RADIUS, SPACING } from '../theme';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import BackgroundDecoration from '../components/BackgroundDecoration';
import CountdownBadge from '../components/CountdownBadge';
import { useFavoriteIds } from '../favorites/useFavorites';
import { toggleFavorite } from '../favorites/favoritesStore';

export default function SavedEventsScreen({ navigation }) {
  const favoriteIds = useFavoriteIds();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = [...favoriteIds];
    if (ids.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all(ids.map((id) => getEventById(id).catch(() => null)))
      .then((results) => {
        // Drop any that failed to load (e.g. an event that was since deleted)
        // and sort soonest-first.
        const valid = results.filter(Boolean).sort((a, b) => (a.date > b.date ? 1 : -1));
        setEvents(valid);
      })
      .finally(() => setLoading(false));
  }, [favoriteIds.size, [...favoriteIds].join(',')]);

  return (
    <View style={styles.container}>
      <BackgroundDecoration />

      {loading && <ActivityIndicator style={{ marginTop: 24 }} color={COLORS.accent} />}

      {!loading && events.length === 0 && (
        <FadeSlideIn>
          <Text style={styles.emptyTitle}>No saved events yet</Text>
          <Text style={styles.emptyText}>
            Tap the 🤍 on any event to save it here for quick access later.
          </Text>
        </FadeSlideIn>
      )}

      {!loading && events.length > 0 && (
        <ScrollView contentContainerStyle={styles.list}>
          {events.map((ev, index) => (
            <FadeSlideIn key={ev.id} delay={index * 60}>
              <AnimatedPressable
                style={styles.card}
                onPress={() => navigation.navigate('EventDetail', { id: ev.id })}
                scaleTo={0.985}
              >
                <View style={styles.cardTopRow}>
                  <CountdownBadge date={ev.date} />
                  <AnimatedPressable
                    onPress={() => toggleFavorite(ev.id)}
                    scaleTo={0.85}
                    style={styles.heartButton}
                  >
                    <Text style={styles.heart}>❤️</Text>
                  </AnimatedPressable>
                </View>
                <Text style={styles.title}>{ev.title}</Text>
                <Text style={styles.meta}>📅 {ev.date}{ev.time ? `  •  🕒 ${ev.time}` : ''}</Text>
                {!!ev.venue && <Text style={styles.meta}>📍 {ev.venue}</Text>}
              </AnimatedPressable>
            </FadeSlideIn>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.md },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: COLORS.ink, marginTop: 24, textAlign: 'center' },
  emptyText: { fontSize: 14, color: COLORS.muted, marginTop: 8, textAlign: 'center', paddingHorizontal: 24 },
  list: { paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  heartButton: { padding: 2 },
  heart: { fontSize: 15 },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.ink, marginBottom: 6 },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },
});
