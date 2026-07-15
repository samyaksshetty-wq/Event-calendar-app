import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

// Soft, low-opacity shapes sitting behind screen content for visual texture.
// Pure Views (no images/blur libs), so nothing extra to install.
const DOTS = [
  { top: 150, left: 30, size: 8, color: COLORS.gold, opacity: 0.35 },
  { top: 210, left: 70, size: 5, color: COLORS.accent, opacity: 0.2 },
  { top: 130, right: 60, size: 6, color: COLORS.accent, opacity: 0.25 },
  { top: 260, right: 24, size: 9, color: COLORS.gold, opacity: 0.3 },
  { top: 340, left: 16, size: 6, color: COLORS.gold, opacity: 0.25 },
  { top: 420, right: 90, size: 5, color: COLORS.accent, opacity: 0.2 },
  { top: 480, left: 60, size: 7, color: COLORS.accent, opacity: 0.18 },
];

export default function BackgroundDecoration() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.circle, styles.topRight]} />
      <View style={[styles.circle, styles.bottomLeft]} />
      <View style={[styles.circle, styles.midRight]} />
      <View style={[styles.ring, styles.topLeftRing]} />
      <View style={[styles.ring, styles.lowRing]} />

      {DOTS.map((d, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              top: d.top,
              left: d.left,
              right: d.right,
              width: d.size,
              height: d.size,
              borderRadius: d.size / 2,
              backgroundColor: d.color,
              opacity: d.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  circle: { position: 'absolute', borderRadius: 999 },
  topRight: {
    width: 280,
    height: 280,
    top: -120,
    right: -100,
    backgroundColor: COLORS.accentSoft,
    opacity: 0.75,
  },
  bottomLeft: {
    width: 240,
    height: 240,
    bottom: 40,
    left: -110,
    backgroundColor: '#FBEFD2',
    opacity: 0.6,
  },
  midRight: {
    width: 150,
    height: 150,
    top: 360,
    right: -55,
    backgroundColor: COLORS.gold,
    opacity: 0.15,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1.5,
  },
  topLeftRing: {
    width: 130,
    height: 130,
    top: -30,
    left: -50,
    borderColor: COLORS.accent,
    opacity: 0.18,
  },
  lowRing: {
    width: 90,
    height: 90,
    bottom: 220,
    right: 30,
    borderColor: COLORS.gold,
    opacity: 0.3,
  },
  dot: { position: 'absolute' },
});
