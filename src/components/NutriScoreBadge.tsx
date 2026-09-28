import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutriScoreGrade } from '../types/nutrition';

interface Props {
  score?: NutriScoreGrade | string;
  size?: 'sm' | 'md';
}

const NUTRISCORE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: '#E8F5E9', text: '#2E7D32' },
  B: { bg: '#F1F8E9', text: '#558B2F' },
  C: { bg: '#FFF8E1', text: '#F57F17' },
  D: { bg: '#FFF3E0', text: '#E65100' },
  E: { bg: '#FFEBEE', text: '#C62828' },
};

export default function NutriScoreBadge({ score, size = 'sm' }: Props) {
  if (!score) return null;

  const letter = score.toUpperCase();
  const config = NUTRISCORE_COLORS[letter] || { bg: '#F3F4F6', text: '#6B7280' };
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall ? styles.badgeSm : styles.badgeMd,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: config.text },
          isSmall ? styles.textSm : styles.textMd,
        ]}
      >
        Nutri-Score {letter}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 6,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeMd: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontWeight: 'bold',
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: 12,
  },
});