import React, { useContext } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
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

  // Calculs des moyennes dynamiques
  const joursActifs = stats.filter((s) => s.calories > 0).length || 1;
  const moyenneCal = Math.round(stats.reduce((acc, s) => acc + s.calories, 0) / joursActifs);
  const moyenneProt = Math.round(stats.reduce((acc, s) => acc + s.proteines, 0) / joursActifs);
  const moyenneGluc = Math.round(stats.reduce((acc, s) => acc + s.glucides, 0) / joursActifs);
  const moyenneLip = Math.round(stats.reduce((acc, s) => acc + s.lipides, 0) / joursActifs);

  // Calcul des pourcentages pour le graphique Donut
  const totalGrammesMacros = moyenneProt + moyenneGluc + moyenneLip;
  const pctProt = totalGrammesMacros > 0 ? Math.round((moyenneProt / totalGrammesMacros) * 100) : 0;
  const pctGluc = totalGrammesMacros > 0 ? Math.round((moyenneGluc / totalGrammesMacros) * 100) : 0;
  const pctLip = totalGrammesMacros > 0 ? Math.round((moyenneLip / totalGrammesMacros) * 100) : 0;

  const pieData = [
    { value: moyenneProt || 1, color: theme.protein },
    { value: moyenneGluc || 1, color: theme.carbs },
    { value: moyenneLip || 1, color: theme.fat },
  ];

  // Formatage des données BarChart avec couleurs conditionnelles
  const barData = stats.map((item) => {
    const estDansLObjectif = Math.abs(item.calories - cibleCal) <= cibleCal * 0.05;
    const estEnDepassement = item.calories > cibleCal * 1.05;

    let barColor = theme.primary;
    if (estDansLObjectif) barColor = '#4CAF50';
    else if (estEnDepassement) barColor = '#E53935';

    return {
      value: item.calories,
      label: item.label,
      frontColor: barColor,
    };
  });

  const maxCalConsommees = Math.max(...stats.map((s) => s.calories), 0);
  const chartMaxValue = Math.max(
    Math.ceil((cibleCal * 1.25) / 500) * 500,
    Math.ceil(maxCalConsommees / 500) * 500
  );

  return (
    <ScrollView style={[globalStyles.container, { paddingTop: 50 }]} showsVerticalScrollIndicator={false}>
      {/* En-tête */}
      <View style={{ marginBottom: 20 }}>
        <Text style={[globalStyles.title, { marginBottom: 2 }]}>Mes Statistiques</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
          Progression et équilibre nutritionnel
        </Text>
      </View>

      {/* 1. Carte : Moyenne Quotidienne (Bâtons) */}
      <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Moyenne quotidienne</Text>
            <Text style={[styles.highlightText, { color: theme.text }]}>{moyenneCal} kcal</Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Cible : {cibleCal}</Text>
        </View>

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <BarChart
            data={barData}
            barWidth={22}
            spacing={16}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: 'transparent' }}
            noOfSections={3}
            maxValue={chartMaxValue}
            xAxisLabelTextStyle={{ color: theme.textSecondary, fontSize: 11 }}
            height={130}
          />
        </View>
      </View>

      {/* 2. Carte : Répartition des Macros (Donut) */}
      <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ marginBottom: 16 }}>
          <Text style={[styles.cardTitle, { color: theme.text, fontWeight: 'bold', fontSize: 15 }]}>
            Répartition des Macros
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
            Équilibre des nutriments cette semaine
          </Text>
        </View>

        <View style={styles.donutContainer}>
          <PieChart
            donut
            innerRadius={40}
            radius={62}
            data={pieData}
            centerLabelComponent={() => (
              <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Total</Text>
                <Text style={{ fontSize: 15, color: theme.text, fontWeight: 'bold' }}>100 %</Text>
              </View>
            )}
          />

          {/* Légende dynamique */}
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.protein }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{moyenneProt} g</Text> Protéines ({pctProt} %)
              </Text>
            </View>

            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.carbs }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{moyenneGluc} g</Text> Glucides ({pctGluc} %)
              </Text>
            </View>

            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: theme.fat }]} />
              <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{moyenneLip} g</Text> Lipides ({pctLip} %)
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Carte : Courbe de Poids */}
      <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 80 }]}>
        <Text style={[styles.cardTitle, { color: theme.text, fontWeight: 'bold', fontSize: 15 }]}>
          Courbe de Poids
        </Text>
        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2, marginBottom: 14 }}>
          Suivi régulier
        </Text>

        <View style={styles.weightContainer}>
          <View>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Poids actuel</Text>
            <Text style={[styles.highlightText, { color: theme.text }]}>
              {profile?.poids ? `${profile.poids} kg` : '78.0 kg'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Évolution</Text>
            <Text style={[styles.highlightText, { color: theme.primary }]}>- 1.2 kg</Text>
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
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  highlightText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  weightContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});