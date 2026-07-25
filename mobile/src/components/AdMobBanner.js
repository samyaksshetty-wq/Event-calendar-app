import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBannerAdUnitId } from '../ads/adUnitIds';
import { COLORS } from '../theme';

// Place this as a SIBLING after your ScrollView (not inside it) so it stays
// docked at the bottom of the screen regardless of scroll position, same
// pattern as the old self-managed banner.
export default function AdMobBanner() {
  return (
    <SafeAreaView edges={['bottom']} style={styles.wrapper}>
      <View style={styles.container}>
        <BannerAd
          unitId={getBannerAdUnitId()}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(err) => console.log('Banner ad failed to load', err)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: COLORS.surface },
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
