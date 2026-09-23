import React, { useState, useContext, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useSaveMealAsFavorite } from '../hooks/useMeals';
import { supabase } from '../services/supabase';

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

  // Recherche d'aliments dans la table Ciqual
  useEffect(() => {
    if (searchQuery.trim().length < 2 || isManual) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Recherche sur la colonne 'nom' de la table Ciqual
        const { data, error } = await supabase
          .from('aliments_ciqual')
          .select('*')
          .ilike('nom', `%${searchQuery.trim()}%`)
          .limit(10);

        if (error) {
          // Tente avec 'alim_nom' si 'nom' échoue
          const { data: fallbackData } = await supabase
            .from('aliments_ciqual')
            .select('*')
            .ilike('alim_nom', `%${searchQuery.trim()}%`)
            .limit(10);

          setSearchResults(fallbackData || []);
        } else {
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error('Erreur recherche Ciqual :', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isManual]);

  const handleSelectAliment = (alim: any) => {
    setSelectedAliment(alim);
    setSearchQuery(alim.nom || alim.alim_nom || alim.alim_nom_fr);
    setSearchResults([]);
  };

  const handleAddIngredient = () => {
    const qte = Number(ingQuantite) || 100;
    const ratio = qte / 100;

    let newItem;

    if (isManual) {
      if (!ingNom.trim()) {
        const msg = 'Veuillez saisir un nom pour l’ingrédient.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Attention', msg);
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
        const msg = 'Veuillez sélectionner un aliment dans la liste ou passer en saisie manuelle.';
        Platform.OS === 'web' ? alert(msg) : Alert.alert('Attention', msg);
        return;
      }

      const alimentNom = selectedAliment.nom || selectedAliment.alim_nom || selectedAliment.alim_nom_fr;
      const calories100g = Number(selectedAliment.energie_kcal || selectedAliment.calories || 0);
      const prot100g = Number(selectedAliment.proteines || 0);
      const gluc100g = Number(selectedAliment.glucides || 0);
      const lip100g = Number(selectedAliment.lipides || 0);

      newItem = {
        id: Date.now().toString(),
        aliment_nom: alimentNom,
        quantite: qte,
        calories: Math.round(calories100g * ratio),
        proteines: Math.round(prot100g * ratio * 10) / 10,
        glucides: Math.round(gluc100g * ratio * 10) / 10,
        lipides: Math.round(lip100g * ratio * 10) / 10,
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
  };

  const handleRemoveIngredient = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSaveRecipe = () => {
    if (!nom.trim()) {
      const msg = 'Veuillez donner un nom à la recette.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Attention', msg);
      return;
    }

    if (items.length === 0) {
      const msg = 'Ajoutez au moins un ingrédient à la recette.';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('Attention', msg);
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
          setNom('');
          setItems([]);
          onClose();
        },
        onError: (err: any) => {
          const msg = err.message || 'Erreur lors de la sauvegarde';
          Platform.OS === 'web' ? alert(msg) : Alert.alert('Erreur', msg);
        },
      }
    );
  };

  const totalCalories = items.reduce((acc, i) => acc + Number(i.calories || 0), 0);
  const totalProteines = items.reduce((acc, i) => acc + Number(i.proteines || 0), 0);

  return (
    <Modal visible={visible} animationType="slide" transparent>
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
                    placeholder="Rechercher un aliment (ex : galette)..."
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
                      {searchResults.map((item) => {
                        const alimentNom = item.nom || item.alim_nom || item.alim_nom_fr;
                        const cal = item.energie_kcal || item.calories || 0;
                        return (
                          <TouchableOpacity
                            key={item.id || item.alim_code || String(Math.random())}
                            style={[styles.resultRow, { borderBottomColor: theme.border }]}
                            onPress={() => handleSelectAliment(item)}
                          >
                            <Text style={{ color: theme.text, fontSize: 12, flex: 1 }}>{alimentNom}</Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{cal} kcal/100g</Text>
                          </TouchableOpacity>
                        );
                      })}
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
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 13 }}>{item.aliment_nom}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
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
    maxHeight: 140,
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