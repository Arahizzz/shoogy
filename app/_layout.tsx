import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TamaguiProvider } from 'tamagui';

import config from '../tamagui.config';

import { initDb } from '~/core/db';

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
  const [appLoaded, setAppLoaded] = useState(false);

  useEffect(() => {
    // RxDB instantiation can be asynchronous
    initAppAsync()
      .then(() => setAppLoaded(true))
      .catch((error) => {
        console.error('Error initializing app resources. Application cannot start.');
        console.error(error);
      });
  }, []);
  useEffect(() => {
    if (fontsLoaded && appLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, appLoaded]);

  if (!fontsLoaded || !appLoaded) return null;

  return (
    <TamaguiProvider config={config}>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </TamaguiProvider>
  );
}

async function initAppAsync() {
  await initDb();
}
