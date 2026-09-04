import React, { useContext } from 'react';
import { View, Image, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles'; 

const LOGO_LOCAL = require('../../assets/default-avatar.jpg');

export default function LoadingScreen() {
 const { theme } = useContext(ThemeContext);
   const styles = getGlobalStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={LOGO_LOCAL} style={styles.logo} />
      <ActivityIndicator size="large" color={theme.primary} style={{ marginVertical: 20 }} />
      <Text style={[styles.text, { color: theme.textSecondary }]}>Chargement de l'application...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  text: { fontSize: 14, fontWeight: '500' },
});