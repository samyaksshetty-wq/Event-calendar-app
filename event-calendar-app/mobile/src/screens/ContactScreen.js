import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';

// TODO: replace these with your real details before publishing the app.
const CONTACT_EMAIL = 'yourname@example.com';
const CONTACT_PHONE = '+91 00000 00000';

export default function ContactScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 48 }}>
      <Text style={styles.heading}>List Your Event</Text>
      <Text style={styles.body}>
        Are you organizing an event and want it featured on the calendar? Reach out with
        your event details — title, date, time, venue, a short description, and a
        brochure (image or PDF) — and it'll be added for everyone to see.
      </Text>

      <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} activeOpacity={0.7}>
        <Text style={styles.contactLabel}>Email</Text>
        <Text style={styles.contactValue}>{CONTACT_EMAIL}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s/g, '')}`)} activeOpacity={0.7}>
        <Text style={styles.contactLabel}>Phone</Text>
        <Text style={styles.contactValue}>{CONTACT_PHONE}</Text>
      </TouchableOpacity>

      <Text style={styles.footnote}>We usually add new events within a day of receiving your details.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  heading: { fontSize: 22, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.5, marginBottom: 12 },
  body: { fontSize: 15, color: '#374151', lineHeight: 22, marginBottom: SPACING.lg },
  contactRow: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: 14,
    marginBottom: SPACING.sm + 4,
  },
  contactLabel: { fontSize: 12, fontWeight: '700', color: COLORS.muted, textTransform: 'uppercase', marginBottom: 4 },
  contactValue: { fontSize: 15, color: COLORS.accent, fontWeight: '700' },
  footnote: { fontSize: 13, color: '#9ca3af', marginTop: 16 },
});
