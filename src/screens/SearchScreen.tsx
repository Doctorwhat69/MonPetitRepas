import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../services/supabase';
import { Aliment } from '../types/nutrition';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Aliment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function searchAliments() {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('aliments')
        .select('*')
        .ilike('nom', `%${query}%`);

      if (!error && data) {
        setResults(data);
      }
      setLoading(false);
    }

    // Anti-rebond (debounce) simple pour éviter de sursolliciter l'API à chaque frappe
    const timer = setTimeout(() => {
      searchAliments();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Rechercher un aliment (ex: Pomme, Poulet)..."
        value={query}
        onChangeText={setQuery}
        autoFocus
      />

      {loading && <ActivityIndicator size="small" color="#0000ff" style={styles.loader} />}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <View>
              <Text style={styles.name}>{item.nom}</Text>
              <Text style={styles.details}>
                {item.calories} kcal/100g | Nutri-Score {item.nutriscore}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          query.length > 0 && !loading ? (
            <Text style={styles.empty}>Aucun aliment trouvé</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  loader: { marginBottom: 12 },
  card: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  name: { fontSize: 16, fontWeight: '600' },
  details: { fontSize: 13, color: '#666', marginTop: 2 },
  empty: { textAlign: 'center', color: '#888', marginTop: 20 },
});