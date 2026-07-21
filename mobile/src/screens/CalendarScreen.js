import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { getEventDatesForMonth, getEventsForDate } from '../api/api';
import { COLORS, RADIUS, SPACING } from '../theme';
import FadeSlideIn from '../components/FadeSlideIn';
import AnimatedPressable from '../components/AnimatedPressable';
import BackgroundDecoration from '../components/BackgroundDecoration';
import AdBanner from '../components/AdBanner';
import CountdownBadge from '../components/CountdownBadge';
import { useFavorite } from '../favorites/useFavorites';

function formatDateHeading(dateString) {
  const d = new Date(dateString + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

// A single ticket card, pulled out as its own component so useFavorite (a
// hook) can be called once per event - hooks can't be called inside a .map().
function TicketCard({ ev, delay, navigation }) {
  const [isFavorite, toggleFavorite] = useFavorite(ev.id);

  return (
    <FadeSlideIn delay={delay}>
      <AnimatedPressable
        style={styles.ticketCard}
        onPress={() => navigation.navigate('EventDetail', { id: ev.id })}
        scaleTo={0.985}
      >
        <View style={styles.notchLeft} />
        <View style={styles.notchRight} />

        <View style={styles.ticketTopRow}>
          <CountdownBadge date={ev.date} />
          <AnimatedPressable onPress={toggleFavorite} scaleTo={0.85} style={styles.ticketHeartButton}>
            <Text style={styles.ticketHeart}>{isFavorite ? '❤️' : '🤍'}</Text>
          </AnimatedPressable>
        </View>

        <Text style={styles.ticketTitle}>{ev.title}</Text>
        {!!ev.organizer_name && (
          <Text style={styles.ticketMeta}>
            <Text style={styles.ticketMetaLabel}>Organizer: </Text>{ev.organizer_name}
          </Text>
        )}

        <View style={styles.ticketDivider} />

        <Text style={styles.detailsButtonText}>View more details  →</Text>
      </AnimatedPressable>
    </FadeSlideIn>
  );
}

export default function CalendarScreen({ navigation }) {
  const [markedDates, setMarkedDates] = useState({});
  const [monthLoading, setMonthLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState(null);
  const [dayEvents, setDayEvents] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);

  const loadMonth = useCallback(async (year, month) => {
    setMonthLoading(true);
    try {
      const dateCounts = await getEventDatesForMonth(year, month);
      const marks = {};
      Object.keys(dateCounts).forEach((date) => {
        marks[date] = { marked: true, dotColor: COLORS.gold };
      });
      setMarkedDates(marks);
    } catch (err) {
      console.log('Failed to load events for month', err.message);
    } finally {
      setMonthLoading(false);
    }
  }, []);

  const today = new Date();

  useEffect(() => {
    loadMonth(today.getFullYear(), today.getMonth() + 1);
  }, []);

  const onDayPress = useCallback((day) => {
    setSelectedDate(day.dateString);
    setDayLoading(true);
    getEventsForDate(day.dateString)
      .then(setDayEvents)
      .catch((err) => console.log('Failed to load day events', err.message))
      .finally(() => setDayLoading(false));
  }, []);

  const displayMarks = { ...markedDates };
  if (selectedDate) {
    displayMarks[selectedDate] = {
      ...(displayMarks[selectedDate] || {}),
      selected: true,
      selectedColor: COLORS.accent,
    };
  }

  return (
    <View style={styles.screen}>
      <BackgroundDecoration />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <FadeSlideIn style={[styles.headerBlock, { flex: 1 }]}>
            <Text style={styles.eyebrow}>WHAT'S ON</Text>
            <Text style={styles.header}>
              <Text style={{ color: COLORS.brandYellow || '#F5C518' }}>Namma</Text>
              <Text style={{ color: COLORS.brandRed }}> Events</Text>
            </Text>
            <Text style={styles.description}>
              Search your favourite events and discover what's happening near you — from concerts
              and workshops to community meetups, browse the calendar and never miss what matters to you.
            </Text>
          </FadeSlideIn>

          <FadeSlideIn>
            <AnimatedPressable
              style={styles.savedIconButton}
              onPress={() => navigation.navigate('SavedEvents')}
              scaleTo={0.9}
            >
              <Text style={styles.savedIcon}>❤️</Text>
            </AnimatedPressable>
          </FadeSlideIn>
        </View>

      <FadeSlideIn delay={90} style={styles.actionRow}>
        <AnimatedPressable style={styles.actionButton} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.actionButtonIcon}>🔍</Text>
          <Text style={styles.actionButtonText}>Search Events</Text>
        </AnimatedPressable>
        <AnimatedPressable style={styles.actionButtonOutline} onPress={() => navigation.navigate('Contact')}>
          <Text style={styles.actionButtonOutlineIcon}>📣</Text>
          <Text style={styles.actionButtonOutlineText}>List Your Event</Text>
        </AnimatedPressable>
      </FadeSlideIn>

      <FadeSlideIn delay={120} style={{ marginBottom: SPACING.lg }}>
        <AnimatedPressable style={styles.savedButton} onPress={() => navigation.navigate('SavedEvents')}>
          <Text style={styles.savedButtonIcon}>❤️</Text>
          <Text style={styles.savedButtonText}>My Saved Events</Text>
        </AnimatedPressable>
      </FadeSlideIn>

      <FadeSlideIn delay={170} style={styles.calendarCard}>
        <Calendar
          current={today.toISOString().split('T')[0]}
          onMonthChange={(m) => loadMonth(m.year, m.month)}
          onDayPress={onDayPress}
          markedDates={displayMarks}
          theme={{
            backgroundColor: COLORS.surface,
            calendarBackground: COLORS.surface,
            textSectionTitleColor: COLORS.muted,
            todayBackgroundColor: COLORS.accentSoft,
            todayTextColor: COLORS.accent,
            dayTextColor: COLORS.ink,
            textDisabledColor: '#D5D2C9',
            selectedDayBackgroundColor: COLORS.accent,
            selectedDayTextColor: '#FFFFFF',
            arrowColor: COLORS.accent,
            dotColor: COLORS.gold,
            selectedDotColor: '#FFFFFF',
            monthTextColor: COLORS.ink,
            textMonthFontWeight: '800',
            textMonthFontSize: 17,
            textDayFontWeight: '600',
            textDayFontSize: 15,
            textDayHeaderFontWeight: '700',
            textDayHeaderFontSize: 12,
          }}
        />
        {monthLoading && <ActivityIndicator style={{ marginTop: 8 }} color={COLORS.accent} />}
      </FadeSlideIn>

      <View style={styles.legendRow}>
        <View style={styles.legendDot} />
        <Text style={styles.legendText}>Dates with events</Text>
      </View>

      {selectedDate && (
        <View style={styles.dayResults}>
          <FadeSlideIn key={`heading-${selectedDate}`}>
            <Text style={styles.dayHeading}>{formatDateHeading(selectedDate)}</Text>
          </FadeSlideIn>

          {dayLoading && <ActivityIndicator style={{ marginTop: 16 }} color={COLORS.accent} />}

          {!dayLoading && dayEvents.length === 0 && (
            <FadeSlideIn>
              <Text style={styles.emptyText}>No events on this day yet.</Text>
            </FadeSlideIn>
          )}

          {!dayLoading &&
            dayEvents.map((ev, index) => (
              <TicketCard key={ev.id} ev={ev} delay={index * 70} navigation={navigation} />
            ))}
        </View>
      )}
      </ScrollView>
      <AdBanner placement="calendar_banner" />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { paddingTop: 60, paddingHorizontal: SPACING.md, paddingBottom: 48 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: SPACING.lg },
  headerBlock: {},
  savedIconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedIcon: { fontSize: 18 },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  header: { fontSize: 28, fontWeight: '800', color: COLORS.brandRed, letterSpacing: -0.5 },
  description: { fontSize: 14, color: COLORS.muted, marginTop: 8, lineHeight: 20 },

  actionRow: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  actionButtonIcon: { fontSize: 15 },
  actionButtonText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  actionButtonOutlineIcon: { fontSize: 15 },
  actionButtonOutlineText: { color: COLORS.accent, fontWeight: '700', fontSize: 14 },

  savedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    paddingVertical: 12,
  },
  savedButtonIcon: { fontSize: 14 },
  savedButtonText: { color: COLORS.ink, fontWeight: '700', fontSize: 13 },

  calendarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm + 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: COLORS.gold, marginRight: 6 },
  legendText: { fontSize: 12, color: COLORS.muted },

  dayResults: { marginTop: SPACING.lg },
  dayHeading: { fontSize: 18, fontWeight: '700', color: COLORS.ink, marginBottom: SPACING.md },
  emptyText: { color: COLORS.muted, fontSize: 14 },

  ticketCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
    overflow: 'visible',
  },
  notchLeft: {
    position: 'absolute',
    left: -9,
    top: '50%',
    marginTop: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notchRight: {
    position: 'absolute',
    right: -9,
    top: '50%',
    marginTop: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ticketTitle: { fontSize: 16, fontWeight: '700', color: COLORS.ink, marginBottom: 8 },
  ticketTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  ticketHeartButton: { padding: 2 },
  ticketHeart: { fontSize: 16 },
  ticketMeta: { fontSize: 13, color: COLORS.muted },
  ticketMetaLabel: { fontWeight: '700', color: COLORS.ink },
  ticketDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: COLORS.border,
    marginVertical: 12,
  },
  detailsButtonText: { color: COLORS.accent, fontWeight: '700', fontSize: 13, alignSelf: 'flex-start' },
});
