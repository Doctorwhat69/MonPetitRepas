import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useMyMeals, useCommunityMeals, RepasFavori } from '../hooks/useMeals';
import MealDetailModal from '../components/MealDetailModal';
import { supabase } from '../services/supabase';

type SortOption = 'recent' | 'calories_desc' | 'calories_asc' | 'proteines_desc';

export default function MealsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const [activeTab, setActiveTab] = useState<'my' | 'community'>('my');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [selectedMeal, setSelectedMeal] = useState<RepasFavori | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const { data: myMeals = [], isLoading: loadingMy } = useMyMeals();
  const { data: communityMeals = [], isLoading: loadingCommunity } = useCommunityMeals();

  const rawList = activeTab === 'my' ? myMeals : communityMeals;
  const isLoading = activeTab === 'my' ? loadingMy : loadingCommunity;

  // Application du tri
  const sortedList = [...rawList].sort((a, b) => {
    if (sortOption === 'calories_desc') return b.total_calories - a.total_calories;
    if (sortOption === 'calories_asc') return a.total_calories - b.total_calories;
    if (sortOption === 'proteines_desc') return b.total_proteines - a.total_proteines;
    return 0; // 'recent' consigne l'ordre par défaut de Supabase
  });

  return (
    <View style={globalStyles.container}>
      {/* Titre */}
      <View style={styles.header}>
        <Text style={globalStyles.title}>Recettes & Idées</Text>
      </View>

      {/* Onglets : Mes Repas / Communauté */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'my' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={{ color: activeTab === 'my' ? theme.primary : theme.textSecondary, fontWeight: 'bold' }}>
            Mes Repas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'community' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }]}
          onPress={() => setActiveTab('community')}
        >
          <Text style={{ color: activeTab === 'community' ? theme.primary : theme.textSecondary, fontWeight: 'bold' }}>
            Communauté
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtres de tri */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.chip, sortOption === 'recent' && { backgroundColor: theme.primary }]}
          onPress={() => setSortOption('recent')}
        >
          <Text style={[styles.chipText, { color: sortOption === 'recent' ? '#FFF' : theme.textSecondary }]}>
            Récents
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, sortOption === 'calories_desc' && { backgroundColor: theme.primary }]}
          onPress={() => setSortOption('calories_desc')}
        >
          <Text style={[styles.chipText, { color: sortOption === 'calories_desc' ? '#FFF' : theme.textSecondary }]}>
            + Caloriques
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, sortOption === 'calories_asc' && { backgroundColor: theme.primary }]}
          onPress={() => setSortOption('calories_asc')}
        >
          <Text style={[styles.chipText, { color: sortOption === 'calories_asc' ? '#FFF' : theme.textSecondary }]}>
            - Caloriques
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, sortOption === 'proteines_desc' && { backgroundColor: theme.primary }]}
          onPress={() => setSortOption('proteines_desc')}
        >
          <Text style={[styles.chipText, { color: sortOption === 'proteines_desc' ? '#FFF' : theme.textSecondary }]}>
            + Protéinés
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Liste des recettes */}
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : sortedList.length === 0 ? (
        <View style={[globalStyles.card, { marginTop: 20 }]}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>
            {activeTab === 'my'
              ? 'Aucun repas sauvegardé dans vos favoris.'
              : 'Aucun repas partagé par la communauté.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[globalStyles.card, { marginBottom: 12 }]}
              onPress={() => setSelectedMeal(item)}
            >
              <View style={styles.rowBetween}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>{item.nom}</Text>
                <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                  {Math.round(item.total_calories)} kcal
                </Text>
              </View>

              {item.description ? (
                <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
                  {item.description}
                </Text>
              ) : null}

              <View style={[styles.rowBetween, { marginTop: 10 }]}>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  P: {Math.round(item.total_proteines)}g | G: {Math.round(item.total_glucides)}g | L:{' '}
                  {Math.round(item.total_lipides)}g
                </Text>
                <Ionicons name="eye-outline" size={18} color={theme.primary} />
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modale de détail et suppression */}
      <MealDetailModal
        visible={!!selectedMeal}
        meal={selectedMeal}
        currentUserId={currentUserId}
        onClose={() => setSelectedMeal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sortContainer: {
    maxHeight: 40,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginRight: 8,
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});