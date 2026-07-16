import React, { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme';

const LYRIC_LINE_1 = ['ಜಯ', 'ಭಾರತ', 'ಜನನಿಯ', 'ತನುಜಾತೆ,'];
const LYRIC_LINE_2 = ['ಜಯ', 'ಹೇ', 'ಕರ್ನಾಟಕ', 'ಮಾತೆ!'];

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Logo + name + tagline fade in together as one group
  const introAnim = useRef(new Animated.Value(0)).current;
  // One Animated.Value per lyric word, so each word fades in on its own turn
  const wordAnims = useRef(
    [...LYRIC_LINE_1, ...LYRIC_LINE_2].map(() => new Animated.Value(0))
  ).current;
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(introAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();

    wordAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 350,
        delay: 800 + i * 400,
        useNativeDriver: true,
      }).start();
    });

    // Hold everything on screen for a moment, then fade the whole splash away
    // to reveal the app underneath (already mounted and ready, so no blank flash).
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setShowSplash(false));
    }, 5000);

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
              opacity: introAnim,
              transform: [
                { translateY: introAnim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
              ],
              alignItems: 'center',
            }}
          >
            <Image source={require('./assets/logo.png')} style={styles.logoImage} resizeMode="cover" />
            <Text style={styles.logoText}>Namma Events</Text>
            <Text style={styles.tagline}>Spreading Kannada Culture in the Land of Harmony</Text>
          </Animated.View>

          <View style={styles.lyricBlock}>
            <View style={styles.lyricLineRow}>
              {LYRIC_LINE_1.map((word, i) => (
                <Animated.Text
                  key={`l1-${i}`}
                  style={[
                    styles.lyricWord,
                    {
                      opacity: wordAnims[i],
                      color: '#F5C518',
                      textShadowColor: '#000',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 3,
                      transform: [
                        { translateY: wordAnims[i].interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) },
                      ],
                    },
                  ]}
                >
                  {word + ' '}
                </Animated.Text>
              ))}
            </View>
            <View style={styles.lyricLineRow}>
              {LYRIC_LINE_2.map((word, i) => {
                const idx = LYRIC_LINE_1.length + i;
                return (
                  <Animated.Text
                    key={`l2-${i}`}
                    style={[
                      styles.lyricWord,
                      {
                        opacity: wordAnims[idx],
                        color: '#D32F2F',
                        textShadowColor: '#000',
                        textShadowOffset: { width: 1, height: 1 },
                        textShadowRadius: 3,
                        transform: [
                          { translateY: wordAnims[idx].interpolate({ inputRange: [0, 1], outputRange: [6, 0] }) },
                        ],
                      },
                    ]}
                  >
                    {word + ' '}
                  </Animated.Text>
                );
              })}
            </View>
          </View>
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
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 12,
  },
  logoText: { fontSize: 22, fontWeight: '800', color: COLORS.ink, letterSpacing: -0.3 },
  tagline: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 48,
  },
  lyricBlock: { marginTop: 28, alignItems: 'center' },
  lyricLineRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  lyricWord: {
    fontSize: 15,
    color: COLORS.brand,
    fontWeight: '600',
    textAlign: 'center',
  },
});
