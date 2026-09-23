import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useMyMeals, useDeleteMeal, RepasFavori } from '../hooks/useMeals';
import AddRecipeModal from '../components/AddRecipeModal';

export default function MealsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  // Hooks pour les repas
  const { data: myMeals = [], isLoading } = useMyMeals();
  const deleteMealMutation = useDeleteMeal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  // État pour gérer la carte dépliée (ID de la recette ouverte)
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDelete = (id: string, nom: string) => {
    const msg = `Voulez-vous vraiment supprimer la recette "${nom}" ?`;
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) {
        deleteMealMutation.mutate(id);
      }
    } else {
      Alert.alert('Supprimer la recette', msg, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteMealMutation.mutate(id),
        },
      ]);
    }
  };

  const renderItem = ({ item }: { item: RepasFavori }) => {
    const isExpanded = expandedId === item.id;
    const ingredients = item.items || [];

    return (
      <View style={[styles.mealCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* En-tête de la carte (Cliquable pour déplier/replier) */}
        <View style={styles.mealHeader}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => toggleExpand(item.id)}>
            <View style={styles.titleRow}>
              <Ionicons
                name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                size={18}
                color={theme.primary}
              />
              <Text style={[styles.mealName, { color: theme.text }]}>{item.nom}</Text>
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2, marginLeft: 22 }}>
              Moment : {item.moment_cible ? item.moment_cible.replace('_', ' ') : 'Dîner par défaut'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleDelete(item.id, item.nom)} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={18} color="#E53935" />
          </TouchableOpacity>
        </View>

        {/* Ligne des macros globales */}
        <View style={[styles.macrosRow, { borderTopColor: theme.border }]}>
          <Text style={{ color: theme.text, fontWeight: 'bold' }}>
            {Math.round(item.total_calories || 0)} kcal
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            P: {Math.round(item.total_proteines || 0)}g | G: {Math.round(item.total_glucides || 0)}g | L:{' '}
            {Math.round(item.total_lipides || 0)}g
          </Text>
        </View>

        {/* Accordéon : Liste des ingrédients */}
        {isExpanded && (
          <View style={[styles.ingredientsList, { borderTopColor: theme.border }]}>
            <Text style={[styles.ingredientsTitle, { color: theme.textSecondary }]}>Ingrédients :</Text>
            {ingredients.length === 0 ? (
              <Text style={{ color: theme.textSecondary, fontSize: 12, }}>
                Aucun ingrédient détaillé.
              </Text>
            ) : (
              ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 13, fontWeight: '500' }}>
                      {ing.aliment_nom}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {ing.quantite}g | P: {ing.proteines}g G: {ing.glucides}g L: {ing.lipides}g
                    </Text>
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>
                    {ing.calories} kcal
                  </Text>
                </View>
              ))
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, { paddingTop: 50, paddingBottom: 80 }]}>
      {/* En-tête avec titre et bouton Ajouter */}
      <View style={styles.topHeader}>
        <Text style={[globalStyles.title, { marginBottom: 0 }]}>Mes Recettes</Text>

        <TouchableOpacity
          style={[styles.addRecipeBtn, { backgroundColor: theme.primary }]}
          onPress={() => setIsModalOpen(true)}
        >
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addRecipeBtnText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des recettes */}
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
      ) : myMeals.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="restaurant-outline" size={48} color={theme.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Aucune recette enregistrée.
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8, textAlign: 'center' }}>
            Cliquez sur "Créer" pour ajouter votre première recette et nourrir l'algorithme !
          </Text>
        </View>
      ) : (
        <FlatList
          data={myMeals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Modal de création de recette */}
      <AddRecipeModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  addRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addRecipeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  mealCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  ingredientsList: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  ingredientsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
});