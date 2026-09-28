import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useSaveMealAsFavorite } from '../hooks/useMeals';
import { supabase } from '../services/supabase';
import NutriScoreBadge from './NutriScoreBadge';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type MomentType = 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation';

const MOMENTS: { key: MomentType; label: string }[] = [
  { key: 'petit_dejeuner', label: 'Petit-déj' },
  { key: 'dejeuner', label: 'Déjeuner' },
  { key: 'diner', label: 'Dîner' },
  { key: 'collation', label: 'Collation' },
];

export default function AddRecipeModal({ visible, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const { showToast } = useToast();
  const saveMealMutation = useSaveMealAsFavorite();

  // État de la recette
  const [nom, setNom] = useState('');
  const [momentCible, setMomentCible] = useState<MomentType>('dejeuner');
  const [items, setItems] = useState<any[]>([]);

  // Recherche d'aliments
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAliment, setSelectedAliment] = useState<any | null>(null);

  // Saisie manuelle / quantité
  const [isManual, setIsManual] = useState(false);
  const [ingQuantite, setIngQuantite] = useState('100');
  const [ingNom, setIngNom] = useState('');
  const [ingCal, setIngCal] = useState('');
  const [ingProt, setIngProt] = useState('');
  const [ingGluc, setIngGluc] = useState('');
  const [ingLip, setIngLip] = useState('');

  // Recherche d'aliments dans la table "aliments"
  useEffect(() => {
    if (searchQuery.trim().length < 2 || isManual) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data, error } = await supabase
          .from('aliments')
          .select('*')
          .ilike('nom', `%${searchQuery.trim()}%`)
          .limit(10);

        if (error) {
          console.error('Erreur recherche aliments :', error);
          setSearchResults([]);
        } else {
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Erreur serveur aliments :', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isManual]);

  const handleSelectAliment = (alim: any) => {
    setSelectedAliment(alim);
    setSearchQuery(alim.nom);
    setIngQuantite(String(alim.portion_poids_g || 100));
    setSearchResults([]);
  };

  const handleAddIngredient = () => {
    const qte = Number(ingQuantite) || 100;

    let newItem;

    if (isManual) {
      if (!ingNom.trim()) {
        showToast('Veuillez saisir un nom pour l’ingrédient.', 'info');
        return;
      }
      newItem = {
        id: Date.now().toString(),
        aliment_nom: ingNom.trim(),
        quantite: qte,
        calories: Number(ingCal) || 0,
        proteines: Number(ingProt) || 0,
        glucides: Number(ingGluc) || 0,
        lipides: Number(ingLip) || 0,
      };
    } else {
      if (!selectedAliment) {
        showToast('Sélectionnez un aliment ou passez en saisie manuelle.', 'info');
        return;
      }

      const portionRef = Number(selectedAliment.portion_poids_g) || 100;
      const ratio = qte / portionRef;

      const alimentNom = selectedAliment.nom;
      const calPortion = Number(selectedAliment.calories || 0);
      const protPortion = Number(selectedAliment.proteines || 0);
      const glucPortion = Number(selectedAliment.glucides || 0);
      const lipPortion = Number(selectedAliment.lipides || 0);

      newItem = {
        id: Date.now().toString(),
        aliment_nom: alimentNom,
        quantite: qte,
        calories: Math.round(calPortion * ratio),
        proteines: Math.round(protPortion * ratio * 10) / 10,
        glucides: Math.round(glucPortion * ratio * 10) / 10,
        lipides: Math.round(lipPortion * ratio * 10) / 10,
        nutriscore: selectedAliment.nutriscore,
      };
    }

    setItems([...items, newItem]);

    // Réinitialisation
    setSearchQuery('');
    setSelectedAliment(null);
    setIngQuantite('100');
    setIngNom('');
    setIngCal('');
    setIngProt('');
    setIngGluc('');
    setIngLip('');
    setIsManual(false);

    showToast('Ingrédient ajouté', 'success');
  };

  const handleRemoveIngredient = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSaveRecipe = () => {
    if (!nom.trim()) {
      showToast('Veuillez donner un nom à la recette.', 'info');
      return;
    }

    if (items.length === 0) {
      showToast('Ajoutez au moins un ingrédient à la recette.', 'info');
      return;
    }

    saveMealMutation.mutate(
      {
        nom: nom.trim(),
        is_public: false,
        moment_cible: momentCible,
        items,
      },
      {
        onSuccess: () => {
          showToast('Recette enregistrée avec succès !', 'success');
          setNom('');
          setItems([]);
          onClose();
        },
        onError: (err: any) => {
          showToast(err.message || 'Erreur lors de la sauvegarde.', 'error');
        },
      }
    );
  };

  const totalCalories = items.reduce((acc, i) => acc + Number(i.calories || 0), 0);
  const totalProteines = items.reduce((acc, i) => acc + Number(i.proteines || 0), 0);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          {/* Header Modal */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Nouvelle Recette</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={26} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Nom de la recette */}
            <Text style={[styles.label, { color: theme.text }]}>Nom de la recette</Text>
            <TextInput
              style={[styles.input, { color: theme.text, borderColor: theme.border }]}
              placeholder="Ex : Poulet Riz Curry"
              placeholderTextColor={theme.textSecondary}
              value={nom}
              onChangeText={setNom}
            />

            {/* Sélecteur de moment */}
            <Text style={[styles.label, { color: theme.text }]}>Moment de la journée</Text>
            <View style={styles.chipsRow}>
              {MOMENTS.map((m) => {
                const selected = momentCible === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[
                      styles.chip,
                      { borderColor: theme.border },
                      selected && { backgroundColor: theme.primary, borderColor: theme.primary },
                    ]}
                    onPress={() => setMomentCible(m.key)}
                  >
                    <Text style={{ color: selected ? '#FFF' : theme.textSecondary, fontSize: 12, fontWeight: 'bold' }}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Section ajout d'ingrédient */}
            <View style={[styles.sectionBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.subTitle, { color: theme.text }]}>Ajouter un ingrédient</Text>
                <TouchableOpacity onPress={() => setIsManual(!isManual)}>
                  <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '600' }}>
                    {isManual ? 'Rechercher dans la base' : '+ Saisie manuelle'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!isManual ? (
                <>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    placeholder="Rechercher un aliment (ex : épinard)..."
                    placeholderTextColor={theme.textSecondary}
                    value={searchQuery}
                    onChangeText={(txt) => {
                      setSearchQuery(txt);
                      setSelectedAliment(null);
                    }}
                  />

                  {isSearching && <ActivityIndicator color={theme.primary} style={{ marginVertical: 4 }} />}

                  {/* Résultats de recherche */}
                  {searchResults.length > 0 && (
                    <View style={[styles.resultsBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
                      {searchResults.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[styles.resultRow, { borderBottomColor: theme.border }]}
                          onPress={() => handleSelectAliment(item)}
                        >
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Text style={{ color: theme.text, fontSize: 12, fontWeight: 'bold', flex: 1 }}>
                                {item.nom}
                              </Text>
                              <NutriScoreBadge score={item.nutriscore} size="sm" />
                            </View>
                            <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                              {item.calories} kcal • {item.portion_description} ({item.portion_poids_g} g)
                            </Text>
                          </View>
                          <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* Quantité & Bouton valider */}
                  <View style={styles.row}>
                    <TextInput
                      style={[styles.inputSmall, { color: theme.text, borderColor: theme.border, flex: 1 }]}
                      placeholder="Quantité (g)"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={ingQuantite}
                      onChangeText={setIngQuantite}
                    />
                    <TouchableOpacity
                      style={[styles.addIngBtn, { backgroundColor: theme.primary }]}
                      onPress={handleAddIngredient}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* Saisie manuelle */
                <>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                    placeholder="Nom de l'ingrédient"
                    placeholderTextColor={theme.textSecondary}
                    value={ingNom}
                    onChangeText={setIngNom}
                  />

                  <View style={styles.row}>
                    <TextInput
                      style={[styles.inputSmall, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Qté (g)"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={ingQuantite}
                      onChangeText={setIngQuantite}
                    />
                    <TextInput
                      style={[styles.inputSmall, { color: theme.text, borderColor: theme.border }]}
                      placeholder="kcal"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={ingCal}
                      onChangeText={setIngCal}
                    />
                    <TextInput
                      style={[styles.inputSmall, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Prot (g)"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={ingProt}
                      onChangeText={setIngProt}
                    />
                  </View>

                  <View style={styles.row}>
                    <TextInput
                      style={[styles.inputSmall, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Gluc (g)"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={ingGluc}
                      onChangeText={setIngGluc}
                    />
                    <TextInput
                      style={[styles.inputSmall, { color: theme.text, borderColor: theme.border }]}
                      placeholder="Lip (g)"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={ingLip}
                      onChangeText={setIngLip}
                    />
                    <TouchableOpacity
                      style={[styles.addIngBtn, { backgroundColor: theme.primary }]}
                      onPress={handleAddIngredient}
                    >
                      <Ionicons name="add" size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            {/* Ingrédients ajoutés */}
            <Text style={[styles.label, { color: theme.text, marginTop: 15 }]}>
              Ingrédients ({items.length}) — Total : {Math.round(totalCalories)} kcal | {Math.round(totalProteines)} g Prot
            </Text>

            {items.map((item) => (
              <View key={item.id} style={[styles.itemRow, { borderColor: theme.border }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>{item.aliment_nom}</Text>
                    {item.nutriscore && <NutriScoreBadge score={item.nutriscore} size="sm" />}
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                    {item.quantite} g | {item.calories} kcal (P : {item.proteines} g, G : {item.glucides} g, L : {item.lipides} g)
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleRemoveIngredient(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#E53935" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Bouton de confirmation */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: theme.primary }]}
              onPress={handleSaveRecipe}
              disabled={saveMealMutation.isPending}
            >
              {saveMealMutation.isPending ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Enregistrer la Recette</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  chip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  sectionBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 5,
  },
  resultsBox: {
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 160,
    marginBottom: 8,
  },
  resultRow: {
    padding: 8,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addIngBtn: {
    width: 38,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  submitBtn: {
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});