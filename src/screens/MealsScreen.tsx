import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

export default function MealsScreen() {
  const { theme } = useContext(ThemeContext);
  const globalStyles = getGlobalStyles(theme);
  
  // État pour gérer l'onglet actif (Mes Repas vs Communauté)
  const [activeTab, setActiveTab] = useState<'personnel' | 'communaute'>('personnel');

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Recettes & Repas</Text>

      {/* Segmented Control (Onglets internes) */}
      <View style={[styles.tabContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'personnel' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('personnel')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'personnel' ? '#FFF' : theme.textSecondary }]}>
            Mes Repas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'communaute' && { backgroundColor: theme.primary }]}
          onPress={() => setActiveTab('communaute')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'communaute' ? '#FFF' : theme.textSecondary }]}>
            Communauté
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {activeTab === 'personnel' ? (
          <View style={globalStyles.card}>
            <Text style={{ color: theme.text, textAlign: 'center', marginVertical: 20 }}>
              Vous n'avez pas encore enregistré de repas favori.
            </Text>
            <TouchableOpacity style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Créer un repas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={globalStyles.card}>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 20 }}>
              Aucun repas partagé par la communauté pour le moment.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontWeight: 'bold',
    fontSize: 14,
  },

});