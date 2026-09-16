import React, { useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useWeeklyStats } from '../hooks/useAnalytics';
import { useProfile } from '../hooks/useProfile';

export default function AnalyticsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const { profile, isLoading: isLoadingProfile } = useProfile();
  const { data: stats = [], isLoading: isLoadingStats } = useWeeklyStats();

  if (isLoadingStats || isLoadingProfile) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  // Objectifs dynamiques issus du profil Supabase
  const cibleCal = profile?.calories_cible || 2000;
  const cibleProt = profile?.proteines_cible || 140;
  const cibleGluc = profile?.glucides_cible || 200;
  const cibleLip = profile?.lipides_cible || 65;

  // Formatage des données pour le BarChart avec couleurs dynamiques
  const barData = stats.map((item) => {
    const estDansLObjectif = Math.abs(item.calories - cibleCal) <= cibleCal * 0.05;
    const estEnDepassement = item.calories > cibleCal * 1.05;

    let barColor = theme.primary;
    if (estDansLObjectif) barColor = '#4CAF50'; // Vert si dans les +/- 5%
    else if (estEnDepassement) barColor = '#E53935'; // Rouge si dépassement

    return {
      value: item.calories,
      label: item.label,
      frontColor: barColor,
      topLabelComponent: () => (
        <Text style={{ color: theme.textSecondary, fontSize: 10, marginBottom: 2 }}>
          {item.calories > 0 ? Math.round(item.calories) : ''}
        </Text>
      ),
    };
  });

  // Calcul du plafond dynamique du graphique
  const maxCalConsommees = Math.max(...stats.map((s) => s.calories), 0);
  const chartMaxValue = Math.max(Math.ceil((cibleCal * 1.25) / 500) * 500, Math.ceil(maxCalConsommees / 500) * 500);

  // Calcul des moyennes sur les jours renseignés (> 0 kcal)
  const joursActifs = stats.filter((s) => s.calories > 0).length || 1;
  const moyenneCal = Math.round(stats.reduce((acc, s) => acc + s.calories, 0) / joursActifs);
  const moyenneProt = Math.round(stats.reduce((acc, s) => acc + s.proteines, 0) / joursActifs);
  const moyenneGluc = Math.round(stats.reduce((acc, s) => acc + s.glucides, 0) / joursActifs);
  const moyenneLip = Math.round(stats.reduce((acc, s) => acc + s.lipides, 0) / joursActifs);

  return (
    <ScrollView style={globalStyles.container} contentContainerStyle={{ paddingBottom: 40, paddingTop: 50 }}>
      <Text style={[globalStyles.title, { marginBottom: 20 }]}>Analyse Hebdo</Text>

      {/* Carte Graphique Calories */}
      <View style={globalStyles.card}>
        <Text style={globalStyles.sectionTitle}>Apport calorique (7 derniers jours)</Text>
        <Text style={{ color: theme.textSecondary, marginBottom: 16, fontSize: 13 }}>
          Moyenne : <Text style={{ fontWeight: 'bold', color: theme.text }}>{moyenneCal} kcal/jour</Text> (Cible : {cibleCal} kcal)
        </Text>

        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <BarChart
            data={barData}
            barWidth={24}
            spacing={16}
            roundedTop
            hideRules
            xAxisThickness={1}
            yAxisThickness={0}
            xAxisColor={theme.border}
            yAxisTextStyle={{ color: theme.textSecondary, fontSize: 10 }}
            noOfSections={3}
            maxValue={chartMaxValue}
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
            <Text style={styles.macroTarget}>Cible : {cibleProt}g</Text>
          </View>

          <View style={[styles.macroBadge, { backgroundColor: '#FB8C0020' }]}>
            <Text style={[styles.macroValue, { color: '#FB8C00' }]}>{moyenneGluc}g</Text>
            <Text style={styles.macroLabel}>Glucides</Text>
            <Text style={styles.macroTarget}>Cible : {cibleGluc}g</Text>
          </View>

          <View style={[styles.macroBadge, { backgroundColor: '#1E88E520' }]}>
            <Text style={[styles.macroValue, { color: '#1E88E5' }]}>{moyenneLip}g</Text>
            <Text style={styles.macroLabel}>Lipides</Text>
            <Text style={styles.macroTarget}>Cible : {cibleLip}g</Text>
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
    fontWeight: '600',
  },
  macroTarget: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 4,
  },
});