import React,{useContext} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles'; 

interface Props {
  score: string;
}

export default function NutriScoreBadge({ score }: Props) {
  const { theme } = useContext(ThemeContext);
  const styles = getGlobalStyles(theme);
  // Définition des couleurs officielles
  const getBackgroundColor = (s: string) => {
    switch (s) {
      case 'A': return '#038141'; // Vert foncé
      case 'B': return '#85BB2F'; // Vert clair
      case 'C': return '#FECB02'; // Jaune
      case 'D': return '#EE8100'; // Orange
      case 'E': return '#E63E11'; // Rouge
      default: return '#cccccc';  // Gris si aucun
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getBackgroundColor(score) }]}>
      <Text style={styles.text}>Nutri-Score {score}</Text>
    </View>
  );
}
