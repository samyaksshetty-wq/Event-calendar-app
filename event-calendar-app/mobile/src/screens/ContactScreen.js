import React from 'react';
import { View, Text, StyleSheet, Linking, ScrollView } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import BackgroundDecoration from '../components/BackgroundDecoration';
import AdBanner from '../components/AdBanner';

// TODO: replace this with your real number before publishing the app.
const CONTACT_PHONE = '+91 00000 00000';

export default function ContactScreen() {
  return (
    <View style={styles.screen}>
      <BackgroundDecoration />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 48 }}>
      <FadeSlideIn>
        <Text style={styles.heading}>List Your Event</Text>
        <Text style={styles.body}>
          Are you organizing an event and want it featured on the calendar? Reach out with
          your event details — title, date, time, venue, a short description, and a
          brochure (image or PDF) — and it'll be added for everyone to see.
        </Text>
      </FadeSlideIn>

      <FadeSlideIn delay={90}>
        <AnimatedPressable
          style={styles.contactRow}
          onPress={() => Linking.openURL(`tel:${CONTACT_PHONE.replace(/\s/g, '')}`)}
          scaleTo={0.98}
        >
          <Text style={styles.contactLabel}>Phone</Text>
          <Text style={styles.contactValue}>{CONTACT_PHONE}</Text>
        </AnimatedPressable>
      </FadeSlideIn>

      <FadeSlideIn delay={160}>
        <Text style={styles.footnote}>We usually add new events within a day of receiving your details.</Text>
      </FadeSlideIn>

      <FadeSlideIn delay={220} style={{ marginTop: SPACING.lg }}>
        <AdBanner placement="contact_banner" />
      </FadeSlideIn>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: 'transparent' },
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
