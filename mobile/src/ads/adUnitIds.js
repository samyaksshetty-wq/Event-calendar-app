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
    android: 'ca-app-pub-6853506192111873/6001085495',
    ios: 'ca-app-pub-6853506192111873/8681988100',
  },
  interstitial: {
    android: 'ca-app-pub-6853506192111873/3183350467',
    ios: 'ca-app-pub-6853506192111873/8075217519',
  },
  appOpen: {
    android: 'ca-app-pub-6853506192111873/8622012423',
    ios: 'ca-app-pub-6853506192111873/2822890839',
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

export function getAppOpenAdUnitId() {
  if (USE_TEST_ADS) return TestIds.APP_OPEN;
  return Platform.OS === 'ios' ? PRODUCTION_UNITS.appOpen.ios : PRODUCTION_UNITS.appOpen.android;
}
