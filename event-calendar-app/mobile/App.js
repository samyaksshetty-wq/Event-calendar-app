import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Animated } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const logoAnim = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade + rise the logo/name in
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    // Then, after a short pause, fade the whole splash away to reveal the app
    // underneath (which is already mounted and ready, so there's no blank flash).
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 1600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator />

      {showSplash && (
        <Animated.View style={[styles.splash, { opacity: splashOpacity }]} pointerEvents="none">
          <Animated.View
            style={{
              opacity: logoAnim,
              transform: [
                { translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              ],
              alignItems: 'center',
            }}
          >
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>📅</Text>
            </View>
            <Text style={styles.logoText}>Namma Events</Text>
          </Animated.View>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 38 },
  logoText: { fontSize: 22, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.3 },
});
