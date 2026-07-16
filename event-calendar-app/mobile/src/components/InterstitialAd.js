import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getActiveAd } from '../api/api';

const COUNTDOWN_SECONDS = 10;

// Checks for a scheduled ad and, if one exists, blocks the screen behind it
// with a full-screen Modal until the countdown-gated close button is tapped.
// Calls onDone() exactly once - either immediately if there's no ad to show,
// or after the user closes the ad - which is the parent's signal that it's
// now safe to reveal the actual screen content.
export default function InterstitialAd({ placement, onDone }) {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef(null);
  const doneRef = useRef(false);

  const fireDone = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone && onDone();
  };

  useEffect(() => {
    let cancelled = false;
    getActiveAd(placement).then((result) => {
      if (cancelled) return;
      if (result) {
        setAd(result);
        setVisible(true);
      } else {
        fireDone();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(COUNTDOWN_SECONDS);

    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [visible]);

  if (!ad) return null;

  const canClose = secondsLeft <= 0;
  const close = () => {
    setVisible(false);
    fireDone();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={() => {
        // Only the countdown-gated button can close this, not the hardware back button.
        if (canClose) close();
      }}
    >
      <View style={styles.container}>
        {ad.media_type === 'video' ? (
          <Video
            source={{ uri: ad.media_url }}
            style={styles.media}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
          />
        ) : (
          <Image
            source={{ uri: ad.media_url }}
            style={styles.media}
            contentFit="contain"
            cachePolicy="disk"
          />
        )}

        <SafeAreaView style={styles.topBar} edges={['top']}>
          {canClose ? (
            <Pressable onPress={close} style={styles.closeButton}>
              <Text style={styles.closeText}>Close ✕</Text>
            </Pressable>
          ) : (
            <View style={styles.countdownBadge}>
              <Text style={styles.countdownText}>{secondsLeft}</Text>
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  media: { flex: 1, width: '100%' },
  topBar: { position: 'absolute', top: 0, right: 0, padding: 16 },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  closeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  countdownBadge: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
