import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Drop-in replacement for TouchableOpacity that gives a soft "press" feel -
// scales down slightly on press-in, springs back on release.
//
// The `style` is applied to the Pressable itself (not just an inner wrapper),
// so layout props like `flex: 1` actually work when this sits in a row
// (e.g. two buttons side by side splitting the width evenly).
export default function AnimatedPressable({ onPress, style, children, scaleTo = 0.97, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} disabled={disabled} style={style}>
      <Animated.View
        style={{
          flex: 1,
          flexDirection: style?.flexDirection,
          alignItems: style?.alignItems,
          justifyContent: style?.justifyContent,
          gap: style?.gap,
          transform: [{ scale }],
        }}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
