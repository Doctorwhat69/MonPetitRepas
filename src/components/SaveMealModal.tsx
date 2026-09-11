import React, { useState, useContext } from 'react';
import { View, Text, Modal, TextInput, Switch, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useSaveMealAsFavorite } from '../hooks/useMeals';

interface Props {
  visible: boolean;
  onClose: () => void;
  items: Array<{
    aliment_nom: string;
    quantite_g: number;
    calories: number;
    proteines: number;
    glucides: number;
    lipides: number;
  }>;
  defaultNom?: string;
}

export default function SaveMealModal({ visible, onClose, items, defaultNom = '' }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const [nom, setNom] = useState(defaultNom);
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const saveMealMutation = useSaveMealAsFavorite();

  const handleSave = () => {
    if (!nom.trim()) return;

    saveMealMutation.mutate(
      { nom, description, is_public: isPublic, items },
      {
        onSuccess: () => {
          setNom('');
          setDescription('');
          setIsPublic(false);
          onClose();
        },
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 16 }]}>Enregistrer en recette</Text>

          <Text style={[styles.label, { color: theme.text }]}>Nom de la recette *</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Ex : Bowl Avoine & Banane"
            placeholderTextColor={theme.textSecondary}
            value={nom}
            onChangeText={setNom}
          />

          <Text style={[styles.label, { color: theme.text }]}>Description (optionnelle)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            placeholder="Ex : Petit-déjeuner rapide avant le sport"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.switchRow}>
            <Text style={{ color: theme.text, fontSize: 14 }}>Partager avec la communauté</Text>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ false: theme.border, true: theme.primary }} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.text, fontWeight: 'bold' }}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 0, flex: 1 }]}
              onPress={handleSave}
              disabled={saveMealMutation.isPending || !nom.trim()}
            >
              {saveMealMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={globalStyles.buttonText}>Enregistrer</Text>
              )}
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
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});