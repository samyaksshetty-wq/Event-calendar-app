import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { AppOpenAd, AdEventType } from 'react-native-google-mobile-ads';
import { getAppOpenAdUnitId } from './adUnitIds';

// Shows a full-screen ad whenever the app is brought back to the foreground
// from the background (switching apps, returning from the lock screen,
// etc). AppState's 'change' event only fires on real transitions, not on
// the initial cold-start mount, so this naturally never fires during the
// splash screen - no special first-launch guard needed.
export function useAppOpenAd() {
  const adRef = useRef(null);
  const loadedRef = useRef(false);
  const isShowingRef = useRef(false);

  useEffect(() => {
    const ad = AppOpenAd.createForAdRequest(getAppOpenAdUnitId());
    adRef.current = ad;

    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, (err) => {
      console.log('App open ad failed to load', err);
      loadedRef.current = false;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      loadedRef.current = false;
      isShowingRef.current = false;
      // Pre-load the next one so it's ready for the next time the app is resumed
      ad.load();
    });

    ad.load();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      if (!loadedRef.current || isShowingRef.current) return;

      isShowingRef.current = true;
      ad.show();
    });

    return () => {
      unsubLoaded();
      unsubError();
      unsubClosed();
      subscription.remove();
    };
  }, []);
}
