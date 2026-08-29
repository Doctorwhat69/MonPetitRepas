import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { supabase } from './src/services/supabase';

import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AuthScreen from './src/screens/AuthScreen';
import { MealProvider } from './src/context/MealContext';

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Récupère la session actuelle au démarrage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Écoute les changements d'état (connexion/déconnexion)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <MealProvider>
      <NavigationContainer>
        {session && session.user ? (
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MonPetitRepas' }} />
            <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Chercher un aliment' }} />
            <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique des repas' }} />
          </Stack.Navigator>
        ) : (
          <AuthScreen />
        )}
      </NavigationContainer>
    </MealProvider>
  );
}