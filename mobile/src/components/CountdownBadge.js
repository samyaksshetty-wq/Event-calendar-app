import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';
import { getRelativeDayLabel } from '../utils/dateHelpers';

export default function CountdownBadge({ date, style }) {
  const label = getRelativeDayLabel(date);
  if (!label) return null;

  const isUrgent = label === 'Today' || label === 'Tomorrow';

  return (
    <View style={[styles.badge, isUrgent && styles.badgeUrgent, style]}>
      <Text style={[styles.text, isUrgent && styles.textUrgent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentSoft,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  badgeUrgent: {
    backgroundColor: COLORS.brandRed,
  },
  text: { fontSize: 11, fontWeight: '700', color: COLORS.accent },
  textUrgent: { color: '#fff' },
});
