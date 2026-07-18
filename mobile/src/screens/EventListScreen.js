import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getEventsForDate } from '../api/api';

function formatDateHeading(dateString) {
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function EventListScreen({ route, navigation }) {
  const { date } = route.params;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    navigation.setOptions({ title: formatDateHeading(date) });
    getEventsForDate(date)
      .then(setEvents)
      .catch((err) => console.log('Failed to load events', err.message))
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#4f46e5" />
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No events on this day yet.</Text>
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('EventDetail', { id: item.id })}
        >
          <Text style={styles.title}>{item.title}</Text>
          {!!item.time && <Text style={styles.meta}>🕒 {item.time}</Text>}
          {!!item.venue && <Text style={styles.meta}>📍 {item.venue}</Text>}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#6b7280', fontSize: 15 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e4eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1f2430', marginBottom: 6 },
  meta: { fontSize: 14, color: '#6b7280', marginTop: 2 },
});
