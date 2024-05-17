import { useObservableEagerState } from 'observable-hooks';
import loginManager from '~/core/nightscout/login-manager';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  const loginState = useObservableEagerState(loginManager.loginStatus);

  if (!loginState) {
    return <Redirect href="/login" />;
  }

  return (
    <Stack initialRouteName={'(tabs)/activities'}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
