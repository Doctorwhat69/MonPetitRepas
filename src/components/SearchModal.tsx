import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Aliment } from '../types/nutrition';
import { chercherAlimentsAPI } from '../services/openfoodfacts';
import NutriScoreBadge from './NutriScoreBadge';
import { MealContext } from '../context/MealContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SearchModal({ visible, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAliment, setSelectedAliment] = useState<Aliment | null>(null);
  const [quantite, setQuantite] = useState('100');

  const { addPortion } = useContext(MealContext);

  // Recherche automatique dès qu'on tape au moins 3 lettres
  useEffect(() => {
    if (query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Attend 400 ms après la dernière frappe avant d'appeler l'API
    const timer = setTimeout(async () => {
      const data = await chercherAlimentsAPI(query);
      setResults(data);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = () => {
    if (!selectedAliment) return;
    const grams = parseFloat(quantite) || 100;
    addPortion({ aliment: selectedAliment, quantiteEnGrams: grams });
    resetAndClose();
  };

  const resetAndClose = () => {
    setSelectedAliment(null);
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajouter un aliment</Text>
          <Button title="Fermer" onPress={resetAndClose} color="#d32f2f" />
        </View>

        <View style={styles.searchBar}>
          <TextInput
            style={styles.input}
            placeholder="Tape au moins 3 lettres (ex: nutell)..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
        </View>

        {loading && <ActivityIndicator size="large" color="#4CAF50" style={{ marginVertical: 20 }} />}

        {!selectedAliment ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.card} onPress={() => setSelectedAliment(item)}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.productImage} />
                ) : (
                  <View style={[styles.productImage, styles.placeholderImage]} />
                )}
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.nom}</Text>
                  {item.marque ? <Text style={styles.cardBrand}>{item.marque}</Text> : null}
                  <Text style={styles.cardDetails}>
                    100g : {item.calories} kcal | P: {item.proteines}g | G: {item.glucides}g | L: {item.lipides}g
                  </Text>
                </View>
                <NutriScoreBadge score={item.nutriscore} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading && query.trim().length >= 3 ? (
                <Text style={styles.empty}>Aucun produit trouvé.</Text>
              ) : !loading ? (
                <Text style={styles.empty}>Tape au moins 3 lettres pour lancer la recherche.</Text>
              ) : null
            }
          />
        ) : (
          <View style={styles.detailCard}>
            <Text style={styles.detailTitle}>{selectedAliment.nom}</Text>
            <Text style={styles.label}>Quantité en grammes :</Text>
            <TextInput
              style={styles.inputQuantite}
              keyboardType="numeric"
              value={quantite}
              onChangeText={setQuantite}
            />
            <View style={styles.buttonRow}>
              <Button title="Changer" color="#777" onPress={() => setSelectedAliment(null)} />
              <Button title="Ajouter au repas" onPress={handleAdd} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  searchBar: { marginBottom: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, height: 44 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productImage: { width: 48, height: 48, borderRadius: 6, marginRight: 10 },
  placeholderImage: { backgroundColor: '#e0e0e0' },
  cardInfo: { flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardBrand: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
  cardDetails: { fontSize: 12, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 30 },
  detailCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  detailTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  inputQuantite: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
});