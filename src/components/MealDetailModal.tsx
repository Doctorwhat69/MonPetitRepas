import React, { useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { RepasFavori, useDeleteMeal } from '../hooks/useMeals';

interface Props {
  visible: boolean;
  meal: RepasFavori | null;
  currentUserId?: string;
  onClose: () => void;
}

export default function MealDetailModal({ visible, meal, currentUserId, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const deleteMutation = useDeleteMeal();

  if (!meal) return null;

  const isOwner = meal.user_id === currentUserId;

  const handleDelete = () => {
    const confirmMessage = `Voulez-vous vraiment supprimer la recette « ${meal.nom} » ?`;

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        deleteMutation.mutate(meal.id, { onSuccess: onClose });
      }
    } else {
      Alert.alert('Supprimer la recette', confirmMessage, [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(meal.id, { onSuccess: onClose }),
        },
      ]);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* En-tête */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>{meal.nom}</Text>
              {meal.auteur_nom && (
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                  Par {meal.auteur_nom}
                </Text>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {meal.description ? (
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginVertical: 8 }}>
              {meal.description}
            </Text>
          ) : null}

          {/* Synthèse Macro */}
          <View style={[styles.macroSummary, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 16 }}>
              {Math.round(meal.total_calories)} kcal
            </Text>
            <Text style={{ color: theme.text, fontSize: 12, marginTop: 2 }}>
              P: {Math.round(meal.total_proteines)}g | G: {Math.round(meal.total_glucides)}g | L:{' '}
              {Math.round(meal.total_lipides)}g
            </Text>
          </View>

          {/* Liste des ingrédients */}
          <Text style={[styles.sectionSubtitle, { color: theme.text }]}>
            Ingrédients ({meal.items?.length || 0})
          </Text>

          <FlatList
            data={meal.items || []}
            keyExtractor={(_, index) => index.toString()}
            style={{ maxHeight: 220 }}
            renderItem={({ item }) => (
              <View style={[styles.ingredientRow, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontWeight: '600', fontSize: 14 }}>
                    {item.aliment_nom}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    P: {item.proteines}g | G: {item.glucides}g | L: {item.lipides}g
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>
                    {item.quantite}g
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                    {item.calories} kcal
                  </Text>
                </View>
              </View>
            )}
          />

          {/* Actions */}
          <View style={styles.actions}>
            {isOwner && (
              <TouchableOpacity
                style={[styles.btnDelete, { borderColor: '#E53935' }]}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Ionicons name="trash-outline" size={18} color="#E53935" />
                <Text style={{ color: '#E53935', fontWeight: 'bold', fontSize: 13 }}>Supprimer</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[globalStyles.button, { marginTop: 0, flex: 1 }]} onPress={onClose}>
              <Text style={globalStyles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  macroSummary: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    marginVertical: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btnDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
});