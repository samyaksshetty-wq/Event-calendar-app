import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getActiveAd } from '../api/api';

const COUNTDOWN_SECONDS = 10;

// Shows a full-screen ad (image or video) the moment it mounts, if one is
// scheduled for the given placement. The close button only appears after a
// 10-second countdown - shown as a small badge in the top-right corner.
export default function InterstitialAd({ placement }) {
  const [ad, setAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    getActiveAd(placement).then((result) => {
      if (!cancelled && result) {
        setAd(result);
        setVisible(true);
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

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        // Only the countdown-gated button can close this, not the hardware back button.
        if (canClose) setVisible(false);
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
          <Image source={{ uri: ad.media_url }} style={styles.media} resizeMode="contain" />
        )}

        <SafeAreaView style={styles.topBar} edges={['top']}>
          {canClose ? (
            <Pressable onPress={() => setVisible(false)} style={styles.closeButton}>
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
