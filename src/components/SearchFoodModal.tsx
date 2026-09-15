import React, { useState, useContext } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useSearchFood, AlimentItem } from '../hooks/useSearchFood';
import { useAjouterConsommation } from '../hooks/useJournal';
import CustomFoodModal from './AddCustomFoodModal';

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
  const [selectedItem, setSelectedItem] = useState<AlimentItem | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Gestion de la quantité (Grammes vs Unités)
  const [mode, setMode] = useState<'grammes' | 'unite'>('grammes');
  const [inputValue, setInputValue] = useState('100');

  const { data: searchResults = [], isLoading } = useSearchFood(search);
  const ajouterMutation = useAjouterConsommation();

  const handleSelectFood = (item: AlimentItem) => {
    setSelectedItem(item);
    if (item.unite_poids_g) {
      setMode('unite');
      setInputValue('1');
    } else {
      setMode('grammes');
      setInputValue('100');
    }
  };

  const handleValidateAdd = () => {
    if (!selectedItem || !moment) return;

    const parsedInput = parseFloat(inputValue.replace(',', '.')) || 0;
    if (parsedInput <= 0) return;

    const finalGrams =
      mode === 'unite' && selectedItem.unite_poids_g
        ? parsedInput * selectedItem.unite_poids_g
        : parsedInput;

    const ratio = finalGrams / 100;

    ajouterMutation.mutate(
      {
        date_consommation: dateString,
        moment,
        aliment_nom: selectedItem.nom,
        quantite: finalGrams,
        calories: Math.round(selectedItem.calories * ratio),
        proteines: Number((selectedItem.proteines * ratio).toFixed(1)),
        glucides: Number((selectedItem.glucides * ratio).toFixed(1)),
        lipides: Number((selectedItem.lipides * ratio).toFixed(1)),
      },
      {
        onSuccess: () => {
          setSelectedItem(null);
          setSearch('');
          setInputValue('100');
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[globalStyles.container, { paddingTop: 50 }]}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>Ajouter un aliment</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

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
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 15 }}>
              {selectedItem.nom}
            </Text>

            {/* Toggle Unité / Grammes (Visible uniquement si une unité existe) */}
            {selectedItem.unite_poids_g && (
              <View style={[styles.toggleContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <TouchableOpacity
                  style={[styles.toggleBtn, mode === 'unite' && { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setMode('unite');
                    setInputValue('1');
                  }}
                >
                  <Text style={{ color: mode === 'unite' ? '#FFF' : theme.textSecondary, fontWeight: 'bold' }}>
                    {selectedItem.unite_nom || 'Portion'} ({selectedItem.unite_poids_g}g)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, mode === 'grammes' && { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setMode('grammes');
                    setInputValue('100');
                  }}
                >
                  <Text style={{ color: mode === 'grammes' ? '#FFF' : theme.textSecondary, fontWeight: 'bold' }}>
                    Grammes
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textSecondary, marginBottom: 5 }}>
                  {mode === 'unite' ? `Nombre de ${selectedItem.unite_nom || 'portions'}` : 'Quantité (g)'}
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
            keyExtractor={(item) => item.id}
            style={{ marginTop: 20 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              search.length > 2 && !isLoading ? (
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Text style={{ color: theme.textSecondary, marginBottom: 12 }}>
                    Aliment introuvable dans la base CIQUAL
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
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.nom}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {item.calories} kcal / 100g
                    {item.unite_poids_g ? ` • 1 ${item.unite_nom || 'portion'} = ${item.unite_poids_g}g` : ''}
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
          onSuccess={() => {
            setShowCustomModal(false);
          }}
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
    paddingVertical: 15,
    borderBottomWidth: 1,
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