import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PIXELS_PER_SECOND = 80;

// A breaking-news-style ticker: text enters from the right, scrolls across,
// and exits on the left, looping continuously. Renders nothing if there's no
// text, so it takes up no space when the admin hasn't set an announcement.
export default function AnnouncementStrip({ text, style }) {
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (!textWidth) return;

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
  }, [textWidth, text]);

  if (!text) return null;

  return (
    <View style={[styles.strip, style]}>
      <Animated.Text
        style={[styles.text, { transform: [{ translateX }] }]}
        numberOfLines={1}
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    height: 36,
    backgroundColor: COLORS.brandRed,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  text: {
    position: 'absolute',
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
