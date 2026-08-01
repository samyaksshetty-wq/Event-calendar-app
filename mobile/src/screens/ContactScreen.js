import React from 'react';
import { View, Text, StyleSheet, Linking, ScrollView } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../theme';
import { API_BASE_URL } from '../api/api';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import BackgroundDecoration from '../components/BackgroundDecoration';
import AdMobBanner from '../components/AdMobBanner';

const CONTACT_PHONE = '+971 50 973 6263';

export default function ContactScreen() {
  return (
    <View style={styles.screen}>
      <BackgroundDecoration />
      <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 48 }}>
      <FadeSlideIn>
        <Text style={styles.heading}>List Your Event</Text>
        <Text style={styles.body}>
          Are you organizing an event and want it featured on the calendar? Contact us on
          the number below and we'll send you a Google Form to fill in your event details —
          title, date, time, venue, a short description, and a brochure.
          Once you submit the form, your event will be added for everyone to see.
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
        <Text style={styles.footnote}>We usually add new events within a day of receiving your completed form.</Text>
      </FadeSlideIn>

      <FadeSlideIn delay={200}>
        <AnimatedPressable onPress={() => Linking.openURL(`${API_BASE_URL}/privacy`)} scaleTo={0.98}>
          <Text style={styles.privacyLink}>Privacy Policy</Text>
        </AnimatedPressable>
      </FadeSlideIn>
      </ScrollView>
      <AdMobBanner />
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
  privacyLink: { fontSize: 13, color: COLORS.accent, fontWeight: '600', marginTop: 14, textDecorationLine: 'underline' },
});
