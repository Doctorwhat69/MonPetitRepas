import React, { useState, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Button,
} from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useSearchFood, useCreerAlimentCustom, AlimentItem } from '../hooks/useSearchFood';
import { useAjouterConsommation } from '../hooks/useJournal';

interface Props {
  visible: boolean;
  moment: 'petit_dejeuner' | 'dejeuner' | 'diner' | 'collation' | null;
  dateString: string;
  onClose: () => void;
}

export default function SearchFoodModal({ visible, moment, dateString, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const styles = getGlobalStyles(theme);

  const [query, setQuery] = useState('');
  const [selectedAliment, setSelectedAliment] = useState<AlimentItem | null>(null);
  const [quantite, setQuantite] = useState('100');

  // Mode création d'un aliment personnalisé
  const [modeCreation, setModeCreation] = useState(false);
  const [customNom, setCustomNom] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customProt, setCustomProt] = useState('');
  const [customGluc, setCustomGluc] = useState('');
  const [customLip, setCustomLip] = useState('');

  const { data: resultats = [], isLoading } = useSearchFood(query);
  const ajouterConsommationMutation = useAjouterConsommation();
  const creerAlimentMutation = useCreerAlimentCustom();

  const reinitialiser = () => {
    setQuery('');
    setSelectedAliment(null);
    setQuantite('100');
    setModeCreation(false);
    setCustomNom('');
    setCustomCal('');
    setCustomProt('');
    setCustomGluc('');
    setCustomLip('');
    onClose();
  };

  const validerAjout = () => {
    if (!selectedAliment || !moment) return;
    const q = parseFloat(quantite) || 100;
    const ratio = q / 100;

    ajouterConsommationMutation.mutate(
      {
        date_consommation: dateString,
        moment,
        aliment_nom: selectedAliment.nom,
        quantite: q,
        calories: Math.round(selectedAliment.calories * ratio),
        proteines: Number((selectedAliment.proteines * ratio).toFixed(1)),
        glucides: Number((selectedAliment.glucides * ratio).toFixed(1)),
        lipides: Number((selectedAliment.lipides * ratio).toFixed(1)),
      },
      {
        onSuccess: () => reinitialiser(),
      }
    );
  };

  const validerCreationEtAjout = () => {
    if (!customNom.trim() || !customCal || !moment) return;

    const cal = parseFloat(customCal) || 0;
    const prot = parseFloat(customProt) || 0;
    const gluc = parseFloat(customGluc) || 0;
    const lip = parseFloat(customLip) || 0;

    creerAlimentMutation.mutate(
      { nom: customNom.trim(), calories: cal, proteines: prot, glucides: gluc, lipides: lip },
      {
        onSuccess: (nouvelAliment) => {
          setSelectedAliment({ ...nouvelAliment, isCustom: true });
          setModeCreation(false);
        },
      }
    );
  };

  const ratio = (parseFloat(quantite) || 0) / 100;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {modeCreation
              ? 'Créer un aliment'
              : selectedAliment
              ? 'Sélectionner la quantité'
              : 'Ajouter un aliment'}
          </Text>
          <Button title="Fermer" onPress={reinitialiser} color={theme.danger} />
        </View>

        {/* MODE 1 : SAISIE DE LA QUANTITÉ */}
        {selectedAliment ? (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selectedAliment.nom}</Text>
            <Text style={styles.label}>Quantité consommée (en grammes) :</Text>
            <TextInput
              style={styles.inputQuantite}
              keyboardType="numeric"
              value={quantite}
              onChangeText={setQuantite}
              autoFocus
            />

            <View style={{ marginVertical: 12 }}>
              <Text style={styles.textSecondary}>Apport calculé pour {quantite || 0}g :</Text>
              <Text style={styles.caloriesText}>
                {Math.round(selectedAliment.calories * ratio)} kcal
              </Text>
              <Text style={styles.macrosText}>
                Prot: {(selectedAliment.proteines * ratio).toFixed(1)}g | Gluc:{' '}
                {(selectedAliment.glucides * ratio).toFixed(1)}g | Lip:{' '}
                {(selectedAliment.lipides * ratio).toFixed(1)}g
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Button title="Retour" onPress={() => setSelectedAliment(null)} color="#757575" />
              <Button
                title="Ajouter au journal"
                onPress={validerAjout}
                color={theme.primary}
                disabled={ajouterConsommationMutation.isPending}
              />
            </View>
          </View>
        ) : modeCreation ? (
          /* MODE 2 : CRÉATION D'UN ALIMENT PERSONNALISÉ */
          <View style={styles.detailCard}>
            <Text style={styles.label}>Nom de l'aliment :</Text>
            <TextInput style={styles.input} value={customNom} onChangeText={setCustomNom} placeholder="ex: Mon Smoothie Protéiné" />

            <Text style={styles.label}>Valeurs pour 100g :</Text>
            <View style={styles.grid2}>
              <View style={styles.field}>
                <Text style={styles.label}>Kcal :</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={customCal} onChangeText={setCustomCal} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Prot (g) :</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={customProt} onChangeText={setCustomProt} />
              </View>
            </View>

            <View style={styles.grid2}>
              <View style={styles.field}>
                <Text style={styles.label}>Glucides (g) :</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={customGluc} onChangeText={setCustomGluc} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Lipides (g) :</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={customLip} onChangeText={setCustomLip} />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <Button title="Annuler" onPress={() => setModeCreation(false)} color="#757575" />
              <Button title="Créer l'aliment" onPress={validerCreationEtAjout} color={theme.primary} />
            </View>
          </View>
        ) : (
          /* MODE 3 : RECHERCHE DE L'ALIMENT */
          <>
            <TextInput
              style={styles.input}
              placeholder="Rechercher (ex: Poulet, Riz, Pomme...)"
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />

            {isLoading && <ActivityIndicator color={theme.primary} style={{ marginVertical: 10 }} />}

            <FlatList
              data={resultats}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.itemCard} onPress={() => setSelectedAliment(item)}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.cardTitle}>
                      {item.nom} {item.isCustom ? '⭐' : ''}
                    </Text>
                    <Text style={styles.cardDetails}>
                      Pour 100g : {item.calories} kcal | P: {item.proteines}g G: {item.glucides}g L:{' '}
                      {item.lipides}g
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                query.length >= 2 && !isLoading ? (
                  <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Text style={styles.emptyText}>Aucun aliment trouvé pour "{query}"</Text>
                    <TouchableOpacity
                      style={[styles.chip, { marginTop: 12, backgroundColor: theme.primary }]}
                      onPress={() => {
                        setCustomNom(query);
                        setModeCreation(true);
                      }}
                    >
                      <Text style={styles.chipTextActive}>+ Créer cet aliment</Text>
                    </TouchableOpacity>
                  </View>
                ) : null
              }
            />
          </>
        )}
      </View>
    </Modal>
  );
}