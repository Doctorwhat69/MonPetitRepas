import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useMyMeals, useDeleteMeal, RepasFavori } from '../hooks/useMeals';
import AddRecipeModal from '../components/AddRecipeModal';

const FILTERS = ['Tout', 'Favoris', 'Rapide', 'Protéiné', 'Végétarien'];

export default function MealsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  // Hooks pour les recettes
  const { data: myMeals = [], isLoading } = useMyMeals();
  const deleteMealMutation = useDeleteMeal();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Tout');
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
    const tempsPrep = item.temps_prep || 15; // Valeur par défaut si non renseigné

    return (
      <View style={[styles.mealCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        {/* Couverture Photo */}
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.coverImage} />
        ) : (
          <View style={[styles.coverImage, styles.placeholderCover, { backgroundColor: theme.border }]}>
            <Ionicons name="restaurant-outline" size={36} color={theme.textSecondary} />
          </View>
        )}

        {/* Corps de la carte */}
        <View style={styles.cardContent}>
          {/* Titre & Temps de prépa */}
          <View style={styles.rowBetween}>
            <Text style={[styles.mealTitle, { color: theme.text }]} numberOfLines={1}>
              {item.nom}
            </Text>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={13} color={theme.textSecondary} />
              <Text style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 3 }}>
                {tempsPrep} min
              </Text>
            </View>
          </View>

          {/* Ligne Calories + Macros avec puces colorées */}
          <View style={styles.macrosRow}>
            <Text style={[styles.calText, { color: theme.text }]}>
              {Math.round(item.total_calories || 0)} kcal
            </Text>

            <View style={styles.dotsRow}>
              <View style={styles.macroDotItem}>
                <View style={[styles.dot, { backgroundColor: theme.protein }]} />
                <Text style={[styles.macroDotText, { color: theme.textSecondary }]}>
                  {Math.round(item.total_proteines || 0)}g P
                </Text>
              </View>

              <View style={styles.macroDotItem}>
                <View style={[styles.dot, { backgroundColor: theme.carbs }]} />
                <Text style={[styles.macroDotText, { color: theme.textSecondary }]}>
                  {Math.round(item.total_glucides || 0)}g G
                </Text>
              </View>

              <View style={styles.macroDotItem}>
                <View style={[styles.dot, { backgroundColor: theme.fat }]} />
                <Text style={[styles.macroDotText, { color: theme.textSecondary }]}>
                  {Math.round(item.total_lipides || 0)}g L
                </Text>
              </View>
            </View>
          </View>

          {/* Actions : Déplier ingrédients / Supprimer */}
          <View style={[styles.actionsRow, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.expandBtn} onPress={() => toggleExpand(item.id)}>
              <Ionicons
                name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={16}
                color={theme.primary}
              />
              <Text style={[styles.expandBtnText, { color: theme.primary }]}>
                {isExpanded ? 'Masquer ingrédients' : 'Voir ingrédients'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDelete(item.id, item.nom)} style={{ padding: 2 }}>
              <Ionicons name="trash-outline" size={18} color="#E53935" />
            </TouchableOpacity>
          </View>

          {/* Accordéon Ingrédients */}
          {isExpanded && (
            <View style={[styles.ingredientsBox, { borderTopColor: theme.border }]}>
              {ingredients.map((ing, idx) => (
                <View key={idx} style={[styles.ingredientRow, { borderBottomColor: theme.border }]}>
                  <Text style={{ color: theme.text, fontSize: 12, flex: 1 }}>{ing.aliment_nom}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {ing.quantite}g ({ing.calories} kcal)
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={[globalStyles.container, { paddingTop: 50, paddingBottom: 0 }]}>
      {/* En-tête */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[globalStyles.title, { marginBottom: 2 }]}>Mes Recettes</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Vos plats enregistrés</Text>
        </View>

        <TouchableOpacity
          style={[styles.addRecipeBtn, { backgroundColor: theme.primary }]}
          onPress={() => setIsModalOpen(true)}
        >
          <Ionicons name="add" size={18} color="#FFF" />
          <Text style={styles.addRecipeBtnText}>Créer</Text>
        </TouchableOpacity>
      </View>

      {/* Barre de filtres (Visuelle) */}
      <View style={{ height: 42, marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {FILTERS.map((f) => {
            const isSelected = activeFilter === f;
            return (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setActiveFilter(f)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFF' : theme.textSecondary },
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
        </View>
      ) : (
        <FlatList
          data={myMeals}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Modal de création */}
      <AddRecipeModal visible={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addRecipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addRecipeBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  mealCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 140,
  },
  placeholderCover: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  calText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  macroDotText: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientsBox: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
  },
});