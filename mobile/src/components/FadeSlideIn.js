import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

// Wrap any content in this to have it fade + slide up when it first appears.
// Use `delay` to stagger a list of these one after another.
export default function FadeSlideIn({ children, delay = 0, style }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 380,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  return (
    <Animated.View style={[style, { opacity: anim, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
