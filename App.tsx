import React, { useState, useEffect, useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';
import { Ionicons } from '@expo/vector-icons'; // Icônes incluses dans Expo
import MealsScreen from './src/screens/MealsScreen';
import { supabase } from './src/services/supabase';
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext';

import HomeScreen from './src/screens/HomeScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import AuthScreen from './src/screens/AuthScreen';

// Instanciation en dehors du composant pour préserver le cache
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache 5 minutes
      retry: 1,
    },
  },
});

const Tab = createBottomTabNavigator();

// On crée un composant séparé pour les Tabs afin de pouvoir utiliser le ThemeContext
function AppTabs() {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Attribution des icônes selon la route
          if (route.name === 'Journal') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'Recettes') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Statistiques') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Journal" component={HomeScreen} />
      <Tab.Screen name="Recettes" component={MealsScreen} /> 
      <Tab.Screen name="Statistiques" component={AnalyticsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {/* Suppression du MealProvider devenu obsolète avec TanStack */}
        <NavigationContainer>
          {session && session.user ? (
            <AppTabs />
          ) : (
            <AuthScreen />
          )}
        </NavigationContainer>
      </ThemeProvider>
    </QueryClientProvider>
  );
}