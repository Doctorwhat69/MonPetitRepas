// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'MonPetitRepas' }} 
        />
        <Stack.Screen 
          name="Search" 
          component={SearchScreen} 
          options={{ title: 'Chercher un aliment' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}