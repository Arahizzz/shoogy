import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TamaguiProvider } from 'tamagui';

import config from '../tamagui.config';

import { getDb } from '~/core/db';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });
  const [dbLoaded, setDbLoaded] = useState(false);

  useEffect(() => {
    // RxDB instantiation can be asynchronous
    getDb
      .then(() => setDbLoaded(true))
      .catch((error) => {
        console.error('Error initializing database. Application cannot start.');
        console.error(error);
      });
  }, []);
  useEffect(() => {
    if (fontsLoaded && dbLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbLoaded]);

  if (!fontsLoaded || !dbLoaded) return null;

  return (
    <TamaguiProvider config={config}>
      <Stack initialRouteName="/activities">
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </TamaguiProvider>
  );
}
