import { useEffect, useRef, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '../ads/adUnitIds';

// Loads an interstitial ad on mount and gives you a function to show it once
// it's ready. Note: unlike the old self-managed interstitial, AdMob controls
// its own close button and timing entirely - there's no way to enforce a
// minimum watch time before close, that's Google's own ad UI, not ours.
export function useInterstitialAd() {
  const adRef = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      console.log('Interstitial ad failed to load', err);
      loadedRef.current = false;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      // Pre-load the next one so it's ready if this screen is visited again
      ad.load();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
    };
  }, []);

  const show = useCallback(() => {
    if (adRef.current && loadedRef.current) {
      adRef.current.show();
    }
  }, []);

  return show;
}
