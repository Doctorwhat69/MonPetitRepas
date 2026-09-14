import React, { useState, useEffect, useContext } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import { useModifierConsommation } from '../hooks/useJournal';

interface Props {
  visible: boolean;
  item: any | null;
  dateString: string;
  onClose: () => void;
}

export default function EditQuantityModal({ visible, item, dateString, onClose }: Props) {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);

  const [quantiteG, setQuantiteG] = useState('');
  const modifierMutation = useModifierConsommation();

  useEffect(() => {
    if (item) {
      setQuantiteG(String(item.quantite || 100));
    }
  }, [item]);

  const handleValidate = () => {
    if (!item || !quantiteG) return;
    const nouvelleQuantite = parseFloat(quantiteG);
    if (isNaN(nouvelleQuantite) || nouvelleQuantite <= 0) return;

    modifierMutation.mutate(
      {
        id: item.id,
        date: dateString,
        nouvelleQuantite,
        ancienneQuantite: Number(item.quantite || 100),
        calories: Number(item.calories || 0),
        proteines: Number(item.proteines || 0),
        glucides: Number(item.glucides || 0),
        lipides: Number(item.lipides || 0),
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!item) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[globalStyles.sectionTitle, { marginBottom: 4 }]}>Modifier la quantité</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 16 }}>{item.aliment_nom}</Text>

          <Text style={[styles.label, { color: theme.text }]}>Nouvelle quantité (g)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="numeric"
            value={quantiteG}
            onChangeText={setQuantiteG}
            autoFocus
          />

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: theme.border }]} onPress={onClose}>
              <Text style={{ color: theme.text, fontWeight: 'bold' }}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[globalStyles.button, { marginTop: 0, flex: 1 }]}
              onPress={handleValidate}
              disabled={modifierMutation.isPending || !quantiteG}
            >
              {modifierMutation.isPending ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={globalStyles.buttonText}>Valider</Text>
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});