import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useSearchFood } from '../hooks/useSearchFood';
import { useAjouterConsommation } from '../hooks/useJournal';
import { Aliment } from '../types/nutrition';
import CustomFoodModal from './AddCustomFoodModal';
import NutriScoreBadge from './NutriScoreBadge';

interface Props {
  visible: boolean;
  moment: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | null;
  dateString: string;
  onClose: () => void;
}

export default function SearchFoodModal({ visible, moment, dateString, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Aliment | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Gestion de la quantité (Grammes vs Portion)
  const [mode, setMode] = useState<'portion' | 'grammes'>('portion');
  const [inputValue, setInputValue] = useState('1');

  const { data: searchResults = [], isLoading } = useSearchFood(search);
  const ajouterMutation = useAjouterConsommation();

  const handleSelectFood = (item: Aliment) => {
    setSelectedItem(item);
    setMode('portion');
    setInputValue('1');
  };

  const handleValidateAdd = () => {
    if (!selectedItem || !moment) return;

    const parsedInput = parseFloat(inputValue.replace(',', '.')) || 0;
    if (parsedInput <= 0) return;

    const portionGrams = selectedItem.portion_poids_g || 100;

    // Détermination de la quantité finale en g et du ratio par rapport à la portion de référence
    const finalGrams = mode === 'portion' ? parsedInput * portionGrams : parsedInput;
    const ratio = finalGrams / portionGrams;

    ajouterMutation.mutate(
      {
        date_consommation: dateString,
        moment,
        aliment_nom: selectedItem.nom,
        quantite: Math.round(finalGrams),
        calories: Math.round(selectedItem.calories * ratio),
        proteines: Number((selectedItem.proteines * ratio).toFixed(1)),
        glucides: Number((selectedItem.glucides * ratio).toFixed(1)),
        lipides: Number((selectedItem.lipides * ratio).toFixed(1)),
      },
      {
        onSuccess: () => {
          setSelectedItem(null);
          setSearch('');
          setInputValue('1');
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[globalStyles.container, { paddingTop: 50 }]}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={globalStyles.title}>Ajouter un aliment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Barre de recherche */}
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Rechercher un aliment..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>

        {/* SI UN ALIMENT EST SÉLECTIONNÉ */}
        {selectedItem ? (
          <View style={[globalStyles.card, { marginTop: 20 }]}>
            <View style={styles.selectedHeader}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, flex: 1 }}>
                {selectedItem.nom}
              </Text>
              <NutriScoreBadge score={selectedItem.nutriscore} size="md" />
            </View>

            {/* Toggle Portion / Grammes */}
            <View style={[styles.toggleContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'portion' && { backgroundColor: theme.primary }]}
                onPress={() => {
                  setMode('portion');
                  setInputValue('1');
                }}
              >
                <Text style={{ color: mode === 'portion' ? '#FFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
                  {selectedItem.portion_description || 'Portion'} ({selectedItem.portion_poids_g} g)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.toggleBtn, mode === 'grammes' && { backgroundColor: theme.primary }]}
                onPress={() => {
                  setMode('grammes');
                  setInputValue(String(selectedItem.portion_poids_g || 100));
                }}
              >
                <Text style={{ color: mode === 'grammes' ? '#FFF' : theme.textSecondary, fontWeight: 'bold', fontSize: 12 }}>
                  Grammes (g)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Champ de saisie */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, marginBottom: 5, fontSize: 12 }}>
                  {mode === 'portion'
                    ? `Nombre de portions (${selectedItem.portion_description})`
                    : 'Poids total en grammes (g)'}
                </Text>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                  keyboardType="numeric"
                  value={inputValue}
                  onChangeText={setInputValue}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 20 }]}
              onPress={handleValidateAdd}
              disabled={ajouterMutation.isPending}
            >
              {ajouterMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={globalStyles.buttonText}>Valider l'ajout</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setSelectedItem(null)}>
              <Text style={{ color: theme.textSecondary }}>Changer d'aliment</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* LISTE DES RÉSULTATS DE RECHERCHE */
          <FlatList
            data={searchResults}
            keyExtractor={(item) => String(item.id)}
            style={{ marginTop: 20 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              search.length >= 2 && !isLoading ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: theme.textSecondary, marginBottom: 12 }}>
                    Aliment introuvable
                  </Text>
                  <TouchableOpacity
                    style={[styles.customBtn, { borderColor: theme.primary }]}
                    onPress={() => setShowCustomModal(true)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                    <Text style={{ color: theme.primary, fontWeight: 'bold' }}>
                      Créer un aliment personnalisé
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : isLoading ? (
                <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.resultItem, { borderBottomColor: theme.border }]}
                onPress={() => handleSelectFood(item)}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 14, flex: 1 }}>
                      {item.nom}
                    </Text>
                    <NutriScoreBadge score={item.nutriscore} size="sm" />
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {item.calories} kcal • {item.portion_description} ({item.portion_poids_g} g)
                  </Text>
                </View>

                <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
              </TouchableOpacity>
            )}
            ListFooterComponent={
              searchResults.length > 0 ? (
                <TouchableOpacity
                  style={[styles.customBtn, { borderColor: theme.border, marginTop: 15, marginBottom: 30 }]}
                  onPress={() => setShowCustomModal(true)}
                >
                  <Ionicons name="add-outline" size={18} color={theme.textSecondary} />
                  <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                    Aliment manquant ? Créer un aliment personnalisé
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}

        {/* Modale de création d'aliment sur mesure */}
        <CustomFoodModal
          visible={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onSuccess={() => setShowCustomModal(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeBtn: { padding: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 15,
    overflow: 'hidden',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  customBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});