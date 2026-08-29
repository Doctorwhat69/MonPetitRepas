import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Aliment } from '../types/nutrition';
import { chercherAlimentsAPI } from '../services/openfoodfacts'; // 1. Import de l'API
import NutriScoreBadge from '../components/NutriScoreBadge';
import { useContext } from 'react';
import { MealContext } from '../context/MealContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  Search: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
};

export default function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAliment, setSelectedAliment] = useState<Aliment | null>(null);
  const [quantite, setQuantite] = useState('100');

  const { addPortion } = useContext(MealContext);

  const handleSearch = async () => {
    setLoading(true);
    const data = await chercherAlimentsAPI(query); // 2. Appel de l'API
    setResults(data);
    setLoading(false);
  };

  const handleAdd = () => {
    if (!selectedAliment) return;
    const grams = parseFloat(quantite) || 100;
    addPortion({ aliment: selectedAliment, quantiteEnGrams: grams });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Ex : nutella, pomme, yaourt..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <Button title="Chercher" onPress={handleSearch} />
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
            !loading ? <Text style={styles.empty}>Tape un produit pour lancer la recherche.</Text> : null
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
            <Button title="Changer de produit" color="#777" onPress={() => setSelectedAliment(null)} />
            <Button title="Ajouter au repas" onPress={handleAdd} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  searchBar: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardInfo: { flex: 1, paddingRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardDetails: { fontSize: 12, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 30 },
  detailCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  detailTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  label: { fontSize: 14, color: '#555', marginBottom: 6 },
  inputQuantite: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  productImage: { width: 48, height: 48, borderRadius: 6, marginRight: 10 },
placeholderImage: { backgroundColor: '#e0e0e0' },
cardBrand: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
});