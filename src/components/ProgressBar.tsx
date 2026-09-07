import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

interface Props {
  label: string;
  actuel: number;
  objectif: number;
  unite?: string;
  couleur: string;
}

export default function ProgressBar({ label, actuel, objectif, unite = 'g', couleur }: Props) {
  const { theme } = useContext(ThemeContext);
  const pourcentage = Math.min(Math.round((actuel / (objectif || 1)) * 100), 100);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
        <Text style={[styles.values, { color: theme.textSecondary }]}>
          <Text style={{ fontWeight: 'bold', color: theme.text }}>{Math.round(actuel)}</Text> / {objectif}{unite}
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: theme.border }]}>
        <View style={[styles.fill, { width: `${pourcentage}%`, backgroundColor: couleur }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  values: {
    fontSize: 12,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});