import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { getEventById, brochureFullUrl } from '../api/api';
import { COLORS, RADIUS, SPACING } from '../theme';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import AdBanner from '../components/AdBanner';
import InterstitialAd from '../components/InterstitialAd';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <Text style={styles.meta}>
      <Text style={styles.metaLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

export default function EventDetailScreen({ route }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brochureVisible, setBrochureVisible] = useState(false);

  useEffect(() => {
    getEventById(id)
      .then(setEvent)
      .catch((err) => console.log('Failed to load event', err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: COLORS.muted }}>Event not found.</Text>
      </View>
    );
  }

  const brochureUrl = brochureFullUrl(event.brochure_url);
  const isImage = brochureUrl && /\.(jpg|jpeg|png|webp)$/i.test(brochureUrl);
  const isPdf = brochureUrl && /\.pdf$/i.test(brochureUrl);

  // Android's WebView can't render PDFs natively, so route it through Google's
  // viewer. iOS renders PDFs directly. Either way it stays inside the app -
  // no "open with" dialog, no leaving the app.
  const pdfViewerUrl = isPdf
    ? Platform.OS === 'android'
      ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(brochureUrl)}`
      : brochureUrl
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: SPACING.md, paddingBottom: 48 }}>
      <InterstitialAd placement="event_detail_interstitial" />

      <FadeSlideIn>
        {!!event.organizer_name && (
          <View style={styles.organizerBlock}>
            <Text style={styles.organizerLabel}>ORGANIZED BY</Text>
            <Text style={styles.organizerName}>{event.organizer_name}</Text>
          </View>
        )}

        <Text style={styles.title}>{event.title}</Text>

        <View style={styles.metaCard}>
          <Field label="Date" value={event.date} />
          <Field label="Timing" value={event.time} />
          <Field label="Venue" value={event.venue} />
          <Field label="Entry Fee" value={event.fees} />
        </View>

        {!!event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description:</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {!!event.organizer_contact && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact:</Text>
            <Text style={styles.description}>{event.organizer_contact}</Text>
          </View>
        )}

        {(isImage || isPdf) && (
          <View style={styles.section}>
            <AnimatedPressable
              style={styles.brochureButton}
              onPress={() => setBrochureVisible(true)}
              scaleTo={0.97}
            >
              <Text style={styles.brochureButtonIcon}>📄</Text>
              <Text style={styles.brochureButtonText}>View Brochure</Text>
            </AnimatedPressable>
          </View>
        )}

        {!!event.location && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Location:</Text>
            <AnimatedPressable
              style={styles.mapCard}
              onPress={() => Linking.openURL(event.location)}
              scaleTo={0.98}
            >
              <Text style={styles.mapPin}>📍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapCardTitle}>View location on Google Maps</Text>
                <Text style={styles.mapCardSubtitle}>Tap to open in Maps</Text>
              </View>
              <Text style={styles.mapArrow}>→</Text>
            </AnimatedPressable>
          </View>
        )}

        <AdBanner placement="event_detail_banner" />
      </FadeSlideIn>

      {/* Full-screen in-app brochure viewer - no external app/browser involved */}
      <Modal
        visible={brochureVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setBrochureVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Brochure</Text>
            <Pressable onPress={() => setBrochureVisible(false)} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Close ✕</Text>
            </Pressable>
          </View>

          {isImage && (
            <Image source={{ uri: brochureUrl }} style={styles.modalImage} resizeMode="contain" />
          )}

          {isPdf && (
            <WebView source={{ uri: pdfViewerUrl }} style={{ flex: 1 }} startInLoadingState />
          )}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },

  organizerBlock: { marginBottom: 14 },
  organizerLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  organizerName: { fontSize: 22, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.3 },

  title: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 16 },

  metaCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  meta: { fontSize: 15, color: COLORS.ink, marginBottom: 6, lineHeight: 21 },
  metaLabel: { fontWeight: '700', color: COLORS.ink },
  section: { marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: 8,
  },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },

  brochureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 14,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  brochureButtonIcon: { fontSize: 16 },
  brochureButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: 12,
  },
  mapPin: { fontSize: 22 },
  mapCardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.ink },
  mapCardSubtitle: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  mapArrow: { fontSize: 18, color: COLORS.accent, fontWeight: '700' },

  modalContainer: { flex: 1, backgroundColor: '#000' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: '#111',
  },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalCloseButton: { paddingVertical: 6, paddingHorizontal: 12 },
  modalCloseText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modalImage: { flex: 1, width: '100%', backgroundColor: '#000' },
});
