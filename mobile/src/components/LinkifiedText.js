import React from 'react';
import { Text, Linking } from 'react-native';
import { COLORS } from '../theme';

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_TEST_REGEX = /^https?:\/\//;

// Renders text with any http(s) links inside it as tappable, opening in the
// device's browser - everything else renders as plain text.
export default function LinkifiedText({ text, style }) {
  if (!text) return null;

  const parts = text.split(URL_SPLIT_REGEX);

  return (
    <Text style={style}>
      {parts.map((part, i) =>
        URL_TEST_REGEX.test(part) ? (
          <Text key={i} style={{ color: COLORS.accent, textDecorationLine: 'underline' }} onPress={() => Linking.openURL(part)}>
            {part}
          </Text>
        ) : (
          part
        )
      )}
    </Text>
  );
}
