import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getActiveAd } from '../api/api';
import { COLORS } from '../theme';

// A docked bottom banner. Place this as a SIBLING after your ScrollView
// (not inside it) so it stays fixed at the bottom of the screen regardless
// of scroll position. Renders nothing if no ad is scheduled for today.
export default function AdBanner({ placement }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getActiveAd(placement).then((result) => {
      if (!cancelled) setAd(result);
    });
    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (!ad) return null;

  return (
    <SafeAreaView edges={['bottom']} style={styles.wrapper}>
      <View style={styles.container}>
        {ad.media_type === 'video' ? (
          <Video
            source={{ uri: ad.media_url }}
            style={styles.media}
            resizeMode={ResizeMode.COVER}
            isLooping
            isMuted
            shouldPlay
          />
        ) : (
          <Image
            source={{ uri: ad.media_url }}
            style={styles.media}
            contentFit="cover"
            cachePolicy="disk"
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: COLORS.surface },
  container: {
    width: '100%',
    height: 90,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -3 },
    elevation: 6,
  },
  media: { width: '100%', height: '100%' },
});
