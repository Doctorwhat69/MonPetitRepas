import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { MealProvider } from './src/context/MealContext';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <MealProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MonPetitRepas' }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Chercher un aliment' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historique des repas' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </MealProvider>
  );
}

export default App;