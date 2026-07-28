import { useEffect, useRef, useCallback } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '../ads/adUnitIds';

const SAFETY_TIMEOUT_MS = 4000;

// Loads an interstitial ad on mount and gives you a function to show it once
// it's ready. Note: unlike the old self-managed interstitial, AdMob controls
// its own close button and timing entirely - there's no way to enforce a
// minimum watch time before close, that's Google's own ad UI, not ours.
export function useInterstitialAd() {
  const adRef = useRef(null);
  const loadedRef = useRef(false);
  // The ad load is a network call that's frequently slower than the screen's
  // own data fetch, so show() is often called before LOADED has fired. This
  // flag remembers that a show was requested so it can fire the moment the
  // ad actually becomes ready, instead of silently doing nothing.
  const pendingShowRef = useRef(false);
  const onDoneRef = useRef(null);

  // Fires whatever callback show() was given, exactly once. Called once the
  // ad is closed, or once it's clear no ad is coming - callers use this to
  // know it's safe to reveal the content underneath.
  const finish = useCallback(() => {
    const cb = onDoneRef.current;
    onDoneRef.current = null;
    if (cb) cb();
  }, []);

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
      if (pendingShowRef.current) {
        pendingShowRef.current = false;
        ad.show();
      }
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      console.log('Interstitial ad failed to load', err);
      loadedRef.current = false;
      if (pendingShowRef.current) {
        // The ad we were waiting to show will never come - let the caller
        // through instead of blocking their content forever.
        pendingShowRef.current = false;
        finish();
      }
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      // Pre-load the next one so it's ready if this screen is visited again
      ad.load();
      finish();
    });

    ad.load();

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
    };
  }, [finish]);

  // Shows the interstitial (waiting for it to finish loading first, if
  // needed). onDone fires once the ad has been shown and closed, or after a
  // few seconds if no ad ever became available - either way it means "go
  // ahead and show your content now".
  const show = useCallback(
    (onDone) => {
      onDoneRef.current = onDone;

      if (adRef.current && loadedRef.current) {
        adRef.current.show();
      } else {
        pendingShowRef.current = true;
      }

      setTimeout(finish, SAFETY_TIMEOUT_MS);
    },
    [finish]
  );

  return show;
}
