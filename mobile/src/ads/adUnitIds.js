import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// IMPORTANT: this defaults to Google's official TEST ad unit IDs, which are
// always safe to use - they show real ad creatives but never generate real
// revenue or count as real impressions. Keep USE_TEST_ADS = true for all of
// your closed testing, right up until you're actually ready to publish
// publicly with your own approved ad units from the AdMob console.
//
// Once you have real ad units, replace the values in PRODUCTION_UNITS below
// (Banner, Interstitial) with the ones from your AdMob console, then flip
// USE_TEST_ADS to false.
const USE_TEST_ADS = true;

const PRODUCTION_UNITS = {
  banner: {
    android: 'ca-app-pub-REPLACE_WITH_YOUR_ID/REPLACE_WITH_BANNER_UNIT',
    ios: 'ca-app-pub-REPLACE_WITH_YOUR_ID/REPLACE_WITH_BANNER_UNIT',
  },
  interstitial: {
    android: 'ca-app-pub-REPLACE_WITH_YOUR_ID/REPLACE_WITH_INTERSTITIAL_UNIT',
    ios: 'ca-app-pub-REPLACE_WITH_YOUR_ID/REPLACE_WITH_INTERSTITIAL_UNIT',
  },
};

export function getBannerAdUnitId() {
  if (USE_TEST_ADS) return TestIds.ADAPTIVE_BANNER;
  return Platform.OS === 'ios' ? PRODUCTION_UNITS.banner.ios : PRODUCTION_UNITS.banner.android;
}

export function getInterstitialAdUnitId() {
  if (USE_TEST_ADS) return TestIds.INTERSTITIAL;
  return Platform.OS === 'ios' ? PRODUCTION_UNITS.interstitial.ios : PRODUCTION_UNITS.interstitial.android;
}
