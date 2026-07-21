import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CalendarScreen from '../screens/CalendarScreen';
import EventDetailScreen from '../screens/EventDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import ContactScreen from '../screens/ContactScreen';
import SavedEventsScreen from '../screens/SavedEventsScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.bg },
          headerTintColor: COLORS.ink,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: COLORS.bg },
        }}
      >
        <Stack.Screen name="Calendar" component={CalendarScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Events' }} />
        <Stack.Screen name="SavedEvents" component={SavedEventsScreen} options={{ title: 'Saved Events' }} />
        <Stack.Screen name="Contact" component={ContactScreen} options={{ title: 'List Your Event' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
