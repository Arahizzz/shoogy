import { Redirect, Slot } from 'expo-router';
import { useObservableEagerState } from 'observable-hooks';
import loginManager from '~/core/nightscout/login-manager';

export default function AppLayout() {
  const loginState = useObservableEagerState(loginManager.loginStatus$);

  if (!loginState) {
    return <Redirect href="/login" />;
  }

  return <Slot />;
}
