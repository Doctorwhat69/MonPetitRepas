import React, { useState, useContext } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { supabase } from '../services/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCustomFoodModal({ visible, onClose, onSuccess }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const [nom, setNom] = useState('');
  const [calories, setCalories] = useState('');
  const [proteines, setProteines] = useState('');
  const [glucides, setGlucides] = useState('');
  const [lipides, setLipides] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!nom.trim() || !calories) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non connecté');

      const { error } = await supabase.from('aliments_custom').insert({
        user_id: user.id,
        nom: nom.trim(),
        calories: parseFloat(calories) || 0,
        proteines: parseFloat(proteines) || 0,
        glucides: parseFloat(glucides) || 0,
        lipides: parseFloat(lipides) || 0,
      });

      if (error) throw error;

      setNom('');
      setCalories('');
      setProteines('');
      setGlucides('');
      setLipides('');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 16 }]}>Nouvel aliment (pour 100 g)</Text>

          <Text style={[styles.label, { color: theme.text }]}>Nom de l'aliment *</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Ex : Pain complet protéiné"
            placeholderTextColor={theme.textSecondary}
            value={nom}
            onChangeText={setNom}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Calories (kcal) *</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                placeholder="250"
                placeholderTextColor={theme.textSecondary}
                value={calories}
                onChangeText={setCalories}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Protéines (g)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                placeholder="12"
                placeholderTextColor={theme.textSecondary}
                value={proteines}
                onChangeText={setProteines}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Glucides (g)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                placeholder="40"
                placeholderTextColor={theme.textSecondary}
                value={glucides}
                onChangeText={setGlucides}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Lipides (g)</Text>
              <TextInput
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
                keyboardType="numeric"
                placeholder="3"
                placeholderTextColor={theme.textSecondary}
                value={lipides}
                onChangeText={setLipides}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.text, fontWeight: 'bold' }}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 0, flex: 1 }]}
              onPress={handleCreate}
              disabled={loading || !nom.trim() || !calories}
            >
              {loading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={globalStyles.buttonText}>Ajouter</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});