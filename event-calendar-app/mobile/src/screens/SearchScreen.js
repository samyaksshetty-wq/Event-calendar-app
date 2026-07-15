import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { searchEvents } from '../api/api';
import { COLORS, RADIUS, SPACING } from '../theme';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import BackgroundDecoration from '../components/BackgroundDecoration';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

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
});
