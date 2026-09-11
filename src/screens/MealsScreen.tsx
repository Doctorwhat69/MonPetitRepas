import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useMyMeals, useCommunityMeals, useAddMealToJournal, RepasFavori } from '../hooks/useMeals';

export default function MealsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);
  
  const [activeTab, setActiveTab] = useState<'personnel' | 'communaute'>('personnel');

  const { data: myMeals = [], isLoading: loadingMine } = useMyMeals();
  const { data: communityMeals = [], isLoading: loadingCommunity } = useCommunityMeals();
  const addMealMutation = useAddMealToJournal();

  const handleLogMeal = (meal: RepasFavori) => {
    // Date du jour au format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    const confirmAction = () => {
      addMealMutation.mutate(
        { meal, date: today, moment: 'dejeuner' }, // Par défaut au déjeuner
        {
          onSuccess: () => {
            const msg = `"${meal.nom}" a été ajouté à votre journal d'aujourd'hui !`;
            if (Platform.OS === 'web') {
              window.alert(msg);
            } else {
              Alert.alert('Succès', msg);
            }
          },
        }
      );
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Ajouter "${meal.nom}" à votre journal du jour ?`)) {
        confirmAction();
      }
    } else {
      Alert.alert('Ajouter le repas', `Voulez-vous ajouter "${meal.nom}" à votre journal du jour ?`, [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Ajouter', onPress: confirmAction },
      ]);
    }
  };

  const renderMealCard = (meal: RepasFavori) => (
    <View key={meal.id} style={globalStyles.card}>
      <View style={styles.cardHeader}>
<Text style={[styles.mealTitle, { color: theme.text }]}>{meal.nom}</Text>
      {meal.auteur_nom && <Text style={styles.author}>par {meal.auteur_nom}</Text>}
      </View>

      {meal.description ? (
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 10 }}>{meal.description}</Text>
      ) : null}

      <View style={styles.macroBadgeRow}>
        <Text style={[styles.macroBadge, { color: theme.primary }]}>{Math.round(meal.total_calories)} kcal</Text>
        <Text style={styles.macroDetail}>P: {Math.round(meal.total_proteines)}g</Text>
        <Text style={styles.macroDetail}>G: {Math.round(meal.total_glucides)}g</Text>
        <Text style={styles.macroDetail}>L: {Math.round(meal.total_lipides)}g</Text>
      </View>

      <TouchableOpacity
        style={[globalStyles.button, { flexDirection: 'row', gap: 6 }]}
        onPress={() => handleLogMeal(meal)}
        disabled={addMealMutation.isPending}
      >
        <Ionicons name="add-circle-outline" size={18} color="#FFF" />
        <Text style={globalStyles.buttonText}>Ajouter au journal aujourd'hui</Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = activeTab === 'personnel' ? loadingMine : loadingCommunity;
  const currentList = activeTab === 'personnel' ? myMeals : communityMeals;

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Recettes & Repas</Text>

      <View style={[styles.tabContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'personnel' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('personnel')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'personnel' ? '#FFF' : theme.textSecondary }]}>
            Mes Repas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'communaute' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('communaute')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'communaute' ? '#FFF' : theme.textSecondary }]}>
            Communauté
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {currentList.length === 0 ? (
            <View style={globalStyles.card}>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
                {activeTab === 'personnel'
                  ? "Vous n'avez pas encore de repas enregistré."
                  : 'Aucun repas public disponible.'}
              </Text>
            </View>
          ) : (
            currentList.map(renderMealCard)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  author: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  macroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  macroBadge: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  macroDetail: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});