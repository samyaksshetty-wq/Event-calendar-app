import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { getActiveAd } from '../api/api';
import { COLORS, RADIUS } from '../theme';

// Renders the currently scheduled ad for a given placement (calendar_banner,
// event_detail_banner, contact_banner). Renders nothing if no ad is active
// for today, so it never leaves an empty gap.
export default function AdBanner({ placement, style }) {
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
    <View style={[styles.container, style]}>
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
        <Image source={{ uri: ad.media_url }} style={styles.media} resizeMode="cover" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 110,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  media: { width: '100%', height: '100%' },
});
