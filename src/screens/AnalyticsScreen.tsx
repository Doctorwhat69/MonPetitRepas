import React, { useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useWeeklyStats } from '../hooks/useAnalytics';

export default function AnalyticsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);
  const { data: stats = [], isLoading } = useWeeklyStats();

  if (isLoading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Formatage des données pour le BarChart
  const barData = stats.map((item) => ({
    value: item.calories,
    label: item.label,
    frontColor: item.calories > 2200 ? '#E53935' : theme.primary,
    topLabelComponent: () => (
      <Text style={{ color: theme.textSecondary, fontSize: 10, marginBottom: 2 }}>
        {item.calories > 0 ? Math.round(item.calories) : ''}
      </Text>
    ),
  }));

  const joursActifs = stats.filter((s) => s.calories > 0).length || 1;
  const moyenneCal = Math.round(stats.reduce((acc, s) => acc + s.calories, 0) / joursActifs);
  const moyenneProt = Math.round(stats.reduce((acc, s) => acc + s.proteines, 0) / joursActifs);
  const moyenneGluc = Math.round(stats.reduce((acc, s) => acc + s.glucides, 0) / joursActifs);
  const moyenneLip = Math.round(stats.reduce((acc, s) => acc + s.lipides, 0) / joursActifs);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>Analyse Hebdo</Text>

      {/* Carte Graphique Calories */}
      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Apport calorique (7 derniers jours)</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 16, fontSize: 13 }}>
          Moyenne : <Text style={{ fontWeight: 'bold', color: theme.text }}>{moyenneCal} kcal/jour</Text>
        </Text>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <BarChart
            data={barData}
            barWidth={26}
            spacing={18}
            roundedTop
            hideRules
            xAxisThickness={1}
            yAxisThickness={0}
            xAxisColor={theme.border}
            yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
            noOfSections={3}
            maxValue={3000}
            height={180}
          />
        </View>
      </View>

      {/* Carte Moyennes Macros */}
      <View style={[globalStyles.card, { marginTop: 16 }]}>
        <Text style={globalStyles.sectionTitle}>Répartition moyenne par jour</Text>

        <View style={styles.macroRow}>
          <View style={[styles.macroBadge, { backgroundColor: '#E5393520' }]}>
            <Text style={[styles.macroValue, { color: '#E53935' }]}>{moyenneProt}g</Text>
            <Text style={styles.macroLabel}>Protéines</Text>
          </View>

          <View style={[styles.macroBadge, { backgroundColor: '#FB8C0020' }]}>
            <Text style={[styles.macroValue, { color: '#FB8C00' }]}>{moyenneGluc}g</Text>
            <Text style={styles.macroLabel}>Glucides</Text>
          </View>

          <View style={[styles.macroBadge, { backgroundColor: '#1E88E520' }]}>
            <Text style={[styles.macroValue, { color: '#1E88E5' }]}>{moyenneLip}g</Text>
            <Text style={styles.macroLabel}>Lipides</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  macroBadge: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  macroLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
});