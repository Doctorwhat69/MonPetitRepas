import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

interface Props {
  visible: boolean;
  item: {
    id: string;
    aliment_nom: string;
    quantite: number;
    calories: number;
  } | null;
  onClose: () => void;
  onSave: (id: string, newQuantite: number) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
}

export default function EditQuantityModal({ visible, item, onClose, onSave, onDelete }: Props) {
  const { theme } = useContext(ThemeContext);
  const { showToast } = useToast();

  const [quantite, setQuantite] = useState('100');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantite(String(item.quantite || 100));
    }
  }, [item]);

  if (!item) return null;

  const handleValidate = async () => {
    const newQty = parseFloat(quantite.replace(',', '.')) || 0;
    if (newQty <= 0) {
      showToast('La quantité doit être supérieure à 0.', 'info');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(item.id, newQty);
      showToast('Quantité mise à jour !', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la modification.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsLoading(true);
    try {
      await onDelete(item.id);
      showToast('Aliment retiré du journal', 'info');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Erreur lors de la suppression.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Modifier la quantité</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.itemName, { color: theme.text }]}>{item.aliment_nom}</Text>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Quantité en grammes (g)</Text>
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.background }]}
            keyboardType="numeric"
            value={quantite}
            onChangeText={setQuantite}
            autoFocus
          />

          <View style={styles.actionsRow}>
            {onDelete && (
              <TouchableOpacity
                style={[styles.deleteBtn, { borderColor: theme.danger }]}
                onPress={handleDelete}
                disabled={isLoading}
              >
                <Ionicons name="trash-outline" size={18} color={theme.danger} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleValidate}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Enregistrer</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    borderRadius: 16,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  deleteBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});