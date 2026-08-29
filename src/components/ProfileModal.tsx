import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated: (nouveauGoal: number) => void;
}

export default function ProfileModal({ visible, onClose, onProfileUpdated }: Props) {
  const [objectif, setObjectif] = useState('2000');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      chargerProfil();
    }
  }, [visible]);

  const chargerProfil = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('profils')
        .select('objectif_calories')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setObjectif(data.objectif_calories.toString());
      }
    }
    setLoading(false);
  };

  const Sauvegarder = async () => {
    const target = parseInt(objectif, 10);
    if (isNaN(target) || target <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un nombre de calories valide.');
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profils')
        .upsert({ user_id: user.id, objectif_calories: target }, { onConflict: 'user_id' });

      if (!error) {
        onProfileUpdated(target);
        onClose();
      } else {
        Alert.alert('Erreur', "Impossible de sauvegarder l'objectif.");
      }
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mon Profil</Text>
          <Button title="Fermer" onPress={onClose} color="#d32f2f" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <View style={styles.card}>
            <Text style={styles.label}>Objectif journalier (kcal) :</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={objectif}
              onChangeText={setObjectif}
            />
            <Button title="Enregistrer l'objectif" onPress={Sauvegarder} color="#4CAF50" />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  label: { fontSize: 16, color: '#333', marginBottom: 10, fontWeight: '500' },
  input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 18, marginBottom: 20 },
});