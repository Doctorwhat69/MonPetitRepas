import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Modal, Button } from 'react-native';
import { supabase } from '../services/supabase';
import { Aliment } from '../types/nutrition';
import { calculerValeursPortion } from '../utils/nutrition';
import { MealContext } from '../context/MealContext';
import { useNavigation } from '@react-navigation/native';

export default function SearchScreen() {
  const navigation = useNavigation();
  const { addPortion } = useContext(MealContext);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(false);

  // États pour la modale
  const [selectedAliment, setSelectedAliment] = useState<Aliment | null>(null);
  const [quantite, setQuantite] = useState<string>('100');

  useEffect(() => {
    async function searchAliments() {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase.from('aliments').select('*').ilike('nom', `%${query}%`);
      if (!error && data) setResults(data);
      setLoading(false);
    }

    const timer = setTimeout(() => searchAliments(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = () => {
    if (selectedAliment && quantite) {
      addPortion({
        aliment: selectedAliment,
        quantiteEnGrams: parseFloat(quantite)
      });
      setSelectedAliment(null);
      navigation.goBack(); // Retour à l'accueil
    }
  };

  // Calcul dynamique dans la modale
  const valeursCalculees = selectedAliment 
    ? calculerValeursPortion(selectedAliment, parseFloat(quantite) || 0) 
    : null;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment..."
        value={query}
        onChangeText={setQuery}
        autoFocus
      />
      {loading && <ActivityIndicator size="small" color="#0000ff" />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => setSelectedAliment(item)}>
            <Text style={styles.name}>{item.nom}</Text>
            <Text style={styles.details}>{item.calories} kcal/100g</Text>
          </TouchableOpacity>
        )}
      />

      {/* Modale de sélection de quantité */}
      <Modal visible={!!selectedAliment} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedAliment && (
              <>
                <Text style={styles.modalTitle}>{selectedAliment.nom}</Text>
                <Text>Quantité (en grammes) :</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  value={quantite}
                  onChangeText={setQuantite}
                  maxLength={4}
                />
                
                {valeursCalculees && (
                  <View style={styles.macrosContainer}>
                    <Text>Calories: {valeursCalculees.calories} kcal</Text>
                    <Text>Protéines: {valeursCalculees.proteines} g</Text>
                    <Text>Glucides: {valeursCalculees.glucides} g</Text>
                    <Text>Lipides: {valeursCalculees.lipides} g</Text>
                  </View>
                )}

                <View style={styles.modalButtons}>
                  <Button title="Annuler" color="red" onPress={() => setSelectedAliment(null)} />
                  <Button title="Ajouter" onPress={handleAdd} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: { height: 46, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  card: { padding: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600' },
  details: { fontSize: 13, color: '#666', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { height: 40, borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginVertical: 10, paddingHorizontal: 10, textAlign: 'center', fontSize: 18 },
  macrosContainer: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginVertical: 15 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }
});