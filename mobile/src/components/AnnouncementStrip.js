import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PIXELS_PER_SECOND = 80;
// Generous estimate of pixel width per character at this font size/weight -
// deliberately on the high side. Sizing the text box off React Native's own
// onLayout measurement was unreliable here (an absolutely-positioned Text
// with no explicit width was still getting capped by an ancestor somewhere,
// silently truncating long strings) - an explicit width computed from the
// string length sidesteps that entirely, guaranteeing the box always has
// enough room no matter how long the text is.
const AVG_CHAR_WIDTH = 11;

// A breaking-news-style ticker: text enters from the right, scrolls across,
// and exits on the left, looping continuously. Renders nothing if there's no
// text, so it takes up no space when the admin hasn't set an announcement.
export default function AnnouncementStrip({ text, style }) {
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (!text) return;

    const textWidth = text.length * AVG_CHAR_WIDTH;
    translateX.setValue(SCREEN_WIDTH);
    const distance = SCREEN_WIDTH + textWidth;

    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: -textWidth,
        duration: (distance / PIXELS_PER_SECOND) * 1000,
        useNativeDriver: true,
        isInteraction: false,
      })
    );
    animation.start();

    return () => animation.stop();
  }, [text]);

  if (!text) return null;

  return (
    <View style={[styles.strip, style]}>
      <Animated.Text
        style={[styles.text, { width: text.length * AVG_CHAR_WIDTH, transform: [{ translateX }] }]}
        numberOfLines={1}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 36,
    backgroundColor: '#F5C518',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    color: COLORS.ink,
    fontWeight: '700',
    fontSize: 16,
  },
});
