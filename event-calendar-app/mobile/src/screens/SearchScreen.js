import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { searchEvents } from '../api/api';
import { COLORS, RADIUS, SPACING } from '../theme';

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
      <TextInput
        style={styles.input}
        placeholder="Search events by name, venue..."
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={runSearch}
        autoFocus
        returnKeyType="search"
      />

      {loading && <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.accent} />}

      {!loading && searched && results.length === 0 && (
        <Text style={styles.emptyText}>No events match "{query}".</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EventDetail', { id: item.id })}
            activeOpacity={0.7}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>📅 {item.date}{item.time ? `  •  🕒 ${item.time}` : ''}</Text>
            {!!item.venue && <Text style={styles.meta}>📍 {item.venue}</Text>}
          </TouchableOpacity>
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
