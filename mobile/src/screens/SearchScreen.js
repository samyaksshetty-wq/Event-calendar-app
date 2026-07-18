import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchEvents, getUpcomingEvents } from '../api/api';
import { COLORS, RADIUS, SPACING } from '../theme';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import BackgroundDecoration from '../components/BackgroundDecoration';

const RECENT_SEARCHES_KEY = 'namma_events_recent_searches';
const MAX_RECENT = 5;

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [recentSearches, setRecentSearches] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [upcomingLoading, setUpcomingLoading] = useState(true);

  // Load recent searches + a few upcoming events to suggest, as soon as the screen opens
  useEffect(() => {
    AsyncStorage.getItem(RECENT_SEARCHES_KEY)
      .then((raw) => {
        if (raw) setRecentSearches(JSON.parse(raw));
      })
      .catch(() => {});

    getUpcomingEvents(5)
      .then(setUpcoming)
      .catch((err) => console.log('Failed to load upcoming events', err.message))
      .finally(() => setUpcomingLoading(false));
  }, []);

  const runSearch = useCallback((text) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    setSearched(true);
    searchEvents(text.trim())
      .then(setResults)
      .catch((err) => console.log('Search failed', err.message))
      .finally(() => setLoading(false));
  }, []);

  // Only saved to "recent" once the person actually commits to a search
  // (hitting the search key), not on every keystroke.
  const commitRecentSearch = useCallback(async (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_RECENT);
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const tapRecentSearch = (term) => {
    runSearch(term);
    commitRecentSearch(term);
  };

  const showSuggestions = !searched;

  return (
    <View style={styles.container}>
      <BackgroundDecoration />

      <FadeSlideIn>
        <TextInput
          style={styles.input}
          placeholder="Search events by name, venue..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={runSearch}
          onSubmitEditing={() => commitRecentSearch(query)}
          autoFocus
          returnKeyType="search"
        />
      </FadeSlideIn>

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.accent} />}

      {!loading && searched && results.length === 0 && (
        <FadeSlideIn>
          <Text style={styles.emptyText}>No events match "{query}".</Text>
        </FadeSlideIn>
      )}

      {!loading && searched && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <FadeSlideIn delay={index * 60}>
              <AnimatedPressable
                style={styles.card}
                onPress={() => navigation.navigate('EventDetail', { id: item.id })}
                scaleTo={0.985}
              >
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.meta}>📅 {item.date}{item.time ? `  •  🕒 ${item.time}` : ''}</Text>
                {!!item.venue && <Text style={styles.meta}>📍 {item.venue}</Text>}
              </AnimatedPressable>
            </FadeSlideIn>
          )}
        />
      )}

      {showSuggestions && (
        <FlatList
          data={[]}
          ListEmptyComponent={null}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              {recentSearches.length > 0 && (
                <FadeSlideIn delay={60} style={styles.suggestionSection}>
                  <Text style={styles.suggestionHeading}>Recent Searches</Text>
                  <View style={styles.chipRow}>
                    {recentSearches.map((term) => (
                      <AnimatedPressable
                        key={term}
                        style={styles.chip}
                        onPress={() => tapRecentSearch(term)}
                        scaleTo={0.95}
                      >
                        <Text style={styles.chipText}>{term}</Text>
                      </AnimatedPressable>
                    ))}
                  </View>
                </FadeSlideIn>
              )}

              <FadeSlideIn delay={recentSearches.length > 0 ? 130 : 60} style={styles.suggestionSection}>
                <Text style={styles.suggestionHeading}>Recommended For You</Text>
                <Text style={styles.suggestionSubheading}>Upcoming events you might like</Text>
              </FadeSlideIn>

              {upcomingLoading && <ActivityIndicator style={{ marginTop: 12 }} color={COLORS.accent} />}

              {!upcomingLoading && upcoming.length === 0 && (
                <Text style={styles.emptyText}>No upcoming events yet — check back soon.</Text>
              )}

              {!upcomingLoading &&
                upcoming.map((ev, index) => (
                  <FadeSlideIn key={ev.id} delay={180 + index * 60}>
                    <AnimatedPressable
                      style={styles.card}
                      onPress={() => navigation.navigate('EventDetail', { id: ev.id })}
                      scaleTo={0.985}
                    >
                      <Text style={styles.title}>{ev.title}</Text>
                      <Text style={styles.meta}>📅 {ev.date}{ev.time ? `  •  🕒 ${ev.time}` : ''}</Text>
                      {!!ev.venue && <Text style={styles.meta}>📍 {ev.venue}</Text>}
                    </AnimatedPressable>
                  </FadeSlideIn>
                ))}
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: SPACING.md },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.ink,
    marginBottom: SPACING.md,
  },
  emptyText: { color: COLORS.muted, fontSize: 14, marginTop: 12 },
  list: { paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.ink, marginBottom: 6 },
  meta: { fontSize: 13, color: COLORS.muted, marginTop: 2 },

  suggestionSection: { marginBottom: SPACING.md },
  suggestionHeading: { fontSize: 13, fontWeight: '700', color: COLORS.accent, textTransform: 'uppercase', letterSpacing: 0.5 },
  suggestionSubheading: { fontSize: 13, color: COLORS.muted, marginTop: 2, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  chip: {
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipText: { color: COLORS.accent, fontWeight: '600', fontSize: 13 },
});
