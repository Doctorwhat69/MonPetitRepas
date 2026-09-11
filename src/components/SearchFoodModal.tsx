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
import { useSearchFood, AlimentItem } from '../hooks/useSearchFood';
import { useAjouterConsommation } from '../hooks/useJournal';
import AddCustomFoodModal from './AddCustomFoodModal';

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
  const [quantiteG, setQuantiteG] = useState('100');
  const [showAddCustom, setShowAddCustom] = useState(false);

  const { data: results = [], isLoading, refetch } = useSearchFood(search);
  const ajouterMutation = useAjouterConsommation();

  const handleSelect = (item: AlimentItem) => {
    setSelectedItem(item);
  };

 const handleValidateAdd = () => {
  if (!selectedItem || !moment) return;

  const g = parseFloat(quantiteG) || 100;
  const ratio = g / 100;

  ajouterMutation.mutate(
    {
      date_consommation: dateString,
      moment,
      aliment_nom: selectedItem.nom,
      quantite: g,
      calories: Math.round(selectedItem.calories * ratio),
      proteines: Number((selectedItem.proteines * ratio).toFixed(1)),
      glucides: Number((selectedItem.glucides * ratio).toFixed(1)),
      lipides: Number((selectedItem.lipides * ratio).toFixed(1)),
    },
    {
      onSuccess: () => {
        setSelectedItem(null);
        setSearch('');
        setQuantiteG('100');
        onClose();
      },
    }
  );
};

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={globalStyles.container}>
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
            placeholder="Rechercher (ex: Flocons d'avoine)..."
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>

        {/* Bouton création d'un aliment personnalisé */}
        <TouchableOpacity
          style={[styles.createCustomBtn, { borderColor: theme.primary }]}
          onPress={() => setShowAddCustom(true)}
        >
          <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
          <Text style={{ color: theme.primary, fontWeight: 'bold', fontSize: 14 }}>
            Aliment introuvable ? Créer un aliment
          </Text>
        </TouchableOpacity>

        {/* Écran de saisie du grammage si aliment sélectionné */}
        {selectedItem ? (
          <View style={[globalStyles.card, { marginTop: 15 }]}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>
              {selectedItem.nom}
            </Text>
            <Text style={{ color: theme.textSecondary, marginBottom: 12 }}>
              Valeurs pour 100g : {selectedItem.calories} kcal | P: {selectedItem.proteines}g G: {selectedItem.glucides}g L: {selectedItem.lipides}g
            </Text>

            <Text style={{ color: theme.text, marginBottom: 6, fontWeight: '600' }}>Quantité consommée (en g) :</Text>
            <TextInput
              style={[styles.gramInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
              keyboardType="numeric"
              value={quantiteG}
              onChangeText={setQuantiteG}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
              <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: theme.border }]}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={{ color: theme.text }}>Retour</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 0, flex: 1 }]}
                onPress={handleValidateAdd}
                disabled={ajouterMutation.isPending}
              >
                {ajouterMutation.isPending ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={globalStyles.buttonText}>Valider l'ajout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Liste des résultats de recherche */
          <View style={{ flex: 1, marginTop: 10 }}>
            {isLoading && <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 20 }} />}

            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.itemRow, { borderBottomColor: theme.border }]}
                  onPress={() => handleSelect(item)}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>{item.nom}</Text>
                      {item.isCustom && (
                        <View style={[styles.badgeCustom, { backgroundColor: theme.primary }]}>
                          <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>Perso</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                      {item.calories} kcal/100g — P: {item.proteines}g G: {item.glucides}g L: {item.lipides}g
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Modale de création d'aliment manquant */}
        <AddCustomFoodModal
          visible={showAddCustom}
          onClose={() => setShowAddCustom(false)}
          onSuccess={() => {
            refetch();
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
    marginBottom: 10,
  },
  closeBtn: {
    padding: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  createCustomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  badgeCustom: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gramInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnAction: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});